import { action, loader } from "../../../app/routes/api/api.checkout-bundle-offer-token";
import prisma from "../../../app/db.server";
import { authenticate } from "../../../app/shopify.server";
import {
  generateCartTransformRuntimeTokenSecret,
  signRuntimeCartToken,
  verifyRuntimeCartToken,
  type RuntimeTokenPayload,
} from "../../../app/services/cart-transform-runtime-token.server";

jest.mock("../../../app/db.server", () => ({
  bundle: { findFirst: jest.fn() },
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: {
    public: { checkout: jest.fn() },
  },
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

const mockDb = prisma as any;
const mockCheckoutAuth = authenticate.public.checkout as jest.Mock;

function makeBundle(overrides: Record<string, unknown> = {}) {
  return {
    id: "bundle-1",
    shopId: "test-shop.myshopify.com",
    status: "ACTIVE",
    bundleType: "full_page",
    personalizationData: {
      addonProducts: {
        isEnabled: true,
        tiers: [{
          tierId: "tier-1",
          maxQuantity: 3,
          eligibilityCondition: { type: "QUANTITY", value: 2 },
          discount: { type: "PERCENTAGE", value: 25 },
          selectedAddonProducts: [{
            title: "Extra",
            variants: [{ variantGraphqlId: "gid://shopify/ProductVariant/201", title: "Default Title" }],
          }],
        }],
      },
    },
    steps: [],
    ...overrides,
  };
}

function parentPayload(shop = "test-shop.myshopify.com"): RuntimeTokenPayload {
  return {
    version: 1,
    shop,
    bundleId: "bundle-1",
    bundleType: "full_page",
    offerGroupId: "FBP-bundle-1_SESSION",
    parentVariantId: "gid://shopify/ProductVariant/999",
    bundleName: "Bundle",
    components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 2 }],
    addons: [],
    priceAdjustment: { method: "percentage_off", value: 10 },
    countryRule: "",
  };
}

function tokenFor(payload = parentPayload(), shop = payload.shop) {
  return signRuntimeCartToken(
    payload,
    generateCartTransformRuntimeTokenSecret(shop, "test_api_secret"),
  );
}

function request(body: Record<string, unknown>) {
  return new Request("https://app.example.com/api/checkout-bundle-offer-token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer checkout-token" },
    body: JSON.stringify(body),
  });
}

async function call(body: Record<string, unknown>) {
  return action({ request: request(body), params: {}, context: {} } as any) as Promise<Response>;
}

describe("checkout bundle offer token route", () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = "test_api_secret";
    mockCheckoutAuth.mockResolvedValue({
      sessionToken: { dest: "https://test-shop.myshopify.com" },
      cors: (response: Response) => response,
    });
    mockDb.bundle.findFirst.mockResolvedValue(makeBundle());
  });

  it("rejects GET with a controlled method contract", async () => {
    const response = loader();
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST, OPTIONS");
  });

  afterAll(() => {
    process.env.SHOPIFY_API_SECRET = originalSecret;
  });

  it("issues an exact variant and quantity token with server-derived discount attributes", async () => {
    const response = await call({
      parentToken: tokenFor(),
      offerKey: "fpb:tier-1",
      selectedVariantId: "gid://shopify/ProductVariant/201",
      quantity: 3,
      discount: { type: "PERCENTAGE", value: 99 },
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    const decoded = verifyRuntimeCartToken(
      body.token,
      generateCartTransformRuntimeTokenSecret("test-shop.myshopify.com", "test_api_secret"),
    );
    expect(decoded).toMatchObject({
      shop: "test-shop.myshopify.com",
      offerGroupId: "FBP-bundle-1_SESSION",
      parentVariantId: "gid://shopify/ProductVariant/999",
      addons: [{
        variantId: "gid://shopify/ProductVariant/201",
        quantity: 3,
        discount: { type: "PERCENTAGE", value: 25 },
      }],
    });
    expect(body.attributes).toEqual(expect.arrayContaining([
      { key: "_bundle_step_type", value: "addon:PERCENTAGE:25" },
      { key: "_checkout_offer_key", value: "fpb:tier-1" },
      { key: "_wolfpack_bundle_runtime", value: body.token },
    ]));
  });

  it.each([0, 1.5, 4])("rejects invalid or over-limit quantity %s", async (quantity) => {
    const response = await call({
      parentToken: tokenFor(),
      offerKey: "fpb:tier-1",
      selectedVariantId: "gid://shopify/ProductVariant/201",
      quantity,
    });
    expect(response.status).toBe(400);
  });

  it("rejects tampered parent tokens", async () => {
    const response = await call({
      parentToken: `${tokenFor()}tampered`,
      offerKey: "fpb:tier-1",
      selectedVariantId: "gid://shopify/ProductVariant/201",
      quantity: 1,
    });
    expect(response.status).toBe(400);
    expect(mockDb.bundle.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a valid parent token from another shop", async () => {
    const foreign = parentPayload("other-shop.myshopify.com");
    const response = await call({
      parentToken: tokenFor(foreign),
      offerKey: "fpb:tier-1",
      selectedVariantId: "gid://shopify/ProductVariant/201",
      quantity: 1,
    });
    expect(response.status).toBe(400);
    expect(mockDb.bundle.findFirst).not.toHaveBeenCalled();
  });

  it("rejects variants outside the current active offer", async () => {
    const response = await call({
      parentToken: tokenFor(),
      offerKey: "fpb:tier-1",
      selectedVariantId: "gid://shopify/ProductVariant/9999",
      quantity: 1,
    });
    expect(response.status).toBe(400);
  });

  it("rejects a tier that is no longer active under current merchant configuration", async () => {
    mockDb.bundle.findFirst.mockResolvedValue(makeBundle({
      personalizationData: {
        addonProducts: {
          isEnabled: true,
          tiers: [
            {
              tierId: "tier-1",
              eligibilityCondition: { type: "QUANTITY", value: 1 },
              selectedAddonProducts: [{ variants: [{ variantGraphqlId: "gid://shopify/ProductVariant/201" }] }],
            },
            {
              tierId: "tier-2",
              eligibilityCondition: { type: "QUANTITY", value: 2 },
              selectedAddonProducts: [{ variants: [{ variantGraphqlId: "gid://shopify/ProductVariant/202" }] }],
            },
          ],
        },
      },
    }));
    const response = await call({
      parentToken: tokenFor(),
      offerKey: "fpb:tier-1",
      selectedVariantId: "gid://shopify/ProductVariant/201",
      quantity: 1,
    });
    expect(response.status).toBe(400);
  });

  it("requires Shopify checkout session-token authentication", async () => {
    mockCheckoutAuth.mockRejectedValue(new Response(null, { status: 401 }));
    await expect(call({})).rejects.toMatchObject({ status: 401 });
  });
});
