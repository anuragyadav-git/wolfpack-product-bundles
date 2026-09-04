/**
 * Order Attribution Backfill Service
 *
 * Queries Shopify Orders GraphQL for a date range and populates OrderAttribution
 * rows for orders the pixel missed. Safety net for the pixel-only ingestion path.
 *
 * Idempotent: pre-checks the set of orderIds already stored for this shop and
 * skips them, so re-running the backfill produces zero new rows.
 *
 * Called from the Analytics admin action (intent="backfill").
 */

import db from "../../db.server";
import { matchLineItemGroupsToBundles, orderIdMatchForms } from "../../lib/analytics/bundle-matcher.server";
import { AppLogger } from "../../lib/logger";
import {
  generateCartTransformRuntimeTokenSecret,
  verifyRuntimeCartToken,
} from "../cart-transform-runtime-token.server";

export interface BackfillResult {
  created: number;
  repaired: number;
  skipped: number;
  pages: number;
}

interface AdminClient {
  graphql: (query: string, opts?: { variables?: Record<string, unknown> }) => Promise<Response>;
}

const ORDERS_PAGE_SIZE = 100;

const ORDERS_QUERY = `
  query WolfpackBackfillOrders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        name
        createdAt
        totalPriceSet { shopMoney { amount currencyCode } }
        customerJourneySummary {
          lastVisit {
            landingPage
            utmParameters { source medium campaign content term }
          }
        }
        lineItems(first: 50) {
          nodes {
            product { id }
            quantity
            customAttributes { key value }
          }
        }
      }
    }
  }
`;

interface OrderNode {
  id: string;
  name?: string | null;
  createdAt: string;
  totalPriceSet?: { shopMoney?: { amount?: string | null; currencyCode?: string | null } | null } | null;
  customerJourneySummary?: {
    lastVisit?: {
      landingPage?: string | null;
      utmParameters?: {
        source?: string | null;
        medium?: string | null;
        campaign?: string | null;
        content?: string | null;
        term?: string | null;
      } | null;
    } | null;
  } | null;
  lineItems?: {
    nodes?: Array<{
      product?: { id?: string | null } | null;
      customAttributes?: Array<{ key?: string | null; value?: string | null }> | null;
    }> | null;
  } | null;
}

function extractOrderNumber(gid: string): string | null {
  if (!gid) return null;
  return gid.includes("/") ? gid.split("/").pop() ?? null : gid;
}

function toRevenueCents(amount?: string | null): number {
  if (!amount) return 0;
  return Math.round(parseFloat(amount) * 100);
}

function verifiedRuntimeBundleIds(node: OrderNode, shopId: string): string[] {
  let secret: string;
  try {
    secret = generateCartTransformRuntimeTokenSecret(shopId);
  } catch {
    return [];
  }

  const bundleIds = new Set<string>();
  for (const lineItem of node.lineItems?.nodes ?? []) {
    const runtimeToken = lineItem.customAttributes?.find(
      (attribute) => attribute.key === "_wolfpack_bundle_runtime",
    )?.value;
    if (!runtimeToken) continue;
    const payload = verifyRuntimeCartToken(runtimeToken, secret);
    if (payload?.shop === shopId && payload.bundleId) {
      bundleIds.add(payload.bundleId);
    }
  }
  return [...bundleIds];
}

export async function backfillOrderAttribution(
  admin: AdminClient,
  shopId: string,
  sinceIso: string,
  untilIso: string
): Promise<BackfillResult> {
  const shopifyQuery = `created_at:>='${sinceIso}' AND created_at:<='${untilIso}'`;

  let cursor: string | null = null;
  let created = 0;
  let repaired = 0;
  let skipped = 0;
  let pages = 0;

  while (true) {
    pages += 1;
    const response = await admin.graphql(ORDERS_QUERY, {
      variables: { first: ORDERS_PAGE_SIZE, after: cursor, query: shopifyQuery },
    });
    const payload = await response.json() as {
      data?: { orders?: { pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }; nodes?: OrderNode[] } };
    };

    const nodes = payload.data?.orders?.nodes ?? [];
    if (nodes.length === 0) {
      break;
    }

    // Dedup pre-check: which of these orderIds already exist in DB? We check
    // both GID and numeric forms because early pixel writes may have stored the
    // raw sandbox id (numeric) while backfill always writes canonical GID.
    const orderIds = nodes.map((n) => n.id);
    const lookupForms = orderIds.flatMap((value) => orderIdMatchForms(value));
    const existing = await db.orderAttribution.findMany({
      where: { shopId, orderId: { in: lookupForms } },
      select: { orderId: true, bundleId: true },
    });

    const existingRowsForOrder = (orderId: string) => {
      const forms = new Set(orderIdMatchForms(orderId));
      return existing.filter((row: { orderId: string; bundleId: string | null }) => (
        forms.has(row.orderId)
      ));
    };

    const explicitBundleIdsByOrder = nodes.map((node) => (
      verifiedRuntimeBundleIds(node, shopId)
    ));
    const fallbackNodeIndexes = nodes.flatMap((node, index) => {
      const existingRows = existingRowsForOrder(node.id);
      const alreadyAttributed = existingRows.some((row: { bundleId: string | null }) => (
        row.bundleId !== null
      ));
      return !alreadyAttributed && explicitBundleIdsByOrder[index].length === 0
        ? [index]
        : [];
    });
    const fallbackMatches = fallbackNodeIndexes.length > 0
      ? await matchLineItemGroupsToBundles(
          shopId,
          fallbackNodeIndexes.map((index) => (
            (nodes[index].lineItems?.nodes ?? []).map((lineItem) => ({
              productId: lineItem.product?.id ?? null,
            }))
          )),
        )
      : [];
    const fallbackMatchesByIndex = new Map(
      fallbackNodeIndexes.map((nodeIndex, resultIndex) => (
        [nodeIndex, fallbackMatches[resultIndex] ?? []] as const
      )),
    );

    const rows: Array<{
      shopId: string;
      bundleId: string | null;
      orderId: string;
      orderNumber: string | null;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      utmContent: string | null;
      utmTerm: string | null;
      landingPage: string | null;
      revenue: number;
      currency: string;
      createdAt: Date;
    }> = [];

    for (const [nodeIndex, node] of nodes.entries()) {
      const existingRows = existingRowsForOrder(node.id);
      if (existingRows.some((row: { bundleId: string | null }) => row.bundleId !== null)) {
        skipped += 1;
        continue;
      }

      const bundleIds = explicitBundleIdsByOrder[nodeIndex].length > 0
        ? explicitBundleIdsByOrder[nodeIndex]
        : fallbackMatchesByIndex.get(nodeIndex) ?? [];

      if (existingRows.length > 0) {
        if (bundleIds.length === 0) {
          skipped += 1;
          continue;
        }
        await db.orderAttribution.updateMany({
          where: {
            shopId,
            orderId: { in: orderIdMatchForms(node.id) },
            bundleId: null,
          },
          data: {
            bundleId: bundleIds[0],
            createdAt: new Date(node.createdAt),
          },
        });
        repaired += 1;
      }

      const visit = node.customerJourneySummary?.lastVisit ?? null;
      const utm = visit?.utmParameters ?? null;
      const revenue = toRevenueCents(node.totalPriceSet?.shopMoney?.amount);
      const currency = node.totalPriceSet?.shopMoney?.currencyCode ?? "USD";
      const orderNumber = extractOrderNumber(node.id);

      const baseRow = {
        shopId,
        orderId: node.id,
        orderNumber,
        utmSource: utm?.source ?? null,
        utmMedium: utm?.medium ?? null,
        utmCampaign: utm?.campaign ?? null,
        utmContent: utm?.content ?? null,
        utmTerm: utm?.term ?? null,
        landingPage: visit?.landingPage ?? null,
        revenue,
        currency,
        createdAt: new Date(node.createdAt),
      };

      if (bundleIds.length > 0) {
        const newBundleIds = existingRows.length > 0 ? bundleIds.slice(1) : bundleIds;
        for (const bundleId of newBundleIds) {
          rows.push({ ...baseRow, bundleId });
        }
      } else if (existingRows.length === 0) {
        rows.push({ ...baseRow, bundleId: null });
      }
    }

    if (rows.length > 0) {
      await db.orderAttribution.createMany({ data: rows });
      created += rows.length;
    }

    const pageInfo = payload.data?.orders?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
      break;
    }
    cursor = pageInfo.endCursor;
  }

  AppLogger.info("[BACKFILL] Order attribution backfill completed", {
    component: "order-backfill",
    shopId,
    created,
    repaired,
    skipped,
    pages,
  });

  return { created, repaired, skipped, pages };
}
