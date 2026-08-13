/**
 * Unit tests — PPB subscription validation handler
 */

import { handleValidateSellingPlanGroups } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/subscriptions.server";
import { SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE } from "../../../app/lib/bundle-config/product-page-admin-sections";

type ProductRecord = {
  id: string;
  title: string;
  variants: string[];
  sellingPlanGroups: Array<{
    id: string;
    name: string;
    eligibleVariantIds: string[];
  }>;
};

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    startTimer: jest.fn(() => jest.fn()),
  },
}));

const getDb = () => require("../../../app/db.server").default;
const SESSION = { shop: "test-shop.myshopify.com" } as any;

function makeBundleResponse(overrides: Partial<{
  products: ProductRecord[];
  collectionProductIds: string[];
}>) {
  const collectionId = "gid://shopify/Collection/555";
  const productIdsFromCollection = overrides.collectionProductIds ?? [];

  return (query: string) => {
    if (query.includes("CollectionProductsForSellingPlanValidation")) {
      return Promise.resolve({
        json: async () => ({
          data: {
            node: {
                id: collectionId,
                products: {
                  edges: productIdsFromCollection.map((id) => ({ node: { id } })),
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              },
          },
        }),
      } as any);
    }

    if (query.includes("ProductsWithSellingPlanGroups")) {
      return Promise.resolve({
        json: async () => ({
          data: {
            nodes: (overrides.products ?? []).map((product) => ({
              id: product.id,
              title: product.title,
              variants: { nodes: product.variants.map((id) => ({ id })) },
              sellingPlanGroups: { nodes: product.sellingPlanGroups.map((group) => ({
                id: group.id,
                name: group.name,
                options: ["Delivery every"],
                position: 1,
                productVariants: { nodes: group.eligibleVariantIds.map((id) => ({ id })) },
                sellingPlans: { nodes: [{
                  id: "gid://shopify/SellingPlan/monthly",
                  name: "Monthly",
                  options: ["1 month"],
                  position: 1,
                  pricingPolicies: [{
                    adjustmentType: "PERCENTAGE",
                    adjustmentValue: { percentage: 10 },
                  }],
                }] },
              })) },
            })),
          },
        }),
      } as any);
    }

    return Promise.resolve({ json: async () => ({ data: {} }) } as any);
  };
}

describe("PPB subscription validation handler", () => {
  const baseBundle = {
    id: "bundle-1",
    shopId: "test-shop.myshopify.com",
    bundleType: "product_page",
    steps: [
      {
        id: "step-1",
        StepProduct: [{ id: "gid://shopify/Product/111" }],
        StepCategory: [
          {
            id: "cat-1",
            products: [],
            collections: [{ id: "gid://shopify/Collection/555" }],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns valid when direct and collection-backed products share a selling plan group", async () => {
    const admin = {
      graphql: jest.fn(
        makeBundleResponse({
          collectionProductIds: ["gid://shopify/Product/222"],
          products: [
            {
              id: "gid://shopify/Product/111",
              title: "Direct Product",
              variants: ["gid://shopify/ProductVariant/1111"],
              sellingPlanGroups: [{ id: "gid://shopify/SellingPlanGroup/monthly", name: "Monthly", eligibleVariantIds: ["gid://shopify/ProductVariant/1111"] }],
            },
            {
              id: "gid://shopify/Product/222",
              title: "Collection Product",
              variants: ["gid://shopify/ProductVariant/2222"],
              sellingPlanGroups: [{ id: "gid://shopify/SellingPlanGroup/monthly", name: "Monthly", eligibleVariantIds: ["gid://shopify/ProductVariant/2222"] }],
            },
          ],
        }),
      ),
    } as any;

    getDb().bundle.findFirst.mockResolvedValue(baseBundle);

    const response = await handleValidateSellingPlanGroups(admin, SESSION, "bundle-1");
    const body = await response.json() as any;

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      isValid: true,
      productCount: 2,
      groups: [
        {
          id: "gid://shopify/SellingPlanGroup/monthly",
          name: "Monthly",
          options: ["Delivery every"],
          position: 1,
          plans: [{
            id: "gid://shopify/SellingPlan/monthly",
            sourceName: "Monthly",
            options: ["1 month"],
            position: 1,
            pricingPolicies: [{ kind: "percentage", value: 10, afterCycle: 0 }],
          }],
        },
      ],
      message: null,
    });
  });

  it("includes collection-backed products and returns no-common-plan when there is no overlap", async () => {
    const admin = {
      graphql: jest.fn(
        makeBundleResponse({
          collectionProductIds: ["gid://shopify/Product/333"],
          products: [
            {
              id: "gid://shopify/Product/111",
              title: "Direct Product",
              variants: ["gid://shopify/ProductVariant/1111"],
              sellingPlanGroups: [{ id: "gid://shopify/SellingPlanGroup/monthly", name: "Monthly", eligibleVariantIds: ["gid://shopify/ProductVariant/1111"] }],
            },
            {
              id: "gid://shopify/Product/333",
              title: "Collection Product",
              variants: ["gid://shopify/ProductVariant/3333"],
              sellingPlanGroups: [{ id: "gid://shopify/SellingPlanGroup/weekly", name: "Weekly", eligibleVariantIds: ["gid://shopify/ProductVariant/3333"] }],
            },
          ],
        }),
      ),
    } as any;

    getDb().bundle.findFirst.mockResolvedValue(baseBundle);

    const response = await handleValidateSellingPlanGroups(admin, SESSION, "bundle-1");
    const body = await response.json() as any;

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.isValid).toBe(false);
    expect(body.productCount).toBe(2);
    expect(body.groups).toEqual([]);
    expect(body.message).toBe(SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE);
  });

  it("fails closed when a selectable variant is not assigned to the common group", async () => {
    const admin = {
      graphql: jest.fn(makeBundleResponse({
        collectionProductIds: [],
        products: [{
          id: "gid://shopify/Product/111",
          title: "Direct Product",
          variants: ["gid://shopify/ProductVariant/1111", "gid://shopify/ProductVariant/1112"],
          sellingPlanGroups: [{
            id: "gid://shopify/SellingPlanGroup/monthly",
            name: "Monthly",
            eligibleVariantIds: ["gid://shopify/ProductVariant/1111"],
          }],
        }],
      })),
    } as any;
    getDb().bundle.findFirst.mockResolvedValue({ ...baseBundle, steps: [{ ...baseBundle.steps[0], StepCategory: [] }] });

    const response = await handleValidateSellingPlanGroups(admin, SESSION, "bundle-1");
    const body = await response.json() as any;
    expect(body.isValid).toBe(false);
    expect(body.groups).toEqual([]);
  });
});
