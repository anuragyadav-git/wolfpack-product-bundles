import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { TemplateManager } from '../../shared/template-manager.js';
import { getDiscountProgressData } from '../../shared/engine/bundle-selectors.js';
import {
  applyDiscountProgressTransition,
  renderDiscountProgress,
} from '../../shared/components/discount-progress.js';
import { STOREFRONT_PROXY_ROOT } from '../../../../config/storefront-proxy-routes.js';

export const fullPageDiscountModalMethods: Record<string, any> & ThisType<any> = {
_renderDiscountProgress(options = {}) {
  const placement = options.placement || "default";
  const providedCombinedDiscountInfo = options.combinedDiscountInfo;
  const providedTotalPrice = options.totalPrice;
  const providedTotalQuantity = options.totalQuantity;
  const providedUnitPrices = options.unitPrices;

  if (!this.selectedBundle?.pricing?.enabled) return null;

  const { totalPrice, totalQuantity, unitPrices } = typeof providedTotalPrice === 'number' && typeof providedTotalQuantity === 'number'
    ? {
        totalPrice: providedTotalPrice,
        totalQuantity: providedTotalQuantity,
        unitPrices: providedUnitPrices || []
      }
    : PricingCalculator.calculateBundleTotal(
        this.selectedProducts,
        this.stepProductData,
        this.selectedBundle?.steps
      );
  const discountInfo = providedCombinedDiscountInfo ?? this.getDiscountInfoWithSelectedAddonDiscount(
    PricingCalculator.calculateDiscount(
      this.selectedBundle, totalPrice, totalQuantity, unitPrices
    ),
    totalPrice
  );
  const currencyInfo = CurrencyManager.getCurrencyInfo();
  const nextRule = PricingCalculator.getNextDiscountRule?.(this.selectedBundle, totalQuantity, totalPrice) || null;
  const variables = TemplateManager.createDiscountVariables(
    this.selectedBundle,
    totalPrice,
    totalQuantity,
    discountInfo,
    currencyInfo,
    { messageType: nextRule ? 'progress' : 'success' }
  );

  const isReached = discountInfo.hasDiscount && !nextRule;
  const progressBarType = this.config.discountProgressBarType === 'simple' ? 'simple' : 'step_based';
  const steppedProgressState = progressBarType === 'step_based'
    ? this.getDiscountProgressState(totalPrice, totalQuantity)
    : null;
  const milestones = steppedProgressState?.milestones || [];
  const progressPct = progressBarType === 'step_based' && milestones.length > 0
    ? steppedProgressState.progressPercent
    : isReached
      ? 100
      : Math.min(100, Math.max(0, parseInt(variables.progressPercentage, 10) || 0));

  let message = '';
  if (progressBarType === 'step_based' && milestones.length > 0) {
    message = '';
  } else if (isReached) {
    message = TemplateManager.replaceVariables(
      this.config.discountProgressSuccessTemplate || this.config.successMessageTemplate || '🎉 You\'ve unlocked {{discountText}}!',
      variables
    );
  } else if (nextRule) {
    message = TemplateManager.replaceVariables(
      this.config.discountProgressTextTemplate || this.config.discountTextTemplate || 'Add {{conditionText}} to get {{discountText}}',
      variables
    );
  } else {
    return null;
  }

  const progressData = getDiscountProgressData({
    currentValue: progressPct,
    targetValue: 100,
    message,
  });
  progressData.success = isReached;
  progressData.milestones = progressBarType === 'step_based' ? milestones : [];

  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderDiscountProgress(progressData, {
    mode: progressBarType === 'simple' ? 'bar' : 'stepped',
    messagePlacement: placement === 'sidebar' ? 'external' : 'inline',
    className: progressBarType === 'simple'
      ? `fpb-discount-progress fpb-dp-simple${isReached ? ' reached' : ''}`
      : `fpb-discount-progress fpb-dp-step_based${isReached ? ' reached' : ''}`,
    messageClassName: 'fpb-dp-row fpb-dp-message',
    trackClassName: 'fpb-dp-track',
    fillClassName: 'fpb-dp-fill',
    milestoneListClassName: 'fpb-discount-step-list',
    milestoneClassName: 'fpb-discount-step',
    milestoneReachedClassName: 'fpb-discount-step-reached',
    milestoneActiveClassName: 'fpb-discount-step-active',
    milestonePendingClassName: 'fpb-discount-step-pending',
    milestoneTitleClassName: 'fpb-discount-step-title',
    milestoneSubtitleClassName: 'fpb-discount-step-subtitle',
    milestoneMarkerClassName: 'fpb-discount-step-marker',
    milestonesOnTrack: progressBarType === 'step_based',
    renderInlineSubtitles: true,
    renderSubtitleList: false,
  }).trim();
  const bar = wrapper.firstElementChild;
  const previousProgressPercent = Number(options.previousProgressPercent);
  if (
    options.previousProgressPercent !== null
    && options.previousProgressPercent !== undefined
    && Number.isFinite(previousProgressPercent)
  ) {
    applyDiscountProgressTransition(bar, previousProgressPercent, progressPct);
  } else {
    applyDiscountProgressTransition(bar, progressPct, progressPct);
  }
  return bar;
},

// ========================================================================
// MODAL FUNCTIONALITY
// ========================================================================

// Helper method to get formatted header text
getFormattedHeaderText() {
  // If discount is not enabled, show step name (escaped)
  if (!this.selectedBundle?.pricing?.enabled) {
    const currentStep = this.selectedBundle?.steps?.[this.currentStepIndex];
    return this._escapeHTML(currentStep?.name) || `Step ${this.currentStepIndex + 1}`;
  }

  const { totalQuantity, totalPrice, unitPrices } = PricingCalculator.calculateBundleTotal(
    this.selectedProducts,
    this.stepProductData,
    this.selectedBundle?.steps
  );
  const discountInfo = PricingCalculator.calculateDiscount(
    this.selectedBundle,
    totalPrice,
    totalQuantity,
    unitPrices
  );
  const combinedDiscountInfo = this.getDiscountInfoWithSelectedAddonDiscount(discountInfo, totalPrice);
  const currencyInfo = CurrencyManager.getCurrencyInfo();
  const variables = TemplateManager.createDiscountVariables(
    this.selectedBundle,
    totalPrice,
    totalQuantity,
    combinedDiscountInfo,
    currencyInfo,
    { messageType: 'progress' }
  );

  return TemplateManager.replaceVariables(
    this.config.discountTextTemplate,
    variables
  );
},

openModal(stepIndex) {
  this.currentStepIndex = stepIndex;

  // Update modal header
  const modal = this.elements.modal;
  const headerText = this.getFormattedHeaderText();

  modal.querySelector('.modal-step-title').innerHTML = headerText;

  // Load and render products for this step
  this.loadStepProducts(stepIndex).then(() => {
    this.renderModalTabs();
    this.renderModalProducts(stepIndex);
    this.updateModalNavigation();
    this.updateModalFooterMessaging();

    // Show modal
    modal.hidden = false;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }).catch(error => {
    ToastManager.show('Failed to load products for this step');
  });
},

closeModal() {
  this.elements.modal.hidden = true;
  this.elements.modal.classList.remove('active');
  document.body.classList.remove('modal-open');

  // Update main UI
  this.renderSteps();
},

resolveStorefrontApiBase() {
  const appProxyPrefix = STOREFRONT_PROXY_ROOT;
  if (window.location?.pathname?.startsWith(`${appProxyPrefix}/`)) {
    return appProxyPrefix;
  }

  const configuredAppUrl = window.__BUNDLE_APP_URL__ || '';
  const currentHost = window.location.host;
  const shopDomain = window.Shopify?.shop || this.container?.dataset.shop || '';

  let configuredAppHost = '';
  if (configuredAppUrl) {
    try {
      configuredAppHost = new URL(configuredAppUrl).host;
    } catch (_error) {
      configuredAppHost = '';
    }
  }

  if (shopDomain && configuredAppHost !== currentHost) {
    return appProxyPrefix;
  }

  return configuredAppUrl || window.location.origin;
},
};
