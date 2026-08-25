/**
 * Shared loader helpers for FPB and PPB configure pages.
 *
 * Both loaders share identical DB queries, Shopify GQL queries, and embed-check
 * logic. This module extracts those shared pieces so each route only handles
 * its own unique fields.
 */

import { AppLogger } from "./logger";

const GET_BUNDLE_CONFIGURE_DATA_WITH_PRODUCT = `
  query GetBundleConfigureData($id: ID!) {
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
      featuredMedia {
        ... on MediaImage {
          id
          image {
            url
            altText
          }
        }
      }
      media(first: 5) {
        nodes {
          ... on MediaImage {
            id
            alt
            image {
              url
              altText
            }
          }
        }
      }
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
    }
    shopLocales(published: true) {
      locale
      name
      primary
      published
    }
  }
`;

const GET_BUNDLE_CONFIGURE_SHOP_DATA = `
  query GetBundleConfigureShopData {
    shop {
      currencyCode
    }
    shopLocales(published: true) {
      locale
      name
      primary
      published
    }
  }
`;

export async function fetchBundleConfigureShopifyData(
  admin: any,
  shopifyProductId: string | null,
  bundleId: string,
) {
  const response = shopifyProductId
    ? await admin.graphql(GET_BUNDLE_CONFIGURE_DATA_WITH_PRODUCT, {
        variables: { id: shopifyProductId },
      })
    : await admin.graphql(GET_BUNDLE_CONFIGURE_SHOP_DATA);
  const result = (await response.json()) as {
    data?: {
      product?: any;
      shop?: { currencyCode?: string };
      shopLocales?: {
        locale: string;
        name: string;
        primary: boolean;
        published: boolean;
      }[];
    };
    errors?: { message?: string }[];
  };

  if (result.errors?.length) {
    AppLogger.warn("Shopify returned bundle configure data errors", {
      component: "bundle-config",
      bundleId,
      operation: "fetch-configure-data",
      errors: result.errors.map((error) => error.message ?? "Unknown Shopify error"),
    });
  }

  const shopCurrencyCode = result.data?.shop?.currencyCode;
  if (!shopCurrencyCode) {
    throw new Error("Shop currency is missing from Shopify Admin response");
  }

  return {
    bundleProduct: result.data?.product ?? null,
    shopCurrencyCode,
    shopLocales: (result.data?.shopLocales ?? [])
      .filter((locale) => locale.published)
      .map(({ locale, name, primary }) => ({ locale, name, primary })),
  };
}
