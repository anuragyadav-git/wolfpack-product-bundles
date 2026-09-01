import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { AppLogger } from "../../lib/logger";
import { authenticate } from "../../shopify.server";
import type { StorefrontApiContext } from "@shopify/shopify-app-remix/server";
import { normalizeStorefrontQuantityAvailable } from "../../lib/storefront-variant-inventory";

/**
 * Public API endpoint to fetch products using Storefront API
 * This endpoint can be called from the widget without authentication
 * Route: /api/storefront-products?ids=gid://shopify/Product/123,gid://shopify/Product/456
 */

/**
 * Inventory fields that require the `unauthenticated_read_product_inventory` scope.
 * Included only when the session scope has been granted — otherwise Shopify
 * Storefront API rejects the whole query with "Access denied".
 */
const INVENTORY_FIELDS = "quantityAvailable currentlyNotInStock";
const PRODUCT_GID_PATTERN = /^gid:\/\/shopify\/Product\/(\d+)$/;
const PRODUCT_IMAGE_LIMIT = 50;
const PRODUCT_BATCH_SIZE = 50;
const VARIANT_PAGE_SIZE = 250;

function normalizeProductId(productId: string): string | null {
  if (/^\d+$/.test(productId)) {
    return `gid://shopify/Product/${productId}`;
  }

  return PRODUCT_GID_PATTERN.test(productId) ? productId : null;
}

function mapStorefrontVariant(edge: any) {
  const selectedOptions = (edge.node.selectedOptions ?? []).map((option: any) => ({
    name: option.name,
    value: option.value,
  }));
  return {
    id: edge.node.id,
    title: edge.node.title,
    price: edge.node.price?.amount || '0',
    compareAtPrice: edge.node.compareAtPrice?.amount || null,
    available: edge.node.availableForSale,
    quantityAvailable: normalizeStorefrontQuantityAvailable(edge.node),
    currentlyNotInStock: edge.node.currentlyNotInStock === true,
    weight: edge.node.weight ?? 0,
    weightUnit: edge.node.weightUnit ?? 'GRAMS',
    image: edge.node.image ? { src: edge.node.image.url } : null,
    selectedOptions,
    option1: selectedOptions[0]?.value ?? null,
    option2: selectedOptions[1]?.value ?? null,
    option3: selectedOptions[2]?.value ?? null,
  };
}

function mapProductOptions(options: any[] = []) {
  return options.map((option: any) => ({
    id: option.id,
    name: option.name,
    optionValues: (option.optionValues ?? []).map((optionValue: any) => ({
      id: optionValue.id,
      name: optionValue.name,
      swatch: optionValue.swatch ? {
        color: optionValue.swatch.color ?? null,
        image: optionValue.swatch.image?.image ? {
          src: optionValue.swatch.image.image.url,
          altText: optionValue.swatch.image.image.altText ?? null,
        } : null,
      } : null,
    })),
  }));
}

/**
 * Fetches all variants for a product using cursor-based pagination
 * Handles products with more than 100 variants.
 * When country is provided, uses @inContext to get market-correct prices from Shopify Markets.
 * When hasInventoryScope is true, requests quantityAvailable + currentlyNotInStock.
 */
async function fetchAllVariants(
  storefront: StorefrontApiContext,
  productId: string,
  country: string | null,
  hasInventoryScope: boolean,
  cursor?: string
): Promise<any[]> {
  const inventoryFields = hasInventoryScope ? ` ${INVENTORY_FIELDS}` : "";

  const VARIANT_QUERY = country
    ? `query getProductVariants($id: ID!, $cursor: String, $country: CountryCode!) @inContext(country: $country) {
        product(id: $id) {
          variants(first: ${VARIANT_PAGE_SIZE}, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                id title availableForSale${inventoryFields}
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                weight
                weightUnit
                image { url }
                selectedOptions { name value }
              }
            }
          }
        }
      }`
    : `query getProductVariants($id: ID!, $cursor: String) {
        product(id: $id) {
          variants(first: ${VARIANT_PAGE_SIZE}, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                id title availableForSale${inventoryFields}
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                weight
                weightUnit
                image { url }
                selectedOptions { name value }
              }
            }
          }
        }
      }`;

  const variables: Record<string, string | undefined> = { id: productId, cursor };
  if (country) variables.country = country;

  const response = await storefront.graphql(VARIANT_QUERY, { variables });
  const data: any = await response.json();

  if (data.errors && !data.data?.product?.variants) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  const variantsData = data.data?.product?.variants;
  if (!variantsData) {
    return [];
  }

  const variants = variantsData.edges || [];
  const { hasNextPage, endCursor } = variantsData.pageInfo;

  // Recursively fetch next page if exists
  if (hasNextPage && endCursor) {
    const nextPageVariants = await fetchAllVariants(
      storefront,
      productId,
      country,
      hasInventoryScope,
      endCursor
    );
    return [...variants, ...nextPageVariants];
  }

  return variants;
}

function buildProductsQuery(country: string | null, hasInventoryScope: boolean) {
  const inventoryFields = hasInventoryScope ? ` ${INVENTORY_FIELDS}` : "";

  return country
    ? `query getProducts($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
        nodes(ids: $ids) {
          ... on Product {
            id title handle description descriptionHtml featuredImage { url }
            images(first: ${PRODUCT_IMAGE_LIMIT}) {
              edges { node { url } }
            }
            options {
              id name
              optionValues {
                id name
                swatch {
                  color
                  image { ... on MediaImage { image { url altText } } }
                }
              }
            }
            variants(first: ${VARIANT_PAGE_SIZE}) {
              pageInfo { hasNextPage endCursor }
              edges {
                node {
                  id title availableForSale${inventoryFields}
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  weight
                  weightUnit
                  image { url }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }`
    : `query getProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id title handle description descriptionHtml featuredImage { url }
            images(first: ${PRODUCT_IMAGE_LIMIT}) {
              edges { node { url } }
            }
            options {
              id name
              optionValues {
                id name
                swatch {
                  color
                  image { ... on MediaImage { image { url altText } } }
                }
              }
            }
            variants(first: ${VARIANT_PAGE_SIZE}) {
              pageInfo { hasNextPage endCursor }
              edges {
                node {
                  id title availableForSale${inventoryFields}
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  weight
                  weightUnit
                  image { url }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }`;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await authenticate.public.appProxy(request);
  if (!context.session || !context.storefront) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const productIds = url.searchParams.get("ids");
  // ISO 3166-1 alpha-2 country code from the customer's browser context (e.g. "CA", "DE").
  // When provided, Storefront API returns market-correct prices via @inContext.
  const country = url.searchParams.get("country") || null;

  if (!productIds) {
    return json({ error: "Missing product IDs" }, { status: 400 });
  }

  const requestedIds = productIds.split(",").map(id => id.trim()).filter(Boolean);

  if (requestedIds.length === 0) {
    return json({ error: "No valid product IDs provided" }, { status: 400 });
  }

  const normalizedIds = requestedIds.map((value) => normalizeProductId(value));
  if (normalizedIds.some(id => id === null)) {
    return json({ error: "Invalid product IDs" }, { status: 400 });
  }
  const ids = [...new Set(normalizedIds as string[])];

  try {
    // quantityAvailable + currentlyNotInStock require unauthenticated_read_product_inventory.
    // Scope is synced from Shopify on install and on every app/scopes_update webhook
    // (see handleScopesUpdate in lifecycle.server.ts), so session.scope is authoritative.
    const hasInventoryScope = (context.session.scope ?? "").includes("unauthenticated_read_product_inventory");
    const STOREFRONT_QUERY = buildProductsQuery(country, hasInventoryScope);

    const mainVariables: Record<string, unknown> = { ids };
    if (country) mainVariables.country = country;

    const nodes: any[] = [];
    for (let index = 0; index < ids.length; index += PRODUCT_BATCH_SIZE) {
      const batchVariables = {
        ...mainVariables,
        ids: ids.slice(index, index + PRODUCT_BATCH_SIZE),
      };
      const response = await context.storefront.graphql(STOREFRONT_QUERY, { variables: batchVariables });
      const data: any = await response.json();
      if (data.errors && !data.data?.nodes) {
        AppLogger.error("[STOREFRONT_API] GraphQL errors", { component: "api.storefront-products" }, data.errors);
        return json({ error: "GraphQL errors", details: data.errors }, { status: 500 });
      }
      nodes.push(...(data.data?.nodes ?? []));
    }

    const products: any[] = [];
    for (const product of nodes) {
      if (!product) continue;

      const images = (product.images?.edges || [])
        .map((edge: any) => edge.node?.url ? { src: edge.node.url } : null)
        .filter(Boolean);
      const initialVariants = product.variants?.edges ?? [];

      try {
        let variantEdges = initialVariants;
        const pageInfo = product.variants?.pageInfo;
        if (pageInfo?.hasNextPage && pageInfo.endCursor) {
          const overflowVariants = await fetchAllVariants(
            context.storefront,
            product.id,
            country,
            hasInventoryScope,
            pageInfo.endCursor,
          );
          variantEdges = [...initialVariants, ...overflowVariants];
        }

        products.push({
          id: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description || '',
          descriptionHtml: product.descriptionHtml || '',
          imageUrl: product.featuredImage?.url || '',
          images,
          options: mapProductOptions(product.options),
          variants: variantEdges.map(
            (value: Parameters<typeof mapStorefrontVariant>[0]) =>
              mapStorefrontVariant(value),
          ),
        });
      } catch (error: any) {
        AppLogger.warn("[STOREFRONT_API] Failed to fetch variants for product", { component: "api.storefront-products", productId: product.id });
        products.push({
          id: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description || '',
          descriptionHtml: product.descriptionHtml || '',
          imageUrl: product.featuredImage?.url || '',
          images,
          options: mapProductOptions(product.options),
          variants: initialVariants.map(
            (value: Parameters<typeof mapStorefrontVariant>[0]) =>
              mapStorefrontVariant(value),
          ),
        });
      }
    }

    const validProducts = products;
    const totalVariants = validProducts.reduce((sum, p) => sum + (p?.variants?.length || 0), 0);

    AppLogger.debug("[STOREFRONT_API] Fetched products", { component: "api.storefront-products", productCount: validProducts.length, variantCount: totalVariants });

    return json({
      products: validProducts,
      count: validProducts.length
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "Vary": "Accept-Encoding"
      }
    });

  } catch (error: any) {
    AppLogger.error("[STOREFRONT_API] Internal error", { component: "api.storefront-products" }, error);
    return json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
