import type { ShopifyAdmin } from "../../../../lib/auth-guards.server";
import { AppLogger } from "../../../../lib/logger";
import {
  updateBundleProductMetafields,
} from "../../../../services/bundles/metafield-sync.server";
import { parseConditionValue } from "../../../../lib/parse-condition-value";
import { formatStepCategoryForRuntime } from "../../../../lib/bundle-config/category-runtime";
import { BundleStatus, BundleType } from "../../../../constants/bundle";
import { safeJsonParse } from "../../../../services/bundles/bundle-configure-handlers.server";

function buildRuntimePricingRule(rule: any): Record<string, unknown> {
  const flatRule: Record<string, unknown> = {
    id: rule.id,
    conditionType: rule.conditionType || "quantity",
    conditionValue: Number(rule.conditionValue ?? 0) || 0,
    discountValue: Number(rule.discountValue ?? 0) || 0,
  };

  if (rule.fixedBundlePrice !== undefined) {
    flatRule.fixedBundlePrice = Number(rule.fixedBundlePrice) || 0;
  }
  if (rule.customerBuys !== undefined) {
    flatRule.customerBuys = Number(rule.customerBuys) || 0;
  }
  if (rule.customerGets !== undefined) {
    flatRule.customerGets = Number(rule.customerGets) || 0;
  }
  if (rule.bxyDiscountType !== undefined) {
    flatRule.bxyDiscountType = rule.bxyDiscountType;
  }
  if (rule.bxyApplyMode !== undefined) {
    flatRule.bxyApplyMode = rule.bxyApplyMode;
  }

  return flatRule;
}

/** Build the base bundle configuration object passed to metafield update functions. */
export function buildBundleBaseConfig(
  updatedBundle: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    bundleType: string;
    templateName: string | null;
    shopifyProductId: string | null;
    bundleDesignTemplate?: string | null;
    bundleDesignPresetId?: string | null;
    defaultProductsData?: unknown;
    boxSelection?: unknown;
    bundleUpsellConfig?: unknown;
    bundleTextConfig?: unknown;
    bundleSubscriptionConfig?: unknown;
    discountDisplayOverride?: unknown;
    validateQuantityPerProduct?: unknown;
    useSingleStepCategoriesAsBundleSteps?: boolean | null;
    pricing?: {
      displayOptions?: unknown;
      messages?: unknown;
      ruleMessagesByLocale?: unknown;
    } | null;
  },
  stepsData: any[],
  stepConditionsData: Record<string, any[]>,
  discountData: any,
  bundleParentVariantId: string | null,
): Record<string, unknown> {
  const optimizedSteps = (stepsData || []).map((step: any) => ({
    id: step.id,
    name: step.name || "Step",
    pageTitle: step.pageTitle ?? null,
    multiLangData: step.multiLangData ?? {},
    stepImage: step.stepImage ?? null,
    minQuantity: step.minQuantity,
    maxQuantity: step.maxQuantity,
    enabled: step.enabled !== false,
    conditionType: stepConditionsData[step.id]?.[0]?.type || null,
    conditionOperator: stepConditionsData[step.id]?.[0]?.operator || null,
    conditionValue: parseConditionValue(
      stepConditionsData[step.id]?.[0]?.value,
    ),
    conditionOperator2: stepConditionsData[step.id]?.[1]?.operator || null,
    conditionValue2: parseConditionValue(
      stepConditionsData[step.id]?.[1]?.value,
    ),
    products: (step.StepProduct || []).map((product: any) => ({
      id: product.id,
      title: product.title || product.name || "Product",
      imageUrl: product.imageUrl || product.image?.url || null,
      variants: Array.isArray(product.variants) ? product.variants : [],
    })),
    collections: (step.collections || []).map((collection: any) => ({
      id: collection.id,
      title: collection.title || "Collection",
    })),
    categories: Array.isArray(step.StepCategory)
      ? step.StepCategory.map((cat: any) => ({
          name: cat.name || "",
          title: cat.title || cat.name || "",
          sortOrder: cat.sortOrder ?? 0,
          multiLangData: cat.multiLangData ?? {},
          products: (cat.products || []).map((p: any) => ({
            id: p.id,
            title: p.title || "Product",
            imageUrl: p.imageUrl || null,
          })),
          collections: (cat.collections || []).map((c: any) => ({
            id: c.id,
            title: c.title || "Collection",
          })),
        }))
      : [],
    isFreeGift: step.isFreeGift === true,
    freeGiftName: step.freeGiftName ?? null,
    addonLabel: step.addonLabel ?? null,
    addonTitle: step.addonTitle ?? null,
    addonAddText: step.addonAddText ?? null,
    addonReplaceText: step.addonReplaceText ?? null,
    addonDisplayFree: step.addonDisplayFree === true,
    addonTiers: Array.isArray(step.addonTiers) ? step.addonTiers : [],
    addonUnlockAfterCompletion: step.addonUnlockAfterCompletion !== false,
  }));

  const savedPricingMessages = safeJsonParse(
    updatedBundle.pricing?.messages,
    {},
  );
  const pricingDisplayOptions =
    updatedBundle.pricing?.displayOptions ??
    discountData.displayOptions ?? null;
  const pricingRuleMessages =
    savedPricingMessages.ruleMessages ?? discountData.ruleMessages ?? {};
  const firstRuleId =
    discountData.discountRules?.[0]?.id ?? Object.keys(pricingRuleMessages)[0];
  const firstRuleMsg = firstRuleId && pricingRuleMessages?.[firstRuleId];

  return {
    bundleId: updatedBundle.id,
    id: updatedBundle.id,
    name: updatedBundle.name,
    description: updatedBundle.description,
    status: updatedBundle.status,
    bundleType: updatedBundle.bundleType,
    templateName: updatedBundle.templateName,
    bundleDesignTemplate: updatedBundle.bundleDesignTemplate ?? null,
    bundleDesignPresetId: updatedBundle.bundleDesignPresetId ?? null,
    defaultProductsData: updatedBundle.defaultProductsData ?? {},
    boxSelection: updatedBundle.boxSelection ?? null,
    bundleUpsellConfig: updatedBundle.bundleUpsellConfig ?? null,
    bundleTextConfig: updatedBundle.bundleTextConfig ?? null,
    bundleSubscriptionConfig: updatedBundle.bundleSubscriptionConfig ?? null,
    discountDisplayOverride: updatedBundle.discountDisplayOverride ?? null,
    validateQuantityPerProduct: updatedBundle.validateQuantityPerProduct ?? {
      isEnabled: false,
      allowedQuantity: 1,
    },
  useSingleStepCategoriesAsBundleSteps:
      updatedBundle.useSingleStepCategoriesAsBundleSteps ?? false,
    steps: optimizedSteps,
    pricing: {
      enabled: discountData.discountEnabled,
      method: discountData.discountType,
      rules: (discountData.discountRules || []).map(buildRuntimePricingRule),
      display: { showFooter: discountData.showFooter !== false },
      displayOptions: pricingDisplayOptions,
      messages: {
        progress:
          firstRuleMsg?.discountText ||
          "Add {conditionText} to get {discountText}",
        qualified:
          firstRuleMsg?.successMessage ||
          "Congratulations! You got {discountText}",
        showDiscountMessaging: discountData.discountMessagingEnabled || false,
        showDiscountDisplay: savedPricingMessages.showDiscountDisplay ?? true,
        ruleMessages: pricingRuleMessages,
        ruleMessagesByLocale:
          updatedBundle.pricing?.ruleMessagesByLocale ??
          discountData.ruleMessagesByLocale ??
          null,
        successMessage:
          savedPricingMessages.successMessage ??
          discountData.successMessage ??
          null,
        successMessageByLocale:
          savedPricingMessages.successMessageByLocale ??
          discountData.successMessageByLocale ??
          null,
        displayOptions: pricingDisplayOptions,
        tierTextByRuleId:
          savedPricingMessages.tierTextByRuleId ??
          discountData.tierTextByRuleId ??
          null,
        tierTextByLocaleByRuleId:
          savedPricingMessages.tierTextByLocaleByRuleId ??
          discountData.tierTextByLocaleByRuleId ??
          null,
        showInCart: true,
      },
    },
    bundleParentVariantId: bundleParentVariantId,
    shopifyProductId: updatedBundle.shopifyProductId,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSyncVariants(
  variants: unknown,
): Array<Record<string, unknown>> {
  if (!Array.isArray(variants)) return [];

  return variants
    .filter(
      (variant: any) =>
        typeof variant?.id === "string" && variant.id.trim() !== "",
    )
    .map((variant: any) => {
      const normalized: Record<string, unknown> = { id: variant.id };
      if (variant.title !== undefined) normalized.title = variant.title;
      if (variant.price !== undefined) normalized.price = variant.price;
      if (variant.image !== undefined) normalized.image = variant.image;
      if (variant.availableForSale !== undefined)
        normalized.availableForSale = variant.availableForSale;
      if (variant.available !== undefined)
        normalized.availableForSale = variant.available;
      return normalized;
    });
}

function normalizeSyncProduct(product: any): Record<string, unknown> | null {
  if (!product || typeof product !== "object") return null;
  const id = product.productId ?? product.id ?? product.graphqlId;
  if (typeof id !== "string" || id.trim() === "") return null;

  return {
    id,
    title: product.title || product.name || "Product",
    imageUrl:
      product.imageUrl ||
      product.images?.[0]?.originalSrc ||
      product.images?.[0]?.url ||
      product.image?.url ||
      null,
    variants: normalizeSyncVariants(product.variants),
  };
}

function pushUniqueProduct(
  target: Array<Record<string, unknown>>,
  seen: Set<string>,
  product: any,
) {
  const normalized = normalizeSyncProduct(product);
  if (!normalized) return;
  const id = normalized.id;
  if (typeof id !== "string" || seen.has(id)) return;
  seen.add(id);
  target.push(normalized);
}

function normalizeSyncCollection(
  collection: any,
): Record<string, unknown> | null {
  if (!collection || typeof collection !== "object") return null;
  const id = collection.id ?? collection.collectionId ?? collection.handle;
  if (typeof id !== "string" || id.trim() === "") return null;

  return {
    id,
    title: collection.title || collection.name || "Collection",
    handle: collection.handle ?? null,
  };
}

function pushUniqueCollection(
  target: Array<Record<string, unknown>>,
  seen: Set<string>,
  collection: any,
) {
  const normalized = normalizeSyncCollection(collection);
  if (!normalized) return;
  const key = typeof normalized.id === "string" ? normalized.id : null;
  if (!key || seen.has(key)) return;
  seen.add(key);
  target.push(normalized);
}

function normalizeSyncCategories(step: any): Array<Record<string, unknown>> {
  return (Array.isArray(step.StepCategory) ? step.StepCategory : []).map(
    (category: any, index: number) => {
      const formatted = formatStepCategoryForRuntime(category, index);
      return {
        ...formatted,
        products: Array.isArray(category.products)
          ? category.products.map(normalizeSyncProduct).filter(Boolean)
          : [],
        collections: Array.isArray(formatted.collections)
          ? formatted.collections.map(normalizeSyncCollection).filter(Boolean)
          : [],
      };
    },
  );
}

function buildSyncOptimizedSteps(steps: any[]): Array<Record<string, unknown>> {
  return (steps || []).map((step: any) => {
    const products: Array<Record<string, unknown>> = [];
    const collections: Array<Record<string, unknown>> = [];
    const seenProductIds = new Set<string>();
    const seenCollectionIds = new Set<string>();

    for (const product of Array.isArray(step.StepProduct)
      ? step.StepProduct
      : []) {
      pushUniqueProduct(products, seenProductIds, product);
    }
    for (const product of Array.isArray(step.products) ? step.products : []) {
      pushUniqueProduct(products, seenProductIds, product);
    }
    for (const collection of Array.isArray(step.collections)
      ? step.collections
      : []) {
      pushUniqueCollection(collections, seenCollectionIds, collection);
    }

    const categories = normalizeSyncCategories(step);

    return {
      id: step.id,
      name: step.name,
      pageTitle: step.pageTitle ?? null,
      multiLangData: step.multiLangData ?? {},
      position: step.position,
      stepImage: step.stepImage ?? step.timelineIconUrl ?? null,
      minQuantity: step.minQuantity,
      maxQuantity: step.maxQuantity ?? null,
      enabled: step.enabled !== false,
      displayVariantsAsIndividual: step.displayVariantsAsIndividual === true,
      autoNextStepOnConditionMet: step.autoNextStepOnConditionMet === true,
      conditionType: step.conditionType,
      conditionOperator: step.conditionOperator,
      conditionValue: step.conditionValue,
      conditionOperator2: step.conditionOperator2,
      conditionValue2: step.conditionValue2,
      products,
      collections,
      StepProduct: Array.isArray(step.StepProduct) ? step.StepProduct : [],
      StepCategory: categories,
      isFreeGift: step.isFreeGift === true,
      freeGiftName: step.freeGiftName ?? null,
      isDefault: step.isDefault === true,
      defaultVariantId: step.defaultVariantId ?? null,
      primaryVariantOption: step.primaryVariantOption ?? null,
      addonLabel: step.addonLabel ?? null,
      addonTitle: step.addonTitle ?? null,
      addonAddText: step.addonAddText ?? null,
      addonReplaceText: step.addonReplaceText ?? null,
      addonDisplayFree: step.addonDisplayFree === true,
      addonTiers: Array.isArray(step.addonTiers) ? step.addonTiers : [],
      addonUnlockAfterCompletion: step.addonUnlockAfterCompletion !== false,
      addonIconUrl: step.addonIconUrl ?? null,
    };
  });
}

function buildSyncPricingConfig(pricing: any): Record<string, unknown> | null {
  if (!pricing) return null;

  const syncMsgs = safeJsonParse(pricing.messages, {});
  const syncRuleMessages = syncMsgs.ruleMessages || {};
  const syncFirstRuleId = Object.keys(syncRuleMessages)[0];
  const syncFirstRuleMsg = syncFirstRuleId
    ? syncRuleMessages[syncFirstRuleId]
    : null;

  return {
    enabled: pricing.enabled,
    method: pricing.method,
    rules: safeJsonParse(pricing.rules, []).map((rule: any) => {
      const flat: Record<string, unknown> = {
        id: rule.id,
        conditionType: rule.conditionType || rule.type || "quantity",
        conditionValue: parseFloat(rule.conditionValue ?? rule.value ?? 0) || 0,
        discountValue:
          parseFloat(rule.discountValue ?? rule.discount?.value ?? 0) || 0,
      };
      if (rule.customerBuys !== undefined)
        flat.customerBuys = Number(rule.customerBuys);
      if (rule.customerGets !== undefined)
        flat.customerGets = Number(rule.customerGets);
      if (rule.bxyDiscountType !== undefined)
        flat.bxyDiscountType = rule.bxyDiscountType;
      if (rule.bxyApplyMode !== undefined)
        flat.bxyApplyMode = rule.bxyApplyMode;
      return flat;
    }),
    messages: {
      progress:
        syncFirstRuleMsg?.discountText ||
        "Add {conditionText} to get {discountText}",
      qualified:
        syncFirstRuleMsg?.successMessage ||
        "Congratulations! You got {discountText}",
      showDiscountMessaging: syncMsgs.showDiscountMessaging || false,
      ruleMessages: syncRuleMessages,
      ruleMessagesByLocale: pricing.ruleMessagesByLocale ?? null,
      successMessage: syncMsgs.successMessage ?? null,
      successMessageByLocale: syncMsgs.successMessageByLocale ?? null,
      displayOptions: pricing.displayOptions ?? null,
      tierTextByRuleId: syncMsgs.tierTextByRuleId ?? null,
      tierTextByLocaleByRuleId: syncMsgs.tierTextByLocaleByRuleId ?? null,
    },
    displayOptions: pricing.displayOptions ?? null,
  };
}

export function buildSyncBundleConfiguration(
  bundle: any,
  shopifyProductId: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  const bundleDesignPresetId = bundle.bundleDesignPresetId ?? null;
  return {
    shopId: bundle.shopId,
    bundleId: bundle.id,
    id: bundle.id,
    name: bundle.name,
    description: bundle.description || "",
    status: bundle.status || BundleStatus.ACTIVE,
    templateName: bundle.templateName || null,
    bundleType: bundle.bundleType || BundleType.PRODUCT_PAGE,
    shopifyProductId,
    type: "cart_transform",
    bundleDesignTemplate: bundle.bundleDesignTemplate ?? null,
    bundleDesignPresetId,
    defaultProductsData: bundle.defaultProductsData ?? {},
    boxSelection: bundle.boxSelection ?? null,
    bundleUpsellConfig: bundle.bundleUpsellConfig ?? null,
    bundleTextConfig: bundle.bundleTextConfig ?? null,
    personalizationData: bundle.personalizationData ?? null,
    bundleSubscriptionConfig: bundle.bundleSubscriptionConfig ?? null,
    discountDisplayOverride: bundle.discountDisplayOverride ?? null,
    validateQuantityPerProduct: bundle.validateQuantityPerProduct ?? {
      isEnabled: false,
      allowedQuantity: 1,
    },
  useSingleStepCategoriesAsBundleSteps:
      bundle.useSingleStepCategoriesAsBundleSteps ?? false,
    steps: buildSyncOptimizedSteps(bundle.steps || []),
    pricing: buildSyncPricingConfig(bundle.pricing),
    loadingGif: bundle.loadingGif ?? null,
    floatingBadgeEnabled: bundle.floatingBadgeEnabled ?? false,
    floatingBadgeText: bundle.floatingBadgeText ?? "",
    textOverrides: bundle.textOverrides ?? null,
    textOverridesByLocale: bundle.textOverridesByLocale ?? null,
    sdkMode: bundle.sdkMode ?? false,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

export async function updateSyncMetafields(
  admin: ShopifyAdmin,
  productId: string,
  bundle: any,
  extra: Record<string, unknown> = {},
) {
  const bundleConfiguration = buildSyncBundleConfiguration(
    bundle,
    productId,
    extra,
  );
  const configSize = JSON.stringify(bundleConfiguration).length;
  AppLogger.debug(
    "[METAFIELD] Sync optimized configuration size:",
    {},
    `${configSize} chars`,
  );

  await updateBundleProductMetafields(admin, productId, bundleConfiguration);

  return bundleConfiguration;
}
