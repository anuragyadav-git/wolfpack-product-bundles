import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../../../../lib/auth-guards.server";
import db from "../../../../db.server";

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

  await db.bundle.update({
    where: { id: bundleId, shopId: session.shop },
    data: { bundleDesignTemplate, bundleDesignPresetId },
  });

  return json({ success: true });
}
