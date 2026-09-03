/**
 * Unit tests — shared bundle subscription validation handler
 */

import { handleValidateSellingPlanGroups } from "../../../app/services/bundle-subscription-discovery.server";
import { SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE } from "../../../app/lib/bundle-subscriptions";

type ProductRecord = {
  id: string;
  title: string;
  variants: string[];
  sellingPlanGroups: Array<{
    id: string;
    name: string;
    eligibleVariantIds: string[];
    appliesToWholeProduct?: boolean;
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

  return (query: string, options?: { variables?: { ids?: string[] } }) => {
    if (query.includes("CollectionProductsForSellingPlanValidationBatch")) {
      return Promise.resolve({
        json: async () => ({
          data: {
            nodes: [{
                id: collectionId,
                products: {
                  nodes: productIdsFromCollection.map((id) => ({ id })),
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              }],
          },
        }),
      } as any);
    }

    if (query.includes("ProductsWithSellingPlanGroupsBatch")) {
      const requestedIds = options?.variables?.ids ?? [];
      return Promise.resolve({
        json: async () => ({
          data: {
            nodes: (overrides.products ?? [])
              .filter(({ id }) => requestedIds.includes(id))
              .map((product) => ({
              id: product.id,
              title: product.title,
              variants: {
                nodes: product.variants.map((id) => ({ id })),
                pageInfo: { hasNextPage: false, endCursor: null },
              },
              sellingPlanGroups: { nodes: product.sellingPlanGroups.map((group) => ({
                id: group.id,
                name: group.name,
                options: ["Delivery every"],
                position: 1,
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

    if (query.includes("SellingPlanGroupAssignmentsBatch")) {
      const requestedIds = options?.variables?.ids ?? [];
      const records = overrides.products ?? [];
      return Promise.resolve({
        json: async () => ({
          data: {
            nodes: requestedIds.map((groupId) => ({
              id: groupId,
              products: {
                nodes: records
                  .filter((product) => product.sellingPlanGroups.some(
                    (group) => group.id === groupId && group.appliesToWholeProduct === true,
                  ))
                  .map((product) => ({ id: product.id })),
                pageInfo: { hasNextPage: false, endCursor: null },
              },
              productVariants: {
                nodes: records.flatMap((product) => product.sellingPlanGroups
                  .filter((group) => group.id === groupId)
                  .flatMap((group) => group.eligibleVariantIds)
                  .map((id) => ({ id }))),
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            })),
          },
        }),
      } as any);
    }

    return Promise.resolve({ json: async () => ({ data: {} }) } as any);
  };
}

describe("bundle subscription validation handler", () => {
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

    const response = await handleValidateSellingPlanGroups(admin, SESSION, "bundle-1", "product_page");
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
    expect(admin.graphql.mock.calls.filter(([query]: [string]) =>
      query.includes("ProductsWithSellingPlanGroupsBatch"))).toHaveLength(1);
    expect(admin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("ProductsWithSellingPlanGroupsBatch"),
      { variables: { ids: ["gid://shopify/Product/111", "gid://shopify/Product/222"] } },
    );
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

    const response = await handleValidateSellingPlanGroups(admin, SESSION, "bundle-1", "product_page");
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

    const response = await handleValidateSellingPlanGroups(admin, SESSION, "bundle-1", "product_page");
    const body = await response.json() as any;
    expect(body.isValid).toBe(false);
    expect(body.groups).toEqual([]);
  });

  it("accepts all selectable variants when the provider assigns the whole product", async () => {
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
            eligibleVariantIds: [],
            appliesToWholeProduct: true,
          }],
        }],
      })),
    } as any;
    getDb().bundle.findFirst.mockResolvedValue({ ...baseBundle, steps: [{ ...baseBundle.steps[0], StepCategory: [] }] });

    const response = await handleValidateSellingPlanGroups(admin, SESSION, "bundle-1", "product_page");
    const body = await response.json() as any;

    expect(body.isValid).toBe(true);
    expect(body.groups).toHaveLength(1);
  });

  it("uses the same discovery contract for full-page bundles", async () => {
    const admin = {
      graphql: jest.fn(makeBundleResponse({
        collectionProductIds: [],
        products: [{
          id: "gid://shopify/Product/111",
          title: "Direct Product",
          variants: ["gid://shopify/ProductVariant/1111"],
          sellingPlanGroups: [{
            id: "gid://shopify/SellingPlanGroup/monthly",
            name: "Monthly",
            eligibleVariantIds: ["gid://shopify/ProductVariant/1111"],
          }],
        }],
      })),
    } as any;
    getDb().bundle.findFirst.mockResolvedValue({
      ...baseBundle,
      bundleType: "full_page",
      steps: [{ ...baseBundle.steps[0], StepCategory: [] }],
    });

    const response = await handleValidateSellingPlanGroups(
      admin,
      SESSION,
      "bundle-1",
      "full_page",
    );
    const body = await response.json() as any;

    expect(body.isValid).toBe(true);
    expect(getDb().bundle.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ bundleType: "full_page" }),
    }));
  });

  it("paginates collection-product variants and validates assignments beyond the first page", async () => {
    const productId = "gid://shopify/Product/111";
    const firstVariant = "gid://shopify/ProductVariant/1111";
    const secondVariant = "gid://shopify/ProductVariant/1112";
    const groupId = "gid://shopify/SellingPlanGroup/monthly";
    const admin = {
      graphql: jest.fn(async (query: string, options: any) => {
        if (query.includes("ProductsWithSellingPlanGroupsBatch")) {
          return {
            json: async () => ({
              data: {
                nodes: [{
                  id: productId,
                  title: "Paginated product",
                  variants: {
                    nodes: [{ id: firstVariant }],
                    pageInfo: {
                      hasNextPage: true,
                      endCursor: "variant-cursor",
                    },
                  },
                  sellingPlanGroups: { nodes: [{
                    id: groupId,
                    name: "Monthly",
                    options: [],
                    position: 1,
                    sellingPlans: { nodes: [{
                      id: "gid://shopify/SellingPlan/monthly",
                      name: "Monthly",
                      options: [],
                      position: 1,
                      pricingPolicies: [],
                    }] },
                  }] },
                }],
              },
            }),
          } as any;
        }
        if (query.includes("ProductVariantsForSellingPlanValidation")) {
          return {
            json: async () => ({
              data: {
                node: {
                  variants: {
                    nodes: [{ id: secondVariant }],
                    pageInfo: { hasNextPage: false, endCursor: null },
                  },
                },
              },
            }),
          } as any;
        }
        if (query.includes("SellingPlanGroupAssignmentsBatch")) {
          return {
            json: async () => ({
              data: {
                nodes: [{
                  id: groupId,
                  products: {
                    nodes: [],
                    pageInfo: { hasNextPage: false, endCursor: null },
                  },
                  productVariants: {
                    nodes: [{ id: firstVariant }, { id: secondVariant }],
                    pageInfo: { hasNextPage: false, endCursor: null },
                  },
                }],
              },
            }),
          } as any;
        }
        return { json: async () => ({ data: {} }) } as any;
      }),
    } as any;
    getDb().bundle.findFirst.mockResolvedValue({
      ...baseBundle,
      steps: [{
        ...baseBundle.steps[0],
        StepProduct: [],
        StepCategory: [{
          id: "cat-1",
          products: [{ id: productId }],
          collections: [],
        }],
      }],
    });

    const response = await handleValidateSellingPlanGroups(
      admin,
      SESSION,
      "bundle-1",
      "product_page",
    );
    const body = await response.json() as any;

    expect(body.isValid).toBe(true);
    expect(admin.graphql.mock.calls.filter(([query]: [string]) =>
      query.includes("ProductsWithSellingPlanGroupsBatch"))).toHaveLength(1);
    expect(admin.graphql.mock.calls.filter(([query]: [string]) =>
      query.includes("ProductVariantsForSellingPlanValidation"))).toHaveLength(1);
    expect(admin.graphql.mock.calls.filter(([query]: [string]) =>
      query.includes("SellingPlanGroupAssignmentsBatch"))).toHaveLength(1);
  });
});
