import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { CurrencyManager } from '../../shared/currency-manager.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { ConditionValidator } from '../../shared/condition-validator.js';
import { getDiscountProgressData } from '../../shared/engine/bundle-selectors.js';
import { createSharedProductCardElement } from '../../shared/components/product-card.js';
import { shouldRenderInlineVariantSelector } from '../../shared/variant-selector-policy.js';
import { resolveProductPageCardButtonText, resolveProductPageInlineAddText } from './modal-methods.js';
import { getSubscriptionProductCardPrice } from '../../shared/subscription-storefront-methods.js';
import { createGiftBadgeIcon } from '../../shared/svg-icons.js';

function bsIsDefaultStep(step: any) { return !!step?.isDefault; }

function bsGetDiscountBadgeLabel(step: any) { return step?.discountBadgeLabel || null; }

function makeSlotCardKeyboardAccessible(card: HTMLDivElement, activate: any) {
  card.setAttribute('role', 'button');
  card.tabIndex = 0;
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (event: any) => {
    if (event.target && event.target !== card) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    activate();
  });
}

export function resolveSelectedSlotTitle(title: string, _isVertical: boolean) {
  return String(title || '');
}

function resolveFilledSlotRemoveLabel(
  resolveText: ((key: string, fallback: string) => string) | undefined,
  productTitle: unknown,
) {
  const fallback = 'Remove this product';
  const template = typeof resolveText === 'function'
    ? String(resolveText('removeProductFromFooterText', fallback) || fallback)
    : fallback;
  const title = String(productTitle || '').trim();

  if (!title) return template.replace('{{stepName}}', '').trim();
  if (template.includes('{{stepName}}')) {
    return template.replace('{{stepName}}', title);
  }
  return `${template}: ${title}`;
}

function createFilledSlotRemoveButton({ label, onRemove }: any) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'step-clear-badge';
  button.title = label;
  button.setAttribute('aria-label', label);
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '×';
  button.appendChild(icon);
  button.addEventListener('click', (event: any) => {
    event.stopPropagation();
    onRemove(event);
  });
  return button;
}

export function resolveSelectedSlotContent(
  product: any = {},
  currencyInfo = CurrencyManager.getCurrencyInfo(),
) {
  const rawVariantTitle = String(product.variantTitle || '').trim();
  const variantTitle = rawVariantTitle && rawVariantTitle !== 'Default Title'
    ? rawVariantTitle
    : '';
  const rawTitle = String(product.parentTitle || product.title || '');
  const expandedVariantSuffix = variantTitle ? ` - ${variantTitle}` : '';
  const title = !product.parentTitle && expandedVariantSuffix && rawTitle.endsWith(expandedVariantSuffix)
    ? rawTitle.slice(0, -expandedVariantSuffix.length)
    : rawTitle;
  const price = Number(product.price);
  const compareAtPrice = Number(product.compareAtPrice);
  const hasPrice = product.price !== null
    && product.price !== undefined
    && Number.isFinite(price);
  const hasCompareAtPrice = hasPrice
    && product.compareAtPrice !== null
    && product.compareAtPrice !== undefined
    && Number.isFinite(compareAtPrice)
    && compareAtPrice > price;

  return {
    title,
    variantTitle,
    priceText: hasPrice ? CurrencyManager.convertAndFormat(price, currencyInfo) : '',
    compareAtPriceText: hasCompareAtPrice
      ? CurrencyManager.convertAndFormat(compareAtPrice, currencyInfo)
      : '',
  };
}

function getStepSlotElements(widget: any, stepIndex: any) {
  const candidates = widget.elements?.stepsContainer?.querySelectorAll?.('[data-step-index]') || [];
  return [...candidates].filter(
    candidate => String(candidate.dataset?.stepIndex) === String(stepIndex),
  );
}

function focusModalSlotAfterRemoval(widget: any, stepIndex: any, slotIndex: number) {
  const focusRecovery = () => {
    const sameStep = getStepSlotElements(widget, stepIndex);
    const nextFocus = sameStep[slotIndex] || sameStep.at(-1);
    nextFocus?.focus?.();
  };

  if (typeof globalThis.requestAnimationFrame === 'function') {
    globalThis.requestAnimationFrame(focusRecovery);
  } else {
    globalThis.queueMicrotask?.(focusRecovery);
  }
}

function createInpageProductLoadingElement(rowCount = 3) {
  const root = document.createElement('div');
  root.className = 'bw-ppb-inpage-loading';
  root.setAttribute('role', 'status');
  root.setAttribute('aria-label', 'Loading products');
  Array.from({ length: rowCount }, (_, index) => {
    const row = document.createElement('div');
    row.className = 'bw-ppb-inpage-loading-row';
    row.setAttribute('aria-hidden', 'true');
    row.dataset.loadingRow = String(index + 1);
    const media = document.createElement('span');
    media.className = 'bw-ppb-inpage-loading-media';
    const body = document.createElement('span');
    body.className = 'bw-ppb-inpage-loading-body';
    const title = document.createElement('span');
    title.className = 'bw-ppb-inpage-loading-line bw-ppb-inpage-loading-line--title';
    const price = document.createElement('span');
    price.className = 'bw-ppb-inpage-loading-line bw-ppb-inpage-loading-line--price';
    body.append(title, price);
    const action = document.createElement('span');
    action.className = 'bw-ppb-inpage-loading-action';
    row.append(media, body, action);
    root.append(row);
  });
  return root;
}

export function shouldDisplayVariantsAsIndividualForInpageCategory(step: any, stepIndex: string|number, activeCategoryIndexes: any = {}) {
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

export function getCascadeSoleVariantDisplayProduct(product: any = {}) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const soleVariantTitle = typeof variants[0]?.title === 'string' ? variants[0].title.trim() : '';
  const hadMultipleSourceVariants = Number(product.sourceVariantCount || 0) > 1;

  if (product.parentProductId || !hadMultipleSourceVariants || variants.length !== 1) return product;
  if (!soleVariantTitle || soleVariantTitle === 'Default Title') return product;

  return { ...product, variantTitle: soleVariantTitle };
}

export function resolveInpageProductSelection(
  product: any = {},
  stepSelections: any = {},
  normalizeSelectionKey = (value: any) => String(value || ''),
  selectedProductCategoryIndexes: any = {},
  activeCategoryIndex: any = null,
) {
  const defaultSelectionKey = product.selectionId || product.variantId || product.id || '';
  const candidateIds: any[] = [defaultSelectionKey, product.id, product.productId];
  if (Array.isArray(product.variants)) {
    candidateIds.push(...product.variants.map((variant: any) => variant.id));
  }

  const normalizedCandidates = new Set(
    candidateIds.map(normalizeSelectionKey).filter(Boolean),
  );
  const restoredEntry = Object.entries(stepSelections || {}).find(
    ([selectionKey, rawQuantity]: any) => (
      Number(rawQuantity) > 0
      && normalizedCandidates.has(normalizeSelectionKey(selectionKey))
    ),
  );

  if (restoredEntry) {
    const normalizedSelectionKey = normalizeSelectionKey(restoredEntry[0]);
    const categoryOwnerEntry = Object.entries(selectedProductCategoryIndexes || {}).find(
      ([selectionKey]: any) => normalizeSelectionKey(selectionKey) === normalizedSelectionKey,
    );
    const categoryOwner = categoryOwnerEntry ? Number(categoryOwnerEntry[1]) : null;
    const belongsToActiveCategory = (
      activeCategoryIndex === null
      || categoryOwner === null
      || categoryOwner === activeCategoryIndex
    );
    return {
      selectionKey: restoredEntry[0],
      quantity: belongsToActiveCategory ? Number(restoredEntry[1]) || 0 : 0,
    };
  }

  return {
    selectionKey: defaultSelectionKey,
    quantity: 0,
  };
}

export const ProductPageInpageRenderMethods: Record<string, any> & ThisType<any> = {
_renderInpageStepProducts(stepIndex: string|number, target: any) {
  const rawProducts = this.stepProductData[stepIndex] || [];
  if (!this._inpageStepProductsLoaded) this._inpageStepProductsLoaded = {};
  target.classList.toggle('bw-ppb-cascade-product-list', this._isProductPageCascadeTemplate());
  target.classList.toggle('bw-ppb-grid-product-grid', this._isProductPageGridTemplate());
  const currentStep = this.selectedBundle?.steps?.[stepIndex];
  const prependStepBanner = () => {
    const banner = this._createStepBannerImage?.(currentStep);
    if (banner) target.prepend(banner);
  };

  const stepProductsLoaded = this._inpageStepProductsLoaded[stepIndex] === true;
  if (rawProducts.length === 0 && !stepProductsLoaded && !(this._stepFetchFailed && this._stepFetchFailed[stepIndex])) {
    target.setAttribute?.('aria-busy', 'true');
    target.replaceChildren(createInpageProductLoadingElement());
    prependStepBanner();
    this.loadStepProducts(stepIndex).then(() => {
      this._inpageStepProductsLoaded[stepIndex] = true;
      if (target.isConnected) this._renderInpageStepProducts(stepIndex, target);
    }).catch(() => {
      if (!this._stepFetchFailed) this._stepFetchFailed = {};
      this._stepFetchFailed[stepIndex] = true;
      if (target.isConnected) this._renderInpageStepProducts(stepIndex, target);
    });
    return;
  }

  const categoryDisplaysVariantsAsIndividual = shouldDisplayVariantsAsIndividualForInpageCategory(
    currentStep,
    stepIndex,
    this.activeInpageCategoryIndexes,
  );
  const products = this._filterProductsForInpageCategory(
    currentStep,
    categoryDisplaysVariantsAsIndividual
      ? this.expandProductsByVariant(rawProducts)
      : rawProducts,
    stepIndex
  );
  target.setAttribute?.('aria-busy', 'false');
  if (products.length === 0) {
    const message = document.createElement('p');
    message.className = this._stepFetchFailed?.[stepIndex] ? 'modal-fetch-error' : 'no-products-message';
    message.textContent = this._stepFetchFailed?.[stepIndex]
      ? 'Could not load products. Please check your connection and try again.'
      : 'No products are configured for this step.';
    target.replaceChildren(message);
    prependStepBanner();
    return;
  }

  const usesCascadeCards = this._isProductPageCascadeTemplate();
  const usesGridCards = this._isProductPageGridTemplate();
  const widgetConfig = this.config || {};
  const productQuantityLimit = ConditionValidator.getAllowedQuantityPerProduct(
    this.selectedBundle?.validateQuantityPerProduct
  );
  const currencyInfo = CurrencyManager.getCurrencyInfo();
  const inlineAddText = resolveProductPageInlineAddText(this._resolveText?.bind(this));

  const cards = products.map((product: any)  => {
    const directSelectionKey = product.selectionId || product.variantId || product.id;
    const restoredGridSelection = usesGridCards
      ? resolveInpageProductSelection(
        product,
        this.selectedProducts?.[stepIndex],
        (value) => this.normalizeSelectionKey(value),
        this.selectedProductCategoryIndexes?.[stepIndex],
        this.activeInpageCategoryIndexes?.[stepIndex] ?? 0,
      )
      : null;
    const selectionKey = restoredGridSelection?.selectionKey || directSelectionKey;
    const productSelection: any = { ...product, selectionId: selectionKey };
    const currentQuantity = restoredGridSelection?.quantity
      ?? this.getSelectedQuantity(stepIndex, selectionKey);
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
    const variantSelectorElement = this.renderInlineCardVariantSelector(product, currentStep);

    if (usesCascadeCards) {
      const cascadeProduct = getCascadeSoleVariantDisplayProduct(productSelection);
      return createSharedProductCardElement(
        cascadeProduct,
        currentQuantity,
        currencyInfo,
        {
          displayPrice: getSubscriptionProductCardPrice(this, cascadeProduct.price),
          mode: 'row',
          className: [
            'bw-ppb-cascade-product-row',
            'wpbMixCascadeProductWrapper',
            variantSelectorElement ? 'bw-ppb-cascade-product-row--has-variant-selector' : '',
            currentQuantity > 0 ? 'selected' : '',
            outOfStock ? 'is-out-of-stock' : '',
          ].filter(Boolean).join(' '),
          description: '',
          displaySeeMoreLink: false,
          expandProductCardOnHover: false,
          variantSelectorElement,
          addButtonText: resolveProductPageCardButtonText({ currentQuantity, currentStep, outOfStock, outOfStockText, defaultAddText: inlineAddText }),
          addDisabled: outOfStock,
          increaseDisabled,
          stockBadgeElement,
        }
      );
    }

    if (usesGridCards) {
      return createSharedProductCardElement(
        productSelection,
        currentQuantity,
        currencyInfo,
        {
          displayPrice: getSubscriptionProductCardPrice(this, product.price),
          variantSelectorElement,
          description: '',
          displaySeeMoreLink: false,
          expandProductCardOnHover: false,
          mode: 'grid',
          className: `bw-ppb-grid-product-card ${outOfStock ? 'is-out-of-stock' : ''}`.trim(),
          addButtonText: resolveProductPageCardButtonText({ currentQuantity, currentStep, outOfStock, outOfStockText, defaultAddText: inlineAddText }),
          selectedAction: productQuantityLimit === 1 ? 'button' : undefined,
          selectedButtonText: resolveProductPageCardButtonText({ currentQuantity, currentStep, outOfStock, outOfStockText, defaultAddText: inlineAddText }),
          addDisabled: outOfStock,
          increaseDisabled,
          stockBadgeElement,
        }
      );
    }

    return createSharedProductCardElement(
      productSelection,
      currentQuantity,
      currencyInfo,
      {
        displayPrice: getSubscriptionProductCardPrice(this, product.price),
        variantSelectorElement,
        className: `bw-product-card--legacy ${usesGridCards ? 'bw-ppb-grid-product-card' : ''} ${outOfStock ? 'is-out-of-stock' : ''}`.trim(),
        description: '',
        displaySeeMoreLink: false,
        expandProductCardOnHover: false,
        mode: usesGridCards ? 'grid' : 'row',
        addButtonText: resolveProductPageCardButtonText({ currentQuantity, currentStep, outOfStock, outOfStockText, defaultAddText: inlineAddText }),
        selectedAction: productQuantityLimit === 1 ? 'button' : undefined,
        selectedButtonText: resolveProductPageCardButtonText({ currentQuantity, currentStep, outOfStock, outOfStockText, defaultAddText: inlineAddText }),
        addDisabled: outOfStock,
        increaseDisabled,
        stockBadgeElement,
      }
    );
  });
  target.replaceChildren(...cards);

  prependStepBanner();
  this.attachProductEventHandlers(target, stepIndex);
},

renderInlineCardVariantSelector(product: any, step: any) {
  if (!shouldRenderInlineVariantSelector({
    bundleVariantSelectorEnabled: this.selectedBundle?.variantSelectorEnabled !== false,
    product,
    displayVariantsAsIndividualProducts: step?.displayVariantsAsIndividual === true || step?.displayVariantsAsIndividualProducts === true,
  })) {
    return null;
  }

  return this.renderVariantSelector(product);
},

// Create an "add more" card for incomplete steps
createAddMoreCard(step: any, stepIndex: number, currentCount: number) {
  const stepBox = document.createElement('div');
  stepBox.className = 'step-box add-more-card';
  stepBox.dataset.stepIndex = String(stepIndex);

  // Plus icon
  const plusIcon = document.createElement('span');
  plusIcon.className = 'plus-icon';
  plusIcon.textContent = '+';
  stepBox.appendChild(plusIcon);

  // Add step name
  const stepName = document.createElement('p');
  stepName.className = 'step-name';
  stepName.textContent = step.name || `Step ${stepIndex + 1}`;
  stepBox.appendChild(stepName);

  // Add remaining count text
  const selectionCount = document.createElement('div');
  selectionCount.className = 'step-selection-count';
  const operator = step.conditionOperator;
  const parsedRequired = Number.parseFloat(step.conditionValue);
  const rawRequired = Number.isFinite(parsedRequired) && parsedRequired >= 0 ? parsedRequired : 0;
  const requiredCount = operator === BUNDLE_WIDGET.CONDITION_OPERATORS.GREATER_THAN
    ? rawRequired + 1
    : rawRequired;
  const remaining = requiredCount - currentCount;
  if (remaining > 0) {
    selectionCount.textContent = `Add ${remaining} more`;
  }
  stepBox.appendChild(selectionCount);

  // Add click handler to open modal
  stepBox.addEventListener('click', (event: any) => this.openModal(stepIndex, event.currentTarget));

  return stepBox;
},

// Create a state card for a selected product
createSelectedProductCard(item: any, cardIndex: string|undefined) {
  const { product, stepIndex, step, variantId, instanceIndex } = item;

  const isDefault = bsIsDefaultStep(step);
  const badgeLabel = bsGetDiscountBadgeLabel(step);
  const content = resolveSelectedSlotContent(product);

  const stepBox = document.createElement('div');
  stepBox.className = 'step-box step-completed product-card-state bw-slot-card bw-slot-card--filled gbbMixSelectedProductCard';
  stepBox.dataset.stepIndex = stepIndex;
  stepBox.dataset.variantId = variantId;
  stepBox.dataset.cardIndex = cardIndex;

  // Remove button — hidden for default (non-removable) steps
  if (!isDefault) {
    const clearBadge = createFilledSlotRemoveButton({
      label: resolveFilledSlotRemoveLabel(this._resolveText?.bind(this), content.title),
      onRemove: () => {
        const stepSlots = getStepSlotElements(this, stepIndex);
        const slotIndex = Math.max(0, stepSlots.indexOf(stepBox));
        this.removeProductFromSelection(stepIndex, variantId);
        focusModalSlotAfterRemoval(this, stepIndex, slotIndex);
      },
    });
    stepBox.appendChild(clearBadge);
  }

  // Product image container
  const imagesContainer = document.createElement('div');
  imagesContainer.className = 'bw-slot-card__image-wrapper';
  const img = document.createElement('img');
  img.src = product.imageUrl || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
  img.alt = product.title || '';
  img.className = 'bw-slot-card__image';
  imagesContainer.appendChild(img);
  stepBox.appendChild(imagesContainer);

  // Discount badge (bottom-sheet mode only, when step has a discountBadgeLabel)
  if (badgeLabel) {
    const badge = document.createElement('span');
    badge.className = 'bw-slot-discount-badge';
    badge.textContent = badgeLabel;
    stepBox.appendChild(badge);
  }

  const identity = document.createElement('div');
  identity.className = 'bw-slot-card__identity';

  const productTitle = document.createElement('p');
  productTitle.className = 'step-name step-name-completed product-title-state';
  const displayTitle = resolveSelectedSlotTitle(
    content.title,
    this._usesVerticalModalSlotLayout?.() === true,
  );
  productTitle.textContent = displayTitle;
  productTitle.title = content.title;
  identity.appendChild(productTitle);

  if (content.variantTitle) {
    const variantTitle = document.createElement('p');
    variantTitle.className = 'bw-slot-card__variant';
    variantTitle.textContent = content.variantTitle;
    identity.appendChild(variantTitle);
  }

  if (content.priceText) {
    const prices = document.createElement('div');
    prices.className = 'bw-slot-card__prices';

    const price = document.createElement('span');
    price.className = 'bw-slot-card__price';
    price.textContent = content.priceText;
    prices.appendChild(price);

    if (content.compareAtPriceText) {
      const compareAtPrice = document.createElement('s');
      compareAtPrice.className = 'bw-slot-card__compare-at-price';
      compareAtPrice.textContent = content.compareAtPriceText;
      prices.appendChild(compareAtPrice);
    }

    identity.appendChild(prices);
  }

  stepBox.appendChild(identity);

  return stepBox;
},

/**
 * Creates a slot card for a default/compulsory product step.
 * Looks like a filled card but has no remove button and shows an "Included" badge.
 */
createDefaultProductCard(step: any, stepIndex: string|undefined, product: any) {
  const stepBox = document.createElement('div');
  stepBox.className = 'step-box bw-slot-card bw-slot-card--filled gbbMixSelectedProductCard';
  stepBox.dataset.stepIndex = stepIndex;
  stepBox.dataset.variantId = step.defaultVariantId || '';
  // Default cards are not clickable
  stepBox.style.cursor = 'default';

  // Product image
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'bw-slot-card__image-wrapper';
  const img = document.createElement('img');
  img.src = product.imageUrl || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
  img.alt = product.title || '';
  img.className = 'bw-slot-card__image';
  imageWrapper.appendChild(img);
  stepBox.appendChild(imageWrapper);

  // Product title
  const productTitle = document.createElement('p');
  productTitle.className = 'step-name bw-slot-card__label';
  const displayTitle = product.title.length > 25
    ? product.title.substring(0, 25) + '...'
    : product.title;
  productTitle.textContent = displayTitle;
  productTitle.title = product.title;
  stepBox.appendChild(productTitle);

  // "Included" badge — bottom-left
  const badge = document.createElement('span');
  badge.className = 'bw-slot-card__included-badge';
  const checkmark = document.createElement('span');
  checkmark.setAttribute('aria-hidden', 'true');
  checkmark.textContent = '✓';
  badge.append(checkmark, document.createTextNode(' Included'));
  stepBox.appendChild(badge);

  return stepBox;
},

/**
 * Placeholder card for a default step while its product data is still loading.
 */
_createDefaultLoadingCard(step: any, stepIndex: number) {
  const stepBox = document.createElement('div');
  stepBox.className = 'step-box bw-slot-card bw-slot-card--filled gbbMixSelectedProductCard is-loading';
  stepBox.dataset.stepIndex = String(stepIndex);
  stepBox.style.cursor = 'default';
  stepBox.style.opacity = '0.7';

  const label = document.createElement('p');
  label.className = 'step-name bw-slot-card__label';
  label.textContent = step.name || `Step ${stepIndex + 1}`;
  stepBox.appendChild(label);

  const badge = document.createElement('span');
  badge.className = 'bw-slot-card__included-badge';
  badge.textContent = 'Included';
  stepBox.appendChild(badge);

  return stepBox;
},

/**
 * Creates the free gift slot card.
 * Shows a ribbon icon, "Free {name}" label.
 * Non-clickable (locked) until all paid steps are complete.
 */
createFreeGiftSlotCard(step: any, stepIndex: number) {
  const unlocked = this.isFreeGiftUnlocked;
  const stepBox = document.createElement('div');
  stepBox.dataset.stepIndex = String(stepIndex);

  // Check if free gift step already has a selection
  const stepSelections = this.selectedProducts[stepIndex] || {};
  const selectedEntries = Object.entries(stepSelections).filter(([, qty]: any) => qty > 0);

  if (selectedEntries.length > 0 && unlocked) {
    // Show selected product for free gift slot
    const products = this.stepProductData[stepIndex] || [];
    const [variantId] = selectedEntries[0];
    const product = this.findProductBySelectionKey(products, variantId);
    if (product) {
      // Show filled state for free gift
      stepBox.className = 'step-box step-completed product-card-state bw-slot-card bw-slot-card--filled gbbMixSelectedProductCard';

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'bw-slot-card__image-wrapper';
      const img = document.createElement('img');
      img.src = product.imageUrl || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
      img.alt = product.title || '';
      img.className = 'bw-slot-card__image';
      imageWrapper.appendChild(img);
      stepBox.appendChild(imageWrapper);

      // Remove button
      const clearBadge = createFilledSlotRemoveButton({
        label: resolveFilledSlotRemoveLabel(this._resolveText?.bind(this), product.title),
        onRemove: () => {
        this.removeProductFromSelection(stepIndex, variantId);
        },
      });
      stepBox.appendChild(clearBadge);

      const productTitle = document.createElement('p');
      productTitle.className = 'step-name step-name-completed product-title-state';
      const displayTitle = resolveSelectedSlotTitle(
        product.title,
        this._usesVerticalModalSlotLayout?.() === true,
      );
      productTitle.textContent = displayTitle;
      stepBox.appendChild(productTitle);

      // Ribbon overlay even in filled state
      stepBox.appendChild(this._createRibbonSvg());
      return stepBox;
    }
  }

  // Empty / locked state
  stepBox.className = `step-box bw-slot-card bw-slot-card--empty${!unlocked ? ' bw-slot-card--locked' : ''}`;

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'bw-slot-card__plus-icon bw-slot-card__plus-icon--free-gift';
  this._appendSlotIcon(iconWrapper);
  stepBox.appendChild(iconWrapper);

  const label = document.createElement('p');
  label.className = 'step-name bw-slot-card__label';
  label.textContent = step.addonLabel || `Free ${step.name || `Step ${stepIndex + 1}`}`;
  stepBox.appendChild(label);

  // Red ribbon SVG overlay — top-right (free gift differentiator in all modes)
  stepBox.appendChild(this._createRibbonSvg());

  if (unlocked) {
    makeSlotCardKeyboardAccessible(stepBox, () => this.openModal(stepIndex));
  }

  return stepBox;
},

/** Returns the red ribbon SVG element for free gift cards */
_createRibbonSvg() {
  const ribbon = document.createElement('span');
  ribbon.className = 'bw-slot-card__ribbon';
  // Check for a merchant-configured badge image via Settings design CSS variable
  const badgeUrl = getComputedStyle(document.documentElement)
    .getPropertyValue('--bundle-free-gift-badge-url').trim();
  const hasMerchantBadge = badgeUrl && badgeUrl !== 'none' && badgeUrl !== '';
  if (hasMerchantBadge) {
    // Strip the url("...") wrapper to get the raw URL
    const rawUrl = badgeUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    const img = document.createElement('img');
    img.src = rawUrl;
    img.alt = 'Gift badge';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    ribbon.appendChild(img);
  } else {
    ribbon.append(createGiftBadgeIcon(document));
  }
  return ribbon;
},

// Remove a selected product entirely from a slot.
removeProductFromSelection(stepIndex: string|number, variantId: any) {
  // Guard: default products are compulsory — they must always stay in selectedProducts
  const step = this.selectedBundle?.steps[stepIndex];
  const normalizedVariantId = this.normalizeSelectionKey(variantId);
  if (!normalizedVariantId) return;

  if (step?.isDefault && this.normalizeSelectionKey(step.defaultVariantId) === normalizedVariantId) return;
  if (this._isDirectDefaultVariant(normalizedVariantId)) return;

  this.setSelectedQuantity(stepIndex, normalizedVariantId, 0);

  // Update UI
  this.renderSteps();
  this._renderDirectDefaultProducts();
  this.updateAddToCartButton();
  this.updateFooterMessaging();

  // Show toast notification
  ToastManager.show('Product removed from bundle');
}

// Full-page bundle layout (horizontal tabs)
};
