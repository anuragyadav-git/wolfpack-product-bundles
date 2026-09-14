import { buildBundleAuthorizationPolicy } from '../../../app/services/bundle-authorization-policy.server';
import { buildFullPageBundleMetafieldConfig } from '../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server';
import { buildSyncBundleConfiguration } from '../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server';
import { createHmac } from "node:crypto";
import { action, loader } from "../../../app/routes/api/api.cart-transform-runtime-token";
import prisma from "../../../app/db.server";
import {
  generateCartTransformRuntimeTokenSecret,
  verifyRuntimeCartToken,
} from "../../../app/services/cart-transform-runtime-token.server";
import { getBundleProductVariantId } from "../../../app/utils/variant-lookup.server";
import { unauthenticated } from "../../../app/shopify.server";

jest.mock("../../../app/db.server", () => ({
  bundle: {
    findFirst: jest.fn(),
  },
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: {
    public: {
      appProxy: jest.fn().mockResolvedValue({ session: { shop: "test-shop.myshopify.com" } }),
    },
  },
  unauthenticated: {
    admin: jest.fn().mockResolvedValue({ admin: { graphql: jest.fn() } }),
  },
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../../app/utils/variant-lookup.server", () => ({
  getBundleProductVariantId: jest.fn(),
}));

const mockGetBundleProductVariantId = getBundleProductVariantId as jest.Mock;
const mockDb = prisma as any;

function makeSignedRequest(body: Record<string, unknown>, shop = "test-shop.myshopify.com") {
  const params = new URLSearchParams({
    shop,
    path_prefix: "/apps/product-bundles",
    timestamp: "1770000000",
  });

  const message = [...params.entries()]
    .map(([key, value]: any) => `${key}=${value}`)
    .sort()
    .join("");

  params.set(
    "signature",
    createHmac("sha256", "test_api_secret").update(message).digest("hex"),
  );

  return new Request(
    `https://${shop}/apps/product-bundles/api/cart-transform-runtime-token?${params.toString()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

function makeBundle(overrides: Record<string, unknown> = {}) {
  return {
    id: "bundle-1",
    shopId: "test-shop.myshopify.com",
    bundleType: "product_page",
    name: "Mix Bundle",
    status: "active",
    shopifyProductId: "gid://shopify/Product/PARENT",
    steps: [
      {
        StepProduct: [
          {
            productId: "gid://shopify/Product/1",
            variants: [{ id: "gid://shopify/ProductVariant/101" }],
          },
        ],
        StepCategory: [],
      },
    ],
    pricing: {
      enabled: true,
      method: "percentage_off",
      rules: [{
        id: "rule-1",
        conditionType: "quantity",
        conditionValue: 1,
        discountValue: 20,
      }],
    },
    personalizationData: null,
    ...overrides,
  };
}

describe("cart transform runtime token route", () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = "test_api_secret";
    mockDb.bundle.findFirst.mockResolvedValue(makeBundle());
    mockGetBundleProductVariantId.mockResolvedValue("gid://shopify/ProductVariant/PARENT");
    (unauthenticated.admin as jest.Mock).mockResolvedValue({
      admin: {
        graphql: jest.fn().mockImplementation(async (query: string) => ({
          json: async () => query.includes('BundlePolicyRevisions') ? await (async () => {
            const bundle = await mockDb.bundle.findFirst.mock.results.at(-1).value;
            const config = bundle.bundleType === 'full_page' ? buildFullPageBundleMetafieldConfig(bundle) : buildSyncBundleConfiguration(bundle, bundle.shopifyProductId);
            const policy = buildBundleAuthorizationPolicy({ bundle: config, shop: bundle.shopId, parentVariantId: 'gid://shopify/ProductVariant/PARENT' });
            return { data: { shop: { id: 'gid://shopify/Shop/1', policy: { compareDigest: 'digest', value: JSON.stringify({ [bundle.id]: { revision: policy.revision, pricingMode: policy.pricingMode } }) } } } };
          })() : query.includes('ResolveRuntimeSelectionProducts') ? { data: { nodes: [{ id: 'gid://shopify/ProductVariant/501', product: { id: 'gid://shopify/Product/5' } }] } } : query.includes("ResolveRuntimeSellingPlanVariants")
            ? {
                data: {
                  nodes: [{
                    id: "gid://shopify/ProductVariant/101",
                    product: { id: "gid://shopify/Product/1" },
                  }],
                },
              }
            : {
                data: {
                  node: {
                    sellingPlans: { nodes: [{ id: "gid://shopify/SellingPlan/1" }] },
                    product0: true,
                    variant0: false,
                  },
                },
              },
        })),
      },
    });
  });

  it.each([null, { revision: 'stale', pricingMode: 'standard' }])('does not sign unpublished or stale configuration: %j', async (published) => {
    (unauthenticated.admin as jest.Mock).mockResolvedValue({ admin: { graphql: jest.fn().mockResolvedValue({ json: async () => ({ data: { shop: { id: 'gid://shopify/Shop/1', policy: { compareDigest: 'digest', value: JSON.stringify({ 'bundle-1': published }) } } } }) }) } });
    const response = await action({ request: makeSignedRequest({ bundleId: 'bundle-1', bundleType: 'product_page', offerGroupId: 'group-1', components: [{ variantId: 'gid://shopify/ProductVariant/101', quantity: 1 }] }) } as any);
    expect(response.status).toBe(409);
    expect(await response.json()).not.toHaveProperty('token');
  });

  afterAll(() => {
    process.env.SHOPIFY_API_SECRET = originalSecret;
  });

  it.each([
    ["full_page", { scheduleMode: "one_time", endsAt: "2026-09-14T10:00:00Z" }, 403],
    ["product_page", { scheduleMode: "one_time", startsAt: "2026-09-14T11:00:00Z" }, 403],
    ["full_page", { scheduleMode: "one_time", startsAt: "2026-09-14T10:00:00Z" }, 200],
    ["product_page", { scheduleMode: "one_time", endsAt: "invalid" }, 403],
    ["full_page", { scheduleMode: "recurring", recurrenceFrequency: "weekly", recurrenceTimezone: "UTC", recurrenceAnchorDate: "2026-09-14", recurrenceWindowStartMinute: 600, recurrenceWindowEndMinute: 660 }, 200],
    ["full_page", { scheduleMode: "recurring", recurrenceFrequency: "weekly", recurrenceTimezone: "UTC", recurrenceAnchorDate: "2026-09-14", recurrenceWindowStartMinute: 540, recurrenceWindowEndMinute: 600 }, 403],
  ])("enforces %s schedule before issuing authorization: %j", async (bundleType, offerPolicy, status) => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-14T10:00:00Z"));
    try {
      mockDb.bundle.findFirst.mockResolvedValue(makeBundle({ bundleType, offerPolicy }));
      const response = await action({ request: makeSignedRequest({
        bundleId: "bundle-1", bundleType, offerGroupId: "FBP-bundle-1_ABC",
        components: [{ variantId: "101", quantity: 1 }],
      }), params: {}, context: {} } as any) as Response;
      expect(response.status).toBe(status);
      if (status === 403) {
        expect(unauthenticated.admin).not.toHaveBeenCalled();
        expect(await response.json()).not.toHaveProperty("token");
      }
    } finally {
      jest.useRealTimers();
    }
  });

  it.each(["draft", "archived", "paused", undefined])("does not sign an unavailable bundle with status %s", async (status) => {
    mockDb.bundle.findFirst.mockResolvedValue(makeBundle({ status }));
    const response = await action({ request: makeSignedRequest({
      bundleId: "bundle-1", bundleType: "product_page", offerGroupId: "bundle-1_GROUP",
      components: [{ variantId: "101", quantity: 1 }],
    }), params: {}, context: {} } as any) as Response;
    expect(response.status).toBe(403);
    expect(unauthenticated.admin).not.toHaveBeenCalled();
    expect(await response.json()).not.toHaveProperty("token");
  });

  it("rejects GET without exposing a Remix missing-loader error", async () => {
    const response = loader();

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST, OPTIONS");
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Method not allowed",
    });
  });

  it("rejects invalid app-proxy signatures", async () => {
    const request = makeSignedRequest({
      bundleId: "bundle-1",
      bundleType: "product_page",
      offerGroupId: "MIX-bundle-1_ABC",
      components: [{ variantId: "101", quantity: 1 }],
    });
    const url = new URL(request.url);
    url.searchParams.set("signature", "bad-signature");

    const response = await action({
      request: new Request(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      params: {},
      context: {},
    } as any) as Response;

    expect(response.status).toBe(400);
    expect(mockDb.bundle.findFirst).not.toHaveBeenCalled();
  });

  it("rejects selected variants that are not in the bundle", async () => {
    const response = await action({
      request: makeSignedRequest({
        bundleId: "bundle-1",
        bundleType: "product_page",
        offerGroupId: "MIX-bundle-1_ABC",
        components: [{ variantId: "999", quantity: 1 }],
      }),
      params: {},
      context: {},
    } as any) as Response;

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/invalid runtime token payload/i);
  });

  it("returns a token for a valid product-page runtime selection", async () => {
    const response = await action({
      request: makeSignedRequest({
        bundleId: "bundle-1",
        bundleType: "product_page",
        offerGroupId: "MIX-bundle-1_ABC",
        components: [{ variantId: "101", quantity: 1 }],
      }),
      params: {},
      context: {},
    } as any) as Response;

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(typeof body.token).toBe("string");
    const secret = generateCartTransformRuntimeTokenSecret("test-shop.myshopify.com", "test_api_secret");
    expect(verifyRuntimeCartToken(body.token, secret)).toMatchObject({
      shop: "test-shop.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "product_page",
      offerGroupId: "MIX-bundle-1_ABC",
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 1 }],
    });
  });

  it("revalidates a saved selling plan and exact selected variant before signing", async () => {
    mockDb.bundle.findFirst.mockResolvedValue(makeBundle({
      bundleSubscriptionConfig: {
        version: 1,
        enabled: true,
        selectedGroup: {
          id: "gid://shopify/SellingPlanGroup/1",
          name: "Subscribe",
          options: [],
          plans: [{ id: "gid://shopify/SellingPlan/1", sourceName: "Monthly", options: [], position: 1, pricingPolicies: [] }],
        },
        selectedPlanIds: ["gid://shopify/SellingPlan/1"],
        defaultPurchaseOption: { kind: "selling_plan", sellingPlanId: "gid://shopify/SellingPlan/1" },
        oneTimePurchase: { enabled: true, title: "One time", description: "" },
        copy: { title: "Purchase options", subtitle: "", unavailableMessage: "Unavailable" },
        planCopy: { "gid://shopify/SellingPlan/1": { displayName: "Monthly", discountPill: "", description: "" } },
        showDiscountOnProductCards: false,
        recurringBundleDiscount: false,
        translations: {},
      },
    }));
    const response = await action({
      request: makeSignedRequest({
        bundleId: "bundle-1",
        bundleType: "product_page",
        offerGroupId: "bundle-1_SESSION",
        components: [{ variantId: "101", quantity: 1 }],
        subscription: {
          sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
          sellingPlanId: "gid://shopify/SellingPlan/1",
          recurringBundleDiscount: false,
        },
      }),
      params: {}, context: {},
    } as any) as Response;
    expect(response.status).toBe(200);
    const body = await response.json();
    const secret = generateCartTransformRuntimeTokenSecret("test-shop.myshopify.com", "test_api_secret");
    expect(verifyRuntimeCartToken(body.token, secret)?.subscription).toEqual({
      sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
      sellingPlanId: "gid://shopify/SellingPlan/1",
      recurringBundleDiscount: false,
    });
  });

  it("returns a token for a category-grouped product with canonical membership", async () => {
    mockDb.bundle.findFirst.mockResolvedValue(makeBundle({
      steps: [
        {
          StepProduct: [
            {
              productId: "gid://shopify/Product/5",
              variants: [],
            },
          ],
          StepCategory: [
            {
              products: [
                {
                  id: "gid://shopify/Product/5",
                  variants: [],
                },
              ],
            },
          ],
        },
      ],
    }));

    const response = await action({
      request: makeSignedRequest({
        bundleId: "bundle-1",
        bundleType: "product_page",
        offerGroupId: "MIX-bundle-1_ABC",
        components: [{ variantId: 501, productId: "gid://shopify/Product/5", quantity: 1 }],
      }),
      params: {},
      context: {},
    } as any) as Response;

    expect(response.status).toBe(200);
    const body = await response.json();
    const secret = generateCartTransformRuntimeTokenSecret("test-shop.myshopify.com", "test_api_secret");
    expect(verifyRuntimeCartToken(body.token, secret)).toMatchObject({
      bundleType: "product_page",
      offerGroupId: "MIX-bundle-1_ABC",
      components: [{ variantId: "gid://shopify/ProductVariant/501", quantity: 1 }],
    });
  });

  it("returns a token for a valid full-page runtime selection", async () => {
    mockDb.bundle.findFirst.mockResolvedValue(makeBundle({ bundleType: "full_page" }));

    const response = await action({
      request: makeSignedRequest({
        bundleId: "bundle-1",
        bundleType: "full_page",
        offerGroupId: "FBP-bundle-1_ABC",
        components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 2 }],
      }),
      params: {},
      context: {},
    } as any) as Response;

    expect(response.status).toBe(200);
    const body = await response.json();
    const secret = generateCartTransformRuntimeTokenSecret("test-shop.myshopify.com", "test_api_secret");
    expect(verifyRuntimeCartToken(body.token, secret)).toMatchObject({
      bundleType: "full_page",
      offerGroupId: "FBP-bundle-1_ABC",
      components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 2 }],
    });
  });
});
