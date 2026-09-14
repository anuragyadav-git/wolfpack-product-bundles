import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../../../../shopify.server";
import db from "../../../../db.server";
import { resolveShopEntitlements } from "../../../../services/subscriptions/subscription-service.server";
import { assertTemplateSelectionAllowed } from "../../../../services/subscriptions/bundle-entitlement-gate.server";
import { EntitlementDeniedError } from "../../../../lib/subscriptions/entitlements";

export async function handleUpdateBundleDesignTemplate(
  _admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
  formData: FormData,
) {
  const bundleDesignTemplate =
    (formData.get("bundleDesignTemplate") as string)?.trim() || null;
  const bundleDesignPresetId =
    (formData.get("bundleDesignPresetId") as string)?.trim() || null;

  const entitlementContext = await resolveShopEntitlements({
    shopDomain: session.shop,
    forceRefresh: true,
  });

  try {
    assertTemplateSelectionAllowed({
      bundleType: "FULL_PAGE",
      designTemplate: bundleDesignTemplate,
      designPresetId: bundleDesignPresetId,
      entitlements: entitlementContext?.entitlements ?? null,
    });
  } catch (error) {
    if (error instanceof EntitlementDeniedError) {
      return json(
        {
          success: false,
          error: "The selected template requires the Growth plan.",
          entitlementFailure: error.toJSON(),
        },
        { status: 403 },
      );
    }
    throw error;
  }

  await db.bundle.update({
    where: { id: bundleId, shopId: session.shop },
    data: { bundleDesignTemplate, bundleDesignPresetId },
  });

  return json({ success: true });
}
