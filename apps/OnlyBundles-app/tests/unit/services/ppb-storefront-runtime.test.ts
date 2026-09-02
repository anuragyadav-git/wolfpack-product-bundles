import {
  PPB_STOREFRONT_TOKEN_TITLE,
  PPB_JSON_LIMIT_BYTES,
  assertPpbStorefrontSnapshotSize,
  buildPpbStorefrontRuntime,
  ensurePpbStorefrontAccessToken,
  syncPpbStorefrontRuntime,
} from "../../../app/services/ppb-storefront-runtime.server";
import {
  SETTINGS_LANGUAGE_LOCALES,
  buildSettingsLanguageRuntime,
} from "../../../app/lib/settings-language-runtime";
import { getInitialLanguageFieldValues } from "../../../app/routes/app/app.settings/settings-state";

jest.mock("../../../app/db.server", () => ({
  prisma: {
    designSettings: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

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
      storefrontProxyRoot: "/apps/product-bundles-sit",
      generalSettings: {},
    });

    expect(runtime).toMatchObject({
      schemaVersion: 2,
      storefrontApiVersion: "2026-07",
      storefrontAccessToken: "public-token",
      storefrontProxyRoot: "/apps/product-bundles-sit",
      controls: { bundleType: "product_page" },
    });
    expect(runtime.languages.en.activeLocale).toBe("en");
    expect(JSON.stringify(runtime)).not.toContain("serverUrl");
  });

  it("projects the saved PPB out-of-stock button copy into each locale snapshot", () => {
    const settingsLanguage = buildSettingsLanguageRuntime({
      languageMode: "MULTIPLE",
      localeFieldValues: {
        en: { "ppb.productCard.productCardOutOfStockBtnText": "QA EN unavailable" },
        fr: { "ppb.productCard.productCardOutOfStockBtnText": "QA FR indisponible" },
      },
    }).settingsLanguage;

    const runtime = buildPpbStorefrontRuntime({
      storefrontAccessToken: "public-token",
      storefrontProxyRoot: "/apps/product-bundles-sit",
      generalSettings: { settingsLanguage },
    });

    expect((runtime.languages.en.textOverrides as Record<string, string>).productCardOutOfStockButton)
      .toBe("QA EN unavailable");
    expect((runtime.languages.fr.textOverrides as Record<string, string>).productCardOutOfStockButton)
      .toBe("QA FR indisponible");
  });

  it("rejects an oversized JSON snapshot before Shopify is called", () => {
    expect(() => assertPpbStorefrontSnapshotSize("runtime", { value: "x".repeat(128 * 1024) }))
      .toThrow(/exceeds Shopify's 128KB JSON limit/);
  });

  it("keeps the complete 39-locale PPB language snapshot within Shopify's JSON limit", () => {
    const localeFieldValues = Object.fromEntries(
      SETTINGS_LANGUAGE_LOCALES.map(({ code }) => [
        code,
        getInitialLanguageFieldValues(code),
      ]),
    );
    const settingsLanguage = buildSettingsLanguageRuntime({
      languageMode: "MULTIPLE",
      localeFieldValues,
    }).settingsLanguage;
    const runtime = buildPpbStorefrontRuntime({
      storefrontAccessToken: "public-token",
      storefrontProxyRoot: "/apps/product-bundles-sit",
      generalSettings: { settingsLanguage },
    });
    const bytes = Buffer.byteLength(JSON.stringify(runtime), "utf8");

    expect(Object.keys(runtime.languages)).toHaveLength(39);
    expect(bytes).toBeLessThanOrEqual(PPB_JSON_LIMIT_BYTES);
    expect(runtime.languages.fr).not.toHaveProperty("languageData");
    expect(runtime.languages.fr).not.toHaveProperty("activeLanguageData");
  });

  it("writes the configured proxy root into the Shopify-hosted runtime", async () => {
    const admin = {
      graphql: jest.fn()
        .mockResolvedValueOnce(response({
          data: { shop: { storefrontAccessTokens: { nodes: [
            { id: "gid://shopify/StorefrontAccessToken/1", title: PPB_STOREFRONT_TOKEN_TITLE, accessToken: "public-token" },
          ] } } },
        }))
        .mockResolvedValueOnce(response({ data: { shop: { id: "gid://shopify/Shop/1" } } }))
        .mockResolvedValueOnce(response({
          data: { metafieldsSet: { metafields: [{ id: "gid://shopify/Metafield/1" }], userErrors: [] } },
        })),
    };

    await syncPpbStorefrontRuntime(
      admin as any,
      "test.myshopify.com",
      "/apps/product-bundles-sit",
    );

    const metafields = admin.graphql.mock.calls[2][1].variables.metafields;
    const runtimeField = metafields.find((field: any) => field.key === "ppb_storefront_runtime");
    expect(JSON.parse(runtimeField.value).storefrontProxyRoot).toBe(
      "/apps/product-bundles-sit",
    );
  });

  it("rejects a malformed proxy root before writing Shopify metafields", async () => {
    const admin = { graphql: jest.fn() };

    await expect(syncPpbStorefrontRuntime(
      admin as any,
      "test.myshopify.com",
      "https://example.test/apps/product-bundles-sit",
    )).rejects.toThrow("Invalid storefront proxy root");
    expect(admin.graphql).not.toHaveBeenCalled();
  });
});
