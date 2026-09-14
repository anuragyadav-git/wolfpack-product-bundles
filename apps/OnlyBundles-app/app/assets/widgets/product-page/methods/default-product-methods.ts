
export const ProductPageDefaultProductMethods: Record<string, any> & ThisType<any> = {
  _normalizeRequiredQuantity(value: string) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  },

initializeDataStructures() {
  const stepsCount = this.selectedBundle.steps.length;

  // Initialize selected products array (one object per step)
  this.selectedProducts = Array(stepsCount).fill(null).map(() => ({}));
  this.selectedProductCategoryIndexes = Array(stepsCount).fill(null).map(() => ({}));

  // Initialize step product data cache
  this.stepProductData = Array(stepsCount).fill(null).map(() => ([]));
  this._stepFetchFailed = {};

  // Seed default steps into selectedProducts regardless of widget style.
  // Default products are always included in the bundle — no user selection required.
  // buildCartItems() reads selectedProducts, so without this the default item is
  // silently excluded from the cart payload on classic modal style bundles.
  this.selectedBundle.steps.forEach((step: any, i: any) => {
    if (step.isDefault && step.defaultVariantId) {
      const normalizedDefaultVariantId = this.normalizeSelectionKey(step.defaultVariantId);
      if (normalizedDefaultVariantId) {
        const initialDefaultQuantity = this._normalizeRequiredQuantity(step.defaultRequiredQuantity);
        this.setSelectedQuantity(i, normalizedDefaultVariantId, initialDefaultQuantity);
      }
    }
  });
},

_getDirectDefaultProductsData() {
  const data = this.selectedBundle?.defaultProductsData;
  if (!data || data.isDefaultProductsEnabled !== true || !Array.isArray(data.products)) {
    return null;
  }
  return data;
},

  _normalizeDirectDefaultProductRequirement(product: any) {
  const productId = this.extractId(product?.graphqlId || product?.productId || product?.id);
  const variant = Array.isArray(product.variants) ? product.variants[0] : null;
  const variantId = this.extractId(
    variant?.variantGraphqlId || variant?.selectionId || variant?.variantId || variant?.id,
  );
  if (!productId || !variantId) return null;

  return {
    productId,
    variantId,
    defaultRequiredQuantity: this._normalizeRequiredQuantity(product.requiredQuantity),
  };
},

_getDirectDefaultProductRequirements() {
  const data = this._getDirectDefaultProductsData();
  if (!data) return [];
  return data.products
    .map((product: any)  => this._normalizeDirectDefaultProductRequirement(product))
    .filter(Boolean);
},

_getDirectDefaultProductIds() {
  return (this.directDefaultProductRequirements || []).map(
    (requirement: any) => `gid://shopify/Product/${requirement.productId}`,
  );
},

_initDirectDefaultProducts() {
  this.directDefaultProductRequirements = this._getDirectDefaultProductRequirements();
  this.directDefaultProducts = [];
  if (this.directDefaultProductRequirements.length === 0 || !this.selectedProducts[0]) return;

  this.directDefaultProductRequirements.forEach((requirement: any)  => {
    this.setSelectedQuantity(0, requirement.variantId, requirement.defaultRequiredQuantity);
  });
},

async _preloadDirectDefaultProducts() {
  if (this.directDefaultProductRequirements.length === 0 || !this.selectedBundle?.steps?.[0]) return;
  await this.loadStepProducts(0).catch(() => {});
},

_mergeDirectDefaultProductsIntoStep(stepIndex: number, products: any[]) {
  if (Number(stepIndex) !== 0) return products;

  const requirements = this.directDefaultProductRequirements || [];
  if (requirements.length === 0) {
    this.directDefaultProducts = [];
    this._directDefaultHydrationFailed = false;
    return products;
  }

  const hydratedDefaults = requirements.map((requirement: any) => {
    const product = products.find((candidate: any) => {
      const candidateProductId = this.extractId(candidate.parentProductId || candidate.id);
      const containsVariant = candidate.variantId === requirement.variantId
        || (candidate.variants || []).some(
          (variant: any) => this.extractId(variant.id || variant.selectionId) === requirement.variantId,
        );
      return candidateProductId === requirement.productId && containsVariant;
    });
    if (!product) return null;

    const variant = (product.variants || []).find(
      (candidate: any) => this.extractId(candidate.id || candidate.selectionId) === requirement.variantId,
    );
    if (!variant) return null;

    return {
      ...product,
      variantId: requirement.variantId,
      selectionId: requirement.variantId,
      price: variant.price,
      currencyCode: variant.currencyCode ?? null,
      compareAtPrice: variant.compareAtPrice ?? null,
      compareAtCurrencyCode: variant.compareAtCurrencyCode ?? null,
      available: variant.available === true,
      quantityAvailable: typeof variant.quantityAvailable === 'number'
        ? variant.quantityAvailable
        : null,
      currentlyNotInStock: variant.currentlyNotInStock === true,
      imageUrl: variant.image?.src || product.imageUrl,
      defaultRequiredQuantity: requirement.defaultRequiredQuantity,
    };
  }).filter(Boolean);

  this._directDefaultHydrationFailed = hydratedDefaults.length !== requirements.length;
  this.directDefaultProducts = this._directDefaultHydrationFailed ? [] : hydratedDefaults;
  return this._directDefaultHydrationFailed ? [] : products;
},

_isDirectDefaultVariant(variantId: any) {
  const normalizedVariantId = this.extractId(variantId);
  return (this.directDefaultProductRequirements || []).some(
    (requirement: any) => requirement.variantId === normalizedVariantId,
  );
},

_getDirectDefaultRequiredQuantity(variantId: any) {
  const normalizedVariantId = this.extractId(variantId);
  const requirement = (this.directDefaultProductRequirements || []).find(
    (item: any) => item.variantId === normalizedVariantId,
  );
  return requirement ? requirement.defaultRequiredQuantity : null;
},

/**
 * Pre-fetches product data for all steps marked isDefault so that
 * the filled slot card can render with real image and title on first paint.
 * Non-fatal — a failed fetch just leaves the card in a loading placeholder state.
 */
async _preloadDefaultStepProducts() {
  const promises = this.selectedBundle.steps.map((step: any, i: any) => {
    if (step.isDefault && step.defaultVariantId) {
      return this.loadStepProducts(i).catch(() => {});
    }
    return null;
  }).filter(Boolean);
  if (promises.length > 0) await Promise.all(promises);
},

/**
 * Returns the product object for a default step from stepProductData,
 * matched by defaultVariantId. Returns null when not yet loaded.
 */
_getDefaultStepProduct(stepIndex: string|number) {
  const step = this.selectedBundle.steps[stepIndex];
  if (!step?.isDefault || !step.defaultVariantId) return null;
  const products = this.stepProductData[stepIndex] || [];
  const variantId = this.normalizeSelectionKey(step.defaultVariantId);
  return this.findProductBySelectionKey(products, variantId) || products[0] || null;
},

/**
 * Show a helpful preview in theme editor when testing on non-bundle products
 */
};
