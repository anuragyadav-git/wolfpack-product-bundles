import type { CSSDesignSettings } from "../lib/css-generators";
import { generateCSSFromSettings } from "../lib/css-generators";
import { sanitizeCss } from "../lib/css-sanitizer";
import { BundleType } from "../constants/bundle";
import { buildSettingsControlsResponse } from "../lib/settings-controls-runtime";
import { buildSettingsLanguageResponse } from "../lib/settings-language-runtime";
import { buildSettingsDesignRuntime } from "../lib/settings-design-runtime";
import { isShopBrandColors } from "../lib/shop-brand-colors";
import { prisma } from "../db.server";

export const PPB_STOREFRONT_TOKEN_TITLE = "Wolfpack PPB Storefront Runtime";
export const PPB_JSON_LIMIT_BYTES = 128 * 1024;
export const PPB_CSS_LIMIT_BYTES = 64 * 1024;

type Admin = { graphql: (query: string, options?: any) => Promise<{ json: () => Promise<any> }> };

export function assertPpbStorefrontSnapshotSize(name: string, value: unknown, limit = PPB_JSON_LIMIT_BYTES) {
  const size = Buffer.byteLength(typeof value === "string" ? value : JSON.stringify(value), "utf8");
  if (size > limit) {
    const label = limit === PPB_CSS_LIMIT_BYTES ? "64KB text" : "128KB JSON";
    throw new Error(`${name} exceeds Shopify's ${label} limit (${size} bytes)`);
  }
  return size;
}

export async function ensurePpbStorefrontAccessToken(admin: Admin) {
  const listResponse = await admin.graphql(`
    query PpbStorefrontTokens {
      shop { storefrontAccessTokens(first: 100) { nodes { id title accessToken } } }
    }
  `);
  const listData = await listResponse.json();
  if (listData.errors?.length) {
    throw new Error(`Unable to list PPB Storefront tokens: ${listData.errors[0].message}`);
  }
  const nodes = listData.data?.shop?.storefrontAccessTokens?.nodes ?? [];
  const existing = nodes.find((token: any) => token?.title === PPB_STOREFRONT_TOKEN_TITLE);
  if (typeof existing?.accessToken === "string" && existing.accessToken) return existing.accessToken;

  const createResponse = await admin.graphql(`
    mutation CreatePpbStorefrontToken($input: StorefrontAccessTokenInput!) {
      storefrontAccessTokenCreate(input: $input) {
        storefrontAccessToken { accessToken }
        userErrors { field message }
      }
    }
  `, { variables: { input: { title: PPB_STOREFRONT_TOKEN_TITLE } } });
  const createData = await createResponse.json();
  const result = createData.data?.storefrontAccessTokenCreate;
  if (createData.errors?.length || result?.userErrors?.length || !result?.storefrontAccessToken?.accessToken) {
    const message = createData.errors?.[0]?.message ?? result?.userErrors?.[0]?.message ?? "Unknown token creation error";
    throw new Error(`Unable to create PPB Storefront token: ${message}`);
  }
  return result.storefrontAccessToken.accessToken as string;
}

function languageLocales(settingsLanguage: unknown) {
  const source = settingsLanguage && typeof settingsLanguage === "object"
    ? (settingsLanguage as any).mixAndMatchTextData
    : null;
  const locales = source && typeof source === "object" ? Object.keys(source) : [];
  return [...new Set(["en", ...locales])];
}

export function buildPpbStorefrontRuntime(input: {
  storefrontAccessToken: string;
  generalSettings: Record<string, unknown>;
}) {
  const controls = buildSettingsControlsResponse(
    input.generalSettings.settingsControls,
    BundleType.PRODUCT_PAGE,
  );
  const languages = Object.fromEntries(languageLocales(input.generalSettings.settingsLanguage).map((locale) => [
    locale,
    buildSettingsLanguageResponse(input.generalSettings.settingsLanguage, BundleType.PRODUCT_PAGE, locale),
  ]));
  return {
    schemaVersion: 1,
    storefrontApiVersion: "2026-07",
    storefrontAccessToken: input.storefrontAccessToken,
    controls,
    languages,
  };
}

export function buildPpbDesignCss(settings: any) {
  const record = settings && typeof settings === "object" ? settings as Record<string, unknown> : {};
  const generalSettings = record.generalSettings && typeof record.generalSettings === "object"
    ? record.generalSettings as Record<string, unknown>
    : {};
  const settingsPage = generalSettings.settingsPage && typeof generalSettings.settingsPage === "object"
    ? generalSettings.settingsPage as Record<string, unknown>
    : {};
  const themeColors = isShopBrandColors(record.themeColors) ? record.themeColors : null;
  let cssSettings: Record<string, unknown> = {
    ...record,
    ...((record.globalColorsSettings as Record<string, unknown>) ?? {}),
    ...((record.footerSettings as Record<string, unknown>) ?? {}),
    ...((record.stepBarSettings as Record<string, unknown>) ?? {}),
    ...generalSettings,
  };
  if (settingsPage.design && typeof settingsPage.design === "object") {
    cssSettings = buildSettingsDesignRuntime(
      settingsPage.design as Record<string, unknown>,
      generalSettings.pageCustomization as Record<string, unknown> ?? {},
      themeColors,
    ).cssSettings;
  }
  const customCss = sanitizeCss(typeof record.customCss === "string" ? record.customCss : "").sanitizedCss;
  return generateCSSFromSettings(
    cssSettings as CSSDesignSettings,
    BundleType.PRODUCT_PAGE,
    customCss,
    themeColors,
  );
}

async function resolveShopGid(admin: Admin) {
  const response = await admin.graphql(`query PpbRuntimeShop { shop { id } }`);
  const data = await response.json();
  const id = data.data?.shop?.id;
  if (typeof id !== "string" || !id) throw new Error("Unable to resolve Shopify Shop ID for PPB runtime sync");
  return id;
}

export async function syncPpbStorefrontRuntime(admin: Admin, shopDomain: string) {
  const [storefrontAccessToken, shopId, settings] = await Promise.all([
    ensurePpbStorefrontAccessToken(admin),
    resolveShopGid(admin),
    prisma.designSettings.findUnique({
      where: { shopId_bundleType: { shopId: shopDomain, bundleType: BundleType.PRODUCT_PAGE } },
    }),
  ]);
  const generalSettings = settings?.generalSettings && typeof settings.generalSettings === "object"
    ? settings.generalSettings as Record<string, unknown>
    : {};
  const runtime = buildPpbStorefrontRuntime({ storefrontAccessToken, generalSettings });
  const css = buildPpbDesignCss(settings);
  assertPpbStorefrontSnapshotSize("ppb_storefront_runtime", runtime);
  assertPpbStorefrontSnapshotSize("ppb_storefront_css", css, PPB_CSS_LIMIT_BYTES);

  const response = await admin.graphql(`
    mutation SyncPpbStorefrontRuntime($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key }
        userErrors { field message code }
      }
    }
  `, { variables: { metafields: [
    { ownerId: shopId, namespace: "$app", key: "ppb_storefront_runtime", type: "json", value: JSON.stringify(runtime) },
    { ownerId: shopId, namespace: "$app", key: "ppb_storefront_css", type: "multi_line_text_field", value: css },
  ] } });
  const data = await response.json();
  const errors = data.data?.metafieldsSet?.userErrors ?? [];
  if (data.errors?.length || errors.length) {
    throw new Error(`Unable to sync PPB storefront runtime: ${data.errors?.[0]?.message ?? errors[0]?.message}`);
  }
  return { runtime, css };
}
