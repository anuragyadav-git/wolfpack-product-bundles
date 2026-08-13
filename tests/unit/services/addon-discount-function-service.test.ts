import { AddOnDiscountFunctionService } from "../../../app/services/addon-discount-function-service.server";
import { createMockGraphQLResponse, mockShopifyAdmin } from "../../setup";

const MOCK_DISCOUNT_FUNCTION_ID = "gid://shopify/ShopifyFunction/addon-discount-1";
const MOCK_DISCOUNT_FUNCTION_HANDLE = "bundle-discount-function";
const MOCK_DISCOUNT_ID = "gid://shopify/DiscountAutomaticNode/1";

function addOnFunctionsMock() {
  return createMockGraphQLResponse({
    shopifyFunctions: {
      nodes: [
        {
          id: MOCK_DISCOUNT_FUNCTION_ID,
          handle: MOCK_DISCOUNT_FUNCTION_HANDLE,
          title: "Translated Add-on Discount",
          apiType: "discount",
        },
      ],
    },
  });
}

function addOnFunctionsEmptyMock() {
  return createMockGraphQLResponse({
    shopifyFunctions: { nodes: [] },
  });
}

function automaticDiscountMock({
  id = MOCK_DISCOUNT_ID,
  status = "ACTIVE",
  functionId = MOCK_DISCOUNT_FUNCTION_ID,
}: {
  id?: string;
  status?: string;
  functionId?: string;
} = {}) {
  return {
    id,
    discount: {
      __typename: "DiscountAutomaticApp",
      title: "Add On",
      status,
      appDiscountType: { functionId },
    },
  };
}

describe("AddOnDiscountFunctionService", () => {
  const shopDomain = "test-shop.myshopify.com";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the automatic app discount by stable function handle when none exists", async () => {
    mockShopifyAdmin.graphql
      .mockResolvedValueOnce(addOnFunctionsMock())
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountNodes: { nodes: [] },
      }))
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountAutomaticAppCreate: {
          automaticAppDiscount: {
            discountId: MOCK_DISCOUNT_ID,
            title: "Add On",
            status: "ACTIVE",
          },
          userErrors: [],
        },
      }));

    const result = await AddOnDiscountFunctionService.completeSetup(
      mockShopifyAdmin,
      shopDomain,
    );

    expect(result.success).toBe(true);
    expect(result.discountId).toBe(MOCK_DISCOUNT_ID);
    expect(result.outcome).toBe("created");
    expect(mockShopifyAdmin.graphql).toHaveBeenCalledTimes(3);

    expect(mockShopifyAdmin.graphql.mock.calls[0][0]).toContain("handle");
    expect(mockShopifyAdmin.graphql.mock.calls[0][1]).toMatchObject({
      apiVersion: "2026-07",
    });

    const createCall = mockShopifyAdmin.graphql.mock.calls[2];
    expect(createCall[0]).toContain("discountAutomaticAppCreate");
    expect(createCall[1].variables.automaticAppDiscount).toMatchObject({
      title: "Add On",
      functionHandle: MOCK_DISCOUNT_FUNCTION_HANDLE,
      discountClasses: ["PRODUCT"],
      combinesWith: {
        orderDiscounts: true,
        productDiscounts: true,
        shippingDiscounts: false,
      },
    });
    expect(createCall[1].variables.automaticAppDiscount).not.toHaveProperty("functionId");
    expect(createCall[1].variables.automaticAppDiscount.startsAt).toEqual(expect.any(String));
  });

  it("returns already active without mutating a matching active discount", async () => {
    mockShopifyAdmin.graphql
      .mockResolvedValueOnce(addOnFunctionsMock())
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountNodes: {
          nodes: [automaticDiscountMock()],
        },
      }));

    const result = await AddOnDiscountFunctionService.completeSetup(
      mockShopifyAdmin,
      shopDomain,
    );

    expect(result.success).toBe(true);
    expect(result.discountId).toBe(MOCK_DISCOUNT_ID);
    expect(result.outcome).toBe("already_active");
    expect(mockShopifyAdmin.graphql).toHaveBeenCalledTimes(2);
  });

  it("creates a role-tagged first-order subscription discount with one recurring cycle", async () => {
    mockShopifyAdmin.graphql
      .mockResolvedValueOnce(addOnFunctionsMock())
      .mockResolvedValueOnce(createMockGraphQLResponse({ discountNodes: { nodes: [] } }))
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountAutomaticAppCreate: {
          automaticAppDiscount: { discountId: MOCK_DISCOUNT_ID, status: "ACTIVE" },
          userErrors: [],
        },
      }));

    const result = await AddOnDiscountFunctionService.completeSubscriptionInitialSetup(
      mockShopifyAdmin,
      shopDomain,
    );
    expect(result.success).toBe(true);
    expect(mockShopifyAdmin.graphql.mock.calls[2][1].variables.automaticAppDiscount).toMatchObject({
      title: "Bundle Subscription - Initial Order",
      recurringCycleLimit: 1,
      metafields: [{
        namespace: "$app",
        key: "discount_role",
        type: "single_line_text_field",
        value: "subscription_initial",
      }],
    });
  });

  it.each(["DISABLED", "EXPIRED"])(
    "reactivates a matching %s automatic discount",
    async (status) => {
      mockShopifyAdmin.graphql
        .mockResolvedValueOnce(addOnFunctionsMock())
        .mockResolvedValueOnce(createMockGraphQLResponse({
          discountNodes: {
            nodes: [automaticDiscountMock({ status })],
          },
        }))
        .mockResolvedValueOnce(createMockGraphQLResponse({
          discountAutomaticActivate: {
            automaticDiscountNode: {
              id: MOCK_DISCOUNT_ID,
              automaticDiscount: {
                __typename: "DiscountAutomaticApp",
                status: "ACTIVE",
              },
            },
            userErrors: [],
          },
        }));

      const result = await AddOnDiscountFunctionService.completeSetup(
        mockShopifyAdmin,
        shopDomain,
      );

      expect(result).toMatchObject({
        success: true,
        discountId: MOCK_DISCOUNT_ID,
        outcome: "reactivated",
      });
      expect(mockShopifyAdmin.graphql.mock.calls[2][0]).toContain(
        "discountAutomaticActivate",
      );
      expect(mockShopifyAdmin.graphql.mock.calls[2][1].variables).toEqual({
        id: MOCK_DISCOUNT_ID,
      });
    },
  );

  it("does not reuse an Add On discount owned by a different function", async () => {
    mockShopifyAdmin.graphql
      .mockResolvedValueOnce(addOnFunctionsMock())
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountNodes: {
          nodes: [automaticDiscountMock({
            functionId: "gid://shopify/ShopifyFunction/wrong-function",
          })],
        },
      }))
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountAutomaticAppCreate: {
          automaticAppDiscount: {
            discountId: MOCK_DISCOUNT_ID,
            status: "ACTIVE",
          },
          userErrors: [],
        },
      }));

    const result = await AddOnDiscountFunctionService.completeSetup(
      mockShopifyAdmin,
      shopDomain,
    );

    expect(result.outcome).toBe("created");
    expect(mockShopifyAdmin.graphql).toHaveBeenCalledTimes(3);
  });

  it("returns failure when the add-on discount function is not deployed", async () => {
    mockShopifyAdmin.graphql.mockResolvedValueOnce(addOnFunctionsEmptyMock());

    const result = await AddOnDiscountFunctionService.completeSetup(
      mockShopifyAdmin,
      shopDomain,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("bundle-discount-function");
    expect(mockShopifyAdmin.graphql).toHaveBeenCalledTimes(1);
  });

  it("surfaces automatic discount creation user errors", async () => {
    mockShopifyAdmin.graphql
      .mockResolvedValueOnce(addOnFunctionsMock())
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountNodes: { nodes: [] },
      }))
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountAutomaticAppCreate: {
          automaticAppDiscount: null,
          userErrors: [{ field: ["functionHandle"], message: "Function not found" }],
        },
      }));

    const result = await AddOnDiscountFunctionService.completeSetup(
      mockShopifyAdmin,
      shopDomain,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Function not found");
    expect(result.outcome).toBeUndefined();
  });

  it("surfaces automatic discount activation user errors", async () => {
    mockShopifyAdmin.graphql
      .mockResolvedValueOnce(addOnFunctionsMock())
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountNodes: {
          nodes: [automaticDiscountMock({ status: "EXPIRED" })],
        },
      }))
      .mockResolvedValueOnce(createMockGraphQLResponse({
        discountAutomaticActivate: {
          automaticDiscountNode: null,
          userErrors: [{ field: ["id"], message: "Discount cannot be activated" }],
        },
      }));

    const result = await AddOnDiscountFunctionService.completeSetup(
      mockShopifyAdmin,
      shopDomain,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Discount cannot be activated");
    expect(result.outcome).toBeUndefined();
  });

  it("does not create a discount when the existing-discount query fails", async () => {
    mockShopifyAdmin.graphql
      .mockResolvedValueOnce(addOnFunctionsMock())
      .mockResolvedValueOnce({
        json: async () => ({
          errors: [{ message: "Discount lookup failed" }],
        }),
      });

    const result = await AddOnDiscountFunctionService.completeSetup(
      mockShopifyAdmin,
      shopDomain,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Discount lookup failed");
    expect(mockShopifyAdmin.graphql).toHaveBeenCalledTimes(2);
  });
});
