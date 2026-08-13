import {
  isVariantExistsOnShopifyStorefront,
  validateVariantIdFromShopify,
} from "../lib/variant-existence.server";

type BundleType = "full_page" | "product_page";

export interface DeploymentGeneralSyncOptions {
  enabled: boolean;
}

export interface DeploymentGeneralSyncSummary {
  mode: "disabled" | "apply";
  scannedShops: number;
  scannedBundles: number;
  syncedBundles: number;
  failedBundles: number;
  failedShops: number;
  metafieldDefinitionShopsSynced: number;
  addonDiscountShopsSynced: number;
  variantRemediation: {
    scannedBundles: number;
    scannedStepProducts: number;
    scannedVariants: number;
    removedVariants: number;
    updatedBundles: number;
    failures: Array<{
      shopDomain: string;
      bundleId: string;
      stepProductId: string;
      variantId: string;
      error: string;
    }>;
  };
  failures: Array<{ shopDomain: string; bundleId: string; error: string }>;
  shopFailures: Array<{ shopDomain: string; error: string }>;
}

interface GeneralSyncBundle {
  id: string;
  shopId: string;
  bundleType: string;
  personalizationData: unknown;
  steps: Array<{
    id: string;
    StepProduct: Array<{
      id: string;
      variants: unknown;
    }>;
  }>;
}

interface GeneralSyncPrisma {
  shop: {
    findMany: (args: unknown) => Promise<Array<{ shopDomain: string }>>;
  };
  bundle: {
    findMany: (args: unknown) => Promise<GeneralSyncBundle[]>;
  };
  stepProduct: {
    update: (args: {
      where: {
        id: string;
      };
      data: {
        variants: unknown;
      };
    }) => Promise<unknown>;
  };
}

export interface DeploymentGeneralSyncDependencies {
  prisma: GeneralSyncPrisma;
  getAdmin: (shopDomain: string) => Promise<unknown>;
  ensureMetafieldDefinitions: (admin: unknown) => Promise<unknown>;
  syncBundle: (input: {
    admin: unknown;
    shopDomain: string;
    bundleId: string;
    bundleType: BundleType;
    reason: "sync_bundle";
  }) => Promise<unknown>;
  setupAddonDiscount: (
    admin: unknown,
    shopDomain: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updateStepProductVariants: (input: {
    stepProductId: string;
    variants: unknown;
  }) => Promise<unknown>;
  logger?: Pick<Console, "info" | "warn" | "error">;
}

function parseBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function parseDeploymentGeneralSyncEnv(
  env: Record<string, string | undefined> = process.env,
): DeploymentGeneralSyncOptions {
  return {
    enabled: parseBoolean(env.WPB_DEPLOYMENT_GENERAL_SYNC),
  };
}

function isBundleType(value: string): value is BundleType {
  return value === "full_page" || value === "product_page";
}

function hasEnabledAddonProducts(personalizationData: unknown) {
  if (
    personalizationData === null
    || typeof personalizationData !== "object"
    || Array.isArray(personalizationData)
  ) {
    return false;
  }
  const addonProducts = (personalizationData as Record<string, unknown>)
    .addonProducts;
  return Boolean(
    addonProducts
    && typeof addonProducts === "object"
    && !Array.isArray(addonProducts)
    && (addonProducts as Record<string, unknown>).isEnabled === true,
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Deployment general sync failed";
}

function emptySummary(mode: "disabled" | "apply"): DeploymentGeneralSyncSummary {
  return {
    mode,
    scannedShops: 0,
    scannedBundles: 0,
    syncedBundles: 0,
    failedBundles: 0,
    failedShops: 0,
    metafieldDefinitionShopsSynced: 0,
    addonDiscountShopsSynced: 0,
    variantRemediation: {
      scannedBundles: 0,
      scannedStepProducts: 0,
      scannedVariants: 0,
      removedVariants: 0,
      updatedBundles: 0,
      failures: [],
    },
    failures: [],
    shopFailures: [],
  };
}

function toVariantReference(rawVariant: unknown): string | number | null {
  if (rawVariant === null || rawVariant === undefined) {
    return null;
  }
  if (typeof rawVariant === "string" || typeof rawVariant === "number") {
    return rawVariant;
  }
  if (typeof rawVariant !== "object") {
    return null;
  }

  const candidate = rawVariant as Record<string, unknown>;
  const directReference = candidate.variantId
    || candidate.variantGraphqlId
    || candidate.id
    || candidate.variant_gid
    || candidate.variantGraphql;

  if (typeof directReference === "string" || typeof directReference === "number") {
    return directReference;
  }

  return null;
}

async function runBundleVariantRemediation(
  shopDomain: string,
  bundle: GeneralSyncBundle,
  deps: DeploymentGeneralSyncDependencies,
  summary: DeploymentGeneralSyncSummary["variantRemediation"],
) {
  const resolvedVariantsByShop = new Map<string, Awaited<ReturnType<typeof isVariantExistsOnShopifyStorefront>>>();
  let bundleUpdated = false;

  for (const step of bundle.steps) {
    for (const stepProduct of step.StepProduct) {
      const refs = Array.isArray(stepProduct.variants) ? stepProduct.variants : [];
      summary.scannedStepProducts += 1;
      summary.scannedVariants += refs.length;

      if (refs.length === 0) {
        continue;
      }

      const validRefs: unknown[] = [];
      let hasInvalidRef = false;

      for (const variantRef of refs) {
        const rawVariantId = toVariantReference(variantRef);
        if (rawVariantId === null) {
          hasInvalidRef = true;
          summary.failures.push({
            shopDomain,
            bundleId: bundle.id,
            stepProductId: stepProduct.id,
            variantId: "",
            error: "Missing or invalid variant reference",
          });
          continue;
        }

        const parsed = await validateVariantIdFromShopify(rawVariantId);
        if (!parsed.isValidFormat) {
          hasInvalidRef = true;
          summary.failures.push({
            shopDomain,
            bundleId: bundle.id,
            stepProductId: stepProduct.id,
            variantId: String(rawVariantId),
            error: parsed.reason || "Invalid variant format",
          });
          continue;
        }

        const cachedLookup = resolvedVariantsByShop.get(parsed.numericId);
        const lookup = cachedLookup
          || (await isVariantExistsOnShopifyStorefront(shopDomain, parsed.numericId));
        resolvedVariantsByShop.set(parsed.numericId, lookup);
        if (!lookup.ok) {
          hasInvalidRef = true;
          summary.failures.push({
            shopDomain,
            bundleId: bundle.id,
            stepProductId: stepProduct.id,
            variantId: String(rawVariantId),
            error: `${lookup.message || "variant not found"} (${lookup.status})`,
          });
          continue;
        }

        validRefs.push(variantRef);
      }

      if (hasInvalidRef && validRefs.length !== refs.length) {
        const removedCount = refs.length - validRefs.length;
        if (removedCount <= 0) {
          continue;
        }
        try {
          await deps.updateStepProductVariants({
            stepProductId: stepProduct.id,
            variants: validRefs,
          });
          bundleUpdated = true;
          summary.removedVariants += removedCount;
          deps.logger?.info?.(
            "[VARIANT_REMEDIATION] Removed invalid StepProduct variant refs from persisted bundle config.",
            {
              shopDomain,
              bundleId: bundle.id,
              stepProductId: stepProduct.id,
              removedCount,
            },
          );
        } catch (error) {
          summary.failures.push({
            shopDomain,
            bundleId: bundle.id,
            stepProductId: stepProduct.id,
            variantId: "",
            error: errorMessage(error),
          });
        }
      }
    }
  }

  if (bundleUpdated) {
    summary.updatedBundles += 1;
  }
}

export async function runDeploymentGeneralSync(
  options: DeploymentGeneralSyncOptions,
  deps: DeploymentGeneralSyncDependencies,
): Promise<DeploymentGeneralSyncSummary> {
  if (!options.enabled) {
    deps.logger?.info?.("[DEPLOYMENT_GENERAL_SYNC] Disabled; skipping.");
    return emptySummary("disabled");
  }

  const shops = await deps.prisma.shop.findMany({
    where: { uninstalledAt: null },
    select: { shopDomain: true },
    orderBy: { shopDomain: "asc" },
  });
  const shopDomains = shops.map(({ shopDomain }) => shopDomain);
  const bundles = shopDomains.length === 0
    ? []
    : await deps.prisma.bundle.findMany({
      where: { shopId: { in: shopDomains } },
      select: {
        id: true,
        shopId: true,
        bundleType: true,
        personalizationData: true,
        steps: {
          select: {
            id: true,
            StepProduct: {
              select: {
                id: true,
                variants: true,
              },
            },
          },
        },
      },
      orderBy: [
        { shopId: "asc" },
        { updatedAt: "desc" },
      ],
    });
  const summary = emptySummary("apply");
  summary.scannedShops = shopDomains.length;
  summary.scannedBundles = bundles.length;
  summary.variantRemediation.scannedBundles = bundles.length;

  const adminByShop = new Map<string, unknown>();
  const failedShops = new Set<string>();

  for (const shopDomain of shopDomains) {
    try {
      const admin = await deps.getAdmin(shopDomain);
      await deps.ensureMetafieldDefinitions(admin);
      adminByShop.set(shopDomain, admin);
      summary.metafieldDefinitionShopsSynced += 1;
    } catch (error) {
      const message = errorMessage(error);
      failedShops.add(shopDomain);
      summary.failedShops += 1;
      summary.shopFailures.push({ shopDomain, error: message });
      deps.logger?.error?.("[DEPLOYMENT_GENERAL_SYNC] Shop setup failed.", {
        shopDomain,
        error: message,
      });
    }
  }

  const addonShops = new Set<string>();
  for (const bundle of bundles) {
    if (failedShops.has(bundle.shopId)) continue;
    if (!isBundleType(bundle.bundleType)) {
      summary.failedBundles += 1;
      summary.failures.push({
        shopDomain: bundle.shopId,
        bundleId: bundle.id,
        error: `Unsupported bundle type: ${bundle.bundleType}`,
      });
      continue;
    }

    try {
      const admin = adminByShop.get(bundle.shopId)!;
      await deps.syncBundle({
        admin,
        shopDomain: bundle.shopId,
        bundleId: bundle.id,
        bundleType: bundle.bundleType,
        reason: "sync_bundle",
      });
      summary.syncedBundles += 1;
      if (
        bundle.bundleType === "full_page"
        && hasEnabledAddonProducts(bundle.personalizationData)
      ) {
        addonShops.add(bundle.shopId);
      }
      await runBundleVariantRemediation(
        bundle.shopId,
        bundle,
        deps,
        summary.variantRemediation,
      );
    } catch (error) {
      const message = errorMessage(error);
      summary.failedBundles += 1;
      summary.failures.push({
        shopDomain: bundle.shopId,
        bundleId: bundle.id,
        error: message,
      });
      deps.logger?.error?.("[DEPLOYMENT_GENERAL_SYNC] Bundle sync failed.", {
        shopDomain: bundle.shopId,
        bundleId: bundle.id,
        error: message,
      });
    }
  }

  for (const shopDomain of addonShops) {
    try {
      const result = await deps.setupAddonDiscount(
        adminByShop.get(shopDomain)!,
        shopDomain,
      );
      if (!result.success) {
        throw new Error(result.error ?? "Add-on discount setup failed");
      }
      summary.addonDiscountShopsSynced += 1;
    } catch (error) {
      summary.failedShops += 1;
      summary.shopFailures.push({
        shopDomain,
        error: errorMessage(error),
      });
    }
  }

  return summary;
}
