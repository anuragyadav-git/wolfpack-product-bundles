import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../../../lib/auth-guards.server";
import db from "../../../db.server";
import {
  syncBundleStorefrontNow,
  type StorefrontSyncReason,
} from "../../../services/bundles/storefront-sync.server";
import { createBundlePreviewToken } from "../../../lib/bundle-preview-token.server";
import {
  appendFpbPreviewToken,
  buildFpbStorefrontUrl,
} from "../../../lib/fpb-storefront-url";
import { recordFirstBundlePreviewEvent } from "../../../services/bundles/bundle-preview-event.server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Storefront sync failed";
}

export async function handleSyncStorefrontNow(
  admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
  bundleType: "full_page" | "product_page",
  reason: StorefrontSyncReason,
) {
  try {
    await syncBundleStorefrontNow({
      admin,
      shopDomain: session.shop,
      bundleId,
      bundleType,
      reason,
    });

    return json({
      success: true,
      statusCode: 200,
      synced: true,
      message: "Updated Successfully!",
    });
  } catch (error: any) {
    return json(
      {
        success: false,
        statusCode: 500,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function handlePrepareStorefrontPreview(
  admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
  bundleType: "full_page" | "product_page",
) {
  try {
    await syncBundleStorefrontNow({
      admin,
      shopDomain: session.shop,
      bundleId,
      bundleType,
      reason: "preview",
    });

    const previewToken = createBundlePreviewToken({
      shop: session.shop,
      bundleId,
    });
    let shareablePreviewUrl: string | null = null;

    if (bundleType === "full_page") {
      const bundle = await db.bundle.findUnique({
        where: { id: bundleId, shopId: session.shop },
        select: { id: true, publicNumber: true, bundleType: true, status: true },
      });
      if (!bundle || bundle.bundleType !== "full_page") {
        throw new Error("Bundle not found");
      }

      const publicNumber = bundle.publicNumber ?? 1;
      shareablePreviewUrl = appendFpbPreviewToken(
        buildFpbStorefrontUrl(session.shop, publicNumber),
        previewToken,
      );
      await recordFirstBundlePreviewEvent({
        admin,
        shopDomain: session.shop,
        bundle,
        bundleLink: shareablePreviewUrl,
        routeFamily: "fpb_configure",
      });
    }

    return json({
      success: true,
      statusCode: 200,
      ready: true,
      message: "success",
      ...(bundleType === "product_page" ? { previewToken } : {}),
      ...(shareablePreviewUrl ? { shareablePreviewUrl } : {}),
    });
  } catch (error: any) {
    return json(
      {
        success: false,
        statusCode: 500,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
