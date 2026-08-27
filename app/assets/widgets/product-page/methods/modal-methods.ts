import { ConditionValidator } from '../../shared/condition-validator.js';
import { CurrencyManager } from '../../shared/currency-manager.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { createSharedProductCardElement } from '../../shared/components/product-card.js';
import { getSubscriptionProductCardPrice } from '../../shared/subscription-storefront-methods.js';
import { resolvePpbModalCardPresentation } from '../ppb-modal-card-presentation.js';

export function resolveProductPageCardButtonText({
  currentQuantity = 0,
  currentStep = {},
  outOfStock = false,
  defaultAddText = 'Add +',
}: any = {}) {
  if (outOfStock) return 'Out of stock';

  const rawText = currentQuantity > 0
    ? (currentStep?.addonReplaceText || `Added x${currentQuantity}`)
    : (currentStep?.addonAddText || defaultAddText);

  return String(rawText)
    .replace(/\{\{\s*allowedQuantity\s*\}\}/g, String(currentQuantity))
    .replace(/\{\{\s*quantity\s*\}\}/g, String(currentQuantity));
}

export function resolveProductPageInlineAddText(resolveText: (arg0: string,arg1: string) => any) {
  if (typeof resolveText !== 'function') return 'Add +';
  const modalFallback = resolveText('productCardAddButton', 'Add +');
  return resolveText('productCardInlineAddButton', modalFallback || 'Add +') || 'Add +';
}

export function shouldDisableProductPageVariantOption(variant: any, trackInventoryOnAddToCart = false) {
  if (variant?.available !== true) {
    return true;
  }

  return trackInventoryOnAddToCart === true
    && variant?.quantityAvailable === 0
    && variant?.currentlyNotInStock !== true;
}

export function shouldDisplayVariantsAsIndividualForModalCategory(
  step: any,
  stepIndex: string|number,
  activeCategoryIndexes: any = {},
) {
  const categories = Array.isArray(step?.categories) ? step.categories : [];
  if (categories.length > 0) {
    const activeIndex = typeof activeCategoryIndexes?.[stepIndex] === 'number'
      ? activeCategoryIndexes[stepIndex]
      : 0;
    const category = categories[activeIndex] || categories[0];
    return category?.displayVariantsAsIndividualProducts === true
      || category?.displayVariantsAsIndividual === true;
  }

  return step?.displayVariantsAsIndividualProducts === true
    || step?.displayVariantsAsIndividual === true;
}

export function getModalSoleVariantDisplayTitle(product: any = {}) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (Number(product?.sourceVariantCount || 0) <= 1 || variants.length !== 1) {
    return '';
  }

  const title = typeof variants[0]?.title === 'string' ? variants[0].title.trim() : '';
  return title && title !== 'Default Title' ? title : '';
}

export function resolveProductPageModalStepPosition({
  stepIndex,
  currentStepIndex,
  stepCount,
}: any = {}) {
  if (
    !Number.isInteger(stepIndex)
    || !Number.isInteger(currentStepIndex)
    || !Number.isInteger(stepCount)
    || stepCount < 1
    || stepIndex < 0
    || currentStepIndex < 0
    || stepIndex >= stepCount
    || currentStepIndex >= stepCount
  ) {
    return 'hidden';
  }

  if (stepIndex === currentStepIndex) return 'current';
  if (stepIndex === currentStepIndex - 1) return 'previous';
  if (stepIndex === currentStepIndex + 1) return 'next';
  return 'hidden';
}

export function applyProductPageVariantSelection({
  product = {},
  variantData = {},
  productCard = null,
  formatPrice = null,
}: any = {}) {
  const nextVariantId = variantData.id || product.variantId || product.id;
  const nextVariantTitle = variantData.title && variantData.title !== 'Default Title'
    ? variantData.title
    : '';
  const nextPrice = normalizeVariantPrice(variantData.price);
  const nextCompareAtPrice = normalizeVariantPrice(variantData.compareAtPrice);
  const nextImageUrl = resolveVariantImageUrl(variantData) || product.imageUrl || product.image?.src || '';

  product.quantityAvailable = typeof variantData.quantityAvailable === 'number'
    ? variantData.quantityAvailable
    : null;
  product.currentlyNotInStock = variantData.currentlyNotInStock === true;
  product.selectionId = nextVariantId;
  product.variantId = nextVariantId;
  product.variantTitle = nextVariantTitle;
  if (Number.isFinite(nextPrice)) product.price = nextPrice;
  product.compareAtPrice = Number.isFinite(nextCompareAtPrice) ? nextCompareAtPrice : null;
  if (nextImageUrl) {
    product.imageUrl = nextImageUrl;
    product.image = nextImageUrl;
  }

  if (!productCard) return product;

  productCard.dataset.productId = nextVariantId;
  productCard.dataset.currentSelectedVariantId = nextVariantId;
  productCard.querySelectorAll?.('[data-product-id]').forEach((el: any)  => {
    el.dataset.productId = nextVariantId;
  });

  const priceEl = productCard.querySelector?.('.product-price');
  if (priceEl && Number.isFinite(product.price) && typeof formatPrice === 'function') {
    priceEl.textContent = formatPrice(product.price);
  }

  const compareEl = productCard.querySelector?.('.product-price-strike');
  if (compareEl) {
    if (Number.isFinite(product.compareAtPrice) && typeof formatPrice === 'function') {
      compareEl.textContent = formatPrice(product.compareAtPrice);
    } else if (typeof compareEl.remove === 'function') {
      compareEl.remove();
    } else {
      compareEl.textContent = '';
    }
  }

  const imageEl = productCard.querySelector?.('.bw-product-card__image, .product-image img');
  if (imageEl && nextImageUrl) {
    imageEl.src = nextImageUrl;
  }

  return product;
}

export function dispatchProductPageVariantSelection({
  product,
  select,
  oldVariantId,
  newVariantId,
  createEvent = () => new Event('change', { bubbles: true }),
}: any = {}) {
  if (!product || !select || !newVariantId) return false;
  product.variantId = oldVariantId;
  select.value = newVariantId;
  select.dispatchEvent(createEvent());
  return true;
}

function normalizeVariantPrice(value: string|null|undefined) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function resolveVariantImageUrl(variantData: any = {}) {
  const image = variantData.image;
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.src || image.url || image.originalSrc || '';
}

export const ProductPageModalMethods: Record<string, any> & ThisType<any> = {
renderModalTabs() {
  const tabsContainer = this.elements.modal.querySelector('.modal-tabs');
  tabsContainer.replaceChildren();

  // Set CSS variable for equal-column grid (bottom-sheet mode)
  const stepCount = this.selectedBundle.steps.length;
  tabsContainer.style.setProperty('--bw-tab-count', stepCount.toString());

  this.selectedBundle.steps.forEach((step: any, index: number) => {
    const isAccessible = this.isStepAccessible(index);
    const isActive = index === this.currentStepIndex;
    const isFreeGift = !!step.isFreeGift;
    // Free gift tab is only accessible when all paid steps are complete
    const freeGiftAccessible = !isFreeGift || this.isFreeGiftUnlocked;
    const railPosition = resolveProductPageModalStepPosition({
      stepIndex: index,
      currentStepIndex: this.currentStepIndex,
      stepCount,
    });

    // Create tab button
    const tabButton = document.createElement('button');
    const freeGiftClass = isFreeGift ? ' bw-free-gift-tab' : '';
    tabButton.className = `bundle-header-tab${freeGiftClass} bw-bs-step-${railPosition} ${isActive ? 'active' : ''} ${(!isAccessible || !freeGiftAccessible) ? 'locked' : ''}`;
    tabButton.textContent = (step.isFreeGift && step.addonLabel) ? step.addonLabel : (step.name || `Step ${index + 1}`);
    tabButton.dataset.stepIndex = index.toString();
    if (isActive) tabButton.setAttribute('aria-current', 'step');

    // Click handler
    tabButton.addEventListener('click', async () => {
      // Re-check accessibility at click time (not stale closure from render time)
      if (!this.isStepAccessible(index)) {
        ToastManager.show('Please complete the previous steps first.');
        return;
      }
      // Free gift tab requires all paid steps complete
      if (step.isFreeGift && !this.isFreeGiftUnlocked) {
        ToastManager.show('Complete all required steps to unlock the free gift.');
        return;
      }
      // Block forward navigation if current step condition is not met
      const shouldValidateConditions = this._isConditionValidationEnabled?.() !== false;
      if (shouldValidateConditions && index > this.currentStepIndex && !this.validateStep(this.currentStepIndex)) {
        ToastManager.show('Please meet the step conditions before proceeding.');
        return;
      }

      this.currentStepIndex = index;

      // Update modal header
      const headerText = this.getFormattedHeaderText();
      const header = this.elements.modal.querySelector('.modal-step-title');
      if (header) {
        header.textContent = headerText;
      }

      // Load products for this step if not already loaded
      this.showLoadingOverlay(this.selectedBundle?.loadingGif || null);
      try {
        await this.loadStepProducts(index);
      } finally {
        this.hideLoadingOverlay();
      }

      // Re-render everything
      this.renderModalTabs();
      this.renderModalProducts(index);
      this.updateModalNavigation();
      this.updateModalFooterMessaging();
    });

    tabsContainer.appendChild(tabButton);
  });

  // Update arrow visibility after rendering tabs
  if (this.updateTabArrows) {
    setTimeout(() => this.updateTabArrows(), 50);
  }

  this.renderModalCategoryTabs();
},

renderModalCategoryTabs() {
  const tabsContainer = this.elements.modal.querySelector('.bw-bs-category-tabs');
  if (!tabsContainer) return;

  const stepIndex = this.currentStepIndex;
  const step = this.selectedBundle?.steps?.[stepIndex];
  const categories = Array.isArray(step?.categories) ? step.categories : [];
  tabsContainer.textContent = '';

  if (categories.length <= 1) {
    tabsContainer.hidden = true;
    return;
  }

  this.activeInpageCategoryIndexes ||= {};
  if (typeof this.activeInpageCategoryIndexes[stepIndex] !== 'number') {
    this.activeInpageCategoryIndexes[stepIndex] = 0;
  }

  tabsContainer.hidden = false;
  categories.forEach((category: any, categoryIndex: any) => {
    const button = tabsContainer.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'bw-bs-category-tab';
    button.dataset.categoryIndex = String(categoryIndex);
    button.textContent = this._getInpageCategoryLabel(category, categoryIndex);
    button.classList.toggle(
      'active',
      categoryIndex === this.activeInpageCategoryIndexes[stepIndex]
    );
    button.addEventListener('click', () => {
      this.activeInpageCategoryIndexes[stepIndex] = categoryIndex;
      tabsContainer.querySelectorAll('.bw-bs-category-tab').forEach((tab: any)  => {
        tab.classList.toggle('active', tab === button);
      });
      this.renderModalProducts(stepIndex);
    });
    tabsContainer.appendChild(button);
  });
},

renderModalProducts(stepIndex: string|number, productsToRender: any = null) {
  // Use all products from step data
  const stepProductData = this.stepProductData || [];
  const rawProducts = productsToRender ?? stepProductData[stepIndex];
  const currentStep = this.selectedBundle?.steps?.[stepIndex];
  const categoryProducts = this._filterProductsForInpageCategory(
    currentStep,
    rawProducts,
    stepIndex
  );
  const products = shouldDisplayVariantsAsIndividualForModalCategory(
    currentStep,
    stepIndex,
    this.activeInpageCategoryIndexes,
  )
    ? this.expandProductsByVariant(categoryProducts)
    : categoryProducts;
  const selectedProducts = this.selectedProducts[stepIndex];
  const productGrid = this.elements.modal.querySelector('.product-grid');
  const isFreeGiftStep = !!currentStep?.isFreeGift;

  // Inject free gift promo heading above the grid
  const bodyEl = this.elements.modal.querySelector('.bw-bs-body') || this.elements.modal.querySelector('.modal-body');
  const existingPromo = bodyEl?.querySelector('.bw-bs-free-gift-promo');
  if (existingPromo) existingPromo.remove();
  if (isFreeGiftStep && bodyEl) {
    const promo = document.createElement('div');
    promo.className = 'bw-bs-free-gift-promo';
    const stepName = currentStep.name || 'gift';
    const firstProduct = rawProducts?.[0];
    const priceStr = firstProduct?.price
      ? CurrencyManager.convertAndFormat(firstProduct.price, CurrencyManager.getCurrencyInfo())
      : '';
    const heading = document.createElement('p');
    heading.className = 'bw-bs-free-gift-heading';
    heading.textContent = `Free ${stepName}!`;
    const subheading = document.createElement('p');
    subheading.className = 'bw-bs-free-gift-subheading';
    subheading.textContent = `Add ${this.paidSteps.length} items to unlock`;
    promo.append(heading, subheading);
    bodyEl.insertBefore(promo, productGrid);
  }

  if (products.length === 0) {
    // Show error state if the fetch failed, otherwise a neutral "no products" message
    if (this._stepFetchFailed && this._stepFetchFailed[stepIndex]) {
      const error = document.createElement('div');
      error.className = 'modal-fetch-error';
      const message = document.createElement('p');
      message.textContent = 'Could not load products. Please check your connection and try again.';
      const retry = document.createElement('button');
      retry.className = 'modal-retry-btn';
      retry.textContent = 'Retry';
      error.append(message, retry);
      productGrid.replaceChildren(error);
      const retryBtn = productGrid.querySelector('.modal-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          // Clear cached failure so loadStepProducts re-fetches
          this._stepFetchFailed[stepIndex] = false;
          this.stepProductData[stepIndex] = [];
          this.renderModalProductsLoading(stepIndex);
          this.loadStepProducts(stepIndex).then(() => {
            this.renderModalProducts(stepIndex);
          });
        });
      }
    } else {
      const noProducts = document.createElement('p');
      noProducts.className = 'no-products-message';
      noProducts.textContent = 'No products are configured for this step.';
      productGrid.replaceChildren(noProducts);
    }
    return;
  }

  // Free gift product cards use a different border (gray instead of gold)
  const freeGiftCardClass = isFreeGiftStep ? ' bw-product-card--free-gift' : '';
  const productQuantityLimit = ConditionValidator.getAllowedQuantityPerProduct(
    this.selectedBundle?.validateQuantityPerProduct
  );

  const cards = products.map((product: any)  => {
    const selectionKey = product.selectionId || product.variantId || product.id;
    const productSelection = product.selectionId
      ? product
      : { ...product, selectionId: selectionKey };
    const currentQuantity = this.getSelectedQuantity(stepIndex, selectionKey);
    const cardPresentation = resolvePpbModalCardPresentation({
      quantity: currentQuantity,
      validation: this.selectedBundle?.validateQuantityPerProduct,
    });
    const currencyInfo = CurrencyManager.getCurrencyInfo();

    // Per-variant stock state derived from Storefront API quantityAvailable
    const { available, outOfStock } = this.getVariantAvailable(stepIndex, selectionKey);
    const outOfStockText = this._resolveText('productCardOutOfStockButton', 'Out of Stock');
    const atMaxStock = available !== null && currentQuantity >= available;
    const atMaxProductQuantity = productQuantityLimit !== null && currentQuantity >= productQuantityLimit;
    const increaseDisabled = outOfStock || atMaxStock || atMaxProductQuantity;
    const stockBadgeElement = outOfStock ? document.createElement('div') : null;
    if (stockBadgeElement) {
      stockBadgeElement.className = 'product-stock-badge product-stock-badge--out';
      stockBadgeElement.textContent = outOfStockText;
    }
    return createSharedProductCardElement(
      {
        ...productSelection,
        title: product.title,
        imageUrl: product.imageUrl,
        description: '',
      },
      currentQuantity,
      currencyInfo,
      {
        displayPrice: getSubscriptionProductCardPrice(this, product.price),
        description: '',
        displaySeeMoreLink: false,
        expandProductCardOnHover: false,
        mode: 'grid',
        cardInteractive: false,
        titleInteractive: false,
        className: `${freeGiftCardClass} ${currentQuantity > 0 ? 'bw-product-card--selected' : ''} ${outOfStock ? 'is-out-of-stock' : ''}`.trim(),
        variantSelectorElement: this.renderVariantSelector(product),
        stockBadgeElement,
        addButtonText: resolveProductPageCardButtonText({
          currentQuantity,
          currentStep,
          outOfStock,
          outOfStockText,
          defaultAddText: 'Add to Cart',
        }),
        selectedButtonText: resolveProductPageCardButtonText({
          currentQuantity,
          currentStep,
          outOfStock,
          outOfStockText,
          defaultAddText: 'Add to Cart',
        }),
        selectedAction: cardPresentation.mode === 'maximum-reached' ? 'button' : undefined,
        addDisabled: outOfStock,
        increaseDisabled,
      },
    );
  });
  productGrid.replaceChildren(...cards);

  // Trigger slide-up animation for cards
  productGrid.classList.remove('bw-animate-in');
  void productGrid.offsetWidth; // force reflow
  productGrid.classList.add('bw-animate-in');

  // Attach event handlers
  this.attachProductEventHandlers(productGrid, stepIndex);
},

renderVariantSelector(product: any) {
  if (!product.variants || product.variants.length <= 1) {
    return null;
  }

  const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
    ? this.isInventoryTrackingOnAddToCartEnabled()
    : false;
  const variantLabel = this._resolveText?.('productVariantLabel', 'Select variant') || 'Select variant';

  const wrapper = document.createElement('div');
  wrapper.className = 'variant-selector-wrapper';
  const label = document.createElement('label');
  label.className = 'ppb-modal-variant-label';
  label.htmlFor = `variant-selector-${product.id}`;
  label.textContent = variantLabel;
  const select = document.createElement('select');
  select.id = `variant-selector-${product.id}`;
  select.className = 'variant-selector';
  select.dataset.baseProductId = String(product.id);
  select.setAttribute('aria-label', variantLabel);
  product.variants.forEach((variant: any) => {
    const isHardOOS = shouldDisableProductPageVariantOption(variant, trackInventoryOnAddToCart);
    const option = document.createElement('option');
    option.value = String(variant.id);
    option.textContent = isHardOOS ? `${variant.title} — out of stock` : variant.title;
    option.selected = variant.id === product.variantId;
    option.disabled = isHardOOS;
    select.append(option);
  });
  wrapper.append(label, select);
  return wrapper;
},

// Render loading animation for modal product grid using merchant-configured GIF or default spinner
renderModalProductsLoading(_stepIndex?: any) {
  const productGrid = this.elements?.modal?.querySelector('.product-grid');
  if (!productGrid) return;

  const gifUrl = this.selectedBundle?.loadingGif || this.config?.loadingGif || null;

  if (gifUrl) {
    const loading = document.createElement('div');
    loading.className = 'bw-bs-modal-loading';
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-label', 'Loading products');
    const image = document.createElement('img');
    image.className = 'bundle-loading-overlay__gif';
    image.src = gifUrl;
    image.alt = 'Loading...';
    loading.append(image);
    productGrid.replaceChildren(loading);
  } else {
    const loading = document.createElement('div');
    loading.className = 'bw-bs-modal-loading';
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-label', 'Loading products');
    const spinner = document.createElement('div');
    spinner.className = 'bundle-loading-overlay__spinner';
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Loading');
    loading.append(spinner);
    productGrid.replaceChildren(loading);
  }
},

// Preload next step's products in the background
preloadNextStep() {
  const nextStepIndex = this.currentStepIndex + 1;

  // Check if there is a next step
  if (nextStepIndex >= this.selectedBundle.steps.length) {
    return;
  }

  // Check if next step products are already loaded
  if (this.stepProductData[nextStepIndex]?.length > 0) {
    return;
  }


  // Load in background (don't await)
  this.loadStepProducts(nextStepIndex)
    .then(() => {
    })
    .catch((error: any)  => {
      // Don't show error to user - preloading is optimization only
    });
},

attachProductEventHandlers(productGrid: any, stepIndex: string|number) {
  // Remove existing event listeners to prevent duplicates
  const newProductGrid = productGrid.cloneNode(true);
  productGrid.parentNode.replaceChild(newProductGrid, productGrid);

  // Get step data for modal
  const step = this.selectedBundle.steps[stepIndex];
  // Helper to find product by ID
  const findProduct = (productId: any) => {
    return this.findProductBySelectionKey(this.stepProductData[stepIndex] || [], productId);
  };
  const hasDomElement = typeof Element !== 'undefined';
  const getEventTarget = (eventTarget: any) => {
    if (!eventTarget) return null;
    if (!hasDomElement) return eventTarget;
    return eventTarget instanceof Element ? eventTarget : eventTarget.parentElement;
  };

  const matchesSelector = (element: any, selector: string) => {
    if (!element) return false;
    if (typeof element.matches === 'function') {
      return element.matches(selector);
    }

    if (selector.startsWith('.')) {
      return element.classList?.contains(selector.slice(1));
    }

    const dataProductId = selector.match(/^\[data-product-id="(.+)"\]$/);
    if (dataProductId) {
      return element.dataset?.productId === dataProductId[1];
    }

    return false;
  };

  const findClosest = (element: any, selector: string) => {
    if (!element) return null;
    const selectors = selector
      .split(',')
      .map((part: string) => part.trim())
      .filter(Boolean);

    let current = element;
    while (current) {
      if (selectors.some((candidate: any) => matchesSelector(current, candidate))) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  };

  // Quantity button handlers
  newProductGrid.addEventListener('click', (e: any) => {
    const eventTarget = getEventTarget(e.target);
    if (!eventTarget) return;

    if (eventTarget.classList.contains('qty-btn') || eventTarget.classList.contains('inline-qty-btn')) {
      e.stopPropagation();
      const productId = eventTarget.dataset.productId;
      const isIncrease = eventTarget.classList.contains('qty-increase');
      const currentQuantity = this.getSelectedQuantity(stepIndex, productId);

      const newQuantity = isIncrease ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);
      this.updateProductSelection(stepIndex, productId, newQuantity);
    }
  });

  newProductGrid.addEventListener('keydown', (e: any) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const eventTarget = getEventTarget(e.target);
    const productImage = findClosest(eventTarget, '.product-image');
    if (!productImage) return;
    e.preventDefault();
    productImage.click?.();
  });

  // Add to Bundle button handler
  newProductGrid.addEventListener('click', (e: any) => {
    const eventTarget = getEventTarget(e.target);
    if (!eventTarget) return;

    if (eventTarget.classList.contains('product-add-btn')) {
      e.stopPropagation();
      const productId = eventTarget.dataset.productId;
      const product = findProduct(productId);

      if (!product) return;
      const currentQuantity = this.getSelectedQuantity(stepIndex, productId);
      const presentation = resolvePpbModalCardPresentation({
        quantity: currentQuantity,
        validation: this.selectedBundle?.validateQuantityPerProduct,
      });
      const directDefaultRequiredQuantity = this._getDirectDefaultRequiredQuantity(productId);
      const toggleQuantity = presentation.mode === 'maximum-reached'
        ? 0
        : directDefaultRequiredQuantity ?? 1;
      if (toggleQuantity > 0 || currentQuantity > 0) {
        this.updateProductSelection(stepIndex, productId, toggleQuantity);
      }
    }
  });

  // Modal cards keep details, variants, and Add as separate actions.
  newProductGrid.addEventListener('click', (e: any) => {
    const eventTarget = getEventTarget(e.target);
    if (!eventTarget) return;

    const productCard = findClosest(eventTarget, '.product-card');
    if (!productCard) return;
    if (findClosest(eventTarget, '.product-add-btn, .qty-btn, .inline-qty-btn, .variant-selector, button, input, select, a')) return;

    const productImage = findClosest(eventTarget, '.product-image');
    if (!productImage) return;

    const productId = productCard.dataset.productId;
    const product = findProduct(productId);
    if (!product) return;

    if (this.productModal && step) {
      const currentQuantity = this.getSelectedQuantity(stepIndex, productId);
      this.productModal.open(product, step, {
        originalSelectionKey: currentQuantity > 0 ? productId : '',
        selectedQuantity: currentQuantity || 1,
      });
    }
  });

  // Variant selector handler (for inline dropdown if used)
  newProductGrid.addEventListener('change', (e: any) => {
    if (e.target.classList.contains('variant-selector')) {
      e.stopPropagation();
      const newVariantId = e.target.value;
      const baseProductId = e.target.dataset.baseProductId;

      // Find the product and update its variant
      const product = this.stepProductData[stepIndex].find((p: any)  => p.id === baseProductId);
      if (product && product.variants) {
        const variantData = product.variants.find((v: any)  => v.id === newVariantId);
        if (variantData) {
          // Sync the new variant's stock fields onto the product so
          // getVariantAvailable() reflects post-swap state.
          product.quantityAvailable = typeof variantData.quantityAvailable === 'number'
            ? variantData.quantityAvailable
            : null;
          product.currentlyNotInStock = variantData.currentlyNotInStock === true;

          const productCard = e.target.closest('.product-card');
          applyProductPageVariantSelection({
            product,
            variantData,
            productCard,
            formatPrice: (amount: any) => CurrencyManager.convertAndFormat(
              getSubscriptionProductCardPrice(this, amount),
              CurrencyManager.getCurrencyInfo(),
            ),
          });

          // Re-render the active card context without mutating the bundle selection.
          this.renderModalProducts(stepIndex);
          this.updateModalNavigation();
          this.updateModalFooterMessaging();
        }
      }
    }
  });
}
};
