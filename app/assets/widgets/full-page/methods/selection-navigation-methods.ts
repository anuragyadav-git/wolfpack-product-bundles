import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { calculateBundleDiscountForPurchaseOption } from '../../shared/subscription-storefront-methods.js';
import { calculateBundleTotalForPurchaseOption } from '../../shared/subscription-storefront-methods.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { ConditionValidator } from '../../shared/condition-validator.js';
import {
  captureDiscountTierState,
  dispatchDiscountTierTransition,
} from '../../shared/discount-tier-feedback.js';

function getSelectionId(item: any = {}) {
  return String(item?.selectionId || '');
}

function findStepSelectionMetric(products: any[] = [], selectionId = '') {
  const normalizedSelectionId = String(selectionId || '');
  for (const product of products) {
    if (getSelectionId(product) === normalizedSelectionId) {
      return { product, metric: product };
    }
    const variant = (Array.isArray(product?.variants) ? product.variants : [])
      .find((candidate: any)  => getSelectionId(candidate) === normalizedSelectionId);
    if (variant) return { product, metric: variant };
  }
  return { product: null, metric: null };
}

function replaceConditionValue(template: any, conditionType: string, required: number) {
  const value = String(required);
  if (conditionType === 'amount') {
    return String(template)
      .replace(/\{\{\s*conditionAmount\s*\}\}/g, value)
      .replace(/\{conditionAmount\}/g, value)
      .replace(/##conditionAmount##/g, value);
  }
  if (conditionType === 'weight') {
    return String(template)
      .replace(/\{\{\s*conditionWeight\s*\}\}/g, value)
      .replace(/\{conditionWeight\}/g, value)
      .replace(/##conditionWeight##/g, value);
  }
  return String(template)
    .replace(/\{\{\s*conditionQuantity\s*\}\}/g, value)
    .replace(/\{conditionQuantity\}/g, value)
    .replace(/##conditionQuantity##/g, value);
}

const normalizeCategoryProductId = (product: any) => {
  return getSelectionId(product);
};

export function shouldAutoAdvanceFullPageStep({ quantity = 0, step = null }: any = {}) {
  if (
    quantity > 0 &&
    step?.autoNextStepOnConditionMet === true &&
    step?.conditionType &&
    step?.conditionOperator &&
    Number(step?.conditionValue || 0) > 0
  ) {
    return true;
  }

  const categories = Array.isArray(step?.categories) ? step.categories : [];
  const categoryRuleCategories = categories.filter((category: any)  =>
    Array.isArray(category?.conditions) && category.conditions.length > 0
  );

  if (!(quantity > 0) || categoryRuleCategories.length === 0) {
    return false;
  }

  return categoryRuleCategories.some((category: any)  => category.autoNextStepOnConditionMet === true);
}

export function getFullPageStepConditionValidationMessage(step: any, resolveText: any = null) {
  const conditionType = step?.conditionType;
  if (!['quantity', 'amount', 'weight'].includes(conditionType)) {
    return 'Please meet the quantity conditions for the current step before proceeding.';
  }

  const required = Number(step.conditionValue || 0);
  if (!Number.isFinite(required) || required <= 0) {
    return 'Please meet the quantity conditions for the current step before proceeding.';
  }

  const operatorKey = ({
    equal_to: 'EqualTo',
    greater_than_or_equal_to: 'GreaterThanOrEqualTo',
    less_than_or_equal_to: 'LessThanOrEqualTo',
  } as Record<string, string>)[step.conditionOperator];
  if (!operatorKey) {
    return 'Please meet the quantity conditions for the current step before proceeding.';
  }

  const productLabel = required === 1 ? 'product' : 'products';
  const fallbacks: any = {
    quantity: {
      EqualTo: `Add exactly ${required} ${productLabel} on this step`,
      GreaterThanOrEqualTo: `Add at least ${required} ${productLabel} on this step`,
      LessThanOrEqualTo: `Add at most ${required} ${productLabel} on this step`,
    },
    amount: {
      EqualTo: `Add products worth ${required} on this step`,
      GreaterThanOrEqualTo: `Add products worth at least ${required} on this step`,
      LessThanOrEqualTo: `Add products worth maximum of ${required} on this step`,
    },
    weight: {
      EqualTo: `Add products weighing ${required} on this step`,
      GreaterThanOrEqualTo: `Add products weighing at least ${required} on this step`,
      LessThanOrEqualTo: `Add products weighing maximum of ${required} on this step`,
    },
  };
  const fallback = fallbacks[conditionType][operatorKey];
  const template = typeof resolveText === 'function'
    ? resolveText(`condition${conditionType[0].toUpperCase()}${conditionType.slice(1)}${operatorKey}`, fallback)
    : fallback;
  return replaceConditionValue(template, conditionType, required);
}

function buildCategoryRuleValidationStep(step: any, stepIndex: any, stepCollectionProductIds: any = {}, extractId = (value: any)  => value) {
  if (!ConditionValidator.isCategoryRuleMode(step)) return step;
  const categories = Array.isArray(step?.categories) ? step.categories : [];

  return {
    ...step,
    categories: categories.map((category: any)  => {
      const products = Array.isArray(category?.products) ? [...category.products] : [];
      const seenProductIds = new Set(products.map(product => {
        return normalizeCategoryProductId(product);
      }));
      const addCollectionHandle = (collection: any) => {
        const handle = collection?.handle;
        if (!handle) return;
        const productIds = stepCollectionProductIds[`${stepIndex}:${handle}`] || [];
        productIds.forEach((productId: null)  => {
          const normalizedId = String(productId == null ? '' : productId);
          if (!normalizedId || seenProductIds.has(normalizedId)) return;
          seenProductIds.add(normalizedId);
          products.push({ selectionId: normalizedId });
        });
      };

      (category.collections || []).forEach(addCollectionHandle);

      return { ...category, products };
    }),
  };
}

export const fullPageSelectionNavigationMethods: Record<string, any> & ThisType<any> = {
getStepConditionValidationMessage(stepIndex: any = undefined) {
  if (stepIndex === undefined) stepIndex = this.currentStepIndex;
  return getFullPageStepConditionValidationMessage(
    this.selectedBundle?.steps?.[stepIndex],
    this._resolveText?.bind(this),
  );
},

updateProductSelection(stepIndex: string|number, productId: string|number, newQuantity: number) {
  const discountTierBefore = captureDiscountTierState(this);
  let quantity = Math.max(0, newQuantity);

  // Clamp against real per-variant stock before doing anything else.
  // Uses quantityAvailable from the Storefront API (see getVariantAvailable).
  // Adding 0 always allowed (that is a removal).
  if (quantity > 0) {
    const { available, outOfStock } = this.getVariantAvailable(stepIndex, productId);
    if (outOfStock) {
      ToastManager.show('This item is out of stock.');
      return;
    }
    if (available !== null && available > 0 && quantity > available) {
      quantity = available;
      ToastManager.show('Only ' + available + ' in stock — quantity adjusted.');
    }
  }

  // Validate step conditions
    if (!this.validateStepCondition(stepIndex, productId, quantity)) {
      return;
    }

  const currentQuantity = this.selectedProducts[stepIndex]?.[productId] || 0;
  const productQuantityCheck = ConditionValidator.canUpdateProductQuantity(
    this.selectedBundle?.validateQuantityPerProduct,
    currentQuantity,
    quantity,
  );
  if (!productQuantityCheck.allowed) {
    ToastManager.show('Maximum allowed quantity per product is ' + productQuantityCheck.limit + '.');
    return;
  }

  // Update selection
  if (quantity > 0) {
    this.selectedProducts[stepIndex][productId] = quantity;
  } else {
    delete this.selectedProducts[stepIndex][productId];
  }

  // Storefront analytics: emit selection delta + first-interaction beacon.
  const selectionEventName = (currentQuantity === 0 && quantity > 0) ? 'product-selected'
    : (currentQuantity > 0 && quantity === 0) ? 'product-deselected'
    : 'product-quantity-changed';
  this._emitStorefrontEvent(selectionEventName, { stepIndex, productId, previousQuantity: currentQuantity, quantity });
  this._emitStorefrontEvent('session-engaged', { trigger: selectionEventName });
  this._sendEngagementBeacon('session-engaged');

  // Re-lock free gift if a paid item was just removed and conditions no longer met
  this._syncFreeGiftLock();

  // Update UI without re-rendering the entire modal (prevents event listener duplication)
  this.updateProductQuantityDisplay(stepIndex, productId, quantity);
  this.renderModalTabs();
  this.updateModalNavigation();
  this.updateModalFooterMessaging();

  // For full-page bundles, re-render the footer/sidebar to show selected products
  const bundleType = this.container.dataset.bundleType;
  if (bundleType === 'full_page') {
    const sidePanel = this.elements.stepsContainer.querySelector('.full-page-side-panel');
    this.renderSidePanel(sidePanel);
    if (this._syncSummaryPresentationMode?.() === 'tray') {
      this._renderMobileSummaryTray({ preserveOpen: true });
    }
    // Update step timeline tabs so completion state, images, counts, and
    // click listeners all reflect the new selection immediately.
    this.updateStepTimeline();

    // Auto-advance is category-rule only. Step rules gate navigation, but the reference
    // exposes the auto-next opt-in only on category rules.
    const _autoAdvanceStep = this.selectedBundle?.steps?.[this.currentStepIndex];
    if (!this._autoAdvancePending && shouldAutoAdvanceFullPageStep({ quantity, step: _autoAdvanceStep })) {
      const isLastStep = this.currentStepIndex === this.selectedBundle.steps.length - 1;
      if (!isLastStep && this.isStepCompleted(this.currentStepIndex) && this.canNavigateToStep(this.currentStepIndex + 1)) {
        this._autoAdvancePending = true;
        setTimeout(() => {
          this._autoAdvancePending = false;
          // Re-check in case the shopper removed something during the delay
          if (this.isStepCompleted(this.currentStepIndex) && this.canNavigateToStep(this.currentStepIndex + 1)) {
            this.activeCollectionId = null;
            this.searchQuery = '';
            this.currentStepIndex++;
            this._sidebarAdvanceToNextStep();
          }
        }, 120);
      }
    }
  }

  dispatchDiscountTierTransition({
    root: this.container,
    before: discountTierBefore,
    after: captureDiscountTierState(this),
  });
},

_shouldRenderProductSlots() {
  return this.selectedBundle?.productSlotsEnabled === true;
},

syncProductQuantityIncreaseState(increaseButton: any, quantity: any) {
  if (!increaseButton) return;

  const disabled = ConditionValidator.isProductQuantityIncreaseDisabled(
    this.selectedBundle?.validateQuantityPerProduct,
    quantity,
  );
  increaseButton.disabled = disabled;
  if (disabled) {
    increaseButton.setAttribute('aria-disabled', 'true');
  } else {
    increaseButton.removeAttribute('aria-disabled');
  }
},

  updateProductQuantityDisplay(stepIndex: string | number, productId: string | number, quantity: number) {
  if (this.usesSelectedQuantityBadge()) {
    this.refreshCurrentProductGrid(stepIndex);
    if (this.elements?.modal?.querySelector('.product-grid')) {
      this.renderModalProducts(stepIndex);
    }
    return;
  }

  // Update quantity display without full re-render
  const productCard = this.container.querySelector('[data-product-id="' + productId + '"]');
  if (!productCard) return;
  const step = this.selectedBundle?.steps?.[stepIndex] || {};
  const sanitizeAria = (value: any, fallback?: string) => String(value ?? fallback ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#96;');
  const quantityLabel = this._resolveText?.('quantityLabel', 'Quantity') || 'Quantity';
  const addButtonAriaLabel = sanitizeAria(this._resolveText?.('addButtonText', 'Add'), 'Add');
  const removeLabelTemplate = this._resolveText?.(
    'removeProductFromFooterText',
    'Remove this product',
  ) || 'Remove this product';
  const removeLabel = removeLabelTemplate
    .replace('{{stepName}}', step?.title || 'step')
    .replace('{{quantity}}', String(quantity));
  const decreaseLabel = sanitizeAria(
    this._resolveText?.('quantityDecreaseText', 'Decrease quantity') || 'Decrease quantity',
  );
  const increaseLabel = sanitizeAria(
    this._resolveText?.('quantityIncreaseText', 'Increase quantity') || 'Increase quantity',
  );
  const productTitleText = String(
    productCard.querySelector('.product-title')?.textContent?.trim() || '',
  );
  const productTargetName = sanitizeAria(productTitleText || productId, 'product');

  if (productCard) {
    productCard.removeAttribute('aria-pressed');
    productCard.setAttribute('aria-expanded', String(quantity > 0));
    const activationAria = productCard.getAttribute('aria-label') || `${sanitizeAria('Open product details')}`;
    const stateSuffix = quantity > 0 ? 'selected' : 'not selected';
    productCard.setAttribute('aria-label', `${activationAria.replace(/\s+\((not )?selected\)$/, '')} (${stateSuffix})`);
  }

  // Find existing action elements
  const contentWrapper = productCard.querySelector('.product-content-wrapper');
  const actionWrapper = productCard.querySelector('.product-card-action');
  if (!contentWrapper && !actionWrapper) return;

  const actionContainer = actionWrapper || contentWrapper;
  actionContainer.setAttribute('role', 'group');
  actionContainer.setAttribute('aria-label', sanitizeAria(`${quantityLabel} controls`, `${quantityLabel} controls`));
  actionContainer.setAttribute('aria-expanded', String(quantity > 0));
  const existingAddBtn = productCard.querySelector('.product-add-btn');
  const existingQuantityControls = productCard.querySelector('.inline-quantity-controls');

  // Toggle between "Add to Bundle" button and quantity controls
  if (quantity > 0) {
    if (actionWrapper) {
      actionWrapper.classList.add('is-expanded');
    }

    if (existingQuantityControls) {
      if (existingAddBtn) {
        existingAddBtn.remove();
      }
      // Just update the quantity display
      const qtyDisplay = existingQuantityControls.querySelector('.inline-qty-display');
      if (qtyDisplay) {
        qtyDisplay.textContent = String(quantity);
        qtyDisplay.setAttribute('aria-label', sanitizeAria(`${quantityLabel}: ${quantity}`));
      }
      const decreaseButton = existingQuantityControls.querySelector('.qty-decrease');
      if (decreaseButton) {
        const removeOrDecreaseAria = sanitizeAria(
          quantity <= 1
            ? `${removeLabel} ${productTargetName}`
            : `${decreaseLabel} ${productTargetName}`,
        );
        decreaseButton.setAttribute('aria-label', removeOrDecreaseAria);
      }
      const increaseButton = existingQuantityControls.querySelector('.qty-increase');
      if (increaseButton) {
        increaseButton.setAttribute('aria-label', sanitizeAria(`${increaseLabel} ${productTargetName}`));
      }
      this.syncProductQuantityIncreaseState(
        existingQuantityControls.querySelector('.qty-increase'),
        quantity,
      );
    } else {
      if (existingAddBtn) {
        existingAddBtn.remove();
      }
      // Create quantity controls
      const quantityControls = document.createElement('div');
      const decreaseButton = document.createElement('button');
      const increaseButton = document.createElement('button');
      const quantityDisplay = document.createElement('span');

      quantityControls.className = 'inline-quantity-controls';
      quantityControls.setAttribute('role', 'group');
      quantityControls.setAttribute('aria-label', sanitizeAria(`${quantityLabel} controls`, `${quantityLabel} controls`));
      quantityControls.setAttribute('aria-live', 'polite');

      decreaseButton.type = 'button';
      decreaseButton.className = 'inline-qty-btn qty-decrease';
      decreaseButton.dataset.productId = String(productId);
      decreaseButton.textContent = '−';
      decreaseButton.setAttribute(
        'aria-label',
        sanitizeAria(
          quantity <= 1
            ? `${removeLabel} ${productTargetName}`
            : `${decreaseLabel} ${productTargetName}`,
        ),
      );

      quantityDisplay.className = 'inline-qty-display';
      quantityDisplay.textContent = String(quantity);
      quantityDisplay.setAttribute('aria-label', sanitizeAria(`${quantityLabel}: ${quantity}`));
      quantityDisplay.setAttribute('aria-live', 'polite');

      increaseButton.type = 'button';
      increaseButton.className = 'inline-qty-btn qty-increase';
      increaseButton.dataset.productId = String(productId);
      increaseButton.textContent = '+';
      increaseButton.setAttribute('aria-label', sanitizeAria(`${increaseLabel} ${productTargetName}`));

      quantityControls.appendChild(decreaseButton);
      quantityControls.appendChild(quantityDisplay);
      quantityControls.appendChild(increaseButton);
      actionContainer.appendChild(quantityControls);

      // Attach event listeners to the new buttons
      const increaseBtn = quantityControls.querySelector('.qty-increase');
      const decreaseBtn = quantityControls.querySelector('.qty-decrease');

      this.syncProductQuantityIncreaseState(increaseBtn, quantity);

      if (increaseBtn) {
        increaseBtn.addEventListener('click', (e: any) => {
          e.stopPropagation();
          const currentQty = this.selectedProducts[stepIndex]?.[productId] || 0;
          this.updateProductSelection(stepIndex, productId, currentQty + 1);
        });
      }

      if (decreaseBtn) {
        decreaseBtn.addEventListener('click', (e: any) => {
          e.stopPropagation();
          const currentQty = this.selectedProducts[stepIndex]?.[productId] || 0;
          if (currentQty > 0) {
            this.updateProductSelection(stepIndex, productId, currentQty - 1);
          }
        });
      }
    }

    productCard.classList.add('bw-product-card--selected');

  } else {
    if (actionWrapper) {
      actionWrapper.classList.remove('is-expanded');
    }

    // Show "Add to Bundle" button, hide quantity controls
    if (existingQuantityControls) {
      existingQuantityControls.remove();
    }

      if (!existingAddBtn) {
        const addButton = document.createElement('button');
        addButton.className = 'product-add-btn';
        addButton.dataset.productId = String(productId);
        addButton.type = 'button';
        addButton.setAttribute('aria-label', addButtonAriaLabel);
        addButton.setAttribute('aria-pressed', 'false');
        addButton.textContent = this.getProductAddButtonText();
        actionContainer.appendChild(addButton);

        // Attach event listener to the new button
        addButton.addEventListener('click', (e: any) => {
          e.stopPropagation();
          const directDefaultQuantities = this._getDirectDefaultSelectionQuantities?.(stepIndex) || {};
          const hasDirectDefaultQuantity = Object.prototype.hasOwnProperty.call(
            directDefaultQuantities,
            String(productId),
          );
          const directDefaultQuantity = hasDirectDefaultQuantity
            ? Number(directDefaultQuantities[String(productId)] || 0)
            : null;
          const currentQuantity = this.selectedProducts[stepIndex]?.[productId] || 0;
          const nextQuantity = currentQuantity > 0 ? 0 : (directDefaultQuantity ?? 1);
          if (nextQuantity > 0 || currentQuantity > 0) {
            this.updateProductSelection(stepIndex, productId, nextQuantity);
          }
        });
      }

    productCard.classList.remove('bw-product-card--selected');
  }
},

refreshCurrentProductGrid(stepIndex: any) {
  if (this.container.dataset.bundleType !== 'full_page') return false;
  if (stepIndex !== this.currentStepIndex) return false;

  const currentGrid = this.container.querySelector('.full-page-product-grid');
  if (!currentGrid) return false;

  const replacementGrid = this.createFullPageProductGrid(stepIndex);
  currentGrid.replaceWith(replacementGrid);
  return true;
},

// Helper to find product by ID across all step data
findProductById(stepIndex: string|number, productId: any) {
  const products = this.stepProductData[stepIndex] || [];
  return products.find((p: any)  => getSelectionId(p) === String(productId));
},

  validateStepCondition(stepIndex: string | number, productId: string | number, newQuantity: number) {
    const step = this.selectedBundle.steps[stepIndex];
    const currentSelections = this.selectedProducts[stepIndex] || {};
    const currentQty = currentSelections[productId] || 0;
    const conditionSelections = this._getStepConditionSelections(stepIndex, currentSelections);
    const directDefaultQuantities = this._getDirectDefaultSelectionQuantities(stepIndex);
    const directDefaultQuantity = Number(directDefaultQuantities[String(productId)] || 0);
    const conditionNewQuantity = Math.max(0, Number(newQuantity || 0) - directDefaultQuantity);
    const stepProducts = this.stepProductData[stepIndex] || [];
    const isAmountOrWeight = step.conditionType === 'amount' || step.conditionType === 'weight';
    const conditionSelectionTotals = isAmountOrWeight
      ? this._buildConditionAwareStepSelections(stepProducts, conditionSelections)
      : conditionSelections;
    const { metric: targetMetric } = findStepSelectionMetric(stepProducts, String(productId));
    const targetValues = isAmountOrWeight
      ? {
        amount: Number(targetMetric?.price || 0),
        weight: Number(targetMetric?.weight || targetMetric?.weightInGrams || targetMetric?.grams || 0),
      }
      : null;

    const { allowed, conditionOperator, conditionValue } = ConditionValidator.canUpdateQuantity(
      step,
      conditionSelectionTotals,
      productId,
      conditionNewQuantity,
      targetValues,
    ) as any;

  // Only block and toast on increases — decreases are always permitted.
  if (!allowed && newQuantity > currentQty) {
    const violatedRule = conditionOperator && Number(conditionValue) > 0
      ? { ...step, conditionOperator, conditionValue }
      : step;
    const toastMessage = getFullPageStepConditionValidationMessage(
      violatedRule,
      this._resolveText?.bind(this),
    );
    ToastManager.show(toastMessage);
    return false;
  }

  return true;
},

  validateStep(stepIndex: string|number) {
    const step = this.selectedBundle.steps[stepIndex];
    const currentSelections = this.selectedProducts[stepIndex] || {};
    const conditionSelections = typeof this._getStepConditionSelections === 'function'
      ? this._getStepConditionSelections(stepIndex, currentSelections)
      : currentSelections;

  // In category-rule mode, selection keys are numeric variant IDs but
  // category product IDs are numeric product IDs (GID-stripped). Translate
  // each variant-ID key → its parent product ID before the validator runs.
  const validationStep = buildCategoryRuleValidationStep(
    step,
    stepIndex,
    this.stepCollectionProductIds,
    value => this.extractId?.(value) || value,
  );

  if (ConditionValidator.isCategoryRuleMode(validationStep)) {
    const products = this.stepProductData[stepIndex] || [];
    const translated: any = {};
    for (const [selKey, qty] of Object.entries(conditionSelections)) {
      const { product, metric } = findStepSelectionMetric(products, selKey);
      const productId = String((product && (product.parentProductId || product.id)) || selKey);
      const quantity = Number(qty) || 0;
      const current = translated[productId] || { quantity: 0, amount: 0 };
      translated[productId] = {
        quantity: current.quantity + quantity,
        amount: current.amount + ((Number(metric?.price) || 0) * quantity),
        weight: (current.weight || 0) + ((Number(metric?.weight) || 0) * quantity),
      };
    }
      return ConditionValidator.isStepConditionSatisfied(validationStep, translated);
    }

    if (validationStep.conditionType === 'amount' || validationStep.conditionType === 'weight') {
      return ConditionValidator.isStepConditionSatisfied(
        validationStep,
        this._buildConditionAwareStepSelections(this.stepProductData[stepIndex] || [], conditionSelections),
      );
    }

    return ConditionValidator.isStepConditionSatisfied(validationStep, conditionSelections);
  },

  _buildConditionAwareStepSelections(stepProducts: any, currentSelections: any) {
    const selections = currentSelections || {};
    const translated: any = {};
    for (const [selKey, qty] of Object.entries(selections)) {
      const quantity = Number(qty) || 0;
      if (quantity <= 0) continue;
      const { metric } = findStepSelectionMetric(stepProducts, selKey);
      const unitAmount = Number(metric?.price || 0);
      const unitWeight = Number(metric?.weight || metric?.weightInGrams || metric?.grams || 0);
      const current = translated[selKey] || { quantity: 0, amount: 0, weight: 0 };
      translated[selKey] = {
        quantity: current.quantity + quantity,
        amount: current.amount + (unitAmount * quantity),
        weight: current.weight + (unitWeight * quantity),
      };
    }
    return translated;
  },

isStepAccessible(stepIndex: number) {
  // Default steps are always accessible (read-only, pre-selected)
  if (this.selectedBundle?.steps[stepIndex]?.isDefault) return true;
  // Add-on step: lock until prior steps complete only when addonUnlockAfterCompletion is true (default)
  const addonStep = this.selectedBundle?.steps[stepIndex];
  if (addonStep?.isFreeGift && addonStep?.addonUnlockAfterCompletion === false) {
    // unlock flag disabled — treat as regular step (fall through to standard check)
  } else if (!this.canNavigateToStep(stepIndex)) {
    return false;
  }
  // Check if all previous steps are completed
  for (let i = 0; i < stepIndex; i++) {
    const step = this.selectedBundle?.steps[i];
    if (step?.isFreeGift || step?.isDefault) continue; // skip non-blocking steps
    if (!this.validateStep(i)) return false;
  }
  return true;
},

updateModalNavigation() {
  const prevButton = this.elements.modal?.querySelector('.prev-button');
  const nextButton = this.elements.modal?.querySelector('.next-button');

  // In full-page mode the modal may be hidden/empty — skip without crashing
  if (!prevButton || !nextButton) return;

  prevButton.disabled = this.currentStepIndex === 0;

  const isCurrentStepValid = this.validateStep(this.currentStepIndex);

  if (this.currentStepIndex === this.selectedBundle.steps.length - 1) {
    nextButton.textContent = this._resolveText('doneButton', 'Done');
    nextButton.disabled = !isCurrentStepValid;
  } else {
    nextButton.textContent = this._resolveText('nextButton', 'Next');
    nextButton.disabled = !isCurrentStepValid;
  }
},

updateModalFooterMessaging() {
  // Skip if modal is not active (full-page mode uses inline footer instead)
  if (!this.elements.modal || this.elements.modal.hidden) return;

  const { totalPrice, totalQuantity, unitPrices } = calculateBundleTotalForPurchaseOption(this,
    this.selectedProducts,
    this.stepProductData,
    this.selectedBundle?.steps
  );

  const discountInfo = calculateBundleDiscountForPurchaseOption(
    this,
    totalPrice,
    totalQuantity,
    unitPrices
  );
  const combinedDiscountInfo = this.getDiscountInfoWithSelectedAddonDiscount(discountInfo, totalPrice);

  const currencyInfo = CurrencyManager.getCurrencyInfo();

  // Update modal header text dynamically
  this.updateModalHeaderText(totalPrice, totalQuantity, combinedDiscountInfo, currencyInfo);

  // Update cart badge with total item count
  const cartBadge = this.elements.modal.querySelector('.cart-badge-count');
  if (cartBadge) {
    cartBadge.textContent = totalQuantity.toString();
  }

  // Update total prices in the footer pill
  this.updateFooterTotalPrices(totalPrice, combinedDiscountInfo, currencyInfo);

  // Update discount messaging and progress bar
  this.updateModalDiscountMessaging(totalPrice, totalQuantity, combinedDiscountInfo, currencyInfo);
},
};
