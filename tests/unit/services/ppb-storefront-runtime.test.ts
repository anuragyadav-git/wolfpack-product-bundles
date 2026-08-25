import {
  PPB_STOREFRONT_TOKEN_TITLE,
  assertPpbStorefrontSnapshotSize,
  buildPpbStorefrontRuntime,
  ensurePpbStorefrontAccessToken,
} from "../../../app/services/ppb-storefront-runtime.server";

function response(data: unknown) {
  return { json: async () => data };
}

describe("PPB Shopify-hosted storefront runtime", () => {
  it("reuses the single titled public Storefront token", async () => {
    const admin = {
      graphql: jest.fn().mockResolvedValue(response({
        data: { shop: { storefrontAccessTokens: { nodes: [
          { id: "gid://shopify/StorefrontAccessToken/1", title: PPB_STOREFRONT_TOKEN_TITLE, accessToken: "public-token" },
        ] } } },
      })),
    };

    await expect(ensurePpbStorefrontAccessToken(admin as any)).resolves.toBe("public-token");
    expect(admin.graphql).toHaveBeenCalledTimes(1);
  });

  it("creates a public Storefront token only when the titled token is absent", async () => {
    const admin = {
      graphql: jest.fn()
        .mockResolvedValueOnce(response({ data: { shop: { storefrontAccessTokens: { nodes: [] } } } }))
        .mockResolvedValueOnce(response({ data: { storefrontAccessTokenCreate: {
          storefrontAccessToken: { accessToken: "created-token" }, userErrors: [],
        } } })),
    };

    await expect(ensurePpbStorefrontAccessToken(admin as any)).resolves.toBe("created-token");
    expect(admin.graphql.mock.calls[1][1].variables.input.title).toBe(PPB_STOREFRONT_TOKEN_TITLE);
  });

  it("builds locale-keyed language and Product Page controls without an origin URL", () => {
    const runtime = buildPpbStorefrontRuntime({
      storefrontAccessToken: "public-token",
      generalSettings: {},
    });

    expect(runtime).toMatchObject({
      schemaVersion: 1,
      storefrontApiVersion: "2026-07",
      storefrontAccessToken: "public-token",
      controls: { bundleType: "product_page" },
    });
    expect(runtime.languages.en.activeLocale).toBe("en");
    expect(JSON.stringify(runtime)).not.toContain("serverUrl");
  });

  it("rejects an oversized JSON snapshot before Shopify is called", () => {
    expect(() => assertPpbStorefrontSnapshotSize("runtime", { value: "x".repeat(128 * 1024) }))
      .toThrow(/exceeds Shopify's 128KB JSON limit/);
  });
});
