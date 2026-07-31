#!/usr/bin/env tsx

import db from "../app/db.server";
import { unauthenticated } from "../app/shopify.server";
import {
  parseDeploymentGeneralSyncEnv,
  runDeploymentGeneralSync,
  syncPersistedBundleMetaobjects,
} from "../app/services/deployment-general-sync.server";
import { runStepConditionRemediation } from "../app/services/step-condition-remediation.server";
import { syncBundleStorefrontNow } from "../app/services/bundles/storefront-sync.server";
import { ensureVariantBundleMetafieldDefinitions } from "../app/services/bundles/metafield-sync.server";
import { AddOnDiscountFunctionService } from "../app/services/addon-discount-function-service.server";

async function main() {
  const summary = await runDeploymentGeneralSync(
    parseDeploymentGeneralSyncEnv(process.env),
    {
      prisma: db as any,
      getAdmin: async (shopDomain) => {
        const { admin } = await unauthenticated.admin(shopDomain);
        return admin;
      },
      ensureMetafieldDefinitions: (admin) =>
        ensureVariantBundleMetafieldDefinitions(admin),
      syncBundle: syncBundleStorefrontNow as any,
      setupAddonDiscount: (admin, shopDomain) =>
        AddOnDiscountFunctionService.completeSetup(admin as any, shopDomain),
      syncBundleMetaobjects: syncPersistedBundleMetaobjects,
      logger: console,
    },
  );

  const remediationSummary =
    summary.mode === "disabled"
      ? {
        mode: "skipped",
        scannedBundles: 0,
        scannedSteps: 0,
        impossibleSteps: 0,
        fixedSteps: 0,
        updatedBundles: 0,
        failures: [],
      }
      : await runStepConditionRemediation({
        prisma: db as any,
        logger: console,
      });

  const combinedSummary = {
    deploymentGeneralSync: summary,
    stepConditionRemediation: remediationSummary,
  };

  console.log(JSON.stringify(combinedSummary, null, 2));
  if (
    summary.failedShops > 0 ||
    summary.failedBundles > 0 ||
    ("failures" in remediationSummary && remediationSummary.failures.length > 0)
  ) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
