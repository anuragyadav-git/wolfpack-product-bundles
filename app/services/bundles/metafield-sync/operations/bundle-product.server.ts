/**
 * Bundle Product Metafield Operations
 *
 * Updates bundle variant metafields with Shopify Standard structure
 */

import { isUUID } from "../../../../utils/shopify-validators";
import { getFirstVariantId, batchGetFirstVariantsWithPrices } from "../../../../utils/variant-lookup.server";
import { AppLogger } from "../../../../lib/logger";
import type { ShopifyAdmin } from "../../../../lib/auth-guards.server";
import { checkMetafieldSize } from "../utils/size-check";
import { calculateComponentPricing } from "../utils/pricing";
import { buildPriceAdjustmentConfig } from "../utils/price-adjustment";
import { collectAddonComponentVariants } from "../utils/addon-components";
import type { BundleUiConfig, ComponentPricing } from "../types";
import { BundleStatus, BundleType } from "../../../../constants/bundle";
import { formatStepCategoriesForRuntime } from "../../../../lib/bundle-config/category-runtime";
import { resolveShowProductComparedAtPrice } from "../../../../lib/bundle-config/product-page-display";
import { normalizeShopifyComponentQuantity } from "../utils/component-quantity";
import { buildCheckoutOfferRuntime } from "../../../checkout-bundle-offers.server";
import { buildPublicBundleSubscriptionConfig } from "../../../../lib/bundle-subscriptions";
import { buildPpbPolicyRevisionMetafield, buildPpbStaticAuthorization } from "../../../ppb-static-authorization.server";
import { generateCartTransformRuntimeTokenSecret } from "../../../cart-transform-runtime-token.server";
import { assertPpbStorefrontSnapshotSize } from "../../../ppb-storefront-runtime.server";

async function ensureBundleParentVariantRequiresComponents(
  admin: ShopifyAdmin,
  bundleProductId: string,
  bundleVariantId: string,
) {
  const response = await admin.graphql(`
    mutation EnsureBundleParentVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          requiresComponents
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `, {
    variables: {
      productId: bundleProductId,
      variants: [{
        id: bundleVariantId,
        requiresComponents: true,
      }],
    },
  });

  const data = await response.json();
  const userErrors = data.data?.productVariantsBulkUpdate?.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(`Failed to mark bundle parent variant as requiring components: ${userErrors[0].message}`);
  }
}

function getProductReferenceId(product: any): string | null {
  if (!product || typeof product !== "object") return null;
  const id = product.productId ?? product.id ?? product.graphqlId;
  return typeof id === "string" && id.trim() !== "" ? id : null;
}

function collectStepProductReferences(step: any): Array<{ id: string }> {
  const productIds: string[] = [];

  for (const product of Array.isArray(step.StepProduct) ? step.StepProduct : []) {
    const id = getProductReferenceId(product);
    if (id && !productIds.includes(id)) productIds.push(id);
  }

  return productIds.map((id) => ({ id }));
}

function normalizeShopifyGid(value: unknown, resource: "ProductVariant"): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.startsWith(`gid://shopify/${resource}/`)) return raw;
  if (/^\d+$/.test(raw)) return `gid://shopify/${resource}/${raw}`;
  return null;
}

function getCachedVariantId(variant: any): string | null {
  return normalizeShopifyGid(
    variant?.id
      ?? variant?.variantGraphqlId
      ?? variant?.graphqlId
      ?? variant?.variantId,
    "ProductVariant",
  );
}

function parseCachedVariantPriceCents(variant: any): number | null {
  const value = variant?.priceCents ?? variant?.price;
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;

  if (typeof value === "number" && Number.isInteger(value) && value >= 1000) {
    return value;
  }

  return Math.round(parsed * 100);
}

function collectCachedStepVariants(
  steps: any[],
): Array<{ variantId: string; quantity: number; priceCents: number | null; title?: string; imageUrl?: string }> {
  const variants: Array<{ variantId: string; quantity: number; priceCents: number | null; title?: string; imageUrl?: string }> = [];

  const appendProductVariants = (product: any, quantity: number) => {
    const cachedVariants = Array.isArray(product?.variants) ? product.variants : [];
    const imageUrl = typeof product?.imageUrl === "string" ? product.imageUrl : undefined;
    for (const variant of cachedVariants) {
      const variantId = getCachedVariantId(variant);
      if (!variantId) continue;

      variants.push({
        variantId,
        quantity,
        priceCents: parseCachedVariantPriceCents(variant),
        title: typeof product?.title === "string" ? product.title : undefined,
        imageUrl,
      });
    }
  };

  for (const step of Array.isArray(steps) ? steps : []) {
    const quantity = step.minQuantity;

    for (const stepProduct of Array.isArray(step.StepProduct) ? step.StepProduct : []) {
      appendProductVariants(stepProduct, quantity);
    }

    for (const product of Array.isArray(step.products) ? step.products : []) {
      appendProductVariants(product, quantity);
    }

    for (const category of Array.isArray(step.StepCategory) ? step.StepCategory : []) {
      for (const product of Array.isArray(category.products) ? category.products : []) {
        appendProductVariants(product, quantity);
      }
    }
  }

  return variants;
}

const COLLECTION_BATCH_SIZE = 25;
const COLLECTION_PRODUCT_PAGE_SIZE = 250;

function collectCollectionHandles(steps: any[]): string[] {
  const handles = new Set<string>();

  for (const step of Array.isArray(steps) ? steps : []) {
    for (const collection of Array.isArray(step.collections) ? step.collections : []) {
      if (typeof collection?.handle === "string" && collection.handle.trim()) {
        handles.add(collection.handle.trim());
      }
    }

    for (const category of Array.isArray(step.StepCategory) ? step.StepCategory : []) {
      for (const collection of Array.isArray(category.collections) ? category.collections : []) {
        if (typeof collection?.handle === "string" && collection.handle.trim()) {
          handles.add(collection.handle.trim());
        }
      }
    }
  }

  return [...handles];
}

async function resolveCollectionProductIds(
  admin: ShopifyAdmin,
  steps: any[],
): Promise<Map<string, string[]>> {
  const handles = collectCollectionHandles(steps);
  const productsByHandle = new Map<string, string[]>();

  for (let offset = 0; offset < handles.length; offset += COLLECTION_BATCH_SIZE) {
    const batch = handles.slice(offset, offset + COLLECTION_BATCH_SIZE);
    const variableDefinitions = batch.map((_, index) => `$handle${index}: String!`).join(", ");
    const selections = batch.map((_, index) => `
      collection${index}: collectionByIdentifier(identifier: { handle: $handle${index} }) {
        products(first: ${COLLECTION_PRODUCT_PAGE_SIZE}) {
          nodes { id }
          pageInfo { hasNextPage endCursor }
        }
      }
    `).join("\n");

    try {
      const response = await admin.graphql(`
        query BatchCollectionProductIds(${variableDefinitions}) {
          ${selections}
        }
      `, {
        variables: Object.fromEntries(batch.map((handle, index) => [`handle${index}`, handle])),
      });
      const data = (await response.json()).data ?? {};

      for (const [index, handle] of batch.entries()) {
        const connection = data[`collection${index}`]?.products;
        const productIds = (connection?.nodes ?? [])
          .map((node: any) => node?.id)
          .filter((id: unknown): id is string => typeof id === "string" && !isUUID(id));
        let pageInfo = connection?.pageInfo;

        while (pageInfo?.hasNextPage && pageInfo.endCursor) {
          try {
            const pageResponse = await admin.graphql(`
              query CollectionProductIdsPage($handle: String!, $after: String!) {
                collectionByIdentifier(identifier: { handle: $handle }) {
                  products(first: ${COLLECTION_PRODUCT_PAGE_SIZE}, after: $after) {
                    nodes { id }
                    pageInfo { hasNextPage endCursor }
                  }
                }
              }
            `, { variables: { handle, after: pageInfo.endCursor } });
            const pageConnection = (await pageResponse.json()).data?.collectionByIdentifier?.products;
            for (const node of pageConnection?.nodes ?? []) {
              if (typeof node?.id === "string" && !isUUID(node.id)) productIds.push(node.id);
            }
            pageInfo = pageConnection?.pageInfo;
          } catch {
            AppLogger.warn("Could not fetch the next collection product page", {
              component: "metafield-sync",
              operation: "updateBundleProductMetafields",
              handle,
            });
            break;
          }
        }

        productsByHandle.set(handle, productIds);
      }
    } catch {
      for (const handle of batch) {
        productsByHandle.set(handle, []);
        AppLogger.warn("Could not fetch products from collection", {
          component: "metafield-sync",
          operation: "updateBundleProductMetafields",
          handle,
        });
      }
    }
  }

  return productsByHandle;
}

/**
 * Updates bundle variant metafields with Shopify Standard structure (Approach 1: Hybrid)
 *
 * Creates 5 metafields on the bundle product's first variant:
 * - component_reference (list.variant_reference) - Shopify standard
 * - component_quantities (list.number_integer) - Shopify standard
 * - price_adjustment (json) - Shopify standard with our extension
 * - bundle_ui_config (json) - Custom for widget configuration
 * - component_pricing (json) - Per-component pricing for expanded checkout display (cents)
 */
export async function updateBundleProductMetafields(
  admin: ShopifyAdmin,
  bundleProductId: string,
  bundleConfiguration: any
): Promise<any[] | undefined> {
  AppLogger.debug("[METAFIELD] Starting bundle variant metafield update", {
    component: "bundle-product.server",
    bundleProductId,
    configSize: JSON.stringify(bundleConfiguration).length,
  });

  // Get the first variant ID for the bundle product
  const variantResult = await getFirstVariantId(admin, bundleProductId);
  if (!variantResult.success || !variantResult.variantId) {
    throw new Error(`Cannot update bundle metafields: ${variantResult.error || 'variant not found'}`);
  }

  const bundleVariantId = variantResult.variantId;
  await ensureBundleParentVariantRequiresComponents(admin, bundleProductId, bundleVariantId);

  // Extract component references and quantities from bundle configuration
  const componentReferences: string[] = [];
  const componentQuantities: number[] = [];

  // PERFORMANCE OPTIMIZATION: Collect all product IDs first, then batch fetch variants
  const productIdMap: Array<{ productId: string; stepMinQuantity: number; source: string }> = [];
  const resolvedStepProductIds = new Map<string, Set<string>>();
  const resolvedCategoryProductIds = new Map<string, Set<string>>();
  const addResolvedProduct = (stepKey: string, productId: string, categoryKey?: string) => {
    const stepProducts = resolvedStepProductIds.get(stepKey) ?? new Set<string>();
    stepProducts.add(productId);
    resolvedStepProductIds.set(stepKey, stepProducts);
    if (categoryKey) {
      const categoryProducts = resolvedCategoryProductIds.get(categoryKey) ?? new Set<string>();
      categoryProducts.add(productId);
      resolvedCategoryProductIds.set(categoryKey, categoryProducts);
    }
  };

  const collectionProductIds = await resolveCollectionProductIds(
    admin,
    bundleConfiguration.steps,
  );

  if (bundleConfiguration.steps && Array.isArray(bundleConfiguration.steps)) {
    for (const [stepIndex, step] of bundleConfiguration.steps.entries()) {
      const stepKey = String(step.id ?? stepIndex);
      // CRITICAL FIX: Process ONLY ONE source to prevent duplicates
      // Priority: StepProduct (database relation) > products array (UI config)

      if (step.StepProduct && Array.isArray(step.StepProduct) && step.StepProduct.length > 0) {
        // Use StepProduct entries from database
        for (const stepProduct of step.StepProduct) {
          if (stepProduct.productId && !isUUID(stepProduct.productId)) {
            addResolvedProduct(stepKey, stepProduct.productId);
            productIdMap.push({
              productId: stepProduct.productId,
              stepMinQuantity: step.minQuantity,
              source: 'StepProduct'
            });
          } else if (stepProduct.productId) {
            AppLogger.warn("[METAFIELD] Skipping UUID product ID", {
              component: "bundle-product.server",
              productId: stepProduct.productId,
            });
          }
        }
      } else if (step.products && Array.isArray(step.products) && step.products.length > 0) {
        // Fallback: Use products array from UI config (only if StepProduct is empty)
        for (const product of step.products) {
          if (product.id && !isUUID(product.id)) {
            addResolvedProduct(stepKey, product.id);
            productIdMap.push({
              productId: product.id,
              stepMinQuantity: step.minQuantity,
              source: 'products'
            });
          }
        }
      } else {
        AppLogger.warn("[METAFIELD] Step has no StepProduct entries", {
          component: "bundle-product.server",
          stepName: step.name,
        });
      }

      // COLLECTION FIX: Also fetch products from collection handles
      // Collections are stored as JSON array of { id, handle, title } in step.collections
      const stepCollections = Array.isArray(step.collections)
        ? step.collections
        : [];

      if (stepCollections.length > 0) {
        for (const collection of stepCollections) {
          const handle = collection.handle;
          if (!handle) continue;

          const productIds = collectionProductIds.get(handle) ?? [];
          for (const productId of productIds) {
            addResolvedProduct(stepKey, productId);
            // Avoid duplicates already added from StepProduct
            const alreadyAdded = productIdMap.some(item => item.productId === productId);
            if (!alreadyAdded) {
              productIdMap.push({
                productId,
                stepMinQuantity: step.minQuantity,
                source: `collection:${handle}`
              });
            }
          }

          AppLogger.debug("[METAFIELD] Fetched products from collection", {
            component: "bundle-product.server",
            handle,
            count: productIds.length,
          });
        }
      }

      // StepCategory: process per-category products (direct GIDs) and collections
      const stepCats = Array.isArray(step.StepCategory) ? step.StepCategory : [];
      for (const [categoryIndex, cat] of stepCats.entries()) {
        const categoryKey = `${stepKey}:${String(cat.id ?? categoryIndex)}`;
        // Direct product GIDs in this category
        const catProducts = Array.isArray(cat.products) ? cat.products : [];
        for (const p of catProducts) {
          if (p.id && !isUUID(p.id) && !productIdMap.some(item => item.productId === p.id)) {
            addResolvedProduct(stepKey, p.id, categoryKey);
            productIdMap.push({
              productId: p.id,
              stepMinQuantity: step.minQuantity,
              source: `StepCategory:${cat.name}`,
            });
          }
        }

        // Collections in this category — resolve to product IDs
        const catCollections = Array.isArray(cat.collections) ? cat.collections : [];
        for (const collection of catCollections) {
          const handle = collection.handle;
          if (!handle) continue;
          for (const productId of collectionProductIds.get(handle) ?? []) {
            if (!productIdMap.some(item => item.productId === productId)) {
              addResolvedProduct(stepKey, productId, categoryKey);
              productIdMap.push({
                productId,
                stepMinQuantity: step.minQuantity,
                source: `StepCategory:${cat.name}:collection:${handle}`,
              });
            }
          }
        }
      }
    }
  }

  // Batch fetch all variants WITH PRICES in a single query (for component pricing)
  // Array to collect component data for pricing calculation
  const componentPricingData: Array<{ variantId: string; priceCents: number; quantity: number; title?: string; imageUrl?: string }> = [];
  const appendComponentVariant = (
    variantId: string,
    quantity: number,
    priceCents: number | null,
    title?: string,
    imageUrl?: string,
  ) => {
    if (componentReferences.includes(variantId)) return;

    const componentQuantity = normalizeShopifyComponentQuantity(quantity);
    componentReferences.push(variantId);
    componentQuantities.push(componentQuantity);

    if (priceCents !== null) {
      componentPricingData.push({
        variantId,
        priceCents,
        quantity: componentQuantity,
        title,
        imageUrl,
      });
    }
  };

  for (const addonVariant of collectAddonComponentVariants(bundleConfiguration.personalizationData)) {
    if (addonVariant.variantId) {
      appendComponentVariant(addonVariant.variantId, 0, addonVariant.priceCents, addonVariant.title, addonVariant.imageUrl);
      continue;
    }

    if (addonVariant.productId && !productIdMap.some(item => item.productId === addonVariant.productId)) {
      productIdMap.push({
        productId: addonVariant.productId,
        stepMinQuantity: 0,
        source: "addonProducts",
      });
    }
  }

  if (productIdMap.length > 0) {
    const productIds = productIdMap.map(item => item.productId);
    AppLogger.debug("[METAFIELD] Batch fetching variants with prices", {
      component: "bundle-product.server",
      count: productIds.length,
    });

    const variantResults = await batchGetFirstVariantsWithPrices(admin, productIds);

    // Process results in order
    productIdMap.forEach(item => {
      const cleanId = item.productId.replace('gid://shopify/Product/', '');
      const result = variantResults.get(cleanId);

      if (result?.success && result.variantId) {
        appendComponentVariant(result.variantId, item.stepMinQuantity, result.priceCents || 0, result.title, result.imageUrl);
      } else {
        AppLogger.warn("Could not get variant for bundle product", {
          component: "metafield-sync",
          operation: "updateBundleProductMetafields",
          productId: item.productId,
          error: result?.error || 'unknown error'
        });
      }
    });
  }

  for (const cachedVariant of collectCachedStepVariants(bundleConfiguration.steps)) {
    appendComponentVariant(
      cachedVariant.variantId,
      cachedVariant.quantity,
      cachedVariant.priceCents,
      cachedVariant.title,
      cachedVariant.imageUrl,
    );
  }

  const priceAdjustment = buildPriceAdjustmentConfig(bundleConfiguration.pricing);

  // Calculate per-component pricing for expanded bundle checkout display
  const componentPricing: ComponentPricing[] = calculateComponentPricing(
    componentPricingData,
    priceAdjustment.method,
    priceAdjustment.value
  );
  const publicSubscriptionConfig = buildPublicBundleSubscriptionConfig(
    bundleConfiguration.bundleSubscriptionConfig,
  );

  // Build bundle_ui_config for widget
  const bundleUiConfig: BundleUiConfig = {
    id: bundleConfiguration.id || bundleConfiguration.bundleId, // Widget expects 'id' field
    bundleId: bundleConfiguration.id || bundleConfiguration.bundleId, // Keep for backwards compatibility
    name: bundleConfiguration.name,
    description: bundleConfiguration.description || '',
    status: bundleConfiguration.status || BundleStatus.ACTIVE, // Widget needs this for filtering
    bundleType: bundleConfiguration.bundleType || BundleType.PRODUCT_PAGE, // Widget needs this for selection
    publicNumber: bundleConfiguration.publicNumber ?? null,
    shopifyProductId: bundleConfiguration.shopifyProductId || null, // Product ID for matching
    bundleDesignTemplate: bundleConfiguration.bundleDesignTemplate ?? null,
    bundleDesignPresetId: bundleConfiguration.bundleDesignPresetId ?? null,
    defaultProductsData: bundleConfiguration.defaultProductsData ?? {},
    boxSelection: bundleConfiguration.boxSelection ?? null,
    bundleUpsellConfig: bundleConfiguration.bundleUpsellConfig ?? null,
    bundleTextConfig: bundleConfiguration.bundleTextConfig ?? null,
    bundleLevelCss: typeof bundleConfiguration.bundleLevelCss === 'string' && bundleConfiguration.bundleLevelCss.trim()
      ? bundleConfiguration.bundleLevelCss
      : null,
    personalizationData: bundleConfiguration.personalizationData ?? null,
    ...(publicSubscriptionConfig !== null
      ? { subscription: publicSubscriptionConfig }
      : {}),
    checkoutOffers: buildCheckoutOfferRuntime(bundleConfiguration).offers,
    discountDisplayOverride: bundleConfiguration.discountDisplayOverride ?? null,
    validateQuantityPerProduct: bundleConfiguration.validateQuantityPerProduct ?? {
      isEnabled: false,
      allowedQuantity: 0,
    },
    productSlotsEnabled: bundleConfiguration.bundleType === "full_page" ? bundleConfiguration.productSlotsEnabled ?? false : false,
  productSlotIconUrl: bundleConfiguration.bundleType === "full_page" ? bundleConfiguration.productSlotIconUrl ?? null : null,
  useSingleStepCategoriesAsBundleSteps: bundleConfiguration.useSingleStepCategoriesAsBundleSteps ?? false,
  showProductComparedAtPrice: resolveShowProductComparedAtPrice(),
    bundleVariantId: bundleVariantId, // Bundle parent variant ID for cart transform EXPAND operation
    steps: (bundleConfiguration.steps || []).map((step: any, stepIndex: number) => {
      const stepKey = String(step.id ?? stepIndex);
      const products = new Map(collectStepProductReferences(step).map((product) => [product.id, product]));
      for (const id of resolvedStepProductIds.get(stepKey) ?? []) products.set(id, { id });
      const categories = formatStepCategoriesForRuntime(step, Array.isArray(step.StepProduct) ? step.StepProduct : [])
        .map((category: any, categoryIndex: number) => {
          const categoryKey = `${stepKey}:${String(category.id ?? categoryIndex)}`;
          const categoryProducts = new Map(
            (Array.isArray(category.products) ? category.products : []).map((product: any) => [product.id ?? product.selectionId, product]),
          );
          for (const id of resolvedCategoryProductIds.get(categoryKey) ?? []) {
            if (!categoryProducts.has(id)) categoryProducts.set(id, { id });
          }
          return { ...category, products: [...categoryProducts.values()] };
        });
      return ({
      id: step.id,
      name: step.name,
      pageTitle: step.pageTitle ?? null,
      multiLangData: step.multiLangData ?? {},
      position: step.position || 0,
      minQuantity: step.minQuantity,
      maxQuantity: step.maxQuantity,
      products: [...products.values()],
      collections: Array.isArray(step.collections) ? step.collections : [],
      categories,
      conditionType: step.conditionType,
      conditionOperator: step.conditionOperator,
      conditionValue: step.conditionValue,
      conditionOperator2: step.conditionOperator2,
      conditionValue2: step.conditionValue2,
      autoNextStepOnConditionMet: step.autoNextStepOnConditionMet === true,
      // Free gift / add-on step fields — required by widget for tab rendering and cart transform
      isFreeGift: step.isFreeGift || false,
      freeGiftName: step.freeGiftName || null,
      addonLabel: step.addonLabel ?? null,
      addonTitle: step.addonTitle ?? null,
      addonAddText: step.addonAddText ?? null,
      addonReplaceText: step.addonReplaceText ?? null,
      addonIconUrl: step.addonIconUrl ?? null,
      addonDisplayFree: step.addonDisplayFree === true,
      addonTiers: Array.isArray(step.addonTiers) ? step.addonTiers : [],
      addonUnlockAfterCompletion: step.addonUnlockAfterCompletion !== false,
      isDefault: step.isDefault || false,
      defaultVariantId: step.defaultVariantId || null,
      imageUrl: step.imageUrl ?? null,
      bannerImageUrl: step.bannerImageUrl ?? null,
      stepImage: step.stepImage ?? step.timelineIconUrl ?? null,
      primaryVariantOption: step.primaryVariantOption ?? null,
      filters: Array.isArray(step.filters) ? step.filters : null,
    }); }),
    pricing: bundleConfiguration.pricing ? {
      enabled: bundleConfiguration.pricing.enabled || false,
      method: bundleConfiguration.pricing.method || 'percentage_off',
      rules: (bundleConfiguration.pricing.rules || []).map((rule: any) => {
        const flat: Record<string, unknown> = {
          id: rule.id,
          conditionType: rule.conditionType || rule.condition?.type || 'quantity',
          conditionValue: parseFloat(rule.conditionValue ?? rule.condition?.value ?? 0) || 0,
          discountValue: parseFloat(rule.discountValue ?? rule.discount?.value ?? 0) || 0,
        };
        if (rule.customerBuys !== undefined) flat.customerBuys = Number(rule.customerBuys);
        if (rule.customerGets !== undefined) flat.customerGets = Number(rule.customerGets);
        if (rule.bxyDiscountType !== undefined) flat.bxyDiscountType = rule.bxyDiscountType;
        if (rule.bxyApplyMode !== undefined) flat.bxyApplyMode = rule.bxyApplyMode;
        if (rule.tierBadge !== undefined) flat.tierBadge = rule.tierBadge;
        return flat;
      }),
      messages: {
        ...((bundleConfiguration.pricing.messages as Record<string, unknown> | null) ?? {}),
        ...(bundleConfiguration.pricing.ruleMessagesByLocale
          ? { ruleMessagesByLocale: bundleConfiguration.pricing.ruleMessagesByLocale }
          : {}),
      },
      displayOptions: bundleConfiguration.pricing.displayOptions ?? null,
    } : null,
    messaging: {
      progressTemplate: bundleConfiguration.pricing?.messages?.progress || bundleConfiguration.messaging?.progressTemplate || 'Add {conditionText} to get {discountText}',
      successTemplate: bundleConfiguration.pricing?.messages?.qualified || bundleConfiguration.messaging?.successTemplate || 'Congratulations! You got {discountText}',
      showDiscountMessaging: bundleConfiguration.pricing?.messages?.showDiscountMessaging || false,
      showFooter: bundleConfiguration.pricing?.display?.showFooter !== false && bundleConfiguration.messaging?.showFooter !== false,
      showDiscountProgressBar: bundleConfiguration.pricing?.display?.showDiscountProgressBar === true || bundleConfiguration.pricing?.showProgressBar === true,
      displayOptions: bundleConfiguration.pricing?.displayOptions ?? null
    },
    promoBannerBgImage: bundleConfiguration.promoBannerBgImage ?? null,
    bundleBannerDesktopUrl: bundleConfiguration.bundleBannerDesktopUrl ?? null,
    bundleBannerMobileUrl: bundleConfiguration.bundleBannerMobileUrl ?? null,
    loadingGif: bundleConfiguration.loadingGif ?? null,
    floatingBadgeEnabled: bundleConfiguration.floatingBadgeEnabled ?? false,
    floatingBadgeText: bundleConfiguration.floatingBadgeText ?? '',
    textOverrides: bundleConfiguration.textOverrides ?? null,
    textOverridesByLocale: bundleConfiguration.textOverridesByLocale ?? null,
    sdkMode: bundleConfiguration.sdkMode ?? false,
    offerDelivery: bundleConfiguration.offerDelivery ?? {
      specificLinkRequired: false,
      ruleVersion: null,
    },
  };

  let ppbPolicyRevisionMetafield: Record<string, unknown> | null = null;
  if (bundleUiConfig.bundleType === BundleType.PRODUCT_PAGE) {
    const shopDomain = String(bundleConfiguration.shopId ?? bundleConfiguration.shopDomain ?? "").trim();
    if (!shopDomain) throw new Error("PPB Shopify-hosted sync requires shopId");
    const staticAuthorization = buildPpbStaticAuthorization({
      bundle: bundleUiConfig,
      shop: shopDomain,
      parentVariantId: bundleVariantId,
      secret: generateCartTransformRuntimeTokenSecret(shopDomain),
    });
    bundleUiConfig.schemaVersion = 3;
    bundleUiConfig.runtimeAuthorization = staticAuthorization.authorization;
    ppbPolicyRevisionMetafield = await buildPpbPolicyRevisionMetafield({
      admin,
      bundleId: bundleUiConfig.id,
      revision: staticAuthorization.policy.revision,
      active: staticAuthorization.policy.active,
    });
    assertPpbStorefrontSnapshotSize("bundle_ui_config", bundleUiConfig);
  }

  // Check metafield sizes and log warnings
  const uiConfigSizeCheck = checkMetafieldSize(bundleUiConfig, 'bundle_ui_config', 'updateBundleProductMetafields');
  const priceAdjustmentSizeCheck = checkMetafieldSize(priceAdjustment, 'price_adjustment', 'updateBundleProductMetafields');
  const componentPricingSizeCheck = checkMetafieldSize(componentPricing, 'component_pricing', 'updateBundleProductMetafields');

  // Abort if any metafield exceeds size limit
  if (bundleUiConfig.bundleType !== BundleType.PRODUCT_PAGE && !uiConfigSizeCheck.withinLimit) {
    throw new Error(`bundle_ui_config metafield exceeds Shopify's 64KB limit (size: ${uiConfigSizeCheck.size} bytes). Bundle has too many products or complex configuration.`);
  }

  if (!priceAdjustmentSizeCheck.withinLimit) {
    throw new Error(`price_adjustment metafield exceeds Shopify's 64KB limit (size: ${priceAdjustmentSizeCheck.size} bytes).`);
  }

  if (!componentPricingSizeCheck.withinLimit) {
    throw new Error(`component_pricing metafield exceeds Shopify's 64KB limit (size: ${componentPricingSizeCheck.size} bytes). Bundle has too many components.`);
  }

  // Set all 5 metafields on the bundle variant
  const SET_METAFIELDS = `
    mutation SetBundleVariantMetafields($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const metafields = [
    {
      ownerId: bundleVariantId,
      namespace: "$app",
      key: 'component_reference',
      type: "list.variant_reference",
      value: JSON.stringify(componentReferences)
    },
    {
      ownerId: bundleVariantId,
      namespace: "$app",
      key: 'component_quantities',
      type: "list.number_integer",
      value: JSON.stringify(componentQuantities)
    },
    {
      ownerId: bundleVariantId,
      namespace: "$app",
      key: 'price_adjustment',
      type: "json",
      value: JSON.stringify(priceAdjustment)
    },
    {
      ownerId: bundleVariantId,
      namespace: "$app",
      key: 'bundle_ui_config',
      type: "json",
      value: JSON.stringify(bundleUiConfig)
    },
    ...(ppbPolicyRevisionMetafield ? [ppbPolicyRevisionMetafield] : []),
    {
      ownerId: bundleVariantId,
      namespace: "$app",
      key: 'component_pricing',
      type: "json",
      value: JSON.stringify(componentPricing)
    }
  ];

  const response = await admin.graphql(SET_METAFIELDS, {
    variables: { metafields }
  });

  const data = await response.json();

  if (data.data?.metafieldsSet?.userErrors?.length > 0) {
    const error = data.data.metafieldsSet.userErrors[0];
    throw new Error(`Failed to update bundle metafields: ${error.message}`);
  }

  AppLogger.info("[METAFIELD] Bundle variant metafields updated", {
    component: "bundle-product.server",
    bundleProductId,
    componentCount: componentReferences.length,
    stepCount: bundleUiConfig.steps.length,
    pricingMethod: priceAdjustment.method,
  });

  return data.data?.metafieldsSet?.metafields;
}
