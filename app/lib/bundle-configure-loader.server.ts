/**
 * Shared loader helpers for FPB and PPB configure pages.
 *
 * Both loaders share identical DB queries, Shopify GQL queries, and embed-check
 * logic. This module extracts those shared pieces so each route only handles
 * its own unique fields.
 */

import { AppLogger } from "./logger";

const GET_BUNDLE_PRODUCT = `
  query GetBundleProduct($id: ID!) {
    product(id: $id) {
      id
      legacyResourceId
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
  }
`;

const GET_SHOP_CURRENCY = `
  query GetShopCurrency {
    shop {
      currencyCode
    }
  }
`;

const GET_SHOP_LOCALES = `
  query GetShopLocales {
    shopLocales(published: true) {
      locale
      name
      primary
      published
    }
  }
`;

type ShopifyGraphqlResult<T> = {
  data?: T;
  errors?: { message?: string }[];
};

async function fetchBundleProduct(
  admin: any,
  shopifyProductId: string,
  bundleId: string,
): Promise<any> {
  try {
    const response = await admin.graphql(GET_BUNDLE_PRODUCT, {
      variables: { id: shopifyProductId },
    });
    const result = (await response.json()) as ShopifyGraphqlResult<{
      product?: any;
    }>;
    if (result.errors?.length) {
      throw new Error(
        result.errors.map((error) => error.message ?? "Unknown Shopify error").join("; "),
      );
    }
    return result.data?.product ?? null;
  } catch (error) {
    AppLogger.warn("Failed to fetch bundle product", {
      component: "bundle-config",
      bundleId,
      operation: "fetch-product",
    }, error);
    return null;
  }
}

async function fetchShopCurrencyCode(admin: any): Promise<string> {
  const response = await admin.graphql(GET_SHOP_CURRENCY);
  const result = (await response.json()) as ShopifyGraphqlResult<{
    shop?: { currencyCode?: string };
  }>;
  const shopCurrencyCode = result.data?.shop?.currencyCode;
  if (!shopCurrencyCode) {
    throw new Error("Shop currency is missing from Shopify Admin response");
  }
  return shopCurrencyCode;
}

async function fetchShopLocales(
  admin: any,
): Promise<{ locale: string; name: string; primary: boolean }[]> {
  try {
    const response = await admin.graphql(GET_SHOP_LOCALES);
    const result = (await response.json()) as ShopifyGraphqlResult<{
      shopLocales?: {
        locale: string;
        name: string;
        primary: boolean;
        published: boolean;
      }[];
    }>;
    if (result.errors?.length) {
      throw new Error(
        result.errors.map((error) => error.message ?? "Unknown Shopify error").join("; "),
      );
    }
    return (result.data?.shopLocales ?? [])
      .filter((locale) => locale.published)
      .map(({ locale, name, primary }) => ({ locale, name, primary }));
  } catch (error) {
    AppLogger.warn("Failed to fetch published shop locales", {
      component: "bundle-config",
      operation: "fetch-shop-locales",
    }, error);
    return [];
  }
}

export async function fetchBundleConfigureShopifyData(
  admin: any,
  shopifyProductId: string | null,
  bundleId: string,
) {
  const [bundleProduct, shopCurrencyCode, shopLocales] = await Promise.all([
    shopifyProductId
      ? fetchBundleProduct(admin, shopifyProductId, bundleId)
      : Promise.resolve(null),
    fetchShopCurrencyCode(admin),
    fetchShopLocales(admin),
  ]);

  return {
    bundleProduct,
    shopCurrencyCode,
    shopLocales,
  };
}
