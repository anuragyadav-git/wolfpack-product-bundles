import type { ResolveShopSubscriptionInput } from "./subscription-entitlement-service.server";
import type { PlanCode } from "../../lib/subscriptions/entitlements";

export interface ReconciliationShop {
  shopDomain: string;
  shopifyShopGid: string | null;
}

export async function reconcileSubscriptionShops(input: {
  shops: ReconciliationShop[];
  verify: (input: ResolveShopSubscriptionInput) => Promise<{ planCode?: PlanCode | null } | unknown>;
  onVerified?: (input: {
    shopDomain: string;
    currentPlanCode: PlanCode | null;
  }) => Promise<void> | void;
}): Promise<{ verified: number; failed: number; skipped: number }> {
  const result = { verified: 0, failed: 0, skipped: 0 };
  for (const shop of input.shops) {
    if (!shop.shopifyShopGid) {
      result.skipped += 1;
      continue;
    }
    try {
      const verified = await input.verify({
        shopDomain: shop.shopDomain,
        forceRefresh: true,
      });
      const currentPlanCode = verified && typeof verified === "object" && "planCode" in verified
        ? (verified.planCode as PlanCode | null | undefined) ?? null
        : null;
      await input.onVerified?.({
        shopDomain: shop.shopDomain,
        currentPlanCode,
      });
      result.verified += 1;
    } catch {
      result.failed += 1;
    }
  }
  return result;
}
