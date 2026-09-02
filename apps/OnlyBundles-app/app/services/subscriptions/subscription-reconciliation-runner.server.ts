import db from "../../db.server";
import { unauthenticated } from "../../shopify.server";
import type { PlanCode } from "../../lib/subscriptions/entitlements";
import { syncBundleStorefrontNow } from "../bundles/storefront-sync.server";
import type { ResolveShopSubscriptionInput } from "./subscription-entitlement-service.server";
import { applyFreePlanBundlePolicy } from "./free-plan-bundle-policy.server";
import { reconcileSubscriptionShops } from "./subscription-reconciliation.server";
import { resolveShopEntitlements } from "./subscription-service.server";

export interface SubscriptionReconciliationRunnerDependencies {
  listInstalledShops: () => Promise<Array<{
    shopDomain: string;
    shopifyShopGid: string | null;
  }>>;
  verify: (input: ResolveShopSubscriptionInput) => Promise<{
    planCode?: PlanCode | null;
  } | unknown>;
  applyFreePlanPolicy: (shopDomain: string) => Promise<void>;
}

const defaultDependencies: SubscriptionReconciliationRunnerDependencies = {
  listInstalledShops: () => db.shop.findMany({
    where: { uninstalledAt: null },
    select: { shopDomain: true, shopifyShopGid: true },
  }),
  verify: resolveShopEntitlements,
  applyFreePlanPolicy: async (shopDomain) => {
    await applyFreePlanBundlePolicy({
      shopDomain,
      onBundleUnpublished: async ({ bundleId, bundleType }) => {
        const { admin } = await unauthenticated.admin(shopDomain);
        await syncBundleStorefrontNow({
          admin,
          shopDomain,
          bundleId,
          bundleType,
          reason: "downgrade",
        });
      },
    });
  },
};

export async function runSubscriptionReconciliation(
  dependencies: SubscriptionReconciliationRunnerDependencies = defaultDependencies,
): Promise<{ verified: number; failed: number; skipped: number }> {
  const shops = await dependencies.listInstalledShops();
  return reconcileSubscriptionShops({
    shops,
    verify: dependencies.verify,
    onVerified: async ({ shopDomain, currentPlanCode }) => {
      if (currentPlanCode === "FREE") {
        await dependencies.applyFreePlanPolicy(shopDomain);
      }
    },
  });
}
