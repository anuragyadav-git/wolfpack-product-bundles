import db from "../../db.server";
import { savedSettingsUseAdvancedDesign } from "../../lib/subscriptions/design-entitlements";

export async function shopUsesAdvancedDesign(
  shopDomain: string,
  database: typeof db = db,
): Promise<boolean> {
  const rows = await database.designSettings.findMany({
    where: { shopId: shopDomain },
    select: { generalSettings: true },
  });
  return rows.some((row) => savedSettingsUseAdvancedDesign(row.generalSettings));
}
