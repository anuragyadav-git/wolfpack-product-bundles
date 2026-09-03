import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../../../../lib/auth-guards.server";
import { AppLogger } from "../../../../lib/logger";
import db from "../../../../db.server";
import { ERROR_MESSAGES } from "../../../../constants/errors";
import { ensureBundleParentProduct } from "../../../../services/bundles/bundle-parent-product.server";
import { updateBundleProductMetafields } from "../../../../services/bundles/metafield-sync.server";
import { buildFullPageBundleMetafieldConfig } from "./shared.server";

export async function handleSyncProduct(
  admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
  _formData: FormData,
) {
  const bundle = await db.bundle.findUnique({
    where: { id: bundleId, shopId: session.shop },
    include: {
      steps: {
        include: {
          StepProduct: { orderBy: { position: "asc" } },
          StepCategory: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { position: "asc" },
      },
      pricing: true,
    },
  });

  if (!bundle) {
    return json(
      { success: false, error: ERROR_MESSAGES.BUNDLE_NOT_FOUND },
      { status: 404 },
    );
  }

  try {
    const parent = await ensureBundleParentProduct({
      admin,
      shopDomain: session.shop,
      appUrl: process.env.SHOPIFY_APP_URL,
      bundle,
    });
    const bundleConfiguration = buildFullPageBundleMetafieldConfig({
      ...bundle,
      shopifyProductId: parent.productId,
      shopifyProductHandle: parent.handle,
    });
    await updateBundleProductMetafields(
      admin,
      parent.productId,
      bundleConfiguration,
    );

    return json({
      success: true,
      statusCode: 200,
      productId: parent.productId,
      productHandle: parent.handle,
      message: "Updated Successfully!",
    });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    AppLogger.error(
      "[PRODUCT_SYNC] Failed to sync FPB parent product",
      { component: "app.bundles.full-page.configure", bundleId },
      error as any,
    );
    return json(
      { success: false, error: `Failed to sync product: ${message}` },
      { status: 500 },
    );
  }
}
