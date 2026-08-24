import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { STOREFRONT_PROXY_ROOT } from '../../../../config/storefront-proxy-routes.js';

function normalizeWeightToGrams(weight: any, unit: any) {
  const numeric = Number(weight);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;

  switch (String(unit || '').toUpperCase()) {
    case 'KILOGRAMS':
    case 'KILOGRAM':
    case 'KG':
      return numeric * 1000;
    case 'POUNDS':
    case 'POUND':
    case 'LB':
    case 'LBS':
      return numeric * 453.59237;
    case 'OUNCES':
    case 'OUNCE':
    case 'OZ':
      return numeric * 28.349523125;
    default:
      return numeric;
  }
}

export const ProductPageProductDataMethods: Record<string, any> & ThisType<any> = {
  normalizeProductSelectionId(product: any = {}) {
    const candidate = this.extractId(product?.selectionId);
    return candidate || '';
  },

resolveStorefrontApiBase() {
  return STOREFRONT_PROXY_ROOT;
},

collectStepProductIds(step: any) {
  const productIds: any[] = [];
  const addProductId = (product: any) => {
    const id = this.normalizeProductSelectionId(product);
    if (id && !productIds.includes(id)) productIds.push(id);
  };

  (step.products || []).forEach(addProductId);
  (step.categories || []).forEach((category: any)  => {
    (category.products || []).forEach(addProductId);
  });

  return productIds;
},

collectStepCollectionHandles(step: any) {
  const handles: any[] = [];
  const addCollectionHandle = (collection: any) => {
    const handle = collection?.handle;
    if (handle && !handles.includes(handle)) handles.push(handle);
  };

  (step.collections || []).forEach(addCollectionHandle);
  (step.categories || []).forEach((category: any)  => {
    (category.collections || []).forEach(addCollectionHandle);
  });

  return handles;
},

async loadStepProducts(stepIndex: string|number) {
  const step = this.selectedBundle.steps[stepIndex];

  const cachedProducts = this.stepProductData[stepIndex] || [];
  const hasHydratedProducts = cachedProducts.some((product: any)  =>
    product?.selectionId
    || product?.imageUrl
    || (Array.isArray(product?.variants) && product.variants.length > 0)
    || typeof product?.price === 'number'
  );

  if (cachedProducts.length > 0 && hasHydratedProducts) {
    return;
  }

  let allProducts: any[] = [];
  let fetchFailed = false;

  const apiBaseUrl = this.resolveStorefrontApiBase();

  const productIds = this.collectStepProductIds(step);
  if (productIds.length > 0) {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/storefront-products?ids=${encodeURIComponent(productIds.join(','))}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.products?.length > 0) allProducts = allProducts.concat(data.products);
      } else {
        fetchFailed = true;
      }
    } catch (_e: any) {
      fetchFailed = true;
    }
  }

  const handles = this.collectStepCollectionHandles(step);
  if (handles.length > 0) {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/storefront-collections?handles=${encodeURIComponent(handles.join(','))}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.products?.length > 0) allProducts = allProducts.concat(data.products);
      } else {
        fetchFailed = true;
      }
    } catch (_e: any) {
      fetchFailed = true;
    }
  }

  // Process and normalize product data
  const processedProducts = this._mergeDirectDefaultProductsIntoStep(
    stepIndex,
    this.processProductsForStep(allProducts, step)
  );

  // Remove duplicates
  const seen = new Set();
  this.stepProductData[stepIndex] = processedProducts.filter((product: any)  => {
    const key = this.normalizeProductSelectionId(product);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Store fetch failure state so renderModalProducts can show a proper error
  if (!this._stepFetchFailed) this._stepFetchFailed = {};
  this._stepFetchFailed[stepIndex] = fetchFailed && this.stepProductData[stepIndex].length === 0;
},

processProductsForStep(products: any[], step: any) {
  // See full-page widget for the same fields. quantityAvailable is number|null
  // (null = untracked / scope ungranted → treat as unlimited in the clamp).
  const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
    ? this.isInventoryTrackingOnAddToCartEnabled()
    : this._getProductPageControls?.()?.trackInventoryOnAddToCart === true;
  const controls = typeof this._getProductPageControls === 'function'
    ? this._getProductPageControls()
    : null;
  const hideOutOfStockProducts = controls?.hideOutOfStockProducts !== false;
  const isTrackedZeroStock = (variant: any) => (
    variant?.quantityAvailable === 0 && variant?.currentlyNotInStock !== true
  );
  const isVariantSelectableForInventory = (variant: any) => (
    variant?.available === true && (
      !trackInventoryOnAddToCart || !isTrackedZeroStock(variant)
    )
  );
  const toCents = (value: any) => Math.round(parseFloat(value || '0') * 100);
  const normalizeVariant = (v: any) => ({
    id: this.extractId(v.id),
    selectionId: this.extractId(v.id),
    title: v.title,
    price: toCents(v.price),
    compareAtPrice: v.compareAtPrice ? toCents(v.compareAtPrice) : null,
    available: isVariantSelectableForInventory(v),
    quantityAvailable: typeof v.quantityAvailable === 'number' ? v.quantityAvailable : null,
    currentlyNotInStock: v.currentlyNotInStock === true,
    weight: normalizeWeightToGrams(v.weight, v.weightUnit),
    weightUnit: 'GRAMS',
    option1: v.option1 || null,
    option2: v.option2 || null,
    option3: v.option3 || null,
    image: v.image || null
  });

  return products.flatMap((product: any)  => {
    const sourceVariants = Array.isArray(product.variants) ? product.variants : [];
    const customerVisibleVariants = hideOutOfStockProducts
      ? sourceVariants.filter((variant: any)  => variant?.available !== false)
      : sourceVariants;

    if (step.displayVariantsAsIndividual && product.variants && product.variants.length > 0) {
      if (customerVisibleVariants.length === 0) {
        return [];
      }
      // Display each variant as a separate product; keep unavailable variants
      // only when the saved Product Page control says not to hide them.
      // Preserve parent product reference for variant selection and tracking
      const processedVariants = customerVisibleVariants.map(normalizeVariant);

      const processedOptions = (product.options || []).map((opt: any)  => {
        if (typeof opt === 'string') return opt;
        return opt.name || opt;
      });

      return customerVisibleVariants
        .map((variant: any)  => {
          // Storefront API: prioritize variant image, fallback to product featured image
          const imageUrl = variant?.image?.src || product.imageUrl || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;

          return {
            id: this.extractId(variant.id),
            selectionId: this.extractId(variant.id),
            title: `${product.title} - ${variant.title}`,
            imageUrl,
            price: toCents(variant.price),
            compareAtPrice: variant.compareAtPrice ? toCents(variant.compareAtPrice) : null,
            variantId: this.extractId(variant.id),
            available: isVariantSelectableForInventory(variant),
            quantityAvailable: typeof variant.quantityAvailable === 'number' ? variant.quantityAvailable : null,
            currentlyNotInStock: variant.currentlyNotInStock === true,
            weight: normalizeWeightToGrams(variant.weight, variant.weightUnit),
            weightUnit: 'GRAMS',
            // Preserve parent product data for variant selection in modal
            parentProductId: this.extractId(product.id),
            parentTitle: product.title,
            variants: processedVariants,
            options: processedOptions,
            images: product.images || (product.imageUrl ? [{ src: product.imageUrl }] : []),
            description: product.description || '',
            descriptionHtml: product.descriptionHtml || ''
          };
        });
    } else {
      if (sourceVariants.length > 0 && customerVisibleVariants.length === 0) {
        return [];
      }
      // Display product with the first sellable variant when variants are not separate cards.
      const defaultVariant = customerVisibleVariants.find(isVariantSelectableForInventory)
        || customerVisibleVariants[0]
        || null;

      // Storefront API: prioritize variant image, fallback to product featured image
      const imageUrl = defaultVariant?.image?.src || product.imageUrl || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;

      // Process variants array for variant selection in modal
      const processedVariants = customerVisibleVariants.map(normalizeVariant);

      // Process options array for variant selector labels
      const processedOptions = (product.options || []).map((opt: any)  => {
        if (typeof opt === 'string') return opt;
        return opt.name || opt;
      });

      return [{
          id: this.extractId(product.id),
          title: product.title,
          imageUrl,
          price: defaultVariant
            ? toCents(defaultVariant.price)
            : toCents(product.price),
          compareAtPrice: defaultVariant?.compareAtPrice ? toCents(defaultVariant.compareAtPrice) : null,
          variantId: this.extractId(defaultVariant?.id || product.id),
          selectionId: this.extractId(defaultVariant?.id || product.id),
          available: defaultVariant ? isVariantSelectableForInventory(defaultVariant) : false,
          quantityAvailable: typeof defaultVariant?.quantityAvailable === 'number' ? defaultVariant.quantityAvailable : null,
          currentlyNotInStock: defaultVariant?.currentlyNotInStock === true,
          weight: normalizeWeightToGrams(defaultVariant?.weight, defaultVariant?.weightUnit),
          weightUnit: 'GRAMS',
          sourceVariantCount: sourceVariants.length,
          // Preserve variants and options for variant selection in modal
          variants: processedVariants,
        options: processedOptions,
        // Preserve product images for the shared product-details carousel.
        images: product.images || (product.imageUrl ? [{ src: product.imageUrl }] : []),
        description: product.description || '',
        descriptionHtml: product.descriptionHtml || ''
      }];
    }
  });
}
};
