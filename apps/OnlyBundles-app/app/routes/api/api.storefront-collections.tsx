import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { AppLogger } from "../../lib/logger";
import { authenticate } from "../../shopify.server";
import { normalizeStorefrontQuantityAvailable } from "../../lib/storefront-variant-inventory";

const INVENTORY_FIELDS = "quantityAvailable currentlyNotInStock";
const PRODUCT_IMAGE_LIMIT = 50;

/**
 * Public API endpoint to fetch products from collections using Storefront API
 * This replaces the legacy /collections/{handle}/products.json REST endpoint
 * Route: /api/storefront-collections?handles=collection-1,collection-2&shop=store.myshopify.com
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const context = await authenticate.public.appProxy(request);
  if (!context.session || !context.storefront) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const collectionHandles = url.searchParams.get("handles");

  if (!collectionHandles) {
    return json({ error: "Missing collection handles" }, { status: 400 });
  }

  const handles = collectionHandles.split(",").map(h => h.trim()).filter(Boolean);

  if (handles.length === 0) {
    return json({ error: "No valid collection handles provided" }, { status: 400 });
  }

  try {
    const hasInventoryScope = (context.session.scope ?? "").includes("unauthenticated_read_product_inventory");
    const inventoryFields = hasInventoryScope ? ` ${INVENTORY_FIELDS}` : "";
    // GraphQL query to fetch products from multiple collections
    const STOREFRONT_QUERY = `
      query getCollectionProducts($query: String!) {
        collections(first: 10, query: $query) {
          edges {
            node {
              id
              handle
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    descriptionHtml
                    featuredImage {
                      url
                    }
                    images(first: ${PRODUCT_IMAGE_LIMIT}) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                    options {
                      id
                      name
                      optionValues {
                        id
                        name
                        swatch {
                          color
                          image { ... on MediaImage { image { url altText } } }
                        }
                      }
                    }
                    variants(first: 100) {
                      edges {
                        node {
                          id
                          title
                          selectedOptions {
                            name
                            value
                          }
                          price {
                            amount
                            currencyCode
                          }
                          compareAtPrice {
                            amount
                            currencyCode
                          }
                          weight
                          weightUnit
                          availableForSale${inventoryFields}
                          image {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    // Build query filter for handles
    const queryFilter = handles.map(h => `handle:${h}`).join(" OR ");

    const response = await context.storefront.graphql(STOREFRONT_QUERY, {
      variables: { query: queryFilter },
    });
    const data: any = await response.json();

    if (data.errors) {
      AppLogger.error("[STOREFRONT_COLLECTIONS] GraphQL errors", { component: "api.storefront-collections" }, data.errors);
      return json({ error: "GraphQL errors", details: data.errors }, { status: 500 });
    }

    // Flatten all products from all collections, tracking per-collection membership
    const allProducts: any[] = [];
    const byCollection: Record<string, string[]> = {};
    const collections = data.data?.collections?.edges || [];

    collections.forEach((collectionEdge: any) => {
      const collectionHandle = collectionEdge.node?.handle;
      const products = collectionEdge.node?.products?.edges || [];
      const collectionProductIds: string[] = [];

      products.forEach((productEdge: any) => {
        const product = productEdge.node;
        if (product) {
          collectionProductIds.push(product.id);
          allProducts.push({
            id: product.id,
            title: product.title,
            handle: product.handle,
            description: product.description || '',
            descriptionHtml: product.descriptionHtml || '',
            imageUrl: product.featuredImage?.url || '',
            images: (product.images?.edges || [])
              .map((edge: any) => edge.node?.url ? { src: edge.node.url } : null)
              .filter(Boolean),
            options: (product.options || []).map((option: any) => ({
              id: option.id,
              name: option.name,
              optionValues: (option.optionValues || []).map((optionValue: any) => ({
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
            })),
            variants: (product.variants?.edges || []).map((edge: any) => ({
              id: edge.node.id,
              title: edge.node.title,
              option1: edge.node.selectedOptions?.[0]?.value ?? null,
              option2: edge.node.selectedOptions?.[1]?.value ?? null,
              option3: edge.node.selectedOptions?.[2]?.value ?? null,
              selectedOptions: (edge.node.selectedOptions ?? []).map((option: any) => ({
                name: option.name,
                value: option.value,
              })),
              price: edge.node.price?.amount || '0',
              compareAtPrice: edge.node.compareAtPrice?.amount || null,
              weight: edge.node.weight ?? 0,
              weightUnit: edge.node.weightUnit ?? 'GRAMS',
              available: edge.node.availableForSale,
              quantityAvailable: normalizeStorefrontQuantityAvailable(edge.node),
              currentlyNotInStock: edge.node.currentlyNotInStock === true,
              image: edge.node.image ? { src: edge.node.image.url } : null
            }))
          });
        }
      });

      if (collectionHandle) {
        byCollection[collectionHandle] = collectionProductIds;
      }
    });

    // Remove duplicates (product might be in multiple collections)
    const uniqueProducts = Array.from(
      new Map(allProducts.map(p => [p.id, p])).values()
    );

    AppLogger.debug("[STOREFRONT_COLLECTIONS] Fetched products from collections", { component: "api.storefront-collections", productCount: uniqueProducts.length, collectionCount: handles.length });

    return json({
      products: uniqueProducts,
      byCollection,
      count: uniqueProducts.length
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "Vary": "Accept-Encoding"
      }
    });

  } catch (error: any) {
    AppLogger.error("[STOREFRONT_COLLECTIONS] Internal error", { component: "api.storefront-collections" }, error);
    return json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
