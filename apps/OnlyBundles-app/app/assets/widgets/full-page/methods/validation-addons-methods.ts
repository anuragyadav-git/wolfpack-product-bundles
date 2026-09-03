import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { calculateBundleTotalForPurchaseOption } from '../../shared/subscription-storefront-methods.js';
import { ConditionValidator } from '../../shared/condition-validator.js';

function getAddonTiersForStep(step: any) {
  return Array.isArray(step?.addonTiers) ? step.addonTiers.filter(Boolean) : [];
}

function hasConfiguredAddonRule(step: any) {
  if (!step) return false;
  const eligibilityValue = Number(step.addonEligibilityCondition?.value) || 0;
  if (eligibilityValue > 0) return true;

  return getAddonTiersForStep(step).some((tier: any)  => {
    const tierValue = Number(tier?.eligibilityCondition?.value) || 0;
    if (tierValue > 0) return true;
    return Array.isArray(tier?.selectedAddonProducts) && tier.selectedAddonProducts.length > 0;
  });
}

function getAddonTierCandidatesWithState(step: any, totalPrice: number, totalQuantity: number) {
  const directTier = step?.addonEligibilityCondition || step?.addonDiscount
    ? [{
        eligibilityCondition: step?.addonEligibilityCondition || {},
        discount: step?.addonDiscount || {},
      }]
    : [];
  const tiers = getAddonTiersForStep(step);
  const candidates = tiers.length > 0 ? tiers : directTier;

  return candidates.map((tier: any, index: any) => {
    const condition = tier?.eligibilityCondition || {};
    const conditionType = String(condition.type || 'QUANTITY').toUpperCase();
    const conditionValue = Number(condition.value || 0);
    const threshold = conditionType === 'AMOUNT' ? Math.round(conditionValue * 100) : conditionValue;
    const currentValue = conditionType === 'AMOUNT' ? totalPrice : totalQuantity;
    return { tier, index, conditionType, threshold, currentValue, isEligible: currentValue >= threshold };
  });
}

function normalizeAddonPercentageDiscount(...sources: any[]) {
  for (const source of sources) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
    const type = String(source.type ?? source.discountType ?? '').toUpperCase();
    const value = Number(source.value ?? source.discountValue ?? 0);
    if (type === 'PERCENTAGE' && Number.isFinite(value) && value > 0) {
      return { type: 'PERCENTAGE', value: Math.min(100, value) };
    }
  }
  return null;
}

function getAddonDiscountForStepTier(step: any, tier: any) {
  return normalizeAddonPercentageDiscount(tier?.discount, tier, step?.addonDiscount);
}

function getSelectionId(item: any = {}) {
  return String(item?.selectionId || '');
}

function getDefaultVariantQuantity(variant: any = {}) {
  return normalizeDefaultRequiredQuantity(variant.defaultRequiredQuantity);
}

function normalizeDefaultRequiredQuantity(value: any = 0) {
  const rawQuantity = Number.parseFloat(String(value));
  return Number.isFinite(rawQuantity) && rawQuantity >= 0 ? rawQuantity : 0;
}

function createFreeGiftStatusIcon(state: string) {
  const icon = document.createElement('span');
  icon.className = `side-panel-free-gift-icon side-panel-free-gift-icon--${state}`;
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = state === 'unlocked' ? '✓' : '🔒';
  return icon;
}

function createFreeGiftStatusText(message: string|null) {
  const text = document.createElement('span');
  text.className = 'side-panel-free-gift-text';
  text.textContent = message;
  return text;
}

export const fullPageValidationAddonsMethods: Record<string, any> & ThisType<any> = {
async _sidebarAdvanceToNextStep() {
  const contentSection = this.elements.stepsContainer.querySelector('.sidebar-content');
  if (!contentSection) {
    // Fallback: full re-render if DOM structure is unexpected
    this.renderFullPageLayout();
    return;
  }

  // 1. Update step timeline tabs in-place (active/completed/locked state + click listeners)
  this.updateStepTimeline();

  // 2. Rebuild the active step title before the rest of the catalog controls
  const existingContentHeader = contentSection.querySelector('.fpb-full-page-content-header');
  const newContentHeader = this.createStepContentHeader(this.currentStepIndex);
  if (existingContentHeader && newContentHeader) {
    existingContentHeader.replaceWith(newContentHeader);
  } else if (existingContentHeader && !newContentHeader) {
    existingContentHeader.remove();
  } else if (!existingContentHeader && newContentHeader) {
    contentSection.prepend(newContentHeader);
  }

  // 3. Rebuild category tabs for the new step
  const existingTabs = contentSection.querySelector('.category-tabs');
  if (this.config.showCategoryTabs) {
    const newTabs = this.createCategoryTabs(this.currentStepIndex);
    if (existingTabs && newTabs) {
      existingTabs.replaceWith(newTabs);
    } else if (existingTabs && !newTabs) {
      existingTabs.remove();
    } else if (!existingTabs && newTabs) {
      const firstCatalogControl = contentSection.querySelector(
        '.step-banner-image, .step-search-container, .fpb-category-section-rows, .fpb-step-category-title, .full-page-product-grid-container'
      );
      if (firstCatalogControl) contentSection.insertBefore(newTabs, firstCatalogControl);
    }
  } else if (existingTabs) {
    existingTabs.remove();
  }

  // 4. Rebuild search input for the new step (search query was cleared by the caller)
  const existingSearch = contentSection.querySelector('.step-search-container');
  if (existingSearch && this.shouldRenderFullPageSearch()) {
    existingSearch.replaceWith(this.createSearchInput());
  } else if (existingSearch) {
    existingSearch.remove();
  } else if (this.shouldRenderFullPageSearch()) {
    const firstAnchor = contentSection.querySelector(
      '.fpb-category-section-rows, .fpb-step-category-title, .full-page-product-grid-container'
    );
    if (firstAnchor) contentSection.insertBefore(this.createSearchInput(), firstAnchor);
  }

  const existingCategoryTitle = contentSection.querySelector('.fpb-step-category-title');
  const newCategoryTitle = this.config.showCategoryTabs
    ? null
    : this.createActiveCategoryTitle(this.currentStepIndex);
  if (existingCategoryTitle && newCategoryTitle) {
    existingCategoryTitle.replaceWith(newCategoryTitle);
  } else if (existingCategoryTitle && !newCategoryTitle) {
    existingCategoryTitle.remove();
  } else if (!existingCategoryTitle && newCategoryTitle) {
    const gridContainer = contentSection.querySelector('.full-page-product-grid-container');
    if (gridContainer) contentSection.insertBefore(newCategoryTitle, gridContainer);
  }

  const existingCategoryRows = contentSection.querySelector('.fpb-category-section-rows');
  const newCategoryRows = this.createCategorySectionRows(this.currentStepIndex);
  if (existingCategoryRows && newCategoryRows) {
    existingCategoryRows.replaceWith(newCategoryRows);
  } else if (existingCategoryRows && !newCategoryRows) {
    existingCategoryRows.remove();
  } else if (!existingCategoryRows && newCategoryRows) {
    const gridContainer = contentSection.querySelector('.full-page-product-grid-container');
    if (gridContainer) gridContainer.insertAdjacentElement('afterend', newCategoryRows);
  }

  // 5. Show product-grid loading state
  const productGridContainer = contentSection.querySelector('.full-page-product-grid-container');
  if (!productGridContainer) {
    this.renderFullPageLayout();
    return;
  }
  this.renderProductGridLoadingState(productGridContainer);

  // 6. Immediately update side panel to reflect current selections
  const sidePanel = this.elements.stepsContainer.querySelector('.full-page-side-panel');
  if (sidePanel) this.renderSidePanel(sidePanel);

  // 7. Async: load products for the new step and swap in the grid
  try {
    await this.loadStepProducts(this.currentStepIndex);
    const productGrid = this.createFullPageProductGrid(this.currentStepIndex);
    productGridContainer.replaceChildren();
    productGridContainer.appendChild(productGrid);
    if (sidePanel) this.renderSidePanel(sidePanel);
    this.hideLoadingOverlay();
    this.preloadNextStep();
    this._renderMobileSummaryTray();
  } catch (error: any) {
    this.hideLoadingOverlay();
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Failed to load products. Please try again.';
    productGridContainer.replaceChildren(errorMessage);
    this._renderMobileSummaryTray();
  }
},

canProceedToNextStep() {
  if (!this.isStepCompleted(this.currentStepIndex)) return false;
  return true;
},

// Helper: Check if all bundle conditions are met
areBundleConditionsMet() {
  return this.selectedBundle.steps.every((step: any, index: any) => {
    if (step.isFreeGift || step.isDefault) return true; // non-blocking steps
    return this.isStepCompleted(index);
  });
},

// Returns true when no step contributes a gating rule.
// A free-gift step contributes a rule when it has an addonEligibilityCondition,
// an addonTier with eligibilityCondition.value > 0, or any selectedAddonProducts —
// otherwise the footer renders "Add to Cart" on the paid step and bypasses the
// merchant-configured addon threshold.
bundleHasNoConditions() {
  if (!this.selectedBundle?.steps?.length) return false;
  return this.selectedBundle.steps.every((step: any)  => {
    if (step.isDefault) return true;
    if (step.isFreeGift) {
      const eligibilityValue = Number(step.addonEligibilityCondition?.value) || 0;
      if (eligibilityValue > 0) return false;
      const tiers = getAddonTiersForStep(step);
      if (tiers.length > 0) {
        return tiers.every((tier: any)  => {
          const tierValue = Number(tier.eligibilityCondition?.value) || 0;
          if (tierValue > 0) return false;
          if (Array.isArray(tier.selectedAddonProducts) && tier.selectedAddonProducts.length > 0) return false;
          return true;
        });
      }
      return true;
    }
    return !step.conditionType && !step.conditionOperator && step.conditionValue == null;
  });
},

// Free gift helpers

get freeGiftStep() {
  return (this.selectedBundle?.steps || []).find((s: any)  => s.isFreeGift) ?? null;
},

get freeGiftStepIndex() {
  return (this.selectedBundle?.steps || []).findIndex((s: any)  => s.isFreeGift);
},

get paidSteps() {
  return (this.selectedBundle?.steps || []).filter((s: any)  => !s.isFreeGift && !s.isDefault);
},

get isFreeGiftUnlocked() {
  if (!this.freeGiftStep) return false;
  const steps = this.selectedBundle?.steps || [];
  return this.paidSteps.every((paidStep: any)  => {
    const globalIndex = steps.indexOf(paidStep);
    return this.isStepCompleted(globalIndex);
  });
},

canNavigateToStep(targetStepIndex: string|number) {
  const targetStep = (this.selectedBundle?.steps || [])[targetStepIndex];
  if (targetStep?.isFreeGift && !this.isFreeGiftUnlocked) return false;
  return true;
},

getAddonTiers(step: any) {
  return getAddonTiersForStep(step);
},

getAddonTierEvaluation(step: any) {
  const { totalPrice, totalQuantity } = calculateBundleTotalForPurchaseOption(this,
    this.selectedProducts,
    this.stepProductData,
    this.selectedBundle?.steps
  );
  const withState = getAddonTierCandidatesWithState(step, totalPrice, totalQuantity);
  if (withState.length === 0) {
    return { tier: null, totalPrice, totalQuantity, currentValue: totalQuantity };
  }

  const eligible = withState
    .filter((candidate: any)  => candidate.isEligible)
    .sort((a: any, b: any) => (a.threshold - b.threshold) || (a.index - b.index));
  const next = withState
    .filter((candidate: any)  => !candidate.isEligible)
    .sort((a: any, b: any) => (a.threshold - b.threshold) || (a.index - b.index));
  const selected = eligible[eligible.length - 1] || next[0] || withState[0];

  return {
    tier: selected?.tier || null,
    tierIndex: selected?.index ?? -1,
    isEligible: selected?.isEligible === true,
    totalPrice,
    totalQuantity,
    currentValue: selected?.currentValue ?? totalQuantity,
  };
},

getAddonMessageTierEvaluation(step: any) {
  const { totalPrice, totalQuantity } = calculateBundleTotalForPurchaseOption(this,
    this.selectedProducts,
    this.stepProductData,
    this.selectedBundle?.steps
  );
  const withState = getAddonTierCandidatesWithState(step, totalPrice, totalQuantity);
  if (withState.length === 0) {
    return { tier: null, totalPrice, totalQuantity, currentValue: totalQuantity };
  }

  const next = withState
    .filter((candidate: any)  => !candidate.isEligible)
    .sort((a: any, b: any) => (a.threshold - b.threshold) || (a.index - b.index));
  const eligible = withState
    .filter((candidate: any)  => candidate.isEligible)
    .sort((a: any, b: any) => (a.threshold - b.threshold) || (a.index - b.index));
  const selected = next[0] || eligible[eligible.length - 1] || withState[0];

  return {
    tier: selected?.tier || null,
    tierIndex: selected?.index ?? -1,
    isEligible: selected?.isEligible === true,
    totalPrice,
    totalQuantity,
    currentValue: selected?.currentValue ?? totalQuantity,
  };
},

getAddonSummaryEligibilityStates(step: any) {
  const { totalPrice, totalQuantity } = calculateBundleTotalForPurchaseOption(this,
    this.selectedProducts,
    this.stepProductData,
    this.selectedBundle?.steps
  );
  const withState = getAddonTierCandidatesWithState(step, totalPrice, totalQuantity);
  const getEligibilityState = typeof this.getAddonEligibilityState === 'function'
    ? this.getAddonEligibilityState
    : fullPageValidationAddonsMethods.getAddonEligibilityState;
  const compareTierProgression = (left: any, right: any) => (
    (left.threshold - right.threshold) || (left.index - right.index)
  );
  const eligible = withState
    .filter((candidate: any)  => candidate.isEligible)
    .sort(compareTierProgression);
  const activeEligible = eligible[eligible.length - 1] || null;
  const visibleCandidates = activeEligible
    ? withState.filter((candidate: any)  => (
        candidate === activeEligible
        || (!candidate.isEligible && compareTierProgression(candidate, activeEligible) > 0)
      ))
    : withState;

  return visibleCandidates.map((candidate: any)  => getEligibilityState.call(this, step, {
    tier: candidate.tier,
    tierIndex: candidate.index,
    isEligible: candidate.isEligible === true,
    totalPrice,
    totalQuantity,
    currentValue: candidate.currentValue,
  }));
},

_getFreeGiftRemainingCount() {
  const steps = this.selectedBundle?.steps || [];
  const paidStepsComplete = this.paidSteps.every((paidStep: any)  => {
    const globalIndex = steps.indexOf(paidStep);
    return this.isStepCompleted(globalIndex);
  });

  if (hasConfiguredAddonRule(this.freeGiftStep)) {
    return this.getAddonEligibilityState(this.freeGiftStep).remainingQuantity;
  }

  if (paidStepsComplete) return 0;

  const total = this.paidSteps.reduce((sum: any, s: any) => {
      const required = typeof this._getSummarySidebarRequiredQuantity === 'function'
        ? this._getSummarySidebarRequiredQuantity(s)
        : null;
      return sum + (Number.isFinite(required) && required > 0 ? required : 0);
    },
    0);
  const selected = this.paidSteps.reduce((sum: number, paidStep: any) => {
    const globalIndex = steps.indexOf(paidStep);
    const stepSel = this.selectedProducts[globalIndex] ?? {};
    return sum + Object.values<any>(stepSel).reduce((s: number, p: any) => {
      const quantity = typeof p === 'number' ? p : Number(p?.quantity);
      return s + (Number.isFinite(quantity) ? quantity : 0);
    }, 0);
  }, 0);
  return Math.max(0, total - selected);
},

getAddonEligibilityState(step: any, evaluationOverride: any = null) {
  const evaluation = evaluationOverride || (typeof this.getAddonTierEvaluation === 'function'
    ? this.getAddonTierEvaluation(step)
    : fullPageValidationAddonsMethods.getAddonTierEvaluation.call(this, step));
  const tier = evaluation.tier;
  const condition = tier?.eligibilityCondition || step?.addonEligibilityCondition || {};
  const discount: any = getAddonDiscountForStepTier(step, tier) || {};
  const conditionType = String(condition.type || 'QUANTITY').toUpperCase();
  const conditionValue = Number(condition.value || 0);
  const currencyInfo = CurrencyManager.getCurrencyInfo();
  const thresholdCents = conditionType === 'AMOUNT' ? Math.round(conditionValue * 100) : conditionValue;
  const currentValue = evaluation.currentValue;
  const remainingRaw = Math.max(0, thresholdCents - currentValue);
  const remainingQuantity = conditionType === 'AMOUNT' ? 0 : remainingRaw;
  const remainingAmount = conditionType === 'AMOUNT' ? remainingRaw : 0;
  const displayedRemainingAmount = Math.ceil(remainingAmount / 100);
  const discountValue = Number(discount.value || 0);
  const discountUnit = discount.type === 'PERCENTAGE' ? '%' : currencyInfo.display.symbol;

  const tierIndex = Number.isInteger(evaluation.tierIndex) ? evaluation.tierIndex : -1;
  const isEligible = evaluation.isEligible === true || remainingRaw <= 0;

  return {
    isEligible,
    tier,
    tierIndex,
    conditionType,
    remainingQuantity,
    remainingAmount,
    variables: {
      addonsConditionDiff: conditionType === 'AMOUNT'
        ? String(displayedRemainingAmount)
        : String(remainingQuantity),
      currencyUnit: currencyInfo.display.symbol,
      addonsDiscountValue: String(discountValue),
      addonsDiscountValueUnit: discountUnit,
      remainingQuantity: String(remainingQuantity),
      remainingAmount: String(displayedRemainingAmount),
      discountValue: String(discountValue),
      discountValueUnit: discountUnit,
    },
  };
},

getAddonMessageEligibilityState(step: any) {
  const evaluation = typeof this.getAddonMessageTierEvaluation === 'function'
    ? this.getAddonMessageTierEvaluation(step)
    : fullPageValidationAddonsMethods.getAddonMessageTierEvaluation.call(this, step);
  const getEligibilityState = typeof this.getAddonEligibilityState === 'function'
    ? this.getAddonEligibilityState
    : fullPageValidationAddonsMethods.getAddonEligibilityState;
  return getEligibilityState.call(this, step, evaluation);
},

getAddonLineDiscount(step: any) {
  const evaluation = typeof this.getAddonTierEvaluation === 'function'
    ? this.getAddonTierEvaluation(step)
    : fullPageValidationAddonsMethods.getAddonTierEvaluation.call(this, step);
  const tier = evaluation.tier;
  if (evaluation.isEligible !== true) return null;
  return getAddonDiscountForStepTier(step, tier);
},

getAddonProductSelectionKeys(step: any) {
  const keys = new Set();
  const addKey = (value: any) => {
    if (value === null || value === undefined || value === '') return;
    const selectionId = String(value?.selectionId || '');
    if (!selectionId) return;
    keys.add(selectionId);
  };
  const products: any[] = [
    ...(Array.isArray(step?.StepProduct) ? step.StepProduct : []),
    ...(Array.isArray(step?.products) ? step.products : []),
  ];

  products.forEach(product => {
    addKey(product);
    if (Array.isArray(product.variants)) {
      product.variants.forEach(addKey);
    }
  });

  return keys;
},

calculateSelectedAddonDiscountAmount() {
  const steps = this.selectedBundle?.steps || [];
  const chargeableAddonStep = steps.find((candidate: any)  => candidate?.isFreeGift === true && this.getAddonLineDiscount(candidate));
  const chargeableAddonStepIndex = steps.indexOf(chargeableAddonStep);
  return this.getAllSelectedProductsData().reduce((total: number, item: any) => {
    const itemStepIndex = Number(item.stepIndex);
    const isChargeableAddonItem = itemStepIndex === chargeableAddonStepIndex || (item.isFreeGift === true && item.addonDisplayFree !== true);
    if (!isChargeableAddonItem) return total;
    const step = steps[itemStepIndex] || chargeableAddonStep;
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
    addonDiscountAmount,
    finalPrice,
    discountPercentage: totalPrice > 0 ? (combinedDiscountAmount / totalPrice) * 100 : 0,
  };
},

renderAddonEligibilityMessage(step: any, eligibilityState: any) {
  const messages = step?.addonMessaging || {};
  const tierKey = eligibilityState?.tierIndex >= 0 ? `tier${eligibilityState.tierIndex + 1}` : 'tier1';
  const tierMessages = messages[tierKey] || messages.tier1 || {};
  const template = eligibilityState.isEligible
    ? tierMessages.eligibleState
    : tierMessages.ineligibleState;
  const defaultMessage = typeof this.getDefaultAddonTierMessage === 'function'
    ? this.getDefaultAddonTierMessage(eligibilityState)
    : fullPageValidationAddonsMethods.getDefaultAddonTierMessage(eligibilityState);
  const messageTemplate = template || defaultMessage;
  if (!messageTemplate) return '';

  return Object.entries(eligibilityState.variables).reduce((message, [key, value]: any) => {
    if (key === 'discountValue') {
      const unit = eligibilityState.variables.discountValueUnit || '';
      const displayValue = unit ? `${value}${unit}` : value;
      return message
        .replaceAll(`##${key}##`, value)
        .replaceAll(`{{${key}}}`, value)
        .replace(/\{discountValue\}(?!\s*(?:\{discountValueUnit\}|%|\$|€|£|₹|¥))/g, displayValue)
        .replaceAll(`{${key}}`, value);
    }
    return message
      .replaceAll(`##${key}##`, value)
      .replaceAll(`{{${key}}}`, value)
      .replaceAll(`{${key}}`, value);
  }, messageTemplate);
},

getDefaultAddonTierMessage(eligibilityState: any) {
  if (!eligibilityState) return '';
  if (eligibilityState.isEligible) {
    return 'Congrats you are eligible for ##addonsDiscountValue####addonsDiscountValueUnit## off on Add ons';
  }
  if (eligibilityState.conditionType === 'AMOUNT') {
    return 'Add product(s) worth at least ##addonsConditionDiff## ##currencyUnit## more to claim ##addonsDiscountValue####addonsDiscountValueUnit## off on Add ons';
  }
  return 'Add ##addonsConditionDiff## more product(s) to claim ##addonsDiscountValue####addonsDiscountValueUnit## off on Add ons';
},

renderAddonSectionTitle(step: any) {
  const title = step?.freeGiftName || step?.addonTitle || step?.addonLabel;
  if (typeof title !== 'string' || !title.trim()) return null;

  const titleEl = document.createElement('div');
  titleEl.className = 'side-panel-addon-title';
  titleEl.textContent = title.trim();
  return titleEl;
},

createAddonTierMessageElement(message: string|null, isEligible: any) {
  const messageCard = document.createElement('div');
  messageCard.className = isEligible
    ? 'side-panel-addon-message side-panel-addon-message--eligible'
    : 'side-panel-addon-message';
  messageCard.dataset.addonTierEligible = isEligible ? 'true' : 'false';

  const messageRow = document.createElement('div');
  messageRow.className = 'side-panel-addon-tier-message-container';

  const text = document.createElement('span');
  text.className = 'side-panel-free-gift-text';
  text.textContent = message;

  const icon = document.createElement('span');
  icon.className = 'side-panel-free-gift-icon';
  icon.setAttribute('aria-hidden', 'true');

  const bottomBar = document.createElement('div');
  bottomBar.className = 'side-panel-addon-tier-bottom-bar';

  messageRow.appendChild(text);
  messageRow.appendChild(icon);
  messageCard.appendChild(messageRow);
  messageCard.appendChild(bottomBar);
  return messageCard;
},

_initDefaultProducts() {
    const steps = this.selectedBundle?.steps || [];
    const normalizeId = (value = '') => this.extractId(value);
    const normalizeSelectionId = (candidate: any) => getSelectionId(candidate);
    const canSelectDefault = (variant: any) => {
      if (!variant) return false;
      if (typeof this.isVariantSelectableForInventory === 'function') {
        return this.isVariantSelectableForInventory(variant);
      }
      return variant.available !== false;
  };

  steps.forEach((step: any, stepIndex: string|number) => {
    if (!step.isDefault || !step.defaultVariantId) return;
    const targetId = normalizeId(step.defaultVariantId);
    if (!targetId) return;
    const allProducts: any[] = [...(step.products || []), ...(step.StepProduct || [])];
    const isMatchingDefault = (candidate: any) => normalizeSelectionId(candidate) === targetId;
    const product = allProducts.find((product) => {
      if (isMatchingDefault(product)) return true;
      if (!Array.isArray(product.variants)) return false;
      return product.variants.some(isMatchingDefault);
    });
    if (!product) return;
    let selectedVariant: any = null;
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      selectedVariant = product.variants.find(isMatchingDefault);
      if (!selectedVariant) return;
    } else {
      selectedVariant = product;
    }

    if (!canSelectDefault(selectedVariant)) return;
    if (!this.selectedProducts[stepIndex]) this.selectedProducts[stepIndex] = {};
    this.selectedProducts[stepIndex][targetId] = getDefaultVariantQuantity(selectedVariant);
  });
},

_initDirectDefaultProducts() {
  const canSelectDirectDefault = (product: any = {}) => {
    const firstVariant = Array.isArray(product.variants) ? product.variants[0] : null;
    if (!firstVariant) return false;
    if (typeof this.isVariantSelectableForInventory === 'function') {
      return this.isVariantSelectableForInventory(firstVariant);
    }
    return firstVariant.available !== false;
  };

  this.directDefaultProducts = this._getDirectDefaultProductItems();
  if (this.directDefaultProducts.length === 0 || !this.selectedProducts[0]) return;

    this.directDefaultProducts = this.directDefaultProducts.filter(canSelectDirectDefault);
    this.directDefaultProducts.forEach((product: any)  => {
      const selectionId = getSelectionId(product);
      if (!selectionId) return;
      const defaultQuantity = Number.parseFloat(product.defaultRequiredQuantity);
      this.selectedProducts[0][selectionId] = Number.isFinite(defaultQuantity) && defaultQuantity >= 0
        ? defaultQuantity
        : 0;
    });
},

// Re-lock free gift if paid items no longer satisfy the unlock condition
_syncFreeGiftLock() {
  if (!this.freeGiftStep || this.freeGiftStepIndex < 0) return;
  const addonEligible = !hasConfiguredAddonRule(this.freeGiftStep)
    || this.getAddonEligibilityState(this.freeGiftStep).isEligible;
  if (!this.isFreeGiftUnlocked || !addonEligible) {
    this.selectedProducts[this.freeGiftStepIndex] = {};
  }
},

// Render the free gift locked/unlocked section in a given container
_renderFreeGiftSection(container: any) {
  const step = this.freeGiftStep;
  if (!step) return;
  if (step.addonProductsEnabled === false) return;

  const section = document.createElement('div');
  const giftName = String(step.freeGiftName || 'gift').trim() || 'gift';
  const hasDirectAddonTiers = step.addonEligibilityCondition || Array.isArray(step.addonTiers);

  if (hasDirectAddonTiers) {
    const summaryStates = typeof this.getAddonSummaryEligibilityStates === 'function'
      ? this.getAddonSummaryEligibilityStates(step)
      : [];
    const fallbackState = summaryStates.length > 0
      ? null
      : (typeof this.getAddonMessageEligibilityState === 'function'
          ? this.getAddonMessageEligibilityState(step)
          : this.getAddonEligibilityState(step));
    const states = summaryStates.length > 0 ? summaryStates : [fallbackState].filter(Boolean);
    const messages = states
      .map((eligibilityState: any)  => ({
        eligibilityState,
        message: this.renderAddonEligibilityMessage(step, eligibilityState),
      }))
      .filter(({ message }: any) => Boolean(message));
    if (messages.length === 0) return;

    const title = this.renderAddonSectionTitle(step);
    const hasEligibleTier = messages.some(({ eligibilityState }: any) => eligibilityState.isEligible);
    section.className = hasEligibleTier
      ? 'side-panel-addon-summary side-panel-free-gift unlocked'
      : 'side-panel-addon-summary side-panel-free-gift';
    if (title) section.appendChild(title);
    const tierList = document.createElement('div');
    tierList.className = 'side-panel-addon-tier-list';
    const createMessageElement = typeof this.createAddonTierMessageElement === 'function'
      ? this.createAddonTierMessageElement
      : fullPageValidationAddonsMethods.createAddonTierMessageElement;
    messages.forEach(({ message, eligibilityState }: any) => {
      tierList.appendChild(createMessageElement.call(this, message, eligibilityState.isEligible));
    });
    section.appendChild(tierList);
    container.appendChild(section);
    return;
  }

  if (this.isFreeGiftUnlocked) {
    section.className = 'side-panel-free-gift unlocked';
    section.appendChild(createFreeGiftStatusIcon('unlocked'));
    section.appendChild(createFreeGiftStatusText(`Congrats! You're eligible for a FREE ${giftName}!`));
  } else {
    const remaining = this._getFreeGiftRemainingCount();
    section.className = 'side-panel-free-gift';
    section.appendChild(createFreeGiftStatusIcon('locked'));
    section.appendChild(createFreeGiftStatusText(
      `Add ${remaining} more product${remaining !== 1 ? 's' : ''} to claim a FREE ${giftName}!`
    ));
  }
  container.appendChild(section);
},

_renderStandardSidebarEmptySlots(container: any, options: any = {}) {
  const slotCount = this.getSummarySidebarMaxItemCount();
  const filledCount = Math.max(0, Number(options.filledCount || 0));
  const emptySlotCount = Math.max(0, slotCount - filledCount);
  const mode = options.mode || this.getSummarySidebarEmptyStateMode();

  if (mode === 'slots') {
    const emptyStateIconUrl = this._escapeHTML(this.selectedBundle?.productSlotIconUrl || '');
    const slots = document.createElement('div');
    slots.className = 'side-panel-inline-slots';

    for (let i = 0; i < emptySlotCount; i += 1) {
      const slot = document.createElement('div');
      slot.className = 'side-panel-inline-slot';
      if (emptyStateIconUrl) {
        const icon = document.createElement('img');
        icon.className = 'side-panel-inline-slot-icon';
        icon.src = emptyStateIconUrl;
        icon.alt = '';
        icon.loading = 'lazy';
        slot.appendChild(icon);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'side-panel-inline-slot-placeholder';
        placeholder.textContent = '+';
        slot.appendChild(placeholder);
      }
      slots.appendChild(slot);
    }

    if (slots.children.length > 0) {
      container.appendChild(slots);
    }
    return;
  }

  const emptyStateIconUrl = this._shouldRenderProductSlots()
    ? this._escapeHTML(this.selectedBundle?.productSlotIconUrl || '')
    : '';
  for (let i = 0; i < slotCount; i += 1) {
    const slot = document.createElement('div');
    slot.className = 'side-panel-product-row side-panel-skeleton-slot side-panel-skeleton-slot--standard-empty';
    const imageWrap = document.createElement('div');
    imageWrap.className = 'side-panel-product-img-wrap';
    const thumbnail = document.createElement(emptyStateIconUrl ? 'img' : 'div');
    thumbnail.className = emptyStateIconUrl
      ? 'side-panel-product-img side-panel-product-slot-icon'
      : 'side-panel-product-img-placeholder side-panel-skeleton-thumb';
    if (emptyStateIconUrl) {
      (thumbnail as HTMLImageElement).src = emptyStateIconUrl;
      (thumbnail as HTMLImageElement).alt = '';
      (thumbnail as HTMLImageElement).loading = 'lazy';
    }
    imageWrap.appendChild(thumbnail);
    const info = document.createElement('div');
    info.className = 'side-panel-product-info side-panel-skeleton-lines';
    ['side-panel-product-title side-panel-skeleton-line line-name', 'side-panel-product-variant side-panel-skeleton-line line-variant', 'side-panel-product-price side-panel-skeleton-line line-price'].forEach((className) => {
      const line = document.createElement('span');
      line.className = className;
      info.appendChild(line);
    });
    slot.append(imageWrap, info);
    container.appendChild(slot);
  }
},

// Render empty-summary skeleton rows that match selected product rows.
_renderSidebarProductSkeletons(container: any, slotCountOverride: any) {
  const slotCount = Number.isFinite(Number(slotCountOverride))
    ? Math.max(0, Number(slotCountOverride))
    : this.getSummarySidebarMaxItemCount();
  for (let i = 0; i < slotCount; i++) {
    const slot = document.createElement('div');
    slot.className = 'side-panel-product-row side-panel-skeleton-slot';
    const imageWrap = document.createElement('div');
    imageWrap.className = 'side-panel-product-img-wrap';
    const thumbnail = document.createElement('div');
    thumbnail.className = 'side-panel-product-img-placeholder side-panel-skeleton-thumb';
    imageWrap.appendChild(thumbnail);
    const info = document.createElement('div');
    info.className = 'side-panel-product-info side-panel-skeleton-lines';
    ['side-panel-product-title side-panel-skeleton-line line-name', 'side-panel-product-variant side-panel-skeleton-line line-variant'].forEach((className) => {
      const line = document.createElement('span');
      line.className = className;
      info.appendChild(line);
    });
    const price = document.createElement('span');
    price.className = 'side-panel-product-price side-panel-skeleton-line line-price';
    slot.append(imageWrap, info, price);
    container.appendChild(slot);
  }
},

_getSummarySidebarRequiredQuantity(step: any) {
  if (!step || step.enabled === false || step.isDefault || step.isFreeGift) return null;
  if (ConditionValidator.isCategoryRuleMode(step)) return null;

  let requiredQuantity: number|null = null;

  const pushLowerBound = (operator: string, value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    if (operator === ConditionValidator.OPERATORS.EQUAL_TO) {
      requiredQuantity = Math.max(requiredQuantity ?? 0, value);
      return;
    }
    if (operator === ConditionValidator.OPERATORS.GREATER_THAN_OR_EQUAL_TO) {
      requiredQuantity = Math.max(requiredQuantity ?? 0, value);
    }
  };

  if (step.conditionOperator != null && step.conditionValue != null) {
    const primary = Number(step.conditionValue);
    pushLowerBound(step.conditionOperator, primary);
  }

  if (step.conditionOperator2 != null && step.conditionValue2 != null) {
    const secondary = Number(step.conditionValue2);
    pushLowerBound(step.conditionOperator2, secondary);
  }

  if (requiredQuantity != null && requiredQuantity > 0) {
    return requiredQuantity;
  }

  return null;
},

getSummarySidebarMaxItemCount(selectedCount = 0) {
  const steps = Array.isArray(this.selectedBundle?.steps) ? this.selectedBundle.steps : [];
  const selected = Number(selectedCount || 0);
  const boxRules = typeof this.getBoxSelectionRules === 'function'
    ? this.getBoxSelectionRules()
    : [];
  const selectedBoxQuantity = typeof this.getSelectedBoxSelectionQuantity === 'function'
    ? this.getSelectedBoxSelectionQuantity()
    : selected;
  const activeBoxRule = typeof this.getActiveBoxSelectionRule === 'function'
    ? this.getActiveBoxSelectionRule(boxRules, selectedBoxQuantity)
    : null;
  const activeBoxQuantity = Number(activeBoxRule?.boxQuantity || 0);
  if (activeBoxQuantity > 0) {
    return Math.max(activeBoxQuantity, selected);
  }

  let totalRequired = 0;

  for (const step of steps) {
    const required = this._getSummarySidebarRequiredQuantity(step);
    if (Number.isFinite(required) && required > 0) {
      totalRequired += required;
    }
  }

  return Math.max(totalRequired, selected);
},

getSummarySidebarEmptyStateMode() {
  return this._shouldRenderProductSlots?.() === true ? 'slots' : 'skeletons';
},
};
