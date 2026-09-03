import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import {
  calculateBundleDiscountForPurchaseOption,
  calculateBundleTotalForPurchaseOption,
} from '../../shared/subscription-storefront-methods.js';
import { getCascadeSummaryPillContent } from './cascade-summary.js';
import { TemplateManager } from '../../shared/template-manager.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { createSelectedProductRowElement } from '../../shared/components/selected-product-row.js';
import { getSelectedProductEntries } from '../../shared/engine/bundle-selectors.js';
import { createMessageFragment, type MessageSegment } from '../../shared/message-segments.js';
import { createCartIcon } from '../../shared/svg-icons.js';

export function renderCascadeDiscountMessage(element: HTMLParagraphElement, message: MessageSegment[] = []) {
  if (!element) return;
  element.replaceChildren(createMessageFragment(message, element.ownerDocument));
}

export function getCascadeSelectedDrawerState(selectedEntries: any[] = [], isOpen = false) {
  const entries = Array.isArray(selectedEntries) ? selectedEntries : [];
  const selectedQuantity = entries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.quantity || 0)), 0);
  const hasSelectedProducts = selectedQuantity > 0;

  return {
    isOpen: Boolean(isOpen && hasSelectedProducts),
    selectedQuantity,
    hasSelectedProducts,
  };
}

export function getNextCascadeSelectedDrawerExpandedState({
  hasSelectedProducts = false,
  isExpanded = false,
}: any = {}) {
  if (!hasSelectedProducts) return false;
  return !isExpanded;
}

export function getCascadeSelectedDrawerHeight({
  list = null,
  drawer = null,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0,
}: any = {}) {
  if (!list) return 0;

  const borderTopWidth = drawer && typeof getComputedStyle === 'function'
    ? Number.parseFloat(getComputedStyle(drawer).borderTopWidth || '0')
    : 0;
  const borderOffset = Number.isFinite(borderTopWidth) ? borderTopWidth : 0;
  const listStyle: any = typeof getComputedStyle === 'function' ? getComputedStyle(list) : {};
  const selectedRows = typeof list.querySelectorAll === 'function'
    ? Array.from(list.querySelectorAll('.bw-ppb-cascade-selected-item, .wpbMixCascadeBundleCartItem'))
    : [];
  const title = typeof list.querySelector === 'function'
    ? list.querySelector('.bw-ppb-cascade-selected-list-title, .wpbMixCascadeCartSectionHeading')
    : null;
  const rowGap = Number.parseFloat(listStyle.rowGap || listStyle.gap || '0');
  const paddingTop = Number.parseFloat(listStyle.paddingTop || '0');
  const visibleRowsLimit = 3;
  let visibleRowsHeight = Number.POSITIVE_INFINITY;

  if (selectedRows.length >= visibleRowsLimit && title) {
    const visibleRows = selectedRows.slice(0, visibleRowsLimit) as HTMLElement[];
    const titleHeight = title.getBoundingClientRect?.().height || 0;
    const rowHeights = visibleRows.reduce((sum, row) => (
      sum + (row.getBoundingClientRect?.().height || 0)
    ), 0);
    const gap = Number.isFinite(rowGap) ? rowGap : 0;
    const top = Number.isFinite(paddingTop) ? paddingTop : 0;
    visibleRowsHeight = top
      + titleHeight
      + gap
      + rowHeights
      + (gap * Math.max(0, visibleRows.length - 1))
      + borderOffset;
  }

  const viewportLimit = Math.round(Number(viewportHeight || 0) * 0.6) || Number.POSITIVE_INFINITY;

  return Math.min(list.scrollHeight + borderOffset, visibleRowsHeight, viewportLimit, 420);
}

export function prepareCascadeSelectedProductDisplay({
  product = {},
  variantId = '',
  quantity = 0,
  formatPrice = null,
}: any = {}) {
  const normalizedQuantity = Number.isFinite(Number(quantity)) ? Math.max(0, Number(quantity)) : 0;
  const title = product.title || product.parentTitle || '';
  const variantTitle = normalizeSelectedRowVariantTitle(product, title);
  const amount = Number(product.price);
  const priceText = product.priceText || (
    Number.isFinite(amount) && typeof formatPrice === 'function'
      ? formatPrice(amount)
      : ''
  );

  return {
    ...product,
    variantId,
    quantity: normalizedQuantity,
    title,
    variantTitle,
    priceText,
    quantityLabel: `x ${normalizedQuantity}`,
  };
}

function normalizeSelectedRowVariantTitle(product: any, title: any) {
  const variantTitle = product.variantTitle && product.variantTitle !== 'Default Title'
    ? String(product.variantTitle).trim()
    : '';
  if (!variantTitle) return '';

  const normalizedTitle = String(title || '').trim();
  if (normalizedTitle.endsWith(` - ${variantTitle}`)) return '';

  return variantTitle;
}

export function shouldMountCascadeAddToCartInFooter(addToCartButton: any, footerElement: any) {
  return Boolean(addToCartButton && footerElement && addToCartButton.parentElement !== footerElement);
}

function formatCascadeDiscountPercentage(value: number) {
  const percentage = Number(value || 0);
  if (!Number.isFinite(percentage) || percentage <= 0) return '';

  return Number.isInteger(percentage)
    ? String(percentage)
    : String(Number(percentage.toFixed(2)));
}

export function getCascadeAddToCartButtonContent({
  label = '',
  finalPriceText = '',
  totalPriceText = '',
  discountAmountText = '',
  discountInfo = null,
}: any = {}) {
  const hasDiscount = Boolean(discountInfo?.hasDiscount);
  const discountMethod = discountInfo?.discountMethod || '';
  const appliedRuleValue = Number(discountInfo?.applicableRule?.discountValue || 0);
  const discountPercentage = appliedRuleValue || Number(discountInfo?.discountPercentage || 0);
  let discountPillText = '';

  if (hasDiscount && discountMethod === 'percentage_off') {
    const percentText = formatCascadeDiscountPercentage(discountPercentage);
    discountPillText = percentText ? `${percentText}% off` : '';
  } else if (hasDiscount && discountAmountText) {
    discountPillText = `${discountAmountText} off`;
  }

  return {
    label,
    separator: '\u2022',
    finalPriceText,
    compareAtPriceText: hasDiscount ? totalPriceText : '',
    discountPillText,
  };
}

export const cascadeTemplateMethods: Record<string, any> & ThisType<any> = {
  _isProductPageCascadeTemplate() {
    return this._getProductPageTemplateContract?.()?.id === 'LIST';
  },

  _getCascadeAddToCartButtonContent(options: any = {}) {
    return getCascadeAddToCartButtonContent(options);
  },

  _renderCascadeAddToCartButtonContent(button: any, content: any = {}) {
    if (!button) return;
    button.textContent = '';

    const appendPart = (tagName: string, className: string, text: any, { hidden = false }: any = {}) => {
      if (!text) return null;
      const part = document.createElement(tagName);
      part.className = className;
      part.textContent = text;
      if (hidden) {
        part.hidden = true;
        part.setAttribute('aria-hidden', 'true');
      }
      button.appendChild(part);
      return part;
    };

    appendPart('span', 'bw-ppb-cascade-add-to-cart-label', content.label);
    appendPart('span', 'bw-ppb-cascade-add-to-cart-separator', content.separator);
    appendPart('span', 'bw-ppb-cascade-add-to-cart-price', content.finalPriceText);
    appendPart('span', 'bw-ppb-cascade-add-to-cart-compare', content.compareAtPriceText, { hidden: true });
    const discountPill = appendPart('span', 'bw-ppb-cascade-add-to-cart-discount-pill', content.discountPillText);
    discountPill?.setAttribute('data-wpb-discount-feedback-pill', '');
  },

  _getSelectedProductEntries() {
    return getSelectedProductEntries({
      selectedProducts: this.selectedProducts,
      stepProductData: this.stepProductData,
    }, {
      expandProductsByStep: (products: any) => this.expandProductsByVariant(products || []),
      normalizeSelectionKey: (value: any) => this.normalizeSelectionKey(value),
    });
  },

  _getCascadeFooterMessage() {
    const displayOptions = this.selectedBundle?.messaging?.displayOptions;
    const pbConfig = displayOptions?.progressBar;
    const rules = this.selectedBundle?.pricing?.rules || [];

    if (rules.length === 0 || !this.selectedBundle?.pricing?.enabled) return '';

    const { totalQuantity, totalPrice, unitPrices } = calculateBundleTotalForPurchaseOption(this,
      this.selectedProducts,
      this.stepProductData,
      this.selectedBundle?.steps
    );
    const discountInfo = calculateBundleDiscountForPurchaseOption(this, totalPrice, totalQuantity, unitPrices);
    const combinedDiscountInfo = this.getDiscountInfoWithSelectedAddonDiscount(discountInfo, totalPrice);
    const nextRule = PricingCalculator.getNextDiscountRule?.(this.selectedBundle, totalQuantity, totalPrice) || null;
    const messageType = nextRule ? 'progress' : 'success';
    const fallbackTemplate = messageType === 'success'
      ? (pbConfig?.successText || this.selectedBundle.messaging?.successTemplate || 'You got {discountText}!')
      : (pbConfig?.progressText || this.selectedBundle.messaging?.progressTemplate || 'Add {conditionText} more to get {discountText}');
    const currencyInfo = CurrencyManager.getCurrencyInfo();
    const variables = TemplateManager.createDiscountVariables(
      this.selectedBundle,
      totalPrice,
      totalQuantity,
      combinedDiscountInfo,
      currencyInfo,
      { messageType }
    );
    const template = TemplateManager.getDiscountMessageTemplate({
      bundle: this.selectedBundle,
      totalQuantity,
      totalPrice,
      discountInfo: combinedDiscountInfo,
      messageType,
      fallbackTemplate,
      locale: window.Shopify?.locale,
    });

    return TemplateManager.formatMessageSegments(template, variables);
  },

  _renderCascadeFooter(el: any) {
    el.className = 'bundle-footer-messaging bw-ppb-cascade-footer wpbMixCascadeFooterWrapper wpbMixCascadeFooterWrapper--bundleATCBtnV2 wpbMixCascadeFooterWrapper--cartDrawerUI';
    el.style.display = '';
    el.removeAttribute('style');

    const selectedEntries = this._getSelectedProductEntries();
    const { totalQuantity, totalPrice, unitPrices } = calculateBundleTotalForPurchaseOption(this,
      this.selectedProducts,
      this.stepProductData,
      this.selectedBundle?.steps
    );
    if (!this.cascadeSelectedDrawerState) {
      this.cascadeSelectedDrawerState = { isOpen: false };
    }
    const drawerState = getCascadeSelectedDrawerState(
      selectedEntries,
      this.cascadeSelectedDrawerState.isOpen,
    );
    const discountInfo = calculateBundleDiscountForPurchaseOption(
      this,
      totalPrice,
      totalQuantity,
      unitPrices,
    );
    const combinedDiscountInfo = this.getDiscountInfoWithSelectedAddonDiscount(discountInfo, totalPrice);
    const currencyInfo = CurrencyManager.getCurrencyInfo();
    const summaryContent = getCascadeSummaryPillContent({
      selectedQuantity: drawerState.selectedQuantity,
      totalPriceText: CurrencyManager.convertAndFormat(totalPrice, currencyInfo),
      finalPriceText: CurrencyManager.convertAndFormat(combinedDiscountInfo.finalPrice, currencyInfo),
      hasDiscount: Number(combinedDiscountInfo.discountAmount || 0) > 0,
    });
    const drawer = document.createElement('div');
    drawer.dataset.ppbDrawerSurface = 'selected-summary';
    drawer.className = `bw-ppb-cascade-selected-drawer wpbMixCascadeCartDrawerContainer${drawerState.isOpen ? ' bw-ppb-cascade-selected-drawer--open wpbMixCascadeCartDrawerContainer--open' : ''}`;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'bw-ppb-cascade-selected-toggle wpbMixCascadeSelectedItemsInCartWrappper';
    toggle.setAttribute('aria-expanded', drawerState.isOpen ? 'true' : 'false');
    const toggleLabel = this._resolveText('viewBundleItems', 'View Bundle Items');
    toggle.setAttribute(
      'aria-label',
      `${toggleLabel}: ${summaryContent.selectedQuantity}, ${summaryContent.finalPriceText}`,
    );
    const surface = document.createElement('span');
    surface.className = 'bw-ppb-cascade-selected-toggle-surface';
    const chevron = document.createElement('span');
    chevron.className = 'bw-ppb-cascade-selected-toggle-chevron wpbMixCascadeCartChevronIcon';
    chevron.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'bw-ppb-cascade-selected-toggle-label wpbMixCascadeCartDrawerBtnText';
    label.textContent = toggleLabel;
    const summary = document.createElement('span');
    summary.className = 'bw-ppb-cascade-selected-toggle-summary';
    summary.setAttribute('aria-hidden', 'true');
    const cart = document.createElement('span');
    cart.className = 'bw-ppb-cascade-selected-toggle-cart';
    const cartCount = document.createElement('span');
    cartCount.className = 'bw-ppb-cascade-selected-toggle-count wpbMixCascadeSelectedItemsInCart';
    cartCount.textContent = String(summaryContent.selectedQuantity);
    cart.append(createCartIcon(document), cartCount);
    const divider = document.createElement('span');
    divider.className = 'bw-ppb-cascade-selected-toggle-divider';
    const prices = document.createElement('span');
    prices.className = 'bw-ppb-cascade-selected-toggle-prices';
    const finalPrice = document.createElement('span');
    finalPrice.className = 'bw-ppb-cascade-selected-toggle-final-price';
    finalPrice.textContent = summaryContent.finalPriceText;
    prices.append(finalPrice);
    if (summaryContent.compareAtPriceText) {
      const comparePrice = document.createElement('s');
      comparePrice.className = 'bw-ppb-cascade-selected-toggle-compare-price';
      comparePrice.textContent = summaryContent.compareAtPriceText;
      prices.append(comparePrice);
    }
    summary.append(cart, divider, prices);
    surface.append(chevron, label, summary);
    toggle.append(surface);
    drawer.appendChild(toggle);

    let list: HTMLDivElement|null = null;
    if (drawerState.hasSelectedProducts) {
      list = document.createElement('div');
      list.className = 'bw-ppb-cascade-selected-list wpbMixCascadeCartItemsWrapper';

      const title = document.createElement('div');
      title.className = 'bw-ppb-cascade-selected-list-title wpbMixCascadeCartSectionHeading wpbMixCascadeCartItemsTitle';
      title.dataset.sectionId = 'selectedProducts';
      const titleText = document.createElement('span');
      titleText.className = 'bw-ppb-cascade-selected-list-title-text wpbMixCascadeCartSectionHeadingTitle';
      titleText.textContent = this._resolveText('bundleCartSelectedProductsText', 'Selected Products');
      const titleLine = document.createElement('span');
      titleLine.className = 'bw-ppb-cascade-selected-list-title-line wpbMixCascadeCartSectionHeadingLine';
      titleLine.setAttribute('aria-hidden', 'true');
      title.append(titleText, titleLine);
      list.appendChild(title);

      selectedEntries.forEach(({ stepIndex, variantId, quantity, product }: any) => {
        const row = createSelectedProductRowElement(prepareCascadeSelectedProductDisplay({
          product,
          variantId,
          quantity,
          formatPrice: (amount: any) => CurrencyManager.convertAndFormat(amount, CurrencyManager.getCurrencyInfo()),
        }), {
          className: 'bw-ppb-cascade-selected-item wpbMixCascadeBundleCartItem',
        });
        row?.querySelector('[data-action="remove-selected-product"]')?.addEventListener('click', () => {
          this.removeProductFromSelection(stepIndex, variantId);
        });
        if (row) list!.appendChild(row);
      });
      drawer.appendChild(list);
    }

    const setDrawerExpanded = (isExpanded: boolean) => {
      const nextExpanded = Boolean(isExpanded && drawerState.hasSelectedProducts);
      let maxDrawerHeight = 0;
      drawer.classList.toggle('bw-ppb-cascade-selected-drawer--open', nextExpanded);
      drawer.classList.toggle('wpbMixCascadeCartDrawerContainer--open', nextExpanded);
      if (list && nextExpanded) {
        maxDrawerHeight = getCascadeSelectedDrawerHeight({ list, drawer });
        drawer.style.setProperty('--bw-ppb-cascade-selected-drawer-height', `${maxDrawerHeight}px`);
      }
      toggle.setAttribute('aria-expanded', nextExpanded ? 'true' : 'false');
      this.cascadeSelectedDrawerState.isOpen = nextExpanded;
      this.cascadeSelectedDrawerState.height = nextExpanded ? maxDrawerHeight : 0;
    };
    toggle.addEventListener('click', () => {
      setDrawerExpanded(getNextCascadeSelectedDrawerExpandedState({
        hasSelectedProducts: drawerState.hasSelectedProducts,
        isExpanded: drawer.classList.contains('bw-ppb-cascade-selected-drawer--open'),
      }));
    });

    el.appendChild(drawer);
    const previousDrawerHeight = Math.max(0, Number(this.cascadeSelectedDrawerState.height || 0));
    if (drawerState.isOpen && previousDrawerHeight > 0) {
      drawer.style.setProperty('--bw-ppb-cascade-selected-drawer-height', `${previousDrawerHeight}px`);
      const scheduleFrame = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame.bind(window)
        : (callback: () => any) => callback();
      scheduleFrame(() => setDrawerExpanded(true));
    } else {
      setDrawerExpanded(drawerState.isOpen);
    }

    const message = this._getCascadeFooterMessage();
    if (message) {
      const messageEl = document.createElement('p');
      messageEl.className = 'bw-ppb-cascade-discount-message';
      renderCascadeDiscountMessage(messageEl, message);
      el.appendChild(messageEl);
    }

    const addToCartButton = this.elements?.addToCartButton;
    if (this._usesCascadeStepFlow?.()) {
      const actions = document.createElement('div');
      actions.className = 'bw-ppb-cascade-footer-actions';

      if (this.currentStepIndex > 0) {
        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.className = 'bw-ppb-cascade-step-back';
        backButton.setAttribute('aria-label', 'Previous step');
        const backIcon = document.createElement('span');
        backIcon.setAttribute('aria-hidden', 'true');
        backButton.append(backIcon);
        backButton.addEventListener('click', () => this.navigateCascadeStep(-1));
        actions.appendChild(backButton);
      }

      if (addToCartButton) actions.appendChild(addToCartButton);
      el.appendChild(actions);
    } else if (shouldMountCascadeAddToCartInFooter(addToCartButton, el)) {
      el.appendChild(addToCartButton);
    }
  },
};
