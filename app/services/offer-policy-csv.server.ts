import db from '../db.server';
import type { ShopifyAdmin } from '../lib/auth-guards.server';
import {
  parseOfferPolicyCsv,
  serializeOfferPolicyCsv,
  validateOfferPolicyCsvRows,
  type OfferPolicyCsvValidationBundle,
} from '../lib/offer-policy-csv';
import { syncBundleStorefrontNow } from './bundles/storefront-sync.server';

const offerPolicyCsvBundleSelect = {
  id: true,
  name: true,
  bundleType: true,
  status: true,
  offerPolicy: {
    include: {
      conditions: {
        where: { type: 'specific_link' as const },
        select: { revokedAt: true, expiresAt: true },
      },
    },
  },
} as const;

type LoadedBundle = Awaited<ReturnType<typeof loadOfferPolicyBundles>>[number];

async function loadOfferPolicyBundles(shopId: string) {
  return (db.bundle as any).findMany({
    where: { shopId },
    select: offerPolicyCsvBundleSelect,
    orderBy: { createdAt: 'asc' },
  }) as Promise<Array<{
    id: string;
    name: string;
    bundleType: string;
    status: string;
    offerPolicy: null | ({
      id: string;
      specificLinkRequired: boolean;
      priority: number;
      stopLowerPriority: boolean;
      startsAt: Date | null;
      endsAt: Date | null;
      countryTargetingEnabled: boolean;
      countryTargetingMode: 'include' | 'exclude';
      countryCodes: string[];
      ruleVersion: number;
      conditions?: Array<{ revokedAt: Date | null; expiresAt: Date | null }>;
    });
  }>>;
}

function toValidationBundle(bundle: LoadedBundle, now: Date): OfferPolicyCsvValidationBundle {
  return {
    ...bundle,
    specificLinkConditionActive: bundle.offerPolicy?.conditions?.some((condition) => (
      condition.revokedAt == null
      && (condition.expiresAt == null || condition.expiresAt > now)
    )) ?? false,
  };
}

function validate(csv: string, bundles: readonly LoadedBundle[]) {
  const parsed = parseOfferPolicyCsv(csv);
  const validation = validateOfferPolicyCsvRows(
    parsed,
    bundles.map((bundle) => toValidationBundle(bundle, new Date())),
  );
  return {
    ...validation,
    valid: validation.errors.length === 0,
    rowCount: parsed.rows.length,
    changedCount: validation.validRows.filter((row) => row.changed).length,
  };
}

export async function exportOfferPolicyCsv(shopId: string): Promise<string> {
  return serializeOfferPolicyCsv(await loadOfferPolicyBundles(shopId));
}

export async function validateOfferPolicyCsvImport(input: { shopId: string; csv: string }) {
  return validate(input.csv, await loadOfferPolicyBundles(input.shopId));
}

export async function applyOfferPolicyCsvImport(input: {
  admin: ShopifyAdmin;
  shopId: string;
  csv: string;
}) {
  const bundles = await loadOfferPolicyBundles(input.shopId);
  const validation = validate(input.csv, bundles);
  if (!validation.valid) {
    return {
      ...validation,
      appliedCount: 0,
      syncedCount: 0,
      syncErrors: [],
    };
  }

  const changedRows = validation.validRows.filter((row) => row.changed);
  const bundlesById = new Map(bundles.map((bundle) => [bundle.id, bundle]));
  try {
    await (db as any).$transaction(async (tx: any) => {
      for (const row of changedRows) {
        const bundle = bundlesById.get(row.bundleId)!;
        if (bundle.offerPolicy) {
          const update = await tx.offerPolicy.updateMany({
            where: {
              bundleId: row.bundleId,
              shopId: input.shopId,
              ruleVersion: row.expectedRuleVersion,
            },
            data: {
              ...row.data,
              ruleVersion: { increment: 1 },
            },
          });
          if (update.count !== 1) throw new Error(`STALE_RULE_VERSION:${row.row}`);
          if (bundle.offerPolicy.specificLinkRequired && !row.data.specificLinkRequired) {
            await tx.offerCondition.updateMany({
              where: {
                offerPolicyId: bundle.offerPolicy.id,
                type: 'specific_link',
                revokedAt: null,
              },
              data: { revokedAt: new Date() },
            });
          }
        } else {
          await tx.offerPolicy.create({
            data: {
              bundleId: row.bundleId,
              shopId: input.shopId,
              ...row.data,
              ruleVersion: 1,
            },
          });
        }
      }
    });
  } catch (error) {
    const match = error instanceof Error ? /^STALE_RULE_VERSION:(\d+)$/.exec(error.message) : null;
    if (!match) throw error;
    return {
      valid: false,
      rowCount: validation.rowCount,
      changedCount: validation.changedCount,
      validRows: [],
      errors: [{ row: Number(match[1]), field: 'rule_version' as const, code: 'stale_rule_version' }],
      appliedCount: 0,
      syncedCount: 0,
      syncErrors: [],
    };
  }

  const syncErrors: Array<{ bundleId: string; code: 'storefront_sync_failed' }> = [];
  let syncedCount = 0;
  for (const row of changedRows) {
    try {
      await syncBundleStorefrontNow({
        admin: input.admin,
        shopDomain: input.shopId,
        bundleId: row.bundleId,
        bundleType: row.bundleType === 'full_page' ? 'full_page' : 'product_page',
        reason: 'save',
      });
      syncedCount += 1;
    } catch {
      syncErrors.push({ bundleId: row.bundleId, code: 'storefront_sync_failed' });
    }
  }

  return {
    ...validation,
    appliedCount: changedRows.length,
    syncedCount,
    syncErrors,
  };
}
