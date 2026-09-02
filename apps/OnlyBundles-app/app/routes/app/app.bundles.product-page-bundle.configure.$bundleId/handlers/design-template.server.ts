import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../../../../lib/auth-guards.server";
import db from "../../../../db.server";
import { parseBundleDesignTemplate } from "./parsers";
import { updateSyncMetafields } from "./runtime-config.server";
import { BundleStatus } from "../../../../constants/bundle";
import { resolveShopEntitlements } from "../../../../services/subscriptions/subscription-service.server";
import { shopUsesAdvancedDesign } from "../../../../services/subscriptions/design-entitlement-state.server";
import { updateBundleWithPublicationGate } from "../../../../services/subscriptions/bundle-entitlement-gate.server";

export async function handleUpdateBundleDesignTemplate(
  _admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
  formData: FormData,
) {
  const { bundleDesignTemplate, bundleDesignPresetId } =
    parseBundleDesignTemplate(formData);

  const currentBundle = await db.bundle.findUnique({
    where: { id: bundleId, shopId: session.shop },
    include: { steps: true },
  });
  if (!currentBundle) return json({ success: false, error: "Bundle not found" }, { status: 404 });
  const publicBundle = currentBundle.status === BundleStatus.ACTIVE
    || currentBundle.status === BundleStatus.UNLISTED;
  const entitlementContext = publicBundle
    ? await resolveShopEntitlements({ shopDomain: session.shop, forceRefresh: true })
    : null;

  const updatedBundle = await updateBundleWithPublicationGate<any>({
    database: db,
    shopDomain: session.shop,
    bundleId,
    candidate: {
      bundleType: "PRODUCT_PAGE",
      status: currentBundle.status.toUpperCase() as "ACTIVE" | "UNLISTED" | "DRAFT" | "ARCHIVED",
      enabledStepCount: currentBundle.steps.filter((step) => step.enabled).length,
      designTemplate: bundleDesignTemplate,
      designPresetId: bundleDesignPresetId,
      usesAdvancedDesign: entitlementContext ? await shopUsesAdvancedDesign(session.shop) : false,
      usesBundleSubscriptions: Boolean(currentBundle.bundleSubscriptionConfig),
      usesCustomCode: false,
    },
    entitlements: entitlementContext?.entitlements ?? null,
    data: { bundleDesignTemplate, bundleDesignPresetId },
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

  if (updatedBundle.shopifyProductId) {
    await updateSyncMetafields(
      _admin,
      updatedBundle.shopifyProductId,
      updatedBundle,
    );
  }

  return json({ success: true });
}
