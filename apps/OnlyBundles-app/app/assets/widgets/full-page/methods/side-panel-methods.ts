import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { calculateBundleDiscountForPurchaseOption, calculateBundleTotalForPurchaseOption } from '../../shared/subscription-storefront-methods.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { TemplateManager } from '../../shared/template-manager.js';
import { getSummaryDiscountBadgeLabel } from '../shared/summary-discount-badge.js';
import { TemplateDesignSystem } from '../../shared/template-design-system.js';
import { readRenderedDiscountProgressPercent } from '../../shared/components/discount-progress.js';
import { createMessageFragment, type MessageSegment } from '../../shared/message-segments.js';
import { createChevronIcon, createTrashIcon } from '../../shared/svg-icons.js';

const sidePanelTemplateSystem = TemplateDesignSystem;

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

function getSelectionId(item: any = {}) {
  return String(item?.selectionId || '');
}

function isSupportedFpbPreset(rawValue: any) {
  if (typeof sidePanelTemplateSystem?.fpb?.isSupportedPreset === 'function') {
    return sidePanelTemplateSystem.fpb.isSupportedPreset(rawValue);
  }
  return Boolean(getFpbPresetContract(rawValue));
}

function getFpbPresetContract(designPreset: any) {
  if (typeof sidePanelTemplateSystem?.fpb?.resolveContract !== 'function') return null;
  return sidePanelTemplateSystem.fpb.resolveContract(designPreset) || null;
}

function isHorizontalFpbPreset(designPreset: any) {
  return getFpbPresetContract(designPreset)?.productCard?.mode === 'row';
}

function isClassicFpbPreset(designPreset: any) {
  return getFpbPresetContract(designPreset)?.summary?.mode === 'slots';
}

function isStandardFpbPreset(designPreset: any) {
  const contract = getFpbPresetContract(designPreset);
  return contract?.summary?.mode === 'rows' && contract?.productCard?.mode === 'grid';
}

function isStandardOrClassicFpbPreset(designPreset: any) {
  return isStandardFpbPreset(designPreset) || isClassicFpbPreset(designPreset);
}

export function shouldUseSharedDesktopSummarySlotTiles({
  designPreset,
  productSlotsEnabled,
}: any = {}) {
  if (productSlotsEnabled !== true) return false;
  const contract = getFpbPresetContract(designPreset);
  return isSupportedFpbPreset(designPreset) && contract?.summary?.mode !== 'slots';
}

export function shouldUseClassicDesktopSummarySlotTiles({
  isClassicDesktopSidebar,
  productSlotsEnabled,
}: any = {}) {
  return isClassicDesktopSidebar === true && productSlotsEnabled === true;
}

export function shouldUseSharedDesktopSummaryRows({
  designPreset,
  isMobileSheet,
  productSlotsEnabled,
}: any = {}) {
  return isSupportedFpbPreset(designPreset)
    && isMobileSheet !== true
    && productSlotsEnabled !== true;
}

export function getRemainingSummarySkeletonCount({
  designPreset,
  productSlotsEnabled,
  requiredQuantity,
  selectedQuantity,
}: any = {}) {
  if (productSlotsEnabled === true) return 0;
  if (!isSupportedFpbPreset(designPreset)) return 0;

  const required = Number(requiredQuantity);
  const selected = Number(selectedQuantity);
  const target = Number.isFinite(required) && required > 0
    ? Math.max(2, required)
    : 2;

  return Math.max(0, target - (Number.isFinite(selected) ? Math.max(0, selected) : 0));
}

export function createSummaryClearButton(onClear: any, label = 'Clear') {
  const clearButton = document.createElement('button');
  clearButton.className = 'side-panel-clear-btn';
  clearButton.type = 'button';
  clearButton.append(createTrashIcon(document, 13));
  const labelElement = document.createElement('span');
  labelElement.textContent = label;
  clearButton.appendChild(labelElement);
  clearButton.addEventListener('click', onClear);
  return clearButton;
}

export const fullPageSidePanelMethods: Record<string, any> & ThisType<any> = {
renderSidePanel(panel: any) {
  if (!panel) return;
  const previousProgressPercent = readRenderedDiscountProgressPercent(
    panel.querySelector?.('.fpb-discount-progress')
  );
  panel.replaceChildren();

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
  const shouldShowOriginalTotal = combinedDiscountInfo.hasDiscount;
  const discountBadgeLabel = getSummaryDiscountBadgeLabel(
    combinedDiscountInfo,
    CurrencyManager.convertAndFormat(combinedDiscountInfo.discountAmount, currencyInfo)
  );
  const allSelectedProducts = this.getAllSelectedProductsData();
  const nextRule = PricingCalculator.getNextDiscountRule?.(this.selectedBundle, totalQuantity, totalPrice) || null;
  const isMobileSheet = panel.classList?.contains('fpb-mobile-bottom-sheet');
  const fullPageDesignPreset = this.getFullPageDesignPreset?.();
  const isHorizontalPreset = isHorizontalFpbPreset(fullPageDesignPreset);
  const isHorizontalFixedBundlePrice =
    isHorizontalPreset
    && PricingCalculator.getDiscountMethod(this.selectedBundle) === 'fixed_bundle_price';
  const isStandardDesktopSidebar = this._isStandardDesktopSidebar(panel);
  const isClassicDesktopPreset = isClassicFpbPreset(fullPageDesignPreset) && !isMobileSheet;
  const activeStep = this.selectedBundle?.steps?.[this.currentStepIndex] || this.selectedBundle?.steps?.[0] || null;
  const isActiveAddonStep = activeStep?.isFreeGift === true;
  const summaryText = this.getBundleSummaryText();
  const isClassicDesktopSidebar =
    this.resolveFullPageLayout() === 'footer_side' &&
    isClassicFpbPreset(fullPageDesignPreset) &&
    !isMobileSheet;
  const summaryEmptyStateMode = this.getSummarySidebarEmptyStateMode();
  const useInlineSummarySlots = summaryEmptyStateMode === 'slots';
  const useSharedDesktopSummarySlotTiles = shouldUseSharedDesktopSummarySlotTiles({
    designPreset: this.getFullPageDesignPreset(),
    productSlotsEnabled: useInlineSummarySlots,
  });
  const useClassicDesktopSummarySlotTiles = shouldUseClassicDesktopSummarySlotTiles({
    isClassicDesktopSidebar,
    productSlotsEnabled: useInlineSummarySlots,
  });
  const useSharedDesktopSummaryRows = shouldUseSharedDesktopSummaryRows({
    designPreset: fullPageDesignPreset,
    isMobileSheet,
    productSlotsEnabled: useInlineSummarySlots,
  });
  const remainingSummarySkeletonCount = getRemainingSummarySkeletonCount({
    designPreset: this.getFullPageDesignPreset(),
    productSlotsEnabled: useInlineSummarySlots,
    requiredQuantity: typeof this.getSummarySidebarMaxItemCount === 'function'
      ? this.getSummarySidebarMaxItemCount()
      : 0,
    selectedQuantity: totalQuantity,
  });
  const selectedSlotItems = useInlineSummarySlots
    ? expandSelectedItemsForSummarySlots(allSelectedProducts)
    : [];
  const selectedSummaryCount = useInlineSummarySlots
    ? selectedSlotItems.length
    : allSelectedProducts.length;

  panel.classList.toggle('full-page-side-panel--inline-slots', useInlineSummarySlots);
  panel.classList.toggle(
    'full-page-side-panel--horizontal-fixed-price',
    isHorizontalFixedBundlePrice
  );
  panel.classList.toggle('full-page-side-panel--skeleton-list', !useInlineSummarySlots);
  panel.classList.toggle('full-page-side-panel--has-addon-summary', false);

  // Header: bundle name + Clear
  const header = document.createElement('div');
  header.className = 'side-panel-header';
  const headerCopy = document.createElement('div');
  headerCopy.className = 'side-panel-header-copy';
  const headerTitle = document.createElement('span');
  headerTitle.className = 'side-panel-title';
  headerTitle.textContent = summaryText.title;
  headerCopy.appendChild(headerTitle);
  header.appendChild(headerCopy);

  if (isStandardDesktopSidebar || allSelectedProducts.length > 0) {
    header.appendChild(createSummaryClearButton(
      () => this.showClearCartConfirmation(),
      this._resolveText?.('clearCartButtonText', 'Clear') || 'Clear',
    ));
  }
  panel.appendChild(header);

  // Subtitle — "Review your bundle"
  const subtitle = document.createElement('p');
  subtitle.className = 'side-panel-subtitle';
  subtitle.textContent = summaryText.subTitle;
  headerCopy.appendChild(subtitle);

  const tierCta = this.createSidebarTierCta(nextRule);
  if (!isStandardDesktopSidebar && !isClassicDesktopSidebar && tierCta) {
    panel.appendChild(tierCta);
  }

  const selectedBoxSelectionQuantity = this.getSelectedBoxSelectionQuantity();
  const boxSelection = this.renderBoxSelectionOptions(selectedBoxSelectionQuantity);

  if (boxSelection) {
    panel.appendChild(boxSelection);
  }

  const summaryContent = document.createElement('div');
  summaryContent.className = 'side-panel-summary-content';

  // Discount messaging
  if (this.selectedBundle?.pricing?.enabled) {
    if (this.config.showDiscountMessaging) {
      const variables = TemplateManager.createDiscountVariables(
        this.selectedBundle,
        totalPrice,
        totalQuantity,
        combinedDiscountInfo,
        currencyInfo,
        { messageType: nextRule ? 'progress' : 'success' }
      );
      let discountMessage: MessageSegment[] = [];
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
        discountMessage = TemplateManager.formatMessageSegments(
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
        discountMessage = TemplateManager.formatMessageSegments(
          successTemplate,
          variables
        );
      }
      if (discountMessage.length > 0) {
        const lastSegment = discountMessage.at(-1);
        if (lastSegment) lastSegment.value = lastSegment.value.replace(/!+\s*$/, '');
        const msgEl = document.createElement('div');
        msgEl.className = 'side-panel-discount-message';
        msgEl.append(createMessageFragment(discountMessage, msgEl.ownerDocument));
        summaryContent.appendChild(msgEl);
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
        summaryContent.appendChild(progressBar);
      }
    }
  }

  if (isStandardDesktopSidebar) {
    const addonChildCountBefore = summaryContent.children.length;
    if (activeStep?.isFreeGift !== true) {
      this._renderFreeGiftSection(summaryContent);
    }
    panel.classList.toggle(
      'full-page-side-panel--has-addon-summary',
      summaryContent.children.length > addonChildCountBefore
    );
  }

  // Item count label
  const countLabel = document.createElement('div');
  countLabel.className = 'side-panel-item-count';
  countLabel.textContent = isStandardDesktopSidebar
    ? `${selectedSummaryCount} item(s)`
    : `${selectedSummaryCount} item${selectedSummaryCount !== 1 ? 's' : ''}`;
  summaryContent.appendChild(countLabel);

  // Selected products list / Classic slots
  if (useClassicDesktopSummarySlotTiles) {
    const classicSlotCount = this.getClassicSidebarSlotCount(
      allSelectedProducts,
      activeStep
    );
  
    const classicSlots = this.renderClassicSidebarSlots(
      allSelectedProducts,
      classicSlotCount
    );

    summaryContent.appendChild(classicSlots);
  } else {
    const productsContainer = document.createElement('div');
    productsContainer.className = 'side-panel-products';
    if (isStandardDesktopSidebar) {
      productsContainer.classList.add('side-panel-products--standard');
    }
    if (isHorizontalPreset) {
      productsContainer.classList.add('side-panel-products--slots');
    }
    productsContainer.classList.toggle('side-panel-products--inline-slots', useInlineSummarySlots);
    productsContainer.classList.toggle('side-panel-products--skeleton-list', !useInlineSummarySlots);

    if (useSharedDesktopSummarySlotTiles) {
      this._renderStandardSidebarSlotTiles(productsContainer, allSelectedProducts);
    } else if (allSelectedProducts.length > 0) {
      allSelectedProducts.forEach((item: any)  => {
        if (useSharedDesktopSummaryRows) {
          const row = this.createStandardSidebarSelectedRow(item, currencyInfo);
          const removeBtn = row?.querySelector('[data-action="remove-selected-product"]');
          if (removeBtn) {
            const removalState = this.getSummaryProductRemovalState(item);
            if (!removalState.canRemove) {
              removeBtn.classList.add('bw-selected-row__remove--disabled');
              removeBtn.setAttribute('aria-disabled', 'true');
              removeBtn.title = removalState.blockedMessage;
            }
            removeBtn.addEventListener('click', () => {
              const summaryTitle = this.getSummaryProductDisplayTitle(item);
              this.removeSummarySelectedProduct(item, summaryTitle);
            });
          }
          if (row) productsContainer.appendChild(row);
          return;
        }

        const summaryTitle = this.getSummaryProductDisplayTitle(item);
        const variantInfo = this.getSummaryProductVariantDisplay(item);
        const row = document.createElement('div');
        row.className = 'side-panel-product-row';
        if (isHorizontalPreset) {
          row.classList.add('side-panel-product-slot');
        }

        const imgSrc = this._getSelectedProductImageSrc(item);

        const isFreeGiftItem = item.isFreeGift === true && item.addonDisplayFree === true;
        const imageWrap = document.createElement('div');
        imageWrap.className = 'side-panel-product-img-wrap';
        const image = document.createElement(imgSrc ? 'img' : 'div');
        image.className = imgSrc ? 'side-panel-product-img' : 'side-panel-product-img-placeholder';
        if (imgSrc) {
          (image as HTMLImageElement).src = imgSrc;
          (image as HTMLImageElement).alt = summaryTitle;
        }
        imageWrap.appendChild(image);
        if (item.quantity > 1) {
          const badge = document.createElement('span');
          badge.className = 'side-panel-qty-badge';
          badge.textContent = String(item.quantity);
          imageWrap.appendChild(badge);
        }

        const info = document.createElement('div');
        info.className = 'side-panel-product-info';
        const title = document.createElement('span');
        title.className = 'side-panel-product-title';
        title.textContent = summaryTitle;
        info.appendChild(title);
        if (variantInfo) {
          const variant = document.createElement('span');
          variant.className = 'side-panel-product-variant';
          variant.textContent = variantInfo;
          info.appendChild(variant);
        }
        const quantity = document.createElement('span');
        quantity.className = 'side-panel-product-qty';
        quantity.setAttribute('aria-label', `Quantity ${item.quantity}`);
        quantity.textContent = `x${item.quantity}`;
        if (isFreeGiftItem) {
          const freePrice = document.createElement('span');
          freePrice.className = 'side-panel-product-price free-gift-price';
          freePrice.textContent = CurrencyManager.convertAndFormat(0, currencyInfo);
          const originalPrice = document.createElement('span');
          originalPrice.className = 'side-panel-product-original-price';
          originalPrice.append(document.createTextNode(`${CurrencyManager.convertAndFormat(item.price * item.quantity, currencyInfo)} `), quantity);
          info.append(freePrice, originalPrice);
        } else {
          const price = document.createElement('span');
          price.className = 'side-panel-product-price';
          price.append(document.createTextNode(`${CurrencyManager.convertAndFormat(item.price * item.quantity, currencyInfo)} `), quantity);
          info.appendChild(price);
        }
        row.append(imageWrap, info);
        if (isStandardDesktopSidebar) {
          const action = document.createElement('div');
          action.className = 'side-panel-product-action';
          row.appendChild(action);
        }

        // Remove button — hidden for default (mandatory) products
        if (!item.isDefault) {
          const removeBtn = document.createElement('button');
          removeBtn.className = 'side-panel-product-remove';
          removeBtn.type = 'button';
          removeBtn.setAttribute(
            'aria-label',
            this.getSummaryProductRemoveButtonLabel(summaryTitle)
          );
          const removalState = this.getSummaryProductRemovalState(item);
          if (!removalState.canRemove) {
            removeBtn.classList.add('side-panel-product-remove--disabled');
            removeBtn.setAttribute('aria-disabled', 'true');
            removeBtn.title = removalState.blockedMessage;
          }
          removeBtn.append(createTrashIcon(document));
          removeBtn.addEventListener('click', () => {
            this.removeSummarySelectedProduct(item, summaryTitle);
          });
          if (isStandardDesktopSidebar) {
            row.querySelector('.side-panel-product-action')?.appendChild(removeBtn);
          } else {
            row.appendChild(removeBtn);
          }
        }

        productsContainer.appendChild(row);
      });
    }
    if (isHorizontalPreset && !useSharedDesktopSummarySlotTiles) {
      const requiredSlots = Math.max(
        totalQuantity,
        2
      );
      if (this._shouldRenderProductSlots()) {
        const emptySlots = Math.max(0, requiredSlots - allSelectedProducts.length);
        const emptyStateIconUrl = this._escapeHTML(this.selectedBundle?.productSlotIconUrl || '');
        for (let slotIndex = 0; slotIndex < emptySlots; slotIndex += 1) {
          const emptySlot = document.createElement('div');
          emptySlot.className = 'side-panel-product-slot side-panel-product-slot--empty';
          if (emptyStateIconUrl) {
            const img = document.createElement('img');
            img.src = emptyStateIconUrl;
            img.alt = '';
            img.width = 40;
            img.height = 40;
            img.className = 'side-panel-product-slot-icon';
            emptySlot.appendChild(img);
          } else {
            const emptyText = document.createElement('span');
            emptyText.className = 'side-panel-product-slot-placeholder';
            emptyText.textContent = '+';
            emptySlot.appendChild(emptyText);
          }
          productsContainer.appendChild(emptySlot);
        }
      }
    }
    if (
      remainingSummarySkeletonCount > 0
      && typeof this._renderSidebarProductSkeletons === 'function'
    ) {
      this._renderSidebarProductSkeletons(productsContainer, remainingSummarySkeletonCount);
    }
    summaryContent.appendChild(productsContainer);
  }

  if (
    !isStandardDesktopSidebar
    && !isMobileSheet
    && allSelectedProducts.length === 0
    && !isHorizontalPreset
    && remainingSummarySkeletonCount === 0
  ) {
    const skeletonContainer = document.createElement('div');
    skeletonContainer.className = 'side-panel-skeleton-slots';
    this._renderSidebarProductSkeletons(skeletonContainer);
    summaryContent.appendChild(skeletonContainer);
  }

  panel.appendChild(summaryContent);

  // Free gift section (locked or unlocked)
  if (!isClassicDesktopSidebar && !isStandardDesktopSidebar && activeStep?.isFreeGift !== true) this._renderFreeGiftSection(panel);

  if (!isMobileSheet) {
    const purchaseOptionsMount = document.createElement('div');
    panel.appendChild(purchaseOptionsMount);
    this.elements = this.elements || {};
    this.elements.purchaseOptionsMounts = {
      ...(this.elements.purchaseOptionsMounts || {}),
      fpbDesktop: purchaseOptionsMount,
    };
  }

  // Total
  const totalSection = document.createElement('div');
  totalSection.className = 'side-panel-total';
  const totalHeading = document.createElement('span');
  totalHeading.className = 'side-panel-total-heading';
  const totalLabel = document.createElement('span');
  totalLabel.className = 'side-panel-total-label';
  totalLabel.textContent = 'Total';
  totalHeading.appendChild(totalLabel);
  const prices = document.createElement('div');
  prices.className = 'side-panel-total-prices';
  if (shouldShowOriginalTotal) {
    const original = document.createElement('span');
    original.className = 'side-panel-total-original';
    original.textContent = CurrencyManager.convertAndFormat(totalPrice, currencyInfo);
    prices.appendChild(original);
  }
  const final = document.createElement('span');
  final.className = 'side-panel-total-final';
  final.textContent = CurrencyManager.convertAndFormat(finalPrice, currencyInfo);
  prices.appendChild(final);
  if (discountBadgeLabel) {
    const discountBadge = document.createElement('span');
    discountBadge.className = 'fpb-summary-discount-badge';
    discountBadge.setAttribute('data-wpb-discount-feedback-pill', '');
    discountBadge.textContent = discountBadgeLabel;
    prices.appendChild(discountBadge);
  }
  totalSection.append(totalHeading, prices);
  if (isMobileSheet) {
    panel.appendChild(totalSection);
    return;
  }

  // Action row
  const actionDivider = document.createElement('div');
  actionDivider.className = 'side-panel-action-divider';
  const actionSection = document.createElement('div');
  actionSection.className = 'side-panel-action-container';
  actionSection.appendChild(totalSection);

  const navSection = document.createElement('div');
  navSection.className = 'side-panel-nav';

  const isLastStep = this.currentStepIndex === this.selectedBundle.steps.length - 1;
  const canProceed = this.canProceedToNextStep();
  const conditionless = this.bundleHasNoConditions();
  const canReturnToPreviousStep = !conditionless && this.currentStepIndex > 0;
  const sidebarTierCtaContent = (conditionless || isLastStep) && !isActiveAddonStep
    ? this.getSidebarTierCtaContent(nextRule)
    : null;

  if (isStandardDesktopSidebar && canReturnToPreviousStep) {
    navSection.classList.add('side-panel-nav--with-back');

    const backBtn = document.createElement('button');
    backBtn.className = 'side-panel-btn side-panel-btn-back';
    backBtn.type = 'button';
    backBtn.setAttribute('aria-label', this._resolveText('backButton', 'Back'));
    backBtn.appendChild(createChevronIcon(document, 'left'));
    backBtn.addEventListener('click', async () => {
      if (this._isWidgetActionBusy || this.currentStepIndex <= 0) return;

      await this._withWidgetActionBusy(async () => {
        const previousStepIndex = this.currentStepIndex;
        this.activeCollectionId = null;
        this.searchQuery = '';
        this.currentStepIndex--;
        this._emitStorefrontEvent?.('step-changed', {
          previousStepIndex,
          currentStepIndex: this.currentStepIndex,
          direction: 'back',
        });
        await this.renderFullPageLayout();
      }, { actionButton: backBtn });
    });
    navSection.appendChild(backBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'side-panel-btn side-panel-btn-next';
  const nextStepLabel = isStandardOrClassicFpbPreset(fullPageDesignPreset)
    ? this._resolveText('nextButton', 'Next')
    : 'Next Step';
    nextBtn.textContent = (conditionless || isLastStep)
      ? this._resolveText('addToCartButton', 'Add to Cart')
      : nextStepLabel;
  if (sidebarTierCtaContent && !isClassicDesktopPreset) {
    const labelText = sidebarTierCtaContent.label || '';
    const subtextText = sidebarTierCtaContent.subtext || '';
    const ctaTextParts = [labelText, subtextText].filter((item) => item !== '');
    nextBtn.textContent = ctaTextParts.join(' ');
    nextBtn.classList.add('side-panel-btn-has-tier-cta');
    if (ctaTextParts.length) {
      nextBtn.title = ctaTextParts.join(' ');
    }
  }
  if (!isStandardDesktopSidebar && (conditionless ? !this.canCheckoutWithBoxSelection() : (isLastStep ? !this.areBundleConditionsMet() : !canProceed))) {
    nextBtn.disabled = true;
  }
  nextBtn.addEventListener('click', async () => {
    if (this._isWidgetActionBusy) return;

    if (conditionless || isLastStep) {
      if (isClassicDesktopPreset && !conditionless && !this.areBundleConditionsMet()) {
        ToastManager.show(this.getStepConditionValidationMessage?.() || 'Please meet the quantity conditions for the current step before proceeding.');
        return;
      }
      if (!this.canCheckoutWithBoxSelection()) {
        this.showBoxSelectionValidationMessage();
        return;
      }
      await this.addBundleToCart(nextBtn);
    } else if (!this.canNavigateToStep(this.currentStepIndex + 1)) {
      const giftName = this.freeGiftStep?.addonLabel || this.freeGiftStep?.freeGiftName;
      ToastManager.show(giftName ? `Complete all steps to unlock ${giftName}!` : 'Complete all steps first.');
    } else if (this.canProceedToNextStep()) {
      await this._withWidgetActionBusy(async () => {
        this.activeCollectionId = null;
        this.searchQuery = '';
        this.currentStepIndex++;
        await this.renderFullPageLayout();
      }, { actionButton: nextBtn });
    } else {
      ToastManager.show(this.getStepConditionValidationMessage?.() || 'Please meet the quantity conditions for the current step before proceeding.');
    }
  });

  navSection.appendChild(nextBtn);
  actionSection.appendChild(navSection);
  panel.appendChild(actionDivider);
  panel.appendChild(actionSection);
  this.renderPurchaseOptions?.();
},

_renderStandardSidebarSlotTiles(container: any, allSelectedProducts: any[] = []) {
  const selectedItems = expandSelectedItemsForSummarySlots(allSelectedProducts);
  const selectedCount = selectedItems.length;
  const slotCount = Math.max(
    this.getSummarySidebarMaxItemCount(selectedCount),
    selectedCount,
    2
  );
  const emptyStateIconUrl = this._escapeHTML(this.selectedBundle?.productSlotIconUrl || '');
  const slots = document.createElement('div');
  slots.className = 'side-panel-inline-slots';

  for (let index = 0; index < slotCount; index += 1) {
    const item = selectedItems[index];
    const slot = document.createElement('div');
    slot.className = item
      ? 'side-panel-inline-slot side-panel-inline-slot--filled'
      : 'side-panel-inline-slot side-panel-inline-slot--empty';

    if (item) {
      const summaryTitle = this.getSummaryProductDisplayTitle(item);
      const productId = getSelectionId(item);
      const selectedStepIndex = Number(item.stepIndex);
      const imgSrc = this._getSelectedProductImageSrc(item);
      const image = document.createElement(imgSrc ? 'img' : 'div');
      image.className = imgSrc ? 'side-panel-inline-slot-image' : 'side-panel-inline-slot-image-placeholder';
      if (imgSrc) {
        (image as HTMLImageElement).src = imgSrc;
        (image as HTMLImageElement).alt = summaryTitle;
      }
      slot.appendChild(image);

      if (!item.isDefault) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'side-panel-inline-slot-remove';
        removeBtn.type = 'button';
        removeBtn.setAttribute('data-action', 'remove-selected-product');
        removeBtn.setAttribute('aria-label', `Delete ${summaryTitle || 'product'}`);

        const removalState = this.getSummaryProductRemovalState(item);
        if (!removalState.canRemove) {
          removeBtn.classList.add('side-panel-inline-slot-remove--disabled');
          removeBtn.setAttribute('aria-disabled', 'true');
          removeBtn.title = removalState.blockedMessage;
          removeBtn.addEventListener('click', (event: any) => {
            event.stopPropagation();
          });
        } else {
          removeBtn.addEventListener('click', (event: any) => {
            event.stopPropagation();
            if (!Number.isFinite(selectedStepIndex) || !productId) return;

            const selectedQty = Number(this.selectedProducts?.[selectedStepIndex]?.[productId] || 0);
            const nextQty = Math.max(0, selectedQty - 1);
            if (nextQty === selectedQty) return;

            this.updateProductSelection(selectedStepIndex, productId, nextQty);
            const truncated = summaryTitle && summaryTitle.length > 25
              ? summaryTitle.substring(0, 25) + '...'
              : (summaryTitle || 'Product');
            ToastManager.showWithUndo(
              `Removed "${truncated}"`,
              () => {
                this.updateProductSelection(selectedStepIndex, productId, selectedQty);
              },
              5000
            );
          });
        }

        slot.appendChild(removeBtn);
      }
    } else {
      const empty = document.createElement(emptyStateIconUrl ? 'img' : 'span');
      empty.className = emptyStateIconUrl ? 'side-panel-inline-slot-icon' : 'side-panel-inline-slot-placeholder';
      if (emptyStateIconUrl) {
        (empty as HTMLImageElement).src = emptyStateIconUrl;
        (empty as HTMLImageElement).alt = '';
        (empty as HTMLImageElement).loading = 'lazy';
      } else {
        empty.textContent = '+';
      }
      slot.appendChild(empty);
    }

    slots.appendChild(slot);
  }

  container.appendChild(slots);
},

createSidebarTierCta(nextRule: any) {
  const content = this.getSidebarTierCtaContent(nextRule);
  if (!content) return null;

  const { label, subtext } = content;

  const cta = document.createElement('div');
  cta.className = 'fpb-sidebar-tier-cta';

  if (label) {
    const title = document.createElement('div');
    title.className = 'fpb-sidebar-tier-cta-title';
    title.textContent = label;
    cta.appendChild(title);
  }

  if (subtext) {
    const detail = document.createElement('div');
    detail.className = 'fpb-sidebar-tier-cta-subtext';
    detail.textContent = subtext;
    cta.appendChild(detail);
  }

  return cta;
},

getSummaryProductRemovalState(item: any = {}) {
  const itemStepIndex = Number(item?.stepIndex);
  const currentStepIndex = Number(this.currentStepIndex || 0);
  const steps = Array.isArray(this.selectedBundle?.steps) ? this.selectedBundle.steps : [];
  const targetStep = Number.isFinite(itemStepIndex) ? steps[itemStepIndex] : null;
  const rawStepName = targetStep?.name
    || targetStep?.addonLabel
    || targetStep?.freeGiftName
    || (Number.isFinite(itemStepIndex) ? `Step ${itemStepIndex + 1}` : 'This Step');
  const targetStepName = String(rawStepName || '').trim() || 'This Step';
  const canRemove = Number.isFinite(itemStepIndex) && itemStepIndex === currentStepIndex;

  return {
    canRemove,
    targetStepName,
    blockedMessage: canRemove ? '' : `Remove This Product From ${targetStepName}`,
  };
},

getSummaryProductRemoveButtonLabel(summaryTitle = '') {
  const normalizedTitle = typeof summaryTitle === 'string'
    ? summaryTitle.trim()
    : '';
  return `Delete ${normalizedTitle || 'product'}`;
},

removeSummarySelectedProduct(item: any = {}, summaryTitle = '') {
  const removalState = this.getSummaryProductRemovalState(item);
  if (!removalState.canRemove) {
    ToastManager.show(removalState.blockedMessage);
    return false;
  }

  const stepIndex = item.stepIndex;
  const productId = getSelectionId(item);
  const removedItem: any = { stepIndex, selectionId: productId, quantity: item.quantity, title: item.title };
  this.updateProductSelection(stepIndex, productId, 0);
  const displayTitle = summaryTitle || item.title || 'Product';
  const truncated = displayTitle.length > 25 ? displayTitle.substring(0, 25) + '...' : displayTitle;
  ToastManager.showWithUndo(
    `Removed "${truncated}"`,
    () => { this.updateProductSelection(removedItem.stepIndex, removedItem.selectionId, removedItem.quantity); },
    5000
  );
  return true;
},
};
