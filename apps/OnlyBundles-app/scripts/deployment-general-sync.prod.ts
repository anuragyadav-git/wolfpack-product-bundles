#!/usr/bin/env tsx

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// 1. Explicitly load .env.prod BEFORE importing any application modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.prod");
dotenv.config({ path: envPath, override: true });

async function main() {
  const {
    parseDeploymentGeneralSyncEnv,
    resolveGeneralSyncEnvironment,
    runDeploymentGeneralSync,
  } = await import("../app/services/deployment-general-sync.server");
  const { syncBundleStorefrontNow } = await import("../app/services/bundles/storefront-sync.server");
  const { ensureVariantBundleMetafieldDefinitions } = await import("../app/services/bundles/metafield-sync/operations/definitions.server");
  const { AddOnDiscountFunctionService } = await import("../app/services/addon-discount-function-service.server");
  const { syncPpbStorefrontRuntime } = await import("../app/services/ppb-storefront-runtime.server");
  const { unauthenticated } = await import("../app/shopify.server");
  const { prisma: db } = await import("../app/db.server");

  // 2. Safeguards: verify production environment context
  const envConfig = resolveGeneralSyncEnvironment("prod", process.env);
  if (envConfig.isKeyMismatch) {
    console.warn(
      `[DEPLOYMENT_GENERAL_SYNC:PROD] Warning: SHOPIFY_API_KEY (${process.env.SHOPIFY_API_KEY}) does not match PROD client ID (${envConfig.expectedApiKey}).`,
    );
  }

  const configuredProxyRoot = envConfig.proxyRoot;

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
      syncPpbRuntime: (admin, shopDomain) =>
        syncPpbStorefrontRuntime(
          admin as any,
          shopDomain,
          configuredProxyRoot,
        ),
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
  });
