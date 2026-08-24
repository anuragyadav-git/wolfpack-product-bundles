import db from "../../db.server";
import { BundleType } from "../../constants/bundle";
import type { ShopifyAdmin } from "../../lib/auth-guards.server";
import { CartTransformService } from "../cart-transform-service.server";
import {
  updateBundleProductMetafields,
} from "./metafield-sync.server";
import { syncThemeColors } from "../theme-colors.server";
import { buildFullPageBundleMetafieldConfig } from "../../routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server";
import {
  buildSyncBundleConfiguration,
} from "../../routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server";
import { ensureBundleParentProduct } from "./bundle-parent-product.server";

export type StorefrontSyncReason = "save" | "retry" | "sync_bundle" | "preview";

async function loadBundleForStorefrontSync(shopDomain: string, bundleId: string) {
  return (db.bundle as any).findUnique({
    where: { id: bundleId, shopId: shopDomain },
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
}

async function syncFullPageBundleFromDb(
  admin: ShopifyAdmin,
  shopDomain: string,
  bundle: any,
) {
  const stats = {
    bundleType: BundleType.FULL_PAGE,
    productMetafields: false,
    proxyHost: true,
    themeColors: false,
  };

  if (!bundle.shopifyProductId) {
    return stats;
  }

  await ensureBundleParentProduct({
    admin,
    shopDomain,
    bundle,
  });

  const bundleConfig = buildFullPageBundleMetafieldConfig(bundle);
  await updateBundleProductMetafields(admin, bundle.shopifyProductId, bundleConfig);
  stats.productMetafields = true;
  syncThemeColors(shopDomain).catch(() => {});
  stats.themeColors = true;
  return stats;
}

async function syncProductPageBundleFromDb(
  admin: ShopifyAdmin,
  shopDomain: string,
  bundle: any,
) {
  const stats = {
    bundleType: BundleType.PRODUCT_PAGE,
    productMetafields: false,
    productState: false,
    themeColors: false,
  };

  if (!bundle.shopifyProductId) {
    return stats;
  }

  stats.productState = true;

  const bundleConfig = buildSyncBundleConfiguration(bundle, bundle.shopifyProductId);
  await updateBundleProductMetafields(admin, bundle.shopifyProductId, bundleConfig);
  stats.productMetafields = true;
  syncThemeColors(shopDomain).catch(() => {});
  stats.themeColors = true;
  return stats;
}

async function performBundleStorefrontSync(
  admin: ShopifyAdmin,
  input: {
    shopDomain: string;
    bundleId: string;
    bundleType: "full_page" | "product_page";
    reason: StorefrontSyncReason;
  },
) {
  const bundle = await loadBundleForStorefrontSync(input.shopDomain, input.bundleId);
  if (!bundle) {
    throw new Error("Bundle not found");
  }

  const activation = await CartTransformService.completeSetup(
    admin,
    input.shopDomain,
  );
  if (!activation.success) {
    throw new Error(activation.error ?? "Cart Transform activation failed");
  }

  const stats =
    input.bundleType === BundleType.FULL_PAGE
      ? await syncFullPageBundleFromDb(admin, input.shopDomain, bundle)
      : await syncProductPageBundleFromDb(admin, input.shopDomain, bundle);

  return { skipped: false, synced: true, stats };
}

export async function syncBundleStorefrontNow(input: {
  admin: ShopifyAdmin;
  shopDomain: string;
  bundleId: string;
  bundleType: "full_page" | "product_page";
  reason: StorefrontSyncReason;
}) {
  return performBundleStorefrontSync(input.admin, {
    shopDomain: input.shopDomain,
    bundleId: input.bundleId,
    bundleType: input.bundleType,
    reason: input.reason,
  });
}

export function compactBundleForConfigureResponse(bundle: any) {
  return {
    id: bundle.id,
    publicNumber: bundle.publicNumber ?? null,
    bundleType: bundle.bundleType,
    status: bundle.status,
    name: bundle.name,
    description: bundle.description ?? null,
    shopifyProductId: bundle.shopifyProductId ?? null,
    shopifyProductHandle: bundle.shopifyProductHandle ?? null,
  };
}
