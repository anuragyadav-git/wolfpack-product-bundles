import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { calculateBundleTotalForPurchaseOption } from '../../shared/subscription-storefront-methods.js';

export const ProductPageSelectionDataMethods: Record<string, any> & ThisType<any> = {
isInventoryTrackingOnAddToCartEnabled() {
  const controls = typeof this._getProductPageControls === 'function'
    ? this._getProductPageControls()
    : null;
  return controls?.trackInventoryOnAddToCart === true;
},

/**
 * Look up real stock for a variant. See full-page widget's getVariantAvailable
 * for field semantics.
 */
getVariantAvailable(stepIndex: string|number, variantId: any) {
  const products = this.stepProductData[stepIndex] || [];
  const product = this.findProductBySelectionKey(products, variantId);
  if (!product) {
    return { available: null, outOfStock: false, acceptsBackorder: false };
  }
  if (product.available === false) {
    return { available: 0, outOfStock: true, acceptsBackorder: false };
  }
  const qty = typeof product.quantityAvailable === 'number' ? product.quantityAvailable : null;
  const backorder = product.currentlyNotInStock === true;
  const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
    ? this.isInventoryTrackingOnAddToCartEnabled()
    : ProductPageSelectionDataMethods.isInventoryTrackingOnAddToCartEnabled.call(this);
  if (!trackInventoryOnAddToCart) {
    return { available: null, outOfStock: false, acceptsBackorder: backorder };
  }
  if (trackInventoryOnAddToCart && qty === 0 && !backorder) {
    return { available: 0, outOfStock: true, acceptsBackorder: false };
  }
  return { available: qty === 0 ? null : qty, outOfStock: false, acceptsBackorder: backorder };
},

findProductBySelectionKey(products: any[], selectionKey: any) {
  const normalized = this.normalizeSelectionKey(selectionKey);
  if (!normalized) return null;

  return products.find((product: any) => (
    String(product?.selectionId || '') === normalized
    || (Array.isArray(product?.variants) && product.variants.some((variant: any)  => (
      this.normalizeSelectionKey(variant?.selectionId || '') === normalized
    )))
  )) || null;
},

extractId(idString: any) {
  if (!idString) return null;

  // Handle GID format
  const gidMatch = idString.toString().match(/gid:\/\/shopify\/\w+\/(\d+)/);
  if (gidMatch) {
    return gidMatch[1];
  }

  // Handle numeric string
  return idString.toString().split('/').pop();
},

normalizeSelectionKey(variantId: any) {
  const normalized = this.extractId(variantId);
  if (normalized == null) return '';
  return String(normalized);
},

getSelectedQuantity(stepIndex: string|number, variantId: any) {
  const selectedProducts = this.selectedProducts[stepIndex] || {};
  const normalized = this.normalizeSelectionKey(variantId);
  if (!normalized) return 0;

  if (Object.prototype.hasOwnProperty.call(selectedProducts, normalized)) {
    return Number(selectedProducts[normalized]) || 0;
  }

  return 0;
},

setSelectedQuantity(stepIndex: string|number, variantId: any, quantity: number) {
  const selectedProducts = this.selectedProducts[stepIndex];
  if (!selectedProducts) return;

  const normalized = this.normalizeSelectionKey(variantId);
  if (!normalized) return;

  this.selectedProductCategoryIndexes ||= [];
  this.selectedProductCategoryIndexes[stepIndex] ||= {};

  if (quantity > 0) {
    selectedProducts[normalized] = quantity;
    this.selectedProductCategoryIndexes[stepIndex][normalized] =
      this.activeInpageCategoryIndexes?.[stepIndex] ?? 0;
  } else {
    delete selectedProducts[normalized];
    if (this.selectedProductCategoryIndexes?.[stepIndex]) {
      delete this.selectedProductCategoryIndexes[stepIndex][normalized];
    }
  }

  this._persistSessionSelections?.();
},

getAddonLineDiscount(step: any) {
  const tier = this.getAddonTierEvaluation(step).tier;
  const discount = step?.addonDiscount || tier?.discount || {};
  const type = String(discount.type || '').toUpperCase();
  const value = Number(discount.value || 0);
  if (type !== 'PERCENTAGE' || !Number.isFinite(value) || value <= 0) return null;
  return {
    type,
    value: Math.min(100, value),
    tierId: tier?.tierId || null,
  };
},

getAddonTiers(step: any) {
  return Array.isArray(step?.addonTiers) ? step.addonTiers.filter(Boolean) : [];
},

getAddonTierEvaluation(step: any) {
  const { totalPrice, totalQuantity } = calculateBundleTotalForPurchaseOption(this,
    this.selectedProducts,
    this.stepProductData,
    this.selectedBundle?.steps
  );
  const directTier = step?.addonEligibilityCondition || step?.addonDiscount
    ? [{
        eligibilityCondition: step?.addonEligibilityCondition || {},
        discount: step?.addonDiscount || {},
        tierId: null,
      }]
    : [];
  const tiers = this.getAddonTiers(step);
  const candidates = tiers.length > 0 ? tiers : directTier;
  if (candidates.length === 0) {
    return { tier: null, totalPrice, totalQuantity, currentValue: totalQuantity, tierIndex: -1, isEligible: false };
  }

  const withState = candidates.map((candidate: any, index: any) => {
    const condition = candidate?.eligibilityCondition || {};
    const conditionType = String(condition.type || 'QUANTITY').toUpperCase();
    const conditionValue = Number(condition.value || 0);
    const threshold = conditionType === 'AMOUNT' ? Math.round(conditionValue * 100) : conditionValue;
    const currentValue = conditionType === 'AMOUNT' ? totalPrice : totalQuantity;
    return {
      tier: candidate,
      tierIndex: index,
      conditionType,
      threshold,
      currentValue,
      isEligible: currentValue >= threshold,
    };
  });

  const eligible = withState.filter((candidate: any)  => candidate.isEligible)
    .sort((a: any, b: any) => (a.threshold - b.threshold) || (a.tierIndex - b.tierIndex));
  const next = withState
    .filter((candidate: any)  => !candidate.isEligible)
    .sort((a: any, b: any) => (a.threshold - b.threshold) || (a.tierIndex - b.tierIndex));
  const selected = eligible[eligible.length - 1] || next[0] || withState[0];

  return {
    tier: selected?.tier || null,
    tierIndex: selected?.tierIndex ?? -1,
    isEligible: selected?.isEligible === true,
    totalPrice,
    totalQuantity,
    currentValue: selected?.currentValue ?? totalQuantity,
  };
},

getAddonProductSelectionKeys(step: any) {
  const keys = new Set();
  const addKey = (value: any) => {
    const selectionId = String(value?.selectionId || '');
    if (!selectionId) return;
    keys.add(selectionId);
  };
  const products: any[] = [
    ...(Array.isArray(step?.StepProduct) ? step.StepProduct : []),
    ...(Array.isArray(step?.products) ? step.products : []),
    ...(Array.isArray(step?.productsData1?.products) ? step.productsData1.products : []),
  ];

  products.forEach(product => {
    addKey(product);
    (Array.isArray(product.variants) ? product.variants : []).forEach(addKey);
  });

  return keys;
},

calculateSelectedAddonDiscountAmount() {
  const steps = this.selectedBundle?.steps || [];
  const chargeableAddonStep = steps.find((candidate: any)  => candidate?.isFreeGift === true && candidate?.addonDisplayFree !== true && this.getAddonLineDiscount(candidate));
  const chargeableAddonStepIndex = steps.indexOf(chargeableAddonStep);
  const chargeableAddonProductKeys = this.getAddonProductSelectionKeys(chargeableAddonStep);

  return this.getAllSelectedProductsData().reduce((total: number, item: any) => {
    const isChargeableAddonItem = Number(item.stepIndex) === chargeableAddonStepIndex || (item.isFreeGift === true && item.addonDisplayFree !== true);
    const isChargeableAddonProduct = chargeableAddonProductKeys.has(String(item.selectionId || ''));
    if (!isChargeableAddonItem && !isChargeableAddonProduct) return total;
    const step = steps[item.stepIndex];
    const addonDiscount = this.getAddonLineDiscount(step) || this.getAddonLineDiscount(chargeableAddonStep);
    if (!addonDiscount) return total;

    const selectedQuantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    if (!selectedQuantity || selectedQuantity <= 0 || !Number.isFinite(price) || price <= 0) return total;
    return total + (price * selectedQuantity * addonDiscount.value / 100);
  }, 0);
},

getDiscountInfoWithSelectedAddonDiscount(discountInfo: any, totalPrice: number) {
  const baseDiscountAmount = Math.max(0, Number(discountInfo?.discountAmount || 0));
  const addonDiscountAmount = this.calculateSelectedAddonDiscountAmount();
  const combinedDiscountAmount = Math.min(totalPrice, baseDiscountAmount + addonDiscountAmount);
  const finalPrice = Math.max(0, totalPrice - combinedDiscountAmount);

  return {
    ...discountInfo,
    hasDiscount: combinedDiscountAmount > 0,
    qualifiesForDiscount: combinedDiscountAmount > 0,
    discountAmount: combinedDiscountAmount,
    savings: combinedDiscountAmount,
    addonDiscountAmount,
    finalPrice,
    discountPercentage: totalPrice > 0 ? (combinedDiscountAmount / totalPrice) * 100 : 0,
  };
},

  getAllSelectedProductsData() {
    const allProducts: { stepIndex: any; variantId: string; selectionId: string; quantity: unknown; title: any; parentTitle: any; variantTitle: any; imageUrl: any; image: any; price: any; productId: any; isDefault: any; isFreeGift: any; addonDisplayFree: boolean; }[] = [];

  this.selectedBundle.steps.forEach((step: any, stepIndex: string|number) => {
    const stepSelections = this.selectedProducts[stepIndex] || {};
    const productsInStep = this.stepProductData[stepIndex] || [];

    Object.entries(stepSelections).forEach(([variantId, quantity]: any) => {
      if (quantity > 0) {
        const normalizedVariantId = this.normalizeSelectionKey(variantId);
        const product = this.findProductBySelectionKey(productsInStep, normalizedVariantId);
        if (!product) {
          return;
        }

        const matchedVariant = Array.isArray(product.variants)
          ? product.variants.find((candidateVariant: any) => (
              this.normalizeSelectionKey(candidateVariant?.selectionId || '')
              === normalizedVariantId
            ))
          : null;

        if (product) {
          const variantData = matchedVariant || product;
          const isVariantMatch = !!matchedVariant;
          const variantTitle = isVariantMatch && matchedVariant.title && matchedVariant.title !== 'Default Title'
            ? matchedVariant.title
            : (product.variantTitle && product.variantTitle !== 'Default Title' ? product.variantTitle : '');
          const imageUrl = isVariantMatch
            ? (matchedVariant.image?.src || matchedVariant.image || product.imageUrl || product.image?.src || '')
            : (product.imageUrl || product.image?.src || '');
          const price = isVariantMatch
            ? (typeof variantData.price === 'number' ? variantData.price : (parseFloat(variantData.price || '0') * 100))
            : (product.price || 0);

          allProducts.push({
            stepIndex,
            variantId,
            selectionId: String(variantId || ''),
            quantity,
            title: isVariantMatch
              ? (variantTitle ? `${product.title} - ${variantTitle}` : product.title)
              : (product.title || 'Untitled Product'),
            parentTitle: product.parentTitle || product.title || 'Untitled Product',
            variantTitle,
            imageUrl,
            image: imageUrl,
            price,
            productId: product.productId || product.id,
            isDefault: step.isDefault ?? false,
            isFreeGift: step.isFreeGift ?? false,
            addonDisplayFree: step.addonDisplayFree === true,
          });
        }
      }
    });
  });

  return allProducts;
},

// Expand products with multiple variants into separate product entries
// Each variant becomes its own card showing "Product Title - Variant Name"
// This matches the full-page widget behavior for consistent UX
expandProductsByVariant(products: any[]) {
  return products.flatMap((product: any)  => {
    // If product already has a parentProductId, it was already expanded
    if (product.parentProductId && product.variantId) {
      return [product];
    }

    // If product has multiple variants, expand into separate cards
    if (product.variants && product.variants.length > 1) {
      return product.variants
        .filter((variant: any)  => variant.available !== false) // Only show available variants
        .map((variant: any)  => {
          // Use variant image if available, fallback to product image
          const imageUrl = variant.image?.src || variant.image || product.imageUrl || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;

          return {
            ...product,
            id: variant.id,
            title: variant.title === 'Default Title' ? product.title : `${product.title} - ${variant.title}`,
            variantTitle: variant.title === 'Default Title' ? '' : variant.title,
            imageUrl,
            price: typeof variant.price === 'number' ? variant.price : (parseFloat(variant.price || '0') * 100),
            compareAtPrice: variant.compareAtPrice ? (typeof variant.compareAtPrice === 'number' ? variant.compareAtPrice : parseFloat(variant.compareAtPrice) * 100) : null,
            variantId: variant.selectionId,
            selectionId: variant.selectionId,
            available: variant.available !== false,
            parentProductId: product.id,
            parentTitle: product.title,
            // Remove variants array from individual cards to prevent showing variant selector
            variants: null
          };
        });
    }

    // Single variant or no variants - return as-is
    return [product];
  });
}
};
