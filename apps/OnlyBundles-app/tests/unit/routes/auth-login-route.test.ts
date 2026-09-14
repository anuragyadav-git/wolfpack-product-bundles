import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LoginErrorType } from "@shopify/shopify-app-remix/server";
import Auth, {
  action,
  loader,
} from "../../../app/routes/auth/auth.login/route";
import { login } from "../../../app/shopify.server";

jest.mock("@remix-run/react", () => {
  const actual = jest.requireActual("@remix-run/react");
  const React = jest.requireActual("react");

  return {
    ...actual,
    Form: ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) =>
      React.createElement("form", props, children),
    useActionData: jest.fn(),
    useLoaderData: jest.fn(),
  };
});

jest.mock("../../../app/shopify.server", () => ({
  login: jest.fn(),
}));

const shopifyLogin = login as jest.MockedFunction<typeof login>;
const { useActionData, useLoaderData } = jest.requireMock(
  "@remix-run/react"
) as {
  useActionData: jest.Mock;
  useLoaderData: jest.Mock;
};

describe("Shopify login route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    shopifyLogin.mockResolvedValue({} as never);
    useActionData.mockReturnValue(undefined);
    useLoaderData.mockReturnValue({ errors: {} });
  });

  it("returns normalized login errors without a React Polaris translation payload", async () => {
    const request = new Request("https://app.example.com/auth/login");

    await expect(loader({ request, params: {}, context: {} })).resolves.toEqual(
      {
        errors: {},
      }
    );
  });

  it("renders a Shopify-native shop field and submit action", () => {
    const view = renderToStaticMarkup(React.createElement(Auth));

    expect(view).toContain("<s-page");
    expect(view).toContain("<s-text-field");
    expect(view).toContain('name="shop"');
    expect(view).toContain("<s-button");
    expect(view).toContain('type="submit"');
  });

  it("keeps an invalid shop error on the owning field", async () => {
    shopifyLogin.mockResolvedValue({
      shop: LoginErrorType.InvalidShop,
    } as never);
    const request = new Request("https://app.example.com/auth/login");

    const result = await loader({ request, params: {}, context: {} });
    useLoaderData.mockReturnValue(result);
    const view = renderToStaticMarkup(React.createElement(Auth));

    expect(view).toContain(
      'error="Please enter a valid shop domain to log in"'
    );
  });

  it("delegates embedded query parameters to Shopify's login handler", async () => {
    const request = new Request(
      "https://app.example.com/auth/login?shop=test-shop.myshopify.com&host=encoded-host&id_token=token"
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
          "https://app.example.com/auth/login?shop=test-shop.myshopify.com"
        ),
        params: {},
        context: {},
      })
    ).rejects.toBe(loginResponse);
  });
});
