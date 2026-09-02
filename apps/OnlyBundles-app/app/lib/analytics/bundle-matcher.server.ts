/**
 * Shared bundle-matching helper.
 *
 * Given a shopId and a list of order line items, returns the set of bundleIds
 * that the order should be attributed to. Used by both:
 *   - /api/attribution (real-time pixel-driven attribution)
 *   - order-backfill service (post-hoc reconciliation from Shopify Orders API)
 *
 * Two-pass strategy:
 *   Pass 1 (MERGE active)   — line items contain the bundle container product.
 *                             Match Bundle.shopifyProductId directly.
 *   Pass 2 (MERGE inactive) — line items contain component products (flat orders,
 *                             PPB, or FPB before Cart Transform sync). Fall back
 *                             to matching via StepProduct.productId.
 *
 * Both Bundle.shopifyProductId and StepProduct.productId are stored as GIDs
 * (`gid://shopify/Product/12345`). Line-item productIds may arrive as either
 * numeric strings or GIDs, so we normalize to GID before the DB lookup.
 */

import db from "../../db.server";

export interface LineItemInput {
  productId: string | null | undefined;
}

const PRODUCT_GID_PREFIX = "gid://shopify/Product/";
const ORDER_GID_PREFIX = "gid://shopify/Order/";

function normalizeToProductGid(id: string): string {
  return id.includes("/") ? id : `${PRODUCT_GID_PREFIX}${id}`;
}

/**
 * Normalize a Shopify order id to canonical GID form. Both the pixel and the
 * backfill service must write this form so that dedup between the two paths
 * works — Shopify's web-pixel sandbox has historically been unclear about
 * whether `checkout.order.id` returns a GID or a numeric string.
 */
export function normalizeToOrderGid(id: string): string {
  return id.includes("/") ? id : `${ORDER_GID_PREFIX}${id}`;
}

/**
 * Given a possibly-numeric or possibly-GID order id, return both forms so a
 * dedup lookup can catch legacy rows written before normalization landed.
 */
export function orderIdMatchForms(id: string): string[] {
  if (id.includes("/")) {
    return [id, id.split("/").pop() ?? id];
  }
  return [id, `${ORDER_GID_PREFIX}${id}`];
}

export async function matchLineItemsToBundles(
  shopId: string,
  lineItems: LineItemInput[]
): Promise<string[]> {
  return (await matchLineItemGroupsToBundles(shopId, [lineItems]))[0] ?? [];
}

export async function matchLineItemGroupsToBundles(
  shopId: string,
  lineItemGroups: LineItemInput[][],
): Promise<string[][]> {
  const productGidsByGroup = lineItemGroups.map((lineItems) => [
    ...new Set(
      (lineItems ?? [])
        .map((item) => item.productId)
        .filter((id): id is string => Boolean(id))
        .map((value) => normalizeToProductGid(value)),
    ),
  ]);
  const allProductGids = [...new Set(productGidsByGroup.flat())];

  if (allProductGids.length === 0) {
    return lineItemGroups.map(() => []);
  }

  // Pass 1: direct match on bundle container product
  const directBundles = await db.bundle.findMany({
    where: { shopId, shopifyProductId: { in: allProductGids } },
    select: { id: true, shopifyProductId: true },
  });
  const directMatches = productGidsByGroup.map((productGids) => directBundles
    .filter((bundle) => bundle.shopifyProductId && productGids.includes(bundle.shopifyProductId))
    .map((bundle) => bundle.id));
  const unresolvedProductGids = [...new Set(productGidsByGroup
    .filter((productGids, index) => productGids.length > 0 && directMatches[index].length === 0)
    .flat())];

  if (unresolvedProductGids.length === 0) {
    return directMatches;
  }

  // Pass 2: fallback — match component products through bundle steps
  const matchedProducts = await db.stepProduct.findMany({
    where: {
      productId: { in: unresolvedProductGids },
      step: { bundle: { shopId } },
    },
    select: { productId: true, step: { select: { bundleId: true } } },
  });

  return productGidsByGroup.map((productGids, index) => {
    if (directMatches[index].length > 0) return directMatches[index];
    return [...new Set(matchedProducts
      .filter((product) => productGids.includes(product.productId))
      .map((product) => product.step.bundleId))];
  });
}
