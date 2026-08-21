import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import db from "../../db.server";
import { AppLogger } from "../../lib/logger";
import { BundleStatus } from "../../constants/bundle";
import { ERROR_MESSAGES } from "../../constants/errors";
import { formatBundleForWidget } from "../../lib/bundle-formatter.server";
import { requireAppProxy } from "../../lib/auth-guards.server";
import { verifyBundlePreviewToken } from "../../lib/bundle-preview-token.server";
import { BUNDLE_PREVIEW_QUERY_PARAM } from "../../lib/bundle-preview-url";

/**
 * Public API endpoint to fetch a single bundle by ID
 * Used by the full-page bundle widget via Shopify App Proxy
 *
 * GET /apps/product-bundles/api/bundle/:bundleId.json
 *
 */

// Handle OPTIONS preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function getNormalizedEtag(etag: string) {
  return etag.replace(/^W\//i, '').replace(/^"|"$/g, '').trim();
}

function isFreshByCacheHeaders(
  request: Request,
  etag: string,
  lastModified: Date | null
) {
  const clientEtags = request.headers.get('if-none-match');
  if (clientEtags) {
    const candidateEtags = clientEtags
      .split(',')
      .map(tag => getNormalizedEtag(tag));

    if (candidateEtags.includes(getNormalizedEtag(etag))) {
      return true;
    }
  }

  const clientLastModifiedHeader = request.headers.get('if-modified-since');
  if (!clientLastModifiedHeader || !lastModified) {
    return false;
  }

  const clientLastModifiedMs = Date.parse(clientLastModifiedHeader);
  if (Number.isNaN(clientLastModifiedMs)) {
    return false;
  }

  return lastModified.getTime() <= clientLastModifiedMs;
}

export const loader: LoaderFunction = async ({ request, params }: any) => {
  const url = new URL(request.url);
  try {
    const { bundleId } = params;

    if (!bundleId) {
      return json({ error: ERROR_MESSAGES.BUNDLE_ID_REQUIRED }, { status: 400, headers: CORS_HEADERS });
    }

    const { session } = await requireAppProxy(request);
    const shopDomain = session.shop;

    AppLogger.info("Fetching bundle", {
      component: "api.bundle",
      operation: "loader",
      shop: shopDomain,
      bundleId
    });

    // Load by the signed app-proxy shop and bundle identity before applying status
    // authorization. Public requests serve ACTIVE/UNLISTED. DRAFT requires a
    // short-lived Admin-minted token bound to this shop and bundle.
    const bundle = await db.bundle.findFirst({
      where: {
        id: bundleId,
        shopId: shopDomain,
      },
      include: {
        steps: {
          include: {
            StepProduct: true,
            StepCategory: {
              orderBy: {
                sortOrder: 'asc'
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        pricing: true
      }
    });

    const isPublic = bundle?.status === BundleStatus.ACTIVE
      || bundle?.status === BundleStatus.UNLISTED;
    const isAuthorizedDraftPreview = bundle?.status === BundleStatus.DRAFT
      && verifyBundlePreviewToken({
        token: url.searchParams.get(BUNDLE_PREVIEW_QUERY_PARAM),
        shop: shopDomain,
        bundleId,
      });

    if (!bundle || (!isPublic && !isAuthorizedDraftPreview)) {
      AppLogger.warn(ERROR_MESSAGES.BUNDLE_NOT_FOUND, {
        component: "api.bundle",
        operation: "loader",
        bundleId,
        shop: shopDomain
      });
      return json({
        success: false,
        error: "Bundle not found or not active"
      }, { status: 404, headers: CORS_HEADERS });
    }

    AppLogger.info("Found bundle", {
      component: "api.bundle",
      operation: "loader",
      bundleId: bundle.id,
      bundleName: bundle.name
    });

    // Build product response using the shared widget formatter.
    // StepProduct stores title, imageUrl, and variants (JSON) captured at save time.
    // We do NOT call the Shopify Admin API here — that endpoint is public-facing
    // (every storefront visitor triggers it) and Admin API calls are rate-limited.
    const formattedBundle = formatBundleForWidget(bundle);
    const updatedAt = bundle.updatedAt ? new Date(bundle.updatedAt) : null;
    const lastModified = updatedAt;
    const etag = `bundle:${bundle.id}:${updatedAt ? updatedAt.getTime() : 0}`;
    const commonHeaders = {
      ...CORS_HEADERS,
      'Cache-Control': isAuthorizedDraftPreview
        ? 'private, no-store'
        : 'public, max-age=10, s-maxage=30, must-revalidate',
      'Vary': 'Accept-Encoding',
      'Last-Modified': lastModified ? lastModified.toUTCString() : new Date(0).toUTCString(),
      'ETag': `"${etag}"`
    };

    if (!isAuthorizedDraftPreview && isFreshByCacheHeaders(request, `"${etag}"`, lastModified)) {
      return new Response(null, {
        status: 304,
        headers: commonHeaders,
      });
    }

    const responsePayload = {
      success: true,
      bundle: formattedBundle
    };

    return json(responsePayload, {
      headers: commonHeaders,
    });

  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    }

    AppLogger.error("Error fetching bundle", {
      component: "api.bundle",
      operation: "loader",
      bundleId: params.bundleId
    }, error);
    return json({
      success: false,
      error: "Unable to fetch bundle"
    }, { status: 500, headers: CORS_HEADERS });
  }
};
