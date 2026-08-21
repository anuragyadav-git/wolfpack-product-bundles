import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { calculateBundleDiscountForPurchaseOption } from '../../shared/subscription-storefront-methods.js';
import { calculateBundleTotalForPurchaseOption } from '../../shared/subscription-storefront-methods.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { TemplateManager } from '../../shared/template-manager.js';
import { getDiscountProgressData } from '../../shared/engine/bundle-selectors.js';
import {
  readRenderedDiscountProgressPercent,
  renderDiscountProgress,
} from '../../shared/components/discount-progress.js';
import { renderSelectedProductRow } from '../../shared/components/selected-product-row.js';
import { getSummaryDiscountBadgeLabel } from '../shared/summary-discount-badge.js';
import {
  createSummaryClearButton,
  getRemainingSummarySkeletonCount,
} from './side-panel-methods.js';
import { TemplateDesignSystem } from '../../shared/template-design-system.js';

const mobileSummaryTemplateSystem = TemplateDesignSystem;

function getSummarySlotQuantity(item: any = {}) {
  const quantity = Number(item?.quantity);
  return Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
}

function expandSelectedItemsForSummarySlots(allSelectedProducts: any[] = []) {
  const selectedProducts = Array.isArray(allSelectedProducts) ? allSelectedProducts : [];
  const expanded: any[] = [];

  selectedProducts.forEach((item) => {
    const normalizedQuantity = getSummarySlotQuantity(item);
    for (let index = 0; index < normalizedQuantity; index += 1) {
      expanded.push({ ...item, quantity: 1 });
    }
  });

  return expanded;
}

function syncCompactMobileSummaryDisclosureState(sheet: any, expanded: any) {
  const bundleItems = sheet.querySelector?.('.fpb-mobile-summary-bundle-items');
  if (!bundleItems) return;

  bundleItems.inert = !expanded;
  if (expanded) {
    bundleItems.removeAttribute?.('aria-hidden');
    return;
  }

  bundleItems.setAttribute?.('aria-hidden', 'true');
}

function getSelectionId(item: any = {}) {
  return String(item?.selectionId || '');
}

function isSupportedFpbPreset(rawValue: any) {
  if (typeof rawValue !== 'string') return false;
  if (typeof mobileSummaryTemplateSystem?.fpb?.isSupportedPreset === 'function') return mobileSummaryTemplateSystem.fpb.isSupportedPreset(rawValue);
  return Boolean(getFpbPresetContract(rawValue));
}

function getFpbPresetContract(rawValue: string) {
  if (typeof mobileSummaryTemplateSystem?.fpb?.resolveContract !== 'function') return null;
  return mobileSummaryTemplateSystem.fpb.resolveContract(rawValue) || null;
}

function isClassicFpbPreset(rawValue: any) {
  return getFpbPresetContract(rawValue)?.summary?.mode === 'slots';
}

function isStandardFpbPreset(rawValue: any) {
  const contract = getFpbPresetContract(rawValue);
  return contract?.summary?.mode === 'rows' && contract?.productCard?.mode === 'grid';
}

function isStandardOrClassicFpbPreset(rawValue: any) {
  return isStandardFpbPreset(rawValue) || isClassicFpbPreset(rawValue);
}

function supportsAdditionalOfferStatus(rawValue: string) {
  const contract = getFpbPresetContract(rawValue);
  if (contract?.mobileSummary?.showAdditionalOfferStatus != null) {
    return contract.mobileSummary.showAdditionalOfferStatus === true;
  }

  const summary = typeof mobileSummaryTemplateSystem?.getSummary === 'function'
    ? mobileSummaryTemplateSystem.getSummary()
    : null;
  const preset = typeof rawValue === 'string' ? rawValue.trim().toUpperCase() : '';
  if (!preset) return false;
  return Array.isArray(summary?.fpb?.presetsSupportingAdditionalOfferStatus)
    ? summary.fpb.presetsSupportingAdditionalOfferStatus.includes(preset)
    : false;
}

export function shouldUseMobileSummarySlotTiles({ designPreset, productSlotsEnabled }: any = {}) {
  if (productSlotsEnabled !== true) return false;
  return Boolean(getFpbPresetContract(designPreset));
}

export function shouldUseFluidMobileSummaryFooter(designPreset: any) {
  return isSupportedFpbPreset(designPreset);
}

export function getMobileAdditionalOffersStatus({
  designPreset,
  currentStepIndex = 0,
  steps = [],
  addonStates = [],
  message = 'Additional offers to be unlocked',
}: any = {}) {
  if (!supportsAdditionalOfferStatus(designPreset)) return { visible: false, message: '' };

  const bundleSteps = Array.isArray(steps) ? steps : [];
  const currentStep = bundleSteps[currentStepIndex] || null;
  if (currentStep?.isFreeGift === true) return { visible: false, message: '' };

  const states = Array.isArray(addonStates) ? addonStates.filter(Boolean) : [];
  const hasEligibleOffer = states.some(state => state.isEligible === true);
  const hasLockedOffer = states.some(state => state.isEligible !== true);
  if (!hasEligibleOffer || !hasLockedOffer) return { visible: false, message: '' };

  return {
    visible: true,
    message,
  };
}

export function shouldDismissMobileSummarySwipe({
  distanceY = 0,
  distanceX = 0,
  velocityY = 0,
}: any = {}) {
  const verticalDistance = Number(distanceY);
  const horizontalDistance = Math.abs(Number(distanceX));
  const downwardVelocity = Number(velocityY);
  if (!Number.isFinite(verticalDistance) || verticalDistance <= 0) return false;
  if (horizontalDistance > verticalDistance) return false;
  return verticalDistance >= 96 || downwardVelocity >= 0.6;
}

export function getMobileSummarySkeletonCount({
  remainingRequiredCount = 0,
  selectedLineItemCount = 0,
}: any = {}) {
  const remaining = Math.max(0, Number(remainingRequiredCount) || 0);
  const selectedRows = Math.max(0, Number(selectedLineItemCount) || 0);
  return Math.max(remaining, 3 - selectedRows);
}

function normalizeStepContentSubtext(value: string) {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  const normalized = text.toLowerCase();
  if (normalized === 'chrome async' || normalized === 'chrome async text') return '';
  if (!normalized.startsWith('chrome async ')) return text;

  const timestampParts = normalized.slice('chrome async '.length).split(':');
  const isTimestamp = (timestampParts.length === 2 || timestampParts.length === 3)
    && timestampParts.every((part, index) => {
      if (!part || part.length > 2 || !Array.from(part).every(character => character >= '0' && character <= '9')) {
        return false;
      }
      const number = Number(part);
      return index === 0 ? number <= 23 : number <= 59;
    });

  return isTimestamp ? '' : text;
}

const MOBILE_SUMMARY_DIALOG_ID = 'fpb-mobile-summary-dialog';

export const fullPageMobileSummaryMethods: Record<string, any> & ThisType<any> = {
_populateCompactMobileSummaryTray(sheet: any) {
  const previousListScrollTop = sheet.querySelector?.('.fpb-mobile-summary-products-list')?.scrollTop || 0;
  const previousProgressPercent = readRenderedDiscountProgressPercent(
    sheet.querySelector?.('.fpb-discount-progress')
  );
  sheet.innerHTML = '';

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
  const finalPrice = combinedDiscountInfo.hasDiscount ? combinedDiscountInfo.finalPrice : totalPrice;
  const discountBadgeLabel = getSummaryDiscountBadgeLabel(
    combinedDiscountInfo,
    CurrencyManager.convertAndFormat(combinedDiscountInfo.discountAmount, currencyInfo)
  );
  const nextRule = PricingCalculator.getNextDiscountRule?.(this.selectedBundle, totalQuantity, totalPrice) || null;
  const allSelectedProducts = this.getAllSelectedProductsData();
  const shouldRenderSlotTiles = shouldUseMobileSummarySlotTiles({
    designPreset: this.getFullPageDesignPreset(),
    productSlotsEnabled: this._shouldRenderProductSlots(),
  });
  const selectedSlotItems = shouldRenderSlotTiles
    ? expandSelectedItemsForSummarySlots(allSelectedProducts)
    : [];
  const selectedFooterQuantity = shouldRenderSlotTiles
    ? selectedSlotItems.length
    : allSelectedProducts.reduce((sum: number, item: any) => {
      const quantity = Number(item.quantity);
      return sum + (Number.isFinite(quantity) ? quantity : 0);
    }, 0);
  const summaryText = this.getBundleSummaryText?.();
  const designPreset = this.getFullPageDesignPreset?.();
  sheet.classList.toggle(
    'fpb-mobile-summary-fluid-footer',
    shouldUseFluidMobileSummaryFooter(designPreset)
  );
  const summaryToggleLabel = summaryText?.title || 'Review your bundle';
  const addonStep = (this.selectedBundle?.steps || []).find((step: any)  => step?.isFreeGift === true) || null;
  const addonStates = addonStep && typeof this.getAddonSummaryEligibilityStates === 'function'
    ? this.getAddonSummaryEligibilityStates(addonStep)
    : [];
  const additionalOffersStatus = getMobileAdditionalOffersStatus({
    designPreset: this.getFullPageDesignPreset?.(),
    currentStepIndex: this.currentStepIndex,
    steps: this.selectedBundle?.steps || [],
    addonStates,
    message: this._resolveText?.('mobileAddonNotification', 'Additional offers to be unlocked')
      || 'Additional offers to be unlocked',
  });
  const toggleSummaryTray = () => {
    this._toggleCompactMobileSummaryTray(sheet);
  };
  const dock = document.createElement('div');
  dock.className = 'fpb-mobile-summary-dock';
  const countBadge = document.createElement('button');
  countBadge.className = 'fpb-mobile-summary-count-badge';
  countBadge.setAttribute('data-wpb-discount-feedback-pill', '');
  countBadge.setAttribute('type', 'button');
  countBadge.setAttribute('aria-controls', MOBILE_SUMMARY_DIALOG_ID);
  if (countBadge.dataset) {
    countBadge.dataset.summaryQuantity = String(selectedFooterQuantity);
  } else {
    countBadge.setAttribute('data-summary-quantity', String(selectedFooterQuantity));
  }
  const toggleCopy = document.createElement('span');
  toggleCopy.className = 'fpb-mobile-summary-toggle-copy';
  const toggleTitle = document.createElement('span');
  toggleTitle.className = 'fpb-mobile-summary-toggle-title';
  toggleTitle.textContent = summaryToggleLabel;
  const toggleValue = document.createElement('span');
  toggleValue.className = 'fpb-mobile-summary-toggle-count';
  toggleValue.setAttribute('data-mobile-summary-toggle-value', '');
  toggleValue.textContent = String(selectedFooterQuantity);
  toggleCopy.append(toggleTitle, toggleValue);
  const togglePrices = document.createElement('span');
  togglePrices.className = 'fpb-mobile-summary-toggle-prices';
  const toggleFinalPrice = document.createElement('span');
  toggleFinalPrice.className = 'fpb-mobile-summary-toggle-final-price';
  toggleFinalPrice.textContent = CurrencyManager.convertAndFormat(finalPrice, currencyInfo);
  togglePrices.appendChild(toggleFinalPrice);
  if (combinedDiscountInfo.hasDiscount && finalPrice < totalPrice) {
    const toggleComparePrice = document.createElement('span');
    toggleComparePrice.className = 'fpb-mobile-summary-toggle-compare-price';
    toggleComparePrice.textContent = CurrencyManager.convertAndFormat(totalPrice, currencyInfo);
    togglePrices.appendChild(toggleComparePrice);
  }
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'fpb-mobile-summary-toggle-icon';
  toggleIcon.setAttribute('aria-hidden', 'true');
  toggleIcon.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.07827 11.2095C6.36662 11.4773 6.81745 11.4606 7.0852 11.1722L9.65059 8.4095L12.216 11.1722C12.4837 11.4606 12.9346 11.4773 13.2229 11.2095C13.5113 10.9418 13.528 10.4909 13.2602 10.2026L10.1727 6.87758C10.0379 6.73239 9.84871 6.6499 9.65059 6.6499C9.45247 6.6499 9.26329 6.73239 9.12847 6.87758L6.04097 10.2026C5.77321 10.4909 5.78991 10.9418 6.07827 11.2095Z" fill="currentColor"></path>
    </svg>
  `;
  countBadge.append(toggleCopy, togglePrices, toggleIcon);
  countBadge.setAttribute('aria-label', summaryToggleLabel);
  countBadge.setAttribute('aria-expanded', this.compactMobileSummaryTrayExpanded ? 'true' : 'false');
  countBadge.addEventListener('click', toggleSummaryTray);
  dock.appendChild(countBadge);

  const dialog = document.createElement('dialog');
  dialog.className = 'fpb-mobile-summary-dialog';
  dialog.id = MOBILE_SUMMARY_DIALOG_ID;
  dialog.setAttribute('aria-label', summaryToggleLabel);
  const dialogPanel = document.createElement('div');
  dialogPanel.className = 'fpb-mobile-summary-dialog-panel';
  dialogPanel.tabIndex = -1;
  const dragHandle = document.createElement('div');
  dragHandle.className = 'fpb-mobile-summary-drag-handle';
  dragHandle.setAttribute('aria-hidden', 'true');
  dialogPanel.appendChild(dragHandle);

  sheet.classList.toggle('fpb-mobile-summary-tray-expanded', this.compactMobileSummaryTrayExpanded);
  sheet.classList.toggle(
    'fpb-mobile-summary-tray--slots',
    shouldRenderSlotTiles
  );
  sheet.classList.remove('fpb-mobile-summary-tray--has-discount-summary');

  if (this.selectedBundle?.pricing?.enabled) {
    const discountBlock = document.createElement('div');
    discountBlock.className = 'side-panel-discount-message';
    if (this.config.showDiscountMessaging) {
      const variables = TemplateManager.createDiscountVariables(
        this.selectedBundle,
        totalPrice,
        totalQuantity,
        combinedDiscountInfo,
        currencyInfo,
        { messageType: nextRule ? 'progress' : 'success' }
      );
      let discountMessage = '';
      if (nextRule) {
        const progressTemplate = TemplateManager.getDiscountMessageTemplate({
          bundle: this.selectedBundle,
          totalQuantity,
          totalPrice,
          discountInfo: combinedDiscountInfo,
          messageType: 'progress',
          fallbackTemplate: this.config.discountTextTemplate || 'Add {conditionText} to get {discountText}',
          locale: window.Shopify?.locale,
        });
        discountMessage = TemplateManager.replaceVariables(
          progressTemplate,
          variables
        );
      } else if (
        combinedDiscountInfo.hasDiscount
        || combinedDiscountInfo.qualifiesForDiscount
      ) {
        const successTemplate = TemplateManager.getDiscountMessageTemplate({
          bundle: this.selectedBundle,
          totalQuantity,
          totalPrice,
          discountInfo: combinedDiscountInfo,
          messageType: 'success',
          fallbackTemplate: this.config.successMessageTemplate || '🎉 You unlocked {{discountText}}!',
          locale: window.Shopify?.locale,
        });
        discountMessage = TemplateManager.replaceVariables(
          successTemplate,
          variables
        );
      }
      if (discountMessage) {
        const msgEl = document.createElement('div');
        msgEl.className = 'fpb-mobile-summary-discount-text';
        msgEl.innerHTML = discountMessage;
        discountBlock.appendChild(msgEl);
      }
    }

    if (this.config.showDiscountProgressBar) {
      const progressBar = this._renderDiscountProgress({
        placement: "sidebar",
        combinedDiscountInfo,
        totalPrice,
        totalQuantity,
        unitPrices,
        previousProgressPercent,
      });
      if (progressBar) {
        progressBar.classList.add('fpb-dp-sidebar');
        discountBlock.appendChild(progressBar);
      }
    }

    if (discountBlock.childElementCount > 0) {
      sheet.classList.add('fpb-mobile-summary-tray--has-discount-summary');
      dialogPanel.appendChild(discountBlock);
    }
  }

  if (additionalOffersStatus.visible) {
    const offerStatus = document.createElement('div');
    offerStatus.className = 'fpb-mobile-summary-offer-status';
    offerStatus.textContent = additionalOffersStatus.message;
    dialogPanel.appendChild(offerStatus);
  }

  const isLastStep = this.currentStepIndex === (this.selectedBundle?.steps?.length || 1) - 1;
  const conditionlessMobile = this.bundleHasNoConditions();
  const actionArgs: any = {
    discountBadgeLabel,
    conditionlessMobile,
    isLastStep,
    isComplete: this.areBundleConditionsMet()
  };
  const dockNav = document.createElement('div');
  dockNav.className = 'side-panel-nav fpb-mobile-summary-dock-nav';
  dockNav.appendChild(this._createMobileSummaryActionButton(actionArgs));
  dock.appendChild(dockNav);

  const productsSection = document.createElement('div');
  productsSection.className = 'fpb-mobile-summary-products-section';
  const bundleItems = this._renderCompactMobileSummaryBundleItems(currencyInfo, totalQuantity);
  productsSection.appendChild(bundleItems);
  dialogPanel.appendChild(productsSection);

  const purchaseOptionsMount = document.createElement('div');
  dialogPanel.appendChild(purchaseOptionsMount);
  this.elements = this.elements || {};
  this.elements.purchaseOptionsMounts = {
    ...(this.elements.purchaseOptionsMounts || {}),
    fpbMobile: purchaseOptionsMount,
  };

  const totals = document.createElement('div');
  totals.className = 'fpb-mobile-summary-totals';
  const totalHeading = document.createElement('div');
  totalHeading.className = 'fpb-mobile-summary-total-heading';
  const totalLabel = document.createElement('span');
  totalLabel.className = 'side-panel-total-label';
  totalLabel.textContent = 'Total';
  totalHeading.appendChild(totalLabel);
  const totalPrices = document.createElement('div');
  totalPrices.className = 'fpb-mobile-summary-total-prices';
  const finalTotal = document.createElement('span');
  finalTotal.className = 'side-panel-total';
  finalTotal.textContent = CurrencyManager.convertAndFormat(finalPrice, currencyInfo);
  totalPrices.appendChild(finalTotal);
  if (combinedDiscountInfo.hasDiscount && finalPrice < totalPrice) {
    const compareTotal = document.createElement('span');
    compareTotal.className = 'side-panel-compare-price';
    compareTotal.textContent = CurrencyManager.convertAndFormat(totalPrice, currencyInfo);
    totalPrices.appendChild(compareTotal);
  }
  totals.append(totalHeading, totalPrices);
  dialogPanel.appendChild(totals);

  const dialogNav = document.createElement('div');
  dialogNav.className = 'side-panel-nav fpb-mobile-summary-dialog-nav';
  dialogNav.appendChild(this._createMobileSummaryActionButton(actionArgs));
  dialogPanel.appendChild(dialogNav);
  dialog.appendChild(dialogPanel);
  sheet.append(dock, dialog);
  if (this._bindCompactMobileSummaryDialog) {
    this._bindCompactMobileSummaryDialog(sheet, dialog, dragHandle);
  } else {
    fullPageMobileSummaryMethods._bindCompactMobileSummaryDialog.call(
      this,
      sheet,
      dialog,
      dragHandle
    );
  }

  const productsList = dialog.querySelector?.('.fpb-mobile-summary-products-list');
  if (productsList) productsList.scrollTop = previousListScrollTop;
  if (this.compactMobileSummaryTrayExpanded === true) {
    this._setCompactMobileSummaryOpen(sheet, true, { restoreFocus: false });
  }
  this.renderPurchaseOptions?.();
},

_toggleCompactMobileSummaryTray(sheet: any) {
  const nextExpanded = !this.compactMobileSummaryTrayExpanded;
  this._setCompactMobileSummaryOpen?.(sheet, nextExpanded);
  if (!this._setCompactMobileSummaryOpen) {
    fullPageMobileSummaryMethods._setCompactMobileSummaryOpen.call(this, sheet, nextExpanded);
  }
},

_setCompactMobileSummaryOpen(sheet: any, expanded: boolean, { restoreFocus = true }: any = {}) {
  const dialog = sheet.querySelector?.('.fpb-mobile-summary-dialog');
  const trigger = sheet.querySelector?.('.fpb-mobile-summary-count-badge');
  this.compactMobileSummaryTrayExpanded = expanded === true;
  sheet.classList.toggle('fpb-mobile-summary-tray-expanded', expanded === true);
  trigger?.setAttribute('aria-expanded', expanded ? 'true' : 'false');

  if (expanded) {
    if (dialog && !dialog.open) dialog.showModal?.();
    document.body?.classList?.add('fpb-mobile-summary-scroll-locked');
    dialog?.querySelector?.('.fpb-mobile-summary-dialog-panel')?.focus?.();
    return;
  }

  if (dialog?.open) dialog.close?.();
  document.body?.classList?.remove('fpb-mobile-summary-scroll-locked');
  if (restoreFocus) trigger?.focus?.();
},

_bindCompactMobileSummaryDialog(sheet: any, dialog: any, dragHandle: any) {
  if (!dialog || dialog.dataset?.fpbSummaryBound === 'true') return;
  if (dialog.dataset) dialog.dataset.fpbSummaryBound = 'true';

  dialog.addEventListener?.('cancel', (event: any) => {
    event.preventDefault?.();
    this._setCompactMobileSummaryOpen(sheet, false);
  });
  dialog.addEventListener?.('click', (event: any) => {
    if (event.target === dialog) this._setCompactMobileSummaryOpen(sheet, false);
  });
  dialog.addEventListener?.('close', () => {
    if (this.compactMobileSummaryTrayExpanded) {
      this.compactMobileSummaryTrayExpanded = false;
      sheet.classList.toggle('fpb-mobile-summary-tray-expanded', false);
      sheet.querySelector?.('.fpb-mobile-summary-count-badge')
        ?.setAttribute('aria-expanded', 'false');
      document.body?.classList?.remove('fpb-mobile-summary-scroll-locked');
    }
  });

  let gesture: any = null;
  dragHandle?.addEventListener?.('pointerdown', (event: any) => {
    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: performance.now(),
    };
    dragHandle.setPointerCapture?.(event.pointerId);
  });
  dragHandle?.addEventListener?.('pointermove', (event: any) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const distanceY = Math.max(0, event.clientY - gesture.startY);
    dialog.style?.setProperty?.('--fpb-mobile-summary-drag-y', `${distanceY}px`);
  });
  const finishGesture = (event: any) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const elapsed = Math.max(1, performance.now() - gesture.startedAt);
    const distanceY = event.clientY - gesture.startY;
    const distanceX = event.clientX - gesture.startX;
    gesture = null;
    dialog.style?.removeProperty?.('--fpb-mobile-summary-drag-y');
    if (shouldDismissMobileSummarySwipe({
      distanceY,
      distanceX,
      velocityY: distanceY / elapsed,
    })) {
      this._setCompactMobileSummaryOpen(sheet, false);
    }
  };
  dragHandle?.addEventListener?.('pointerup', finishGesture);
  dragHandle?.addEventListener?.('pointercancel', () => {
    gesture = null;
    dialog.style?.removeProperty?.('--fpb-mobile-summary-drag-y');
  });
},

_syncCompactMobileSummaryDisclosureState(sheet: any, expanded: any) {
  syncCompactMobileSummaryDisclosureState(sheet, expanded);
},

_renderCompactMobileSummaryBundleItems(currencyInfo: any, totalQuantity: number) {
  const allSelectedProducts = this.getAllSelectedProductsData();
  const activeStep = this.selectedBundle?.steps?.[this.currentStepIndex] || this.selectedBundle?.steps?.[0] || null;
  const summaryText = this.getBundleSummaryText();

  const bundleItems = document.createElement('div');
  bundleItems.className = 'fpb-mobile-summary-bundle-items';

  const header = document.createElement('div');
  header.className = 'fpb-mobile-summary-bundle-header';

  const headerCopy = document.createElement('div');
  headerCopy.className = 'fpb-mobile-summary-bundle-copy';
  const title = document.createElement('div');
  title.className = 'fpb-mobile-summary-bundle-title';
  title.textContent = summaryText.title;
  const subtitle = document.createElement('div');
  subtitle.className = 'fpb-mobile-summary-bundle-subtitle';
  subtitle.textContent = summaryText.subTitle;
  headerCopy.append(title, subtitle);
  header.appendChild(headerCopy);

  if (allSelectedProducts.length > 0) {
    header.appendChild(createSummaryClearButton(() => this.showClearCartConfirmation()));
  }
  bundleItems.appendChild(header);

  const selectedBoxSelectionQuantity = this.getSelectedBoxSelectionQuantity();
  const boxSelection = this.renderBoxSelectionOptions(selectedBoxSelectionQuantity);
  if (boxSelection) {
    boxSelection.classList.add('fpb-mobile-summary-box-selection');
    bundleItems.appendChild(boxSelection);
  }

  const productsList = document.createElement('div');
  productsList.className = 'fpb-mobile-summary-products-list';
  const shouldRenderSlotTiles = shouldUseMobileSummarySlotTiles({
    designPreset: this.getFullPageDesignPreset(),
    productSlotsEnabled: this._shouldRenderProductSlots(),
  });

  if (shouldRenderSlotTiles) {
    productsList.classList.add('fpb-mobile-summary-products-list--slots');
    this._renderCompactMobileSummarySlotTiles(productsList, allSelectedProducts, activeStep, totalQuantity);
    bundleItems.appendChild(productsList);
    return bundleItems;
  }

  allSelectedProducts.forEach((item: any)  => {
    const summaryTitle = this.getSummaryProductDisplayTitle(item);
    const variantInfo = this.getSummaryProductVariantDisplay(item);
    const row = document.createElement('div');
    row.className = 'fpb-mobile-summary-product-row';
    const imgSrc = this._getSelectedProductImageSrc(item);
    const isFreeGiftItem = item.isFreeGift === true && item.addonDisplayFree === true;
    const priceText = CurrencyManager.convertAndFormat(
      isFreeGiftItem ? 0 : item.price * item.quantity,
      currencyInfo
    );

    row.innerHTML = `
      <div class="fpb-mobile-summary-product-image-wrap">
        ${imgSrc ? `<img src="${imgSrc}" alt="${this._escapeHTML(summaryTitle)}" class="fpb-mobile-summary-product-image">` : '<div class="fpb-mobile-summary-product-image-placeholder"></div>'}
      </div>
      <div class="fpb-mobile-summary-product-info">
        <span class="fpb-mobile-summary-product-title">${this._escapeHTML(summaryTitle)}</span>
        ${variantInfo ? `<span class="fpb-mobile-summary-product-variant">${this._escapeHTML(variantInfo)}</span>` : ''}
        <span class="fpb-mobile-summary-product-price">${priceText}</span>
      </div>
      <div class="fpb-mobile-summary-product-action">
        <span class="fpb-mobile-summary-product-qty">x${item.quantity}</span>
      </div>
    `;

    if (!item.isDefault) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'fpb-mobile-summary-product-remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute(
        'aria-label',
        this.getSummaryProductRemoveButtonLabel(summaryTitle)
      );
      const removalState = this.getSummaryProductRemovalState(item);
      if (!removalState.canRemove) {
        removeBtn.classList.add('fpb-mobile-summary-product-remove--disabled');
        removeBtn.setAttribute('aria-disabled', 'true');
        removeBtn.title = removalState.blockedMessage;
      }
      removeBtn.innerHTML = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6 2h8a1 1 0 0 1 1 1v1H5V3a1 1 0 0 1 1-1Zm-2 3h12l-1 13H5L4 5Zm4 2v9m4-9v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`;
      removeBtn.addEventListener('click', () => {
        this.removeSummarySelectedProduct(item, summaryTitle);
      });
      row.querySelector('.fpb-mobile-summary-product-action')?.appendChild(removeBtn);
    }

    productsList.appendChild(row);
  });

  const remainingSummarySkeletonCount = getRemainingSummarySkeletonCount({
    designPreset: this.getFullPageDesignPreset(),
    productSlotsEnabled: this._shouldRenderProductSlots(),
    requiredQuantity: typeof this.getSummarySidebarMaxItemCount === 'function'
      ? this.getSummarySidebarMaxItemCount()
      : 0,
    selectedQuantity: totalQuantity,
  });
  const mobileSummarySkeletonCount = getMobileSummarySkeletonCount({
    remainingRequiredCount: remainingSummarySkeletonCount,
    selectedLineItemCount: allSelectedProducts.length,
  });

  if (
    mobileSummarySkeletonCount > 0
    && typeof this._renderSidebarProductSkeletons === 'function'
  ) {
    productsList.classList.add('fpb-mobile-summary-products-list--skeletons');
    this._renderSidebarProductSkeletons(productsList, mobileSummarySkeletonCount);
  }

  const requiredSlots = Math.max(
    allSelectedProducts.length,
    totalQuantity,
    2
  );
  if (this._shouldRenderProductSlots()) {
    const emptySlots = Math.max(0, Math.min(2, requiredSlots - allSelectedProducts.length));
    const emptyStateIconUrl = this._escapeHTML(this.selectedBundle?.productSlotIconUrl || '');
    for (let slotIndex = 0; slotIndex < emptySlots; slotIndex += 1) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'fpb-mobile-summary-empty-product-card';
      const emptyStateIcon = emptyStateIconUrl
        ? `<img class="fpb-mobile-summary-slot-icon-img" src="${emptyStateIconUrl}" alt="" width="63" height="63">`
        : '<span class="fpb-mobile-summary-slot-plus">+</span>';
      emptyCard.innerHTML = `
        <div class="fpb-mobile-summary-empty-product-image">${emptyStateIcon}</div>
        <div class="fpb-mobile-summary-empty-product-info">
          <span class="fpb-mobile-summary-empty-product-title"></span>
          <span class="fpb-mobile-summary-empty-product-variant"></span>
          <span class="fpb-mobile-summary-empty-product-price"></span>
        </div>
        <span class="fpb-mobile-summary-empty-product-action"></span>
      `;
      productsList.appendChild(emptyCard);
    }
  }

  bundleItems.appendChild(productsList);
  return bundleItems;
},

_renderCompactMobileSummarySlotTiles(container: any, allSelectedProducts: any[] = [], activeStep: any = null, totalQuantity = 0) {
  const selectedItems = expandSelectedItemsForSummarySlots(allSelectedProducts);
  const selectedCount = selectedItems.length;
  const sharedTargetCount = typeof this.getSummarySidebarMaxItemCount === 'function'
    ? this.getSummarySidebarMaxItemCount(selectedCount)
    : 0;
  const slotCount = Math.max(
    sharedTargetCount,
    selectedCount,
    2
  );
  const emptyStateIconUrl = this._escapeHTML(this.selectedBundle?.productSlotIconUrl || '');

  for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
    const item = selectedItems[slotIndex];
    const card = document.createElement('div');
    card.className = item
      ? 'fpb-mobile-summary-slot-card fpb-mobile-summary-slot-card--filled'
      : 'fpb-mobile-summary-slot-card fpb-mobile-summary-slot-card--empty';

    if (item) {
      const summaryTitle = this.getSummaryProductDisplayTitle(item);
      const imgSrc = this._getSelectedProductImageSrc(item);
      card.innerHTML = imgSrc
        ? `<img src="${imgSrc}" alt="${this._escapeHTML(summaryTitle)}" class="fpb-mobile-summary-slot-image">`
        : '<div class="fpb-mobile-summary-slot-image-placeholder"></div>';
    } else {
      card.innerHTML = emptyStateIconUrl
        ? `<img class="fpb-mobile-summary-slot-icon-img" src="${emptyStateIconUrl}" alt="">`
        : '<span class="fpb-mobile-summary-slot-plus">+</span>';
    }

    container.appendChild(card);
  }
},

_createMobileSummaryActionButton({
  discountBadgeLabel,
  conditionlessMobile,
  isLastStep,
  isComplete
}: any) {
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'side-panel-btn side-panel-btn-next';
  const shouldAdvance = !conditionlessMobile && !isLastStep;
  const shouldAddToCart = !shouldAdvance && (conditionlessMobile || isLastStep);
  const actionText = shouldAddToCart
    ? this._resolveText('addToCartButton', 'Add to Cart')
    : this._resolveText('nextButton', 'Next');
  const labelSpan = document.createElement('span');
  labelSpan.className = 'fpb-mobile-summary-action-label';
  labelSpan.textContent = actionText;
  ctaBtn.appendChild(labelSpan);
  if (shouldAddToCart && discountBadgeLabel) {
    const discountBadge = document.createElement('span');
    discountBadge.className = 'fpb-summary-discount-badge fpb-mobile-summary-action-discount-badge';
    discountBadge.setAttribute('data-wpb-discount-feedback-pill', '');
    discountBadge.textContent = discountBadgeLabel;
    ctaBtn.appendChild(discountBadge);
  }
  const isClassicPreset = isClassicFpbPreset(this.getFullPageDesignPreset?.());
  const shouldKeepClassicValidationClickable = isClassicPreset && shouldAddToCart && !conditionlessMobile && !isComplete;
  if (
    shouldAddToCart
    && !shouldKeepClassicValidationClickable
    && (conditionlessMobile ? !this.canCheckoutWithBoxSelection() : (!isComplete || !this.canCheckoutWithBoxSelection()))
  ) ctaBtn.disabled = true;
  ctaBtn.addEventListener('click', async () => {
    if (shouldAddToCart) {
      if (!conditionlessMobile && !this.areBundleConditionsMet()) {
        ToastManager.show(this.getStepConditionValidationMessage?.() || 'Please meet the quantity conditions for the current step before proceeding.');
        return;
      }
      if (!this.canCheckoutWithBoxSelection()) {
        this.showBoxSelectionValidationMessage();
        return;
      }
      await this.addBundleToCart(ctaBtn);
    } else {
      const targetStepIndex = this.currentStepIndex + 1;
      if (this.canNavigateToStep(targetStepIndex) && this.canProceedToNextStep()) {
        const previousStepIndex = this.currentStepIndex;
        this.activeCollectionId = null;
        this.searchQuery = '';
        this.currentStepIndex = targetStepIndex;
        this._emitStorefrontEvent('step-changed', { previousStepIndex, currentStepIndex: targetStepIndex, direction: 'next' });
        await this._withWidgetActionBusy(async () => {
          await this.renderFullPageLayout();
        }, { actionButton: ctaBtn });
      } else if (!this.canNavigateToStep(targetStepIndex)) {
        ToastManager.show(this.freeGiftStep?.addonLabel || this.freeGiftStep?.freeGiftName ? `Complete all steps to unlock the free ${this.freeGiftStep?.addonLabel || this.freeGiftStep?.freeGiftName}!` : 'Complete all steps first.');
      } else {
        ToastManager.show(this.getStepConditionValidationMessage?.() || 'Please meet the quantity conditions for the current step before proceeding.');
      }
    }
  });
  return ctaBtn;
},

getBundleSummaryText() {
  const summary = this.selectedBundle?.bundleTextConfig?.bundleSummary || {};
  const summaryTitle = typeof summary.title === 'string'
    ? summary.title.trim()
    : '';
  const bundleName = typeof this.selectedBundle?.name === 'string'
    ? this.selectedBundle.name.trim()
    : '';
  return {
    title: summaryTitle || bundleName,
    subTitle: typeof summary.subTitle === 'string' && summary.subTitle.trim()
      ? summary.subTitle
      : 'Review your bundle'
  };
},

getBundleContentSummaryText() {
  const summary = this.selectedBundle?.bundleTextConfig?.bundleSummary || {};
  return {
    title: typeof summary.title === 'string' ? summary.title.trim() : '',
    subTitle: typeof summary.subTitle === 'string' ? summary.subTitle.trim() : ''
  };
},

getCurrentStepContentText(stepIndex: string|number) {
  const step = this.selectedBundle?.steps?.[stepIndex];
  return {
    subtext: normalizeStepContentSubtext(step?.pageTitle)
  };
},

createStepContentHeader(stepIndex: any) {
  if (!this.shouldRenderFullPageStepChrome()) return null;

  const contentText = this.getCurrentStepContentText(stepIndex);
  if (!contentText.subtext) return null;

  const header = document.createElement('div');
  header.className = 'fpb-full-page-content-header';

  const subtitle = document.createElement('p');
  subtitle.className = 'fpb-full-page-content-subtitle fpb-step-subtext';
  subtitle.textContent = contentText.subtext;
  header.appendChild(subtitle);

  return header;
},

shouldRenderFullPageSearch() {
  if (this.resolveFullPageLayout() === 'footer_side') {
    return false;
  }
  return this.resolveFullPageCardCtaMode() !== 'icon';
},

usesSelectedQuantityBadge() {
  return false;
},

_isStandardDesktopSidebar(panel: any) {
  const preset = this.getFullPageDesignPreset();
  return this.resolveFullPageLayout() === 'footer_side'
    && isStandardOrClassicFpbPreset(preset)
    && !panel?.classList?.contains('fpb-mobile-bottom-sheet');
},

createStandardSidebarSelectedRow(item: any, currencyInfo: any) {
  const summaryTitle = this.getSummaryProductDisplayTitle(item);
  const variantInfo = this.getSummaryProductVariantDisplay(item);
  const isFreeGiftItem = item.isFreeGift === true && item.addonDisplayFree === true;
  const priceText = isFreeGiftItem
    ? CurrencyManager.convertAndFormat(0, currencyInfo)
    : CurrencyManager.convertAndFormat(item.price * item.quantity, currencyInfo);
  const wrapper = document.createElement('div');

  wrapper.innerHTML = renderSelectedProductRow({
    id: getSelectionId(item),
    title: summaryTitle,
    variantTitle: variantInfo,
    imageUrl: this._getSelectedProductImageSrc(item),
    quantity: item.quantity,
    priceText,
    isDefault: item.isDefault === true,
    isFreeGift: isFreeGiftItem,
  }).trim();

  const row = wrapper.firstElementChild;
  row?.classList?.add('side-panel-product-row');
  return row;
},

createStandardSidebarDiscountProgress({ discountMessage, combinedDiscountInfo, totalPrice, totalQuantity }: any) {
  const activeRule = combinedDiscountInfo?.applicableRule
    || PricingCalculator.getNextDiscountRule?.(this.selectedBundle, totalQuantity, totalPrice)
    || null;
  if (!activeRule) return null;

  const conditionType = PricingCalculator.getRuleConditionType(activeRule);
  const targetValue = PricingCalculator.getRuleConditionValue(
    activeRule,
    PricingCalculator.getDiscountMethod(this.selectedBundle)
  );
  const currentValue = conditionType === 'amount' ? totalPrice : totalQuantity;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderDiscountProgress(
    getDiscountProgressData({
      currentValue,
      targetValue,
      message: discountMessage || '',
    }),
    {
      mode: this.config.discountProgressBarType === 'simple' ? 'bar' : 'stepped',
      messagePlacement: 'external',
    }
  ).trim();

  const progress = wrapper.firstElementChild;
  progress?.classList?.add('bw-discount-progress--standard-sidebar');
  progress?.classList?.add('fpb-dp-sidebar');
  return progress;
},

// Render the sidebar panel content (used by footer_side layout)
};
