#!/usr/bin/env tsx

import db from "../app/db.server";
import { unauthenticated } from "../app/shopify.server";
import {
  parseDeploymentGeneralSyncEnv,
  runDeploymentGeneralSync,
} from "../app/services/deployment-general-sync.server";
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
      updateStepProductVariants: async ({ stepProductId, variants }: any) => {
        await db.stepProduct.update({
          where: { id: stepProductId },
          data: { variants: variants as any },
        });
      },
      setupAddonDiscount: (admin, shopDomain) =>
        AddOnDiscountFunctionService.completeSetup(admin as any, shopDomain),
      setupSubscriptionDiscount: (admin, shopDomain) =>
        AddOnDiscountFunctionService.completeSubscriptionInitialSetup(
          admin as any,
          shopDomain,
        ),
      setupSubscriptionRecurringDiscount: (admin, shopDomain) =>
        AddOnDiscountFunctionService.completeSubscriptionRecurringSetup(
          admin as any,
          shopDomain,
        ),
      logger: console,
    },
  );

  console.log(JSON.stringify(summary, null, 2));
  if (summary.failedShops > 0 || summary.failedBundles > 0) {
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
