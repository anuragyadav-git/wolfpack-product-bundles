#!/usr/bin/env tsx

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  parseDeploymentGeneralSyncEnv,
  resolveGeneralSyncEnvironment,
  runDeploymentGeneralSync,
} from "../app/services/deployment-general-sync.server";
import { syncBundleStorefrontNow } from "../app/services/bundles/storefront-sync.server";
import { ensureVariantBundleMetafieldDefinitions } from "../app/services/bundles/metafield-sync/operations/definitions.server";
import { AddOnDiscountFunctionService } from "../app/services/addon-discount-function-service.server";
import { syncPpbStorefrontRuntime } from "../app/services/ppb-storefront-runtime.server";

// 1. Explicitly load .env.staging
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.staging");
dotenv.config({ path: envPath, override: true });

// 2. Safeguards: verify SIT environment context
const envConfig = resolveGeneralSyncEnvironment("sit", process.env);
if (envConfig.isKeyMismatch) {
  console.warn(
    `[DEPLOYMENT_GENERAL_SYNC:SIT] Warning: SHOPIFY_API_KEY (${process.env.SHOPIFY_API_KEY}) does not match SIT client ID (${envConfig.expectedApiKey}).`,
  );
}

const configuredProxyRoot = envConfig.proxyRoot;

// 3. Dedicated Prisma client connected to the SIT DATABASE_URL
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  // Dynamically import shopify.server after dotenv has configured environment variables
  const { unauthenticated } = await import("../app/shopify.server");

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
  })
  .finally(async () => {
    await db.$disconnect();
  });
