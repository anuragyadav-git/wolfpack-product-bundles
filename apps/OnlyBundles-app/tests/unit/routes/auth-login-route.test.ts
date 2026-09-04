import { action, loader } from "../../../app/routes/auth/auth.login/route";
import { login } from "../../../app/shopify.server";

jest.mock("../../../app/shopify.server", () => ({
  login: jest.fn(),
}));

const shopifyLogin = login as jest.MockedFunction<typeof login>;

describe("Shopify login route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    shopifyLogin.mockResolvedValue({} as never);
  });

  it("delegates embedded query parameters to Shopify's login handler", async () => {
    const request = new Request(
      "https://app.example.com/auth/login?shop=test-shop.myshopify.com&host=encoded-host&id_token=token",
    );

    await loader({ request, params: {}, context: {} });

    expect(shopifyLogin).toHaveBeenCalledWith(request);
  });

  it("delegates submitted shops to Shopify's login handler", async () => {
    const formData = new FormData();
    formData.set("shop", "test-shop.myshopify.com");
    const request = new Request("https://app.example.com/auth/login", {
      method: "POST",
      body: formData,
    });

    await action({ request, params: {}, context: {} });

    expect(shopifyLogin).toHaveBeenCalledWith(request);
  });

  it("propagates Shopify's login redirect response", async () => {
    const loginResponse = new Response(null, {
      status: 302,
      headers: { Location: "https://shopify.com/admin/oauth/authorize" },
    });
    shopifyLogin.mockRejectedValue(loginResponse);

    await expect(
      loader({
        request: new Request(
          "https://app.example.com/auth/login?shop=test-shop.myshopify.com",
        ),
        params: {},
        context: {},
      }),
    ).rejects.toBe(loginResponse);
  });
});
