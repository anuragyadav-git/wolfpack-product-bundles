/**
 * Shared loader helpers for FPB and PPB configure pages.
 *
 * Both loaders share identical DB queries, Shopify GQL queries, and embed-check
 * logic. This module extracts those shared pieces so each route only handles
 * its own unique fields.
 */

import { AppLogger } from "./logger";

const GET_BUNDLE_CONFIGURE_DATA_WITH_PRODUCT = `
  query GetBundleConfigureDataWithProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      status
      onlineStoreUrl
      onlineStorePreviewUrl
      description
      productType
      vendor
      tags
      variants(first: 1) {
        edges {
          node {
            id
            title
            price
          }
        }
      }
    }
    shop {
      currencyCode
      ianaTimezone
    }
    shopLocales(published: true) {
      locale
      name
      primary
      published
    }
  }
`;

const GET_BUNDLE_CONFIGURE_DATA = `
  query GetBundleConfigureData {
    shop {
      currencyCode
      ianaTimezone
    }
    shopLocales(published: true) {
      locale
      name
      primary
      published
    }
  }
`;

const GET_SHOP_CONFIGURATION = `
  query GetShopConfiguration {
    shop {
      currencyCode
      ianaTimezone
    }
  }
`;

type ShopifyGraphqlResult<T> = {
  data?: T;
  errors?: { message?: string; path?: (string | number)[] }[];
};

type ShopConfigurationData = {
  shop?: { currencyCode?: string; ianaTimezone?: string };
};

type ShopLocaleData = {
  locale: string;
  name: string;
  primary: boolean;
  published: boolean;
};

type BundleConfigureData = ShopConfigurationData & {
  product?: any;
  shopLocales?: ShopLocaleData[] | null;
};

function parseShopConfiguration(data?: ShopConfigurationData): {
  shopCurrencyCode: string;
  shopIanaTimezone: string;
} {
  const shopCurrencyCode = data?.shop?.currencyCode;
  const shopIanaTimezone = data?.shop?.ianaTimezone;
  if (!shopCurrencyCode) {
    throw new Error("Shop currency is missing from Shopify Admin response");
  }
  if (!shopIanaTimezone) {
    throw new Error("Shop timezone is missing from Shopify Admin response");
  }
  return { shopCurrencyCode, shopIanaTimezone };
}

function fieldError(
  result: ShopifyGraphqlResult<unknown>,
  field: "product" | "shopLocales",
): Error | null {
  const messages = (result.errors ?? [])
    .filter((error) => error.path?.[0] === field)
    .map((error) => error.message ?? "Unknown Shopify error");
  return messages.length > 0 ? new Error(messages.join("; ")) : null;
}

export async function fetchShopConfiguration(admin: any): Promise<{
  shopCurrencyCode: string;
  shopIanaTimezone: string;
}> {
  const response = await admin.graphql(GET_SHOP_CONFIGURATION);
  const result = (await response.json()) as ShopifyGraphqlResult<{
    shop?: { currencyCode?: string; ianaTimezone?: string };
  }>;
  return parseShopConfiguration(result.data);
}

export async function fetchBundleConfigureShopifyData(
  admin: any,
  shopifyProductId: string | null,
  bundleId: string,
) {
  const response = shopifyProductId
    ? await admin.graphql(GET_BUNDLE_CONFIGURE_DATA_WITH_PRODUCT, {
        variables: { id: shopifyProductId },
      })
    : await admin.graphql(GET_BUNDLE_CONFIGURE_DATA);
  const result = (await response.json()) as ShopifyGraphqlResult<BundleConfigureData>;
  const productError = fieldError(result, "product");
  const localeError = fieldError(result, "shopLocales");

  if (productError) {
    AppLogger.warn("Failed to fetch bundle product", {
      component: "bundle-config",
      bundleId,
      operation: "fetch-product",
    }, productError);
  }

  if (localeError) {
    AppLogger.warn("Failed to fetch published shop locales", {
      component: "bundle-config",
      operation: "fetch-shop-locales",
    }, localeError);
  }

  const shopConfiguration = parseShopConfiguration(result.data);
  const shopLocales = localeError
    ? []
    : (result.data?.shopLocales ?? [])
        .filter((locale) => locale.published)
        .map(({ locale, name, primary }) => ({ locale, name, primary }));

  return {
    bundleProduct: productError ? null : result.data?.product ?? null,
    ...shopConfiguration,
    shopLocales,
  };
}
