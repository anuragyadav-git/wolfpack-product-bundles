import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { sanitizeRichHtmlFragment } from '../../shared/rich-html.js';

function extractFullPageId(idString: any) {
  if (!idString) return null;
  const gidMatch = idString.toString().match(/gid:\/\/shopify\/\w+\/(\d+)/);
  if (gidMatch) return gidMatch[1];
  return idString.toString().split('/').pop();
}

function normalizeDefaultQuantity(value: string) {
  const rawQuantity = Number.parseFloat(value);
  return Number.isFinite(rawQuantity) && rawQuantity > 0
    ? rawQuantity
    : 1;
}

function normalizeAddonPercentageDiscount(discount: any, tier: any = null) {
  const type = String(discount?.type ?? tier?.discountType ?? '').toUpperCase();
  const value = Number(discount?.value ?? tier?.discountValue ?? 0);
  if (type !== 'PERCENTAGE' || !Number.isFinite(value) || value <= 0) return null;
  return { type: 'PERCENTAGE', value: Math.min(100, value) };
}

function collectProductSelectionKeys(product: any) {
  const keys = new Set();
  const addKey = (value: string|null|undefined) => {
    if (value === null || value === undefined || value === '') return;
    const normalized = extractFullPageId(value) || value;
    keys.add(String(normalized));
  };

  addKey(product?.selectionId);
  (Array.isArray(product?.variants) ? product.variants : []).forEach((variant: any)  => {
    addKey(variant?.selectionId);
  });

  return keys;
}

function pruneStepSelectionsToProducts(selectedProducts: any, stepIndex: string|number, products: any[]) {
  const selections = selectedProducts?.[stepIndex];
  if (!selections) return;

  const allowedKeys = new Set();
  products.forEach((product: any)  => {
    collectProductSelectionKeys(product).forEach(key => allowedKeys.add(key));
  });

  Object.keys(selections).forEach(key => {
    if (!allowedKeys.has(String(key))) {
      delete selections[key];
    }
  });
}

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
    case 'GRAMS':
    case 'GRAM':
    case 'G':
    default:
      return numeric;
  }
}

function isTrackedZeroStock(product: any) {
  return product?.quantityAvailable === 0 && product?.currentlyNotInStock !== true;
}

function getVariantSelectedOptionValue(variant: any, index: number) {
  const directValue = variant?.[`option${index}`];
  if (directValue) return directValue;

  const selectedOptions = Array.isArray(variant?.selectedOptions) ? variant.selectedOptions : [];
  const selectedOption = selectedOptions[index - 1];
  if (selectedOption?.value) return selectedOption.value;

  const titleParts = typeof variant?.title === 'string'
    ? variant.title.split(' / ').map((part: string)  => part.trim()).filter(Boolean)
    : [];
  return titleParts[index - 1] || null;
}

function deriveProductOptionNames(product: any) {
  const explicitOptions = (Array.isArray(product?.options) ? product.options : [])
    .map((option: any)  => {
      if (typeof option === 'string') return option;
      return option?.name || option;
    })
    .filter(Boolean);
  if (explicitOptions.length > 0) return explicitOptions;

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const optionNames: any[] = [];
  variants.forEach((variant: any)  => {
    const selectedOptions = Array.isArray(variant?.selectedOptions) ? variant.selectedOptions : [];
    selectedOptions.forEach((option: any, index: number) => {
      if (!optionNames[index] && option?.name) optionNames[index] = option.name;
    });
  });
  if (optionNames.filter(Boolean).length > 0) return optionNames.filter(Boolean);

  const maxTitleParts = variants.reduce((max: number, variant: any) => {
    if (typeof variant?.title !== 'string' || variant.title === 'Default Title') return max;
    return Math.max(max, variant.title.split(' / ').filter(Boolean).length);
  }, 0);

  return Array.from({ length: maxTitleParts }, (_, index) => `Option ${index + 1}`);
}

function normalizeProductDescription(product: any) {
  const directDescription = typeof product?.description === 'string'
    ? product.description.trim()
    : '';
  if (directDescription) return directDescription;

  const htmlDescription = typeof product?.descriptionHtml === 'string'
    ? product.descriptionHtml.trim()
    : '';
  if (!htmlDescription || typeof document === 'undefined') return '';

  const fragment = sanitizeRichHtmlFragment(htmlDescription, 'product-description');
  return (fragment.textContent || '').trim();
}

function normalizeProductDescriptionHtml(product: any) {
  return typeof product?.descriptionHtml === 'string'
    ? product.descriptionHtml.trim()
    : '';
}

function collectCategoryProducts(step: any) {
  if (!Array.isArray(step?.categories)) return [];

  const products: any[] = [];
  step.categories.forEach((category: any)  => {
    if (!category || typeof category !== 'object') return;
    if (Array.isArray(category.products)) products.push(...category.products);
  });
  return products;
}

function normalizeProductLookupId(product: any = {}) {
  return extractFullPageId(product?.selectionId || product?.id || product?.productId);
}

function normalizeStorefrontApiVariant(variant: any = {}) {
  const selectionId = extractFullPageId(variant?.id);
  if (!selectionId) return null;
  return { ...variant, selectionId };
}

function normalizeStorefrontApiProduct(product: any = {}) {
  const selectionId = extractFullPageId(product?.id);
  if (!selectionId) return null;
  return {
    ...product,
    selectionId,
    variants: (Array.isArray(product?.variants) ? product.variants : [])
      .map(normalizeStorefrontApiVariant)
      .filter(Boolean),
  };
}

function storefrontApiProductLookupKey(product: any = {}) {
  return extractFullPageId(product?.id);
}

function mergeProductVariants(currentVariants: any[] = [], incomingVariants: any[] = []) {
  const mergedById = new Map();
  [...currentVariants, ...incomingVariants].forEach(variant => {
    const key = variantLookupKey(variant);
    if (!key) return;
    mergedById.set(key, {
      ...(mergedById.get(key) || {}),
      ...variant,
    });
  });
  return Array.from(mergedById.values());
}

export function mergeFullPageProductsBySelectionId(products: any[] = []) {
  const merged: any[] = [];
  const indexBySelectionId = new Map();

  products.forEach(product => {
    const key = String(product?.selectionId || '');
    if (!key || !indexBySelectionId.has(key)) {
      if (key) indexBySelectionId.set(key, merged.length);
      merged.push(product);
      return;
    }

    const index = indexBySelectionId.get(key);
    const current = merged[index];
    const currentImages = Array.isArray(current?.images) ? current.images : [];
    const incomingImages = Array.isArray(product?.images) ? product.images : [];
    const currentVariants = Array.isArray(current?.variants) ? current.variants : [];
    const incomingVariants = Array.isArray(product?.variants) ? product.variants : [];

    merged[index] = {
      ...product,
      ...current,
      description: current?.description || product?.description || '',
      descriptionHtml: current?.descriptionHtml || product?.descriptionHtml || '',
      images: incomingImages.length > currentImages.length ? incomingImages : currentImages,
      variants: mergeProductVariants(currentVariants, incomingVariants),
    };
  });

  return merged;
}

function productLookupKey(product: any) {
  return normalizeProductLookupId(product);
}

function productGraphqlId(product: any) {
  const rawId = product?.selectionId || product?.id || product?.productId;
  if (!rawId) return null;
  const normalized = String(rawId);
  if (normalized.startsWith('gid://shopify/Product/')) return normalized;
  if (/^\d+$/.test(normalized)) return `gid://shopify/Product/${normalized}`;
  return null;
}

function hasCompleteRuntimeProductData(product: any) {
  if (!product || typeof product !== 'object') return false;
  const price = Number(product.price);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const images = Array.isArray(product.images) ? product.images : [];
  return Number.isFinite(price) && price > 0 && variants.length > 0 && images.length > 1;
}

function parseFinitePrice(value: any) {
  if (value == null) return null;
  if (typeof value === 'object' && typeof value?.amount !== 'undefined') {
    return parseFinitePrice(value.amount);
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCachedRuntimeProduct(product: any) {
  const normalizeCompareAt = (sourceProduct: any) => {
    if (!sourceProduct) return null;
    const raw = sourceProduct.compareAtPrice ?? sourceProduct.compare_at_price;
    if (raw == null) return null;
    const resolved = typeof raw === 'object' && raw !== null && typeof raw.amount !== 'undefined'
      ? raw.amount
      : raw;
    const parsed = Number.parseFloat(resolved);
    return Number.isFinite(parsed) ? parsed / 100 : null;
  };

  return {
    ...product,
    price: (product.price || 0) / 100,
    compareAtPrice: normalizeCompareAt(product),
    variants: product.variants?.map((variant: any)  => ({
      ...variant,
      price: (variant.price || 0) / 100,
      compareAtPrice: normalizeCompareAt(variant),
    }))
  };
}

function normalizeCompareAtPriceToCents(value: any) {
  if (value == null) return null;
  const resolvedValue = typeof value === 'object' && value !== null && typeof value?.amount !== 'undefined'
    ? value.amount
    : value;
  const parsedValue = Number.parseFloat(resolvedValue);
  return Number.isFinite(parsedValue)
    ? Math.round(parsedValue * 100)
    : null;
}

function variantLookupKey(variant: any) {
  return extractFullPageId(variant?.selectionId);
}

function mergeVariantRuntimeAvailability(product: any, categoryProduct: any) {
  if (!Array.isArray(product?.variants) || !Array.isArray(categoryProduct?.variants)) return product;

  const categoryVariantsById = new Map();
  categoryProduct.variants.forEach((variant: any)  => {
    const key = variantLookupKey(variant);
    if (key) categoryVariantsById.set(key, variant);
  });
  if (categoryVariantsById.size === 0) return product;

  let changed = false;
  const variants = product.variants.map((variant: any)  => {
    const source = categoryVariantsById.get(variantLookupKey(variant));
    if (!source) return variant;

    const patch: any = {};
    if (source.available === true || source.available === false) patch.available = source.available;
    if (typeof source.quantityAvailable === 'number') patch.quantityAvailable = source.quantityAvailable;
    if (source.currentlyNotInStock === true || source.currentlyNotInStock === false) {
      patch.currentlyNotInStock = source.currentlyNotInStock;
    }
    if (Object.keys(patch).length === 0) return variant;

    changed = true;
    return { ...variant, ...patch };
  });

  if (!changed) return product;
  return {
    ...product,
    variants,
    available: variants.some((variant: any)  => variant.available !== false),
  };
}

export function normalizeFullPageDirectDefaultProduct(product: any) {
  const variant = Array.isArray(product?.variants) ? product.variants[0] : null;
  const variantId = variant?.variantGraphqlId
    ? extractFullPageId(variant.variantGraphqlId)
    : null;
  if (!variantId) return null;
  const productId = product?.graphqlId
    ? extractFullPageId(product.graphqlId)
    : variantId;

  const imageUrl = product.images?.[0]?.originalSrc
    || product.images?.[0]?.url
    || product.imageUrl
    || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
  const inventoryQuantity = typeof variant?.inventoryQuantity === 'number'
    ? variant.inventoryQuantity
    : null;
  const price = Number.parseFloat(variant?.price || product?.price || '0') * 100;
  const normalizedRequiredQuantity = normalizeDefaultQuantity(product.requiredQuantity);
  const explicitlyUnavailable = variant?.availableForSale === false || variant?.available === false;
  const available = !explicitlyUnavailable;
  const quantityAvailable = inventoryQuantity;

  return {
    id: productId,
    title: product.title || '',
    handle: product.handle || '',
    imageUrl,
    price,
    compareAtPrice: null,
    variantId,
    selectionId: variantId,
    available,
    quantityAvailable,
    currentlyNotInStock: false,
    defaultRequiredQuantity: normalizedRequiredQuantity,
    isDirectDefaultProduct: true,
    variants: [{
      id: variantId,
      selectionId: variantId,
      title: variant?.title || variant?.variantTitle || '',
      price,
      compareAtPrice: null,
      available,
      quantityAvailable,
      currentlyNotInStock: false,
    }],
    images: imageUrl ? [{ src: imageUrl }] : [],
    description: normalizeProductDescription(product),
    descriptionHtml: normalizeProductDescriptionHtml(product),
  };
}

export function reconcileFullPageDirectDefaultProducts(directDefaults: any, hydratedProducts: any) {
  const availableVariantIds = new Set();
  (Array.isArray(hydratedProducts) ? hydratedProducts : []).forEach(product => {
    (Array.isArray(product?.variants) ? product.variants : []).forEach((variant: any)  => {
      if (variant?.available !== true) return;
      const selectionId = extractFullPageId(variant?.selectionId || variant?.id);
      if (selectionId) availableVariantIds.add(String(selectionId));
    });
  });

  return (Array.isArray(directDefaults) ? directDefaults : []).filter(product => {
    const selectionId = extractFullPageId(product?.selectionId || product?.variantId);
    return selectionId && availableVariantIds.has(String(selectionId));
  });
}

export function filterFullPageProductsByInvalidDefaultVariants(products: any, invalidVariantIds: any) {
  if (!(invalidVariantIds instanceof Set) || invalidVariantIds.size === 0) {
    return products;
  }

  return (Array.isArray(products) ? products : []).filter(product => {
    const productKeys = collectProductSelectionKeys(product);
    (Array.isArray(product?.variants) ? product.variants : []).forEach((variant: any)  => {
      [
        variant?.id,
        variant?.variantId,
        variant?.variantGraphqlId,
      ].forEach(value => {
        const selectionId = extractFullPageId(value);
        if (selectionId) productKeys.add(String(selectionId));
      });
    });
    return !Array.from(productKeys).some(key => invalidVariantIds.has(String(key)));
  });
}

export const fullPageProductProcessingMethods: Record<string, any> & ThisType<any> = {
mergeProductsBySelectionId(products: any) {
  return mergeFullPageProductsBySelectionId(products);
},

mergeCategoryProductVariantAvailability(products: any[], step: any) {
  if (!Array.isArray(products) || products.length === 0) return products;

  const categoryProductsByKey = new Map();
  collectCategoryProducts(step).forEach(product => {
    const key = productLookupKey(product);
    if (key && !categoryProductsByKey.has(key)) categoryProductsByKey.set(key, product);
  });
  if (categoryProductsByKey.size === 0) return products;

  return products.map(product => {
    const key = productLookupKey(product);
    const categoryProduct = key ? categoryProductsByKey.get(key) : null;
    return categoryProduct ? mergeVariantRuntimeAvailability(product, categoryProduct) : product;
  });
},

async loadStepProducts(stepIndex: string|number) {
  const step = this.selectedBundle.steps[stepIndex];
  let activeAddonTier: any = null;

  if (step?.isFreeGift && Array.isArray(step.addonTiers)) {
    const evaluation = typeof this.getAddonTierEvaluation === 'function'
      ? this.getAddonTierEvaluation(step)
      : { tier: null, isEligible: false };
    activeAddonTier = evaluation?.isEligible === true ? evaluation.tier : null;
    step.displayVariantsAsIndividual =
      activeAddonTier?.displayVariantsAsIndividualProducts_addons === true;
    const activeDiscount = normalizeAddonPercentageDiscount(
      activeAddonTier?.discount,
      activeAddonTier
    );
    step.addonDisplayFree = Number(activeDiscount?.value || 0) >= 100;
  }

  if (this.stepProductData[stepIndex].length > 0) {
    return;
  }


  let allProducts: any[] = [];

  if (step?.isFreeGift && Array.isArray(step.addonTiers)) {
    const activeProducts = Array.isArray(activeAddonTier?.selectedAddonProducts)
      ? activeAddonTier.selectedAddonProducts
      : [];
    allProducts = activeProducts.map((product: any)  =>
      typeof this.normalizePersonalizationAddonProduct === 'function'
        ? this.normalizePersonalizationAddonProduct(product)
        : product
    );
    step.StepProduct = allProducts;
    step.products = allProducts;
    step.maxQuantity = allProducts.length;
  }

  // Process explicit products.
  // When loaded from metafield cache (data-bundle-config), step.products already contains
  // enriched data (images, variants, prices). Multi-image records are used directly;
  // compact single-image records are hydrated so the product drawer receives the full gallery.
  // When loaded from the API response, step.StepProduct carries the enriched data and
  // step.products only has stubs, so skip the fetch to avoid a duplicate call.
  const hasEnrichedStepProducts = !step?.isFreeGift && Array.isArray(step.StepProduct) && step.StepProduct.length > 0
    && step.StepProduct.some((sp: any)  => sp.title && sp.imageUrl);

  const stepProductsAlreadyEnriched = !step?.isFreeGift && Array.isArray(step.products) && step.products.length > 0
    && step.products.some((p: any)  => (Array.isArray(p.images) && p.images.length > 0) || p.featuredImage);
  const shouldRefreshRuntimeInventory = hasEnrichedStepProducts
    && fullPageProductProcessingMethods.isInventoryTrackingOnAddToCartEnabled.call(this);
  const refreshedProductKeys = new Set();
  const productIds = !step?.isFreeGift ? this.collectStepProductIds(step) : [];
  if (!step?.isFreeGift && Array.isArray(step.StepProduct)) {
    step.StepProduct.forEach((product: any)  => {
      const id = normalizeProductLookupId(product);
      if (id && !productIds.includes(id)) productIds.push(id);
    });
  }

  if (stepProductsAlreadyEnriched) {
    // Metafield cache path: products have full data, use them directly.
    // Prices in metafield are stored as cents (e.g. 82900 = ₹829.00).
    // processProductsForStep multiplies by 100 assuming decimal input, so
    // divide by 100 here to normalise before that multiplication.
    const cachedProducts: any[] = [];
    const incompleteProducts: any[] = [];
    step.products.forEach((product: any)  => {
      if (hasCompleteRuntimeProductData(product)) {
        cachedProducts.push(product);
      } else {
        incompleteProducts.push(product);
      }
    });

    const fetchedProductsByKey = new Map();
    if (incompleteProducts.length > 0) {
      const missingProductIds = incompleteProducts
        .map(productGraphqlId)
        .filter(Boolean);

      if (missingProductIds.length > 0) {
        const apiBaseUrl = this.resolveStorefrontApiBase();
        const country = window.Shopify?.country
          || (window.Shopify?.locale?.includes('-') ? window.Shopify.locale.split('-')[1] : null)
          || null;

        try {
          const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';
          const response = await fetch(`${apiBaseUrl}/api/storefront-products?ids=${encodeURIComponent(missingProductIds.join(','))}${countryParam}`);

          if (response.ok) {
            const data = await response.json();
            if (data.products && data.products.length > 0) {
              if (typeof this.rememberRuntimeProductInventory === 'function') {
                this.rememberRuntimeProductInventory(data.products);
              }
              data.products.forEach((product: any)  => {
                const key = storefrontApiProductLookupKey(product);
                if (key) fetchedProductsByKey.set(key, product);
              });
            }
          } else {
            await response.text();
          }
        } catch (error: any) {
        }
      }
    }

    step.products.forEach((product: any)  => {
      if (cachedProducts.includes(product)) {
        allProducts.push(normalizeCachedRuntimeProduct(product));
        return;
      }

      const key = productLookupKey(product);
      const fetchedProduct = key ? fetchedProductsByKey.get(key) : null;
      if (fetchedProduct) {
        allProducts.push(fetchedProduct);
      } else {
        allProducts.push(normalizeCachedRuntimeProduct(product));
      }
    });
  } else if (!step?.isFreeGift) {
    if ((!hasEnrichedStepProducts || shouldRefreshRuntimeInventory) && productIds.length > 0) {

      // Get app URL from widget data attribute or window global
      const apiBaseUrl = this.resolveStorefrontApiBase();

      // Derive customer's country for @inContext pricing (market-correct prices via Shopify Markets)
      const country = window.Shopify?.country
        || (window.Shopify?.locale?.includes('-') ? window.Shopify.locale.split('-')[1] : null)
        || null;

      try {
        const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';
        const response = await fetch(`${apiBaseUrl}/api/storefront-products?ids=${encodeURIComponent(productIds.join(','))}${countryParam}`);

        if (!response.ok) {
          await response.text();
        } else {
          const data = await response.json();

          if (data.products && data.products.length > 0) {
            allProducts = allProducts.concat(data.products);
            if (typeof this.rememberRuntimeProductInventory === 'function') {
              this.rememberRuntimeProductInventory(data.products);
            }
            if (shouldRefreshRuntimeInventory) {
              data.products.forEach((product: any)  => {
                const key = storefrontApiProductLookupKey(product);
                if (key) refreshedProductKeys.add(key);
              });
            }
          }
        }
      } catch (error: any) {
      }
    }
  }

  if (!step?.isFreeGift && allProducts.length === 0 && Array.isArray(step.categories)) {
    const hasRenderableCachedProductData = (product: any) => Boolean(
      product
      && typeof product === 'object'
      && (
        (Array.isArray(product.variants) && product.variants.length > 0)
        || (Array.isArray(product.images) && product.images.length > 0)
        || product.imageUrl
        || product.featuredImage
        || product.price
      )
    );

    step.categories.forEach((category: any)  => {
      (category.products || []).forEach((product: any)  => {
        if (hasRenderableCachedProductData(product)) allProducts.push(product);
      });
    });
  }

  if (!step?.isFreeGift && step.StepProduct && Array.isArray(step.StepProduct) && step.StepProduct.length > 0) {
    // Check if StepProduct already has enriched data (for full-page bundles)
    const hasEnrichedData = step.StepProduct.some((sp: any)  => sp.title && sp.imageUrl && sp.price);

    if (hasEnrichedData) {

      // Transform StepProduct to match expected product format
      const enrichedProducts = step.StepProduct.map((sp: any)  => ({
        id: sp.productId,
        selectionId: normalizeProductLookupId(sp),
        title: sp.title,
        handle: sp.handle,
        imageUrl: sp.imageUrl,
        price: sp.price,
        compareAtPrice: sp.compareAtPrice != null
        ? parseFinitePrice(sp.compareAtPrice)
        : (sp.compare_at_price != null
          ? parseFinitePrice(sp.compare_at_price?.amount ?? sp.compare_at_price)
          : null),
        available: true,
        variants: sp.variants || [{
          id: sp.productId.replace('Product', 'ProductVariant'),
          title: 'Default Title',
          price: sp.price,
          compareAtPrice: sp.compareAtPrice != null
            ? parseFinitePrice(sp.compareAtPrice)
            : (sp.compare_at_price != null
              ? parseFinitePrice(sp.compare_at_price?.amount ?? sp.compare_at_price)
              : null),
          available: true,
          image: sp.imageUrl ? { src: sp.imageUrl } : null
        }]
      })).filter((product: any)  => {
        const key = productLookupKey(product);
        return !key || !refreshedProductKeys.has(key);
      });

      allProducts = allProducts.concat(enrichedProducts);
    } else {
      // Fetch from storefront API if data is not enriched
      const productGids = step.StepProduct.map((sp: any)  => sp.productId).filter(Boolean);

      if (productGids.length > 0) {

        const apiBaseUrl = this.resolveStorefrontApiBase();

        // Derive customer's country for @inContext pricing (market-correct prices via Shopify Markets)
        const country = window.Shopify?.country
          || (window.Shopify?.locale?.includes('-') ? window.Shopify.locale.split('-')[1] : null)
          || null;

        try {
          const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';
          const response = await fetch(`${apiBaseUrl}/api/storefront-products?ids=${encodeURIComponent(productGids.join(','))}${countryParam}`);

          if (!response.ok) {
          } else {
            const data = await response.json();
            if (data.products && data.products.length > 0) {
              allProducts = allProducts.concat(data.products);
              if (typeof this.rememberRuntimeProductInventory === 'function') {
                this.rememberRuntimeProductInventory(data.products);
              }
            }
          }
        } catch (error: any) {
        }
      }
    }
  }

  const collectionHandles = step?.isFreeGift ? [] : this.collectStepCollectionHandles(step);
  if (collectionHandles.length > 0) {
    const apiBaseUrl = this.resolveStorefrontApiBase();


    try {
      const response = await fetch(
        `${apiBaseUrl}/api/storefront-collections?handles=${encodeURIComponent(collectionHandles.join(','))}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          allProducts = allProducts.concat(data.products);
          if (typeof this.rememberRuntimeProductInventory === 'function') {
            this.rememberRuntimeProductInventory(data.products);
          }
        }
        // Store per-collection product ID membership for tab filtering
        if (data.byCollection) {
          for (const [handle, productIds] of Object.entries(data.byCollection)) {
            this.stepCollectionProductIds[`${stepIndex}:${handle}`] = productIds;
          }
        }
      } else {
      }
    } catch (error: any) {
    }
  }

  allProducts = await this.enrichMissingProductDescriptions(allProducts);

  // Process and normalize product data
  allProducts = this.mergeCategoryProductVariantAvailability(allProducts, step);
  await fullPageProductProcessingMethods._reconcileDirectDefaultProductsFromStorefront.call(this, stepIndex);
  allProducts = filterFullPageProductsByInvalidDefaultVariants(
    allProducts,
    this._invalidDirectDefaultSelectionIds,
  );

  const processedProducts = this._mergeDirectDefaultProductsIntoStep(
    stepIndex,
    this.processProductsForStep(allProducts, step),
  );


  this.stepProductData[stepIndex] = mergeFullPageProductsBySelectionId(processedProducts);

  if (step?.isFreeGift && Array.isArray(step.addonTiers)) {
    step.maxQuantity = this.stepProductData[stepIndex].length;
    pruneStepSelectionsToProducts(this.selectedProducts, stepIndex, this.stepProductData[stepIndex]);
  }

  this._reconcileFpbUpsellHandoffAfterStepLoad?.(stepIndex);

},

_getDirectDefaultProductsData() {
  const data = this.selectedBundle?.defaultProductsData;
  if (!data || data.isDefaultProductsEnabled !== true || !Array.isArray(data.products)) {
    return null;
  }
  return data;
},

_getDirectDefaultProductItems() {
  const data = this._getDirectDefaultProductsData();
  if (!data) return [];
  return data.products
    .map((product: any)  => normalizeFullPageDirectDefaultProduct(product))
    .filter(Boolean);
},

async _reconcileDirectDefaultProductsFromStorefront(stepIndex: number) {
  if (stepIndex !== 0 || !Array.isArray(this.directDefaultProducts) || this.directDefaultProducts.length === 0) {
    return;
  }

  const productIds = Array.from(new Set(this.directDefaultProducts
    .map((product: any)  => extractFullPageId(product?.id))
    .filter(Boolean)
    .map((productId: any)  => `gid://shopify/Product/${productId}`)));
  if (productIds.length === 0) return;

  const apiBaseUrl = this.resolveStorefrontApiBase();
  const country = window.Shopify?.country
    || (window.Shopify?.locale?.includes('-') ? window.Shopify.locale.split('-')[1] : null)
    || null;

  try {
    const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';
    const response = await fetch(
      `${apiBaseUrl}/api/storefront-products?ids=${encodeURIComponent(productIds.join(','))}${countryParam}`,
      { cache: 'no-store' },
    );
    if (!response.ok) {
      await response.text();
      return;
    }

    const data = await response.json();
    const previousDefaults = this.directDefaultProducts;
    this.directDefaultProducts = reconcileFullPageDirectDefaultProducts(
      previousDefaults,
      Array.isArray(data.products) ? data.products : [],
    );
    const retainedSelectionIds = new Set(this.directDefaultProducts
      .map((product: any)  => extractFullPageId(product?.selectionId || product?.variantId))
      .filter(Boolean)
      .map(String));
    this._invalidDirectDefaultSelectionIds = new Set(previousDefaults
      .map((product: any)  => extractFullPageId(product?.selectionId || product?.variantId))
      .filter((selectionId: any)  => selectionId && !retainedSelectionIds.has(String(selectionId)))
      .map(String));

    previousDefaults.forEach((product: any)  => {
      const selectionId = extractFullPageId(product?.selectionId || product?.variantId);
      if (selectionId && this.selectedProducts?.[0]) {
        delete this.selectedProducts[0][selectionId];
      }
    });
    this.directDefaultProducts.forEach((product: any)  => {
      const selectionId = extractFullPageId(product?.selectionId || product?.variantId);
      if (selectionId && this.selectedProducts?.[0]) {
        this.selectedProducts[0][selectionId] = normalizeDefaultQuantity(product.defaultRequiredQuantity);
      }
    });

    if (typeof this.rememberRuntimeProductInventory === 'function') {
      this.rememberRuntimeProductInventory(data.products);
    }
  } catch (error: any) {
  }
},

_initDirectDefaultProducts() {
  this.directDefaultProducts = this._getDirectDefaultProductItems();
  if (this.directDefaultProducts.length === 0 || !this.selectedProducts[0]) return;

  this.directDefaultProducts.forEach((product: any)  => {
    const selectionId = product?.selectionId;
    if (!selectionId) return;
    const defaultQuantity = normalizeDefaultQuantity(product.defaultRequiredQuantity);
    this.selectedProducts[0][selectionId] = defaultQuantity;
  });
},

_mergeDirectDefaultProductsIntoStep(stepIndex: number, products: any[]) {
  if (stepIndex !== 0 || !Array.isArray(this.directDefaultProducts) || this.directDefaultProducts.length === 0) {
    return products;
  }

  const directDefaultsByVariant = new Map<string, any>(
    this.directDefaultProducts
      .filter((product: any)  => product?.selectionId)
      .map((product: any)  => [String(product.selectionId), product])
  );
  const seenDirectDefaults = new Set();
  const mergedProducts = products.map((product: any)  => {
    const key = String(product?.selectionId || '');
    const directDefault = directDefaultsByVariant.get(key);
    if (!directDefault) return product;

    seenDirectDefaults.add(key);
    return {
      ...product,
      defaultRequiredQuantity: directDefault.defaultRequiredQuantity,
      isDirectDefaultProduct: true,
    };
  });

  const unmatchedDirectDefaults = this.directDefaultProducts.filter((product: any)  => {
    const key = String(product?.selectionId || '');
    return key && !seenDirectDefaults.has(key);
  });

  return mergedProducts.concat(unmatchedDirectDefaults);
},

_getDirectDefaultSelectionQuantities(stepIndex: number) {
  if (stepIndex !== 0 || !Array.isArray(this.directDefaultProducts)) return {};
  return this.directDefaultProducts.reduce((quantities: any, product: any) => {
    if (product?.selectionId) {
      quantities[String(product.selectionId)] = normalizeDefaultQuantity(product.defaultRequiredQuantity);
    }
    return quantities;
  }, {});
},

_getStepConditionSelections(stepIndex: string | number, selections: any = undefined) {
  if (selections === undefined) selections = this.selectedProducts?.[stepIndex] || {};
  const directDefaults = this._getDirectDefaultSelectionQuantities(stepIndex);
  if (Object.keys(directDefaults).length === 0) return selections;

  return Object.entries(selections || {}).reduce((filtered, [variantId, quantity]: any) => {
    const directDefaultQuantity = Number(directDefaults[String(variantId)] || 0);
    const conditionQuantity = Math.max(0, Number(quantity || 0) - directDefaultQuantity);
    if (conditionQuantity > 0) filtered[variantId] = conditionQuantity;
    return filtered;
  }, {} as Record<string, number>);
},

shouldExpandStepProductsDuringLoad(step: any) {
  const hasCategoryProducts = Array.isArray(step?.categories) && step.categories.some((category: any)  =>
    (Array.isArray(category.products) && category.products.length > 0)
    || (Array.isArray(category.collections) && category.collections.length > 0)
  );

  if (hasCategoryProducts) {
    return false;
  }

  return step?.displayVariantsAsIndividualProducts === true || step?.displayVariantsAsIndividual === true;
},

getFirstAvailableVariant(product: any) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length === 0) {
    return null;
  }

  return variants.find((variant: any)  => this.isVariantSelectableForInventory(variant)) || null;
},

rememberRuntimeProductInventory(products: any[]) {
  if (!Array.isArray(products) || products.length === 0) return;
  if (!this._fpbRuntimeVariantInventoryById) {
    this._fpbRuntimeVariantInventoryById = {};
  }

  products.forEach(product => {
    (Array.isArray(product?.variants) ? product.variants : []).forEach((variant: any)  => {
      const key = extractFullPageId(variant?.id);
      if (!key) return;
      this._fpbRuntimeVariantInventoryById[key] = {
        available: variant.available === true,
        quantityAvailable: typeof variant.quantityAvailable === 'number' ? variant.quantityAvailable : null,
        currentlyNotInStock: variant.currentlyNotInStock === true,
      };
    });
  });
},

getRuntimeVariantInventory(productOrVariant: any) {
  const key = variantLookupKey(productOrVariant);
  if (!key) return null;
  return this._fpbRuntimeVariantInventoryById?.[key] || null;
},

isInventoryTrackingOnAddToCartEnabled() {
  const controls = typeof this._getLandingPageControls === 'function'
    ? this._getLandingPageControls()
    : null;
  return controls?.trackInventoryOnAddToCart === true;
},

isVariantSelectableForInventory(variant: any) {
  const runtimeInventory = typeof this.getRuntimeVariantInventory === 'function'
    ? this.getRuntimeVariantInventory(variant)
    : null;
  const candidate = runtimeInventory ? { ...variant, ...runtimeInventory } : variant;

  if (candidate?.available !== true) {
    return false;
  }
  const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
    ? this.isInventoryTrackingOnAddToCartEnabled()
    : fullPageProductProcessingMethods.isInventoryTrackingOnAddToCartEnabled.call(this);
  if (!trackInventoryOnAddToCart) {
    return true;
  }
  return !isTrackedZeroStock(candidate);
},

processProductsForStep(products: any, step: any) {
  // Normalize per-variant inventory fields from the Storefront API proxy response.
  // quantityAvailable is number | null (null when the inventory scope isn't granted
  // or the variant is untracked — widget treats null as unlimited).
  // currentlyNotInStock is true for backorder-accepting variants that are sold out.
  const toCents = (value: any) => Math.round(parseFloat(value || '0') * 100);
  const normalizeVariant = (v: any) => {
    const variantId = variantLookupKey(v);
    if (!variantId) return null;
    const quantityAvailable = typeof v.quantityAvailable === 'number' ? v.quantityAvailable : null;
    const currentlyNotInStock = v.currentlyNotInStock === true;
    return {
      id: variantId,
      selectionId: variantId,
      title: v.title,
      price: toCents(v.price),
      compareAtPrice: normalizeCompareAtPriceToCents(v.compareAtPrice) ?? normalizeCompareAtPriceToCents(v.compare_at_price),
      available: v.available === true && (
        !fullPageProductProcessingMethods.isInventoryTrackingOnAddToCartEnabled.call(this)
        || !(quantityAvailable === 0 && currentlyNotInStock !== true)
      ),
      quantityAvailable,
      currentlyNotInStock,
      weight: normalizeWeightToGrams(v.weight, v.weightUnit),
      weightUnit: 'GRAMS',
      option1: getVariantSelectedOptionValue(v, 1),
      option2: getVariantSelectedOptionValue(v, 2),
      option3: getVariantSelectedOptionValue(v, 3),
      image: v.image || null
    };
  };

  const normalizedProducts = (Array.isArray(products) ? products : [])
    .map(normalizeStorefrontApiProduct)
    .filter(Boolean);

  return normalizedProducts.flatMap(product => {
    if (this.shouldExpandStepProductsDuringLoad(step) && product.variants && product.variants.length > 0) {
      // Display each variant as separate product - filter out unavailable variants
      // Preserve parent product reference for variant selection in modal
      const processedVariants = (product.variants || []).map(normalizeVariant).filter(Boolean);

      const processedOptions = deriveProductOptionNames(product);

    return product.variants
        .filter((variant: any)  => this.isVariantSelectableForInventory(variant))
        .map((variant: any)  => {
          const variantId = variantLookupKey(variant);
          if (!variantId) return null;

          // Storefront API: prioritize variant image, fallback to product featured image.
          // product.imageUrl — set by API path; product.featuredImage/images — metafield cache format.
          const imageUrl = variant?.image?.src
            || variant?.image?.url
            || (typeof variant?.image === 'string' ? variant.image : null)
            || variant?.imageUrl
            || product.imageUrl
            || product.featuredImage?.url
            || product.images?.[0]?.url
            || product.images?.[0]?.src
            || product.images?.[0]?.originalSrc
            || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;

          return {
            id: variantId,
            title: `${product.title} - ${variant.title}`,
            imageUrl,
            price: toCents(variant.price),
            compareAtPrice: normalizeCompareAtPriceToCents(variant.compareAtPrice) ?? normalizeCompareAtPriceToCents(variant.compare_at_price),
            variantId,
            selectionId: variantId,
            available: this.isVariantSelectableForInventory(variant),
            quantityAvailable: typeof variant.quantityAvailable === 'number' ? variant.quantityAvailable : null,
            currentlyNotInStock: variant.currentlyNotInStock === true,
            weight: normalizeWeightToGrams(variant.weight, variant.weightUnit),
            weightUnit: 'GRAMS',
            // Preserve parent product data for variant selection in modal
            parentProductId: normalizeProductLookupId(product),
            parentTitle: product.title,
            variants: processedVariants,
            options: processedOptions,
            images: product.images || (product.imageUrl ? [{ src: product.imageUrl }] : []),
            description: normalizeProductDescription(product),
            descriptionHtml: normalizeProductDescriptionHtml(product)
          };
        })
        .filter(Boolean);
    } else {
      // Grouped cards require at least one sellable variant. This also removes
      // tracked zero-stock products when the global inventory control is active.
      const defaultVariant = this.getFirstAvailableVariant(product);
      if (Array.isArray(product?.variants) && product.variants.length > 0 && !defaultVariant) {
        return [];
      }

      // Storefront API: prioritize variant image, fallback to product featured image.
      // product.imageUrl — set by API path; product.featuredImage/images — metafield cache format.
      const imageUrl = defaultVariant?.image?.src
        || defaultVariant?.image?.url
        || (typeof defaultVariant?.image === 'string' ? defaultVariant.image : null)
        || defaultVariant?.imageUrl
        || product.imageUrl
        || product.featuredImage?.url
        || product.images?.[0]?.url
        || product.images?.[0]?.src
        || product.images?.[0]?.originalSrc
        || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;

      // Process variants array for variant selection in modal
      const processedVariants = (product.variants || []).map(normalizeVariant);

      // Process options array for variant selector labels
      const processedOptions = deriveProductOptionNames(product);

      const productId = normalizeProductLookupId(product);
      const selectionId = variantLookupKey(defaultVariant) || normalizeProductLookupId(product);
      if (!selectionId) return [];

      return [{
        id: productId,
        title: product.title,
        imageUrl,
        price: defaultVariant
          ? toCents(defaultVariant.price)
          : toCents(product.price),
        compareAtPrice: defaultVariant
          ? normalizeCompareAtPriceToCents(defaultVariant.compareAtPrice) ?? normalizeCompareAtPriceToCents(defaultVariant.compare_at_price)
          : null,
        variantId: selectionId,
        selectionId,
        available: defaultVariant ? this.isVariantSelectableForInventory(defaultVariant) : product.available === true,
        quantityAvailable: typeof defaultVariant?.quantityAvailable === 'number' ? defaultVariant.quantityAvailable : null,
        currentlyNotInStock: defaultVariant?.currentlyNotInStock === true,
        weight: normalizeWeightToGrams(defaultVariant?.weight, defaultVariant?.weightUnit),
        weightUnit: 'GRAMS',
        // Preserve variants and options for variant selection in modal
        variants: processedVariants,
        options: processedOptions,
        // Preserve product images for the shared product-details carousel.
        images: product.images || (product.imageUrl ? [{ src: product.imageUrl }] : []),
        description: normalizeProductDescription(product),
        descriptionHtml: normalizeProductDescriptionHtml(product)
      }];
    }
  });
},

/**
 * Look up real stock for a variant in a step's product data.
 * Returns:
 *   - available: positive numeric remaining stock, or null when uncapped
 *   - outOfStock: true only when Shopify marks the variant unavailable
 *   - acceptsBackorder: true when Shopify marks the variant as backorderable
 */
isVariantOutOfStock(product: any) {
  if (!product) {
    return false;
  }
  const runtimeInventory = typeof this.getRuntimeVariantInventory === 'function'
    ? this.getRuntimeVariantInventory(product)
    : null;
  const candidate = runtimeInventory ? { ...product, ...runtimeInventory } : product;

  if (candidate.available === false) {
    return true;
  }
  const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
    ? this.isInventoryTrackingOnAddToCartEnabled()
    : fullPageProductProcessingMethods.isInventoryTrackingOnAddToCartEnabled.call(this);
  if (trackInventoryOnAddToCart && isTrackedZeroStock(candidate)) {
    return true;
  }
  return false;
},

getVariantAvailable(stepIndex: string|number, variantId: any) {
  const products = this.stepProductData[stepIndex] || [];
  const requestedVariantKey = extractFullPageId(variantId);
  const product = products.find((p: any)  => variantLookupKey(p) === requestedVariantKey)
    || products.flatMap((p: any)  => Array.isArray(p?.variants) ? p.variants : [])
      .find((variant: any)  => variantLookupKey(variant) === requestedVariantKey);
  if (!product) {
    return { available: null, outOfStock: false, acceptsBackorder: false };
  }

  const runtimeInventory = typeof this.getRuntimeVariantInventory === 'function'
    ? this.getRuntimeVariantInventory(product)
    : null;
  const candidate = runtimeInventory ? { ...product, ...runtimeInventory } : product;
  const backorder = candidate.currentlyNotInStock === true;
  const outOfStock = this.isVariantOutOfStock(product);
  const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
    ? this.isInventoryTrackingOnAddToCartEnabled()
    : fullPageProductProcessingMethods.isInventoryTrackingOnAddToCartEnabled.call(this);
  const qty = trackInventoryOnAddToCart
    && typeof candidate.quantityAvailable === 'number'
    && candidate.quantityAvailable > 0
    ? candidate.quantityAvailable
    : null;

  return { available: qty, outOfStock, acceptsBackorder: backorder };
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

getProductSelectionId(product: any = {}) {
  return String(product?.selectionId || '');
},

async enrichMissingProductDescriptions(products: any[]) {
  if (!Array.isArray(products) || products.length === 0) return products;

  const missingProductIds = Array.from(new Set(products
    .filter(product => !normalizeProductDescriptionHtml(product))
    .map(productGraphqlId)
    .filter(Boolean)));

  if (missingProductIds.length === 0) return products;

  const apiBaseUrl = this.resolveStorefrontApiBase();
  const country = window.Shopify?.country
    || (window.Shopify?.locale?.includes('-') ? window.Shopify.locale.split('-')[1] : null)
    || null;

  try {
    const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';
    const response = await fetch(`${apiBaseUrl}/api/storefront-products?ids=${encodeURIComponent(missingProductIds.join(','))}${countryParam}`);
    if (!response.ok) return products;

    const data = await response.json();
    if (typeof this.rememberRuntimeProductInventory === 'function') {
      this.rememberRuntimeProductInventory(data.products);
    }
    const descriptionsByProductId = new Map();
    (Array.isArray(data.products) ? data.products : []).forEach((product: any)  => {
      const description = normalizeProductDescription(product);
      const descriptionHtml = normalizeProductDescriptionHtml(product);
      const key = storefrontApiProductLookupKey(product);
      if (key && (description || descriptionHtml)) {
        descriptionsByProductId.set(key, { description, descriptionHtml });
      }
    });

    if (descriptionsByProductId.size === 0) return products;

    return products.map(product => {
      if (normalizeProductDescriptionHtml(product)) return product;
      const key = productLookupKey(product);
      const descriptions = key ? descriptionsByProductId.get(key) : null;
      if (!descriptions) return product;

      const existingDescription = normalizeProductDescription(product);
      return {
        ...product,
        description: existingDescription || descriptions.description || '',
        descriptionHtml: descriptions.descriptionHtml || '',
      };
    });
  } catch (error: any) {
    return products;
  }
},
};
