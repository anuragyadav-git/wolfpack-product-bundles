import { action } from "../../../app/routes/api/api.ensure-product-template";
import { authenticate } from "../../../app/shopify.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const authenticateAdmin = authenticate.admin as jest.MockedFunction<
  typeof authenticate.admin
>;

function makeRequest(body: Record<string, unknown>) {
  return new Request("https://app.example.com/api/ensure-product-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("ensure product template Admin action authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateAdmin.mockResolvedValue({
      admin: { graphql: jest.fn() },
      session: { shop: "test-shop.myshopify.com" },
    } as never);
  });

  it("propagates Shopify authentication responses", async () => {
    const authResponse = new Response(null, {
      status: 302,
      headers: { Location: "https://admin.shopify.com" },
    });
    authenticateAdmin.mockRejectedValue(authResponse);

    await expect(
      action({
        request: makeRequest({ productHandle: "bundle-product" }),
        params: {},
        context: {},
      }),
    ).rejects.toBe(authResponse);
  });

  it("validates the request only after Shopify authentication succeeds", async () => {
    const request = makeRequest({ bundleId: "bundle-1" });

    const response = await action({ request, params: {}, context: {} });

    expect(authenticateAdmin).toHaveBeenCalledWith(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Product handle is required",
    });
  });
});
