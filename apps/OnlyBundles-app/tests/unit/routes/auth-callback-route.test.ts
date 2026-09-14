import { loader } from "../../../app/routes/auth/auth.$";
import { authenticate } from "../../../app/shopify.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

const authenticateAdmin = authenticate.admin as jest.MockedFunction<
  typeof authenticate.admin
>;

describe("Shopify OAuth callback route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateAdmin.mockResolvedValue({} as never);
  });

  it("delegates the callback to Shopify authentication without a second redirect", async () => {
    const request = new Request("https://app.example.com/auth/callback");

    await expect(
      loader({ request, params: {}, context: {} }),
    ).resolves.toBeNull();
    expect(authenticateAdmin).toHaveBeenCalledWith(request);
  });

  it("propagates Shopify's authentication response", async () => {
    const authResponse = new Response(null, {
      status: 302,
      headers: { Location: "https://admin.shopify.com" },
    });
    authenticateAdmin.mockRejectedValue(authResponse);

    await expect(
      loader({
        request: new Request("https://app.example.com/auth/callback"),
        params: {},
        context: {},
      }),
    ).rejects.toBe(authResponse);
  });
});
