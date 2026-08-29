import { Prisma, type BundleStatus } from "@prisma/client";
import db from "../../db.server";
import { detectBundleRequirements, type BundleEntitlementCandidate } from "../../lib/subscriptions/entitlements";
import { savedSettingsUseAdvancedDesign } from "../../lib/subscriptions/design-entitlements";

export interface PublicBundlePolicyState {
  id: string;
  status: "ACTIVE" | "UNLISTED";
  publishedAt: Date | null;
  requiresGrowth: boolean;
}

export function selectRetainedFreeBundle(
  bundles: PublicBundlePolicyState[],
): PublicBundlePolicyState | null {
  return bundles
    .filter((bundle) => !bundle.requiresGrowth)
    .sort((left, right) =>
      (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0))[0]
    ?? null;
}

function toPolicyState(input: {
  id: string;
  status: BundleStatus;
  publishedAt: Date | null;
  candidate: BundleEntitlementCandidate;
}): PublicBundlePolicyState {
  return {
    id: input.id,
    status: input.status.toUpperCase() as "ACTIVE" | "UNLISTED",
    publishedAt: input.publishedAt,
    requiresGrowth: detectBundleRequirements(input.candidate).length > 0,
  };
}

export async function applyFreePlanBundlePolicy(input: {
  shopDomain: string;
  database?: typeof db;
  now?: Date;
  onBundleUnpublished: (bundle: {
    shopDomain: string;
    bundleId: string;
    bundleType: "full_page" | "product_page";
  }) => Promise<void>;
}): Promise<{ retainedBundleId: string | null; unpublishedBundleIds: string[] }> {
  const database = input.database ?? db;
  const now = input.now ?? new Date();
  const result = await database.$transaction(async (transaction) => {
    await transaction.$queryRaw(Prisma.sql`
      SELECT "id" FROM "Shop" WHERE "shopDomain" = ${input.shopDomain} FOR UPDATE
    `);
    const [publicBundles, pendingSyncBundles, designRows] = await Promise.all([
      transaction.bundle.findMany({
        where: { shopId: input.shopDomain, status: { in: ["active", "unlisted"] } },
        select: {
          id: true,
          status: true,
          bundleType: true,
          bundleDesignTemplate: true,
          bundleDesignPresetId: true,
          publishedAt: true,
          steps: { select: { enabled: true } },
        },
      }),
      transaction.bundle.findMany({
        where: {
          shopId: input.shopDomain,
          status: "draft",
          planRestrictionReason: "free_plan_storefront_sync_pending",
        },
        select: { id: true, bundleType: true },
      }),
      transaction.designSettings.findMany({
        where: { shopId: input.shopDomain },
        select: { generalSettings: true },
      }),
    ]);
    const usesAdvancedDesign = designRows.some((row) =>
      savedSettingsUseAdvancedDesign(row.generalSettings));
    const states = publicBundles.map((bundle) => toPolicyState({
      id: bundle.id,
      status: bundle.status,
      publishedAt: bundle.publishedAt,
      candidate: {
        bundleType: bundle.bundleType === "full_page" ? "FULL_PAGE" : "PRODUCT_PAGE",
        status: bundle.status.toUpperCase() as "ACTIVE" | "UNLISTED",
        enabledStepCount: bundle.steps.filter((step) => step.enabled).length,
        designTemplate: bundle.bundleDesignTemplate,
        designPresetId: bundle.bundleDesignPresetId,
        usesAdvancedDesign,
      },
    }));
    const retained = selectRetainedFreeBundle(states);
    const newlyUnpublished = publicBundles.filter((bundle) => bundle.id !== retained?.id);
    if (newlyUnpublished.length > 0) {
      await transaction.bundle.updateMany({
        where: { id: { in: newlyUnpublished.map((bundle) => bundle.id) }, shopId: input.shopDomain },
        data: {
          status: "draft",
          planRestrictedAt: now,
          planRestrictionReason: "free_plan_storefront_sync_pending",
        },
      });
    }
    const pendingById = new Map(
      [...pendingSyncBundles, ...newlyUnpublished].map((bundle) => [bundle.id, bundle]),
    );
    return { retainedBundleId: retained?.id ?? null, pendingSync: [...pendingById.values()] };
  });

  for (const bundle of result.pendingSync) {
    await input.onBundleUnpublished({
      shopDomain: input.shopDomain,
      bundleId: bundle.id,
      bundleType: bundle.bundleType,
    });
    await database.bundle.update({
      where: { id: bundle.id, shopId: input.shopDomain },
      data: { planRestrictionReason: "free_plan_enforced" },
    });
  }
  return {
    retainedBundleId: result.retainedBundleId,
    unpublishedBundleIds: result.pendingSync.map((bundle) => bundle.id),
  };
}
