import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { TemplateManager } from '../../shared/template-manager.js';
import { createMessageFragment } from '../../shared/message-segments.js';
import { createDefaultLoadingAnimation } from '../../shared/default-loading-animation.js';
import { hideLoadingOverlayElement, markLoadingOverlayVisible } from '../../shared/loading-overlay.js';
import { TemplateDesignSystem } from '../../shared/template-design-system.js';
import { buildStorefrontApiPath } from '../../../../config/storefront-proxy-routes.js';

function replaceMessage(element: HTMLElement, template: string, variables: Record<string, unknown>) {
  element.replaceChildren(createMessageFragment(
    TemplateManager.formatMessageSegments(template, variables),
    element.ownerDocument,
  ));
}

const actionButtonContents = new WeakMap<HTMLElement, { nodes: Node[]; disabled: boolean }>();

const runtimeCartTemplateSystem = TemplateDesignSystem;

export function resolveTierConfig(apiTierConfig: any, dataTierConfig: any) {
  if (apiTierConfig == null) return dataTierConfig;
  const mapped = (Array.isArray(apiTierConfig) ? apiTierConfig : [])
    .filter(t => (
      typeof t?.label === 'string'
      && typeof t?.linkedBundleId === 'string'
      && t.label.trim() !== ''
      && t.linkedBundleId.trim() !== ''
    ))
    .map(t => ({ label: t.label.trim(), bundleId: t.linkedBundleId.trim() }))
    .slice(0, 4);
  return mapped.length >= 2 ? mapped : [];
}

function getFpbPresetContract(rawValue: string) {
  if (typeof rawValue !== 'string') return null;
  const normalizedPreset = rawValue.trim().toUpperCase();
  if (!normalizedPreset) return null;
  if (typeof runtimeCartTemplateSystem?.fpb?.resolveContract === 'function') {
    return runtimeCartTemplateSystem.fpb.resolveContract(normalizedPreset);
  }
  return null;
}

function isClassicFpbPreset(rawValue: string) {
  return getFpbPresetContract(rawValue)?.summary?.mode === 'slots';
}

function isHorizontalFpbPreset(rawValue: string) {
  return getFpbPresetContract(rawValue)?.productCard?.mode === 'row';
}

function isRowsFpbPreset(rawValue: string) {
  return getFpbPresetContract(rawValue)?.summary?.mode === 'rows';
}

function isStandardFpbPreset(rawValue: string) {
  const contract = getFpbPresetContract(rawValue);
  return contract?.summary?.mode === 'rows' && contract?.productCard?.mode === 'grid';
}


export const fullPageRuntimeCartSettingsMethods: Record<string, any> & ThisType<any> = {
updateModalHeaderText(totalPrice: any, totalQuantity: any, discountInfo: any, currencyInfo: any) {
  const modalStepTitle = this.elements.modal.querySelector('.modal-step-title');
  if (!modalStepTitle) return;

  // If discount is not enabled, show step name (escaped)
  if (!this.selectedBundle?.pricing?.enabled) {
    const currentStep = this.selectedBundle?.steps?.[this.currentStepIndex];
    modalStepTitle.textContent = currentStep?.name || 'Step ' + (this.currentStepIndex + 1);
    return;
  }

  const variables = TemplateManager.createDiscountVariables(
    this.selectedBundle,
    totalPrice,
    totalQuantity,
    discountInfo,
    currencyInfo,
    { messageType: 'progress' }
  );

  replaceMessage(modalStepTitle, this.config.discountTextTemplate, variables);
},

updateModalDiscountMessaging(totalPrice: any, totalQuantity: any, discountInfo: any, currencyInfo: any) {
  const footerDiscountText = this.elements.modal.querySelector('.footer-discount-text');
  const discountSection = this.elements.modal.querySelector('.modal-footer-discount-messaging');

  if (!footerDiscountText) return;

  const nextRule = PricingCalculator.getNextDiscountRule?.(this.selectedBundle, totalQuantity, totalPrice) || null;
  const variables = TemplateManager.createDiscountVariables(
    this.selectedBundle,
    totalPrice,
    totalQuantity,
    discountInfo,
    currencyInfo,
    { messageType: nextRule ? 'progress' : 'success' }
  );

  if (nextRule) {
    replaceMessage(footerDiscountText, this.config.discountTextTemplate, variables);
    if (discountSection) discountSection.classList.remove('qualified');
  } else if (discountInfo.qualifiesForDiscount) {
    replaceMessage(footerDiscountText, this.config.successMessageTemplate, variables);
    if (discountSection) discountSection.classList.add('qualified');
  } else {
    footerDiscountText.replaceChildren();
    if (discountSection) discountSection.classList.remove('qualified');
  }

  // Show/hide discount section based on config
  if (discountSection) {
    discountSection.hidden = !this.config.showDiscountMessaging;
  }
},

updateFooterTotalPrices(totalPrice: number, discountInfo: any, currencyInfo: any) {
  const strikePriceEl = this.elements.modal.querySelector('.total-price-strike');
  const finalPriceEl = this.elements.modal.querySelector('.total-price-final');

  if (!strikePriceEl || !finalPriceEl) return;

  if (discountInfo.qualifiesForDiscount && discountInfo.finalPrice < totalPrice) {
    // Show strike-through original price and discounted price
    strikePriceEl.textContent = CurrencyManager.convertAndFormat(totalPrice, currencyInfo);
    strikePriceEl.hidden = false;
    finalPriceEl.textContent = CurrencyManager.convertAndFormat(discountInfo.finalPrice, currencyInfo);
  } else {
    // Show only regular price
    strikePriceEl.hidden = true;
    finalPriceEl.textContent = CurrencyManager.convertAndFormat(totalPrice, currencyInfo);
  }
},

// ========================================================================
// LOADING OVERLAY
// ========================================================================

showLoadingOverlay() {
  if (!this.container) return;
  if (this.container.querySelector('[data-wpb-loading-screen]')) return;
  // Remove any existing overlay (idempotent)
  this.container.querySelector('.bundle-loading-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'bundle-loading-overlay';
  overlay.style.setProperty(
    '--wpb-loading-screen-bg',
    this.config?.loadingScreen?.backgroundColor || '#ffffff',
  );

  const gifUrl = this.config?.loadingScreen?.gifUrl || '';
  if (gifUrl) {
    const img = document.createElement('img');
    img.className = 'bundle-loading-overlay__gif';
    img.src = gifUrl;
    img.alt = '';
    overlay.appendChild(img);
  } else {
    const animation = createDefaultLoadingAnimation();
    overlay.appendChild(animation);
  }

  this.container.appendChild(overlay);
  requestAnimationFrame(() => markLoadingOverlayVisible(overlay));
},

hideLoadingOverlay() {
  const overlay = this.container?.querySelector('.bundle-loading-overlay');
  hideLoadingOverlayElement(overlay);
},

_getButtonDataset(button: any) {
  if (!button) return null;
  if (!button.dataset) button.dataset = {};
  return button.dataset;
},

_setActionButtonLoadingState(button: any, isLoading: any) {
  if (!button) return;
  const dataset = this._getButtonDataset(button);

  if (isLoading) {
    if (!actionButtonContents.has(button)) {
      actionButtonContents.set(button, {
        nodes: Array.from(button.childNodes),
        disabled: button.disabled === true,
      });
      dataset.fpbLoadingWasDisabled = String(button.disabled === true);
    }
    button.classList.add('fpb-inline-spinner-active');
    button.disabled = true;
    const spinner = button.ownerDocument.createElement('span');
    spinner.className = 'fpb-inline-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    button.replaceChildren(spinner);
    return;
  }

  const original = actionButtonContents.get(button);
  if (original) {
    button.replaceChildren(...original.nodes);
    button.disabled = original.disabled;
    actionButtonContents.delete(button);
    delete dataset.fpbLoadingWasDisabled;
  }
  button.classList.remove('fpb-inline-spinner-active');
},

_setWidgetBusy(isBusy: any, activeButton: any = null) {
  this._isWidgetActionBusy = Boolean(isBusy);

  if (!this.container) return;
  this.container.classList.toggle('fpb-widget-busy', this._isWidgetActionBusy);

  this._setActionButtonLoadingState(activeButton, isBusy);
},

_withWidgetActionBusy(action: () => any, options: any = {}) {
  const { actionButton = null } = options;

  if (!this.container || this._isWidgetActionBusy) return Promise.resolve(false);

  this._setWidgetBusy(true, actionButton);

  return Promise.resolve()
    .then(() => action())
    .then(() => true)
    .catch((error) => {
      console.error('[Wolfpack Bundles] Widget action failed:', error);
      throw error;
    })
    .finally(() => {
      this._setWidgetBusy(false, actionButton);
    });
},

// ========================================================================
// CART OPERATIONS
// ========================================================================

generateBundleInstanceId() {
  // Generate unique bundle instance ID using UUID (recommended by Shopify)
  // This prevents hash collisions and ensures each bundle instance is truly unique
  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID

  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const uuid = crypto.randomUUID();
    const bundleInstanceId = `${this.selectedBundle.id}_${uuid}`;

    return bundleInstanceId;
  }

  // Fallback for older browsers: use timestamp + random number
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const bundleInstanceId = `${this.selectedBundle.id}_${timestamp}_${random}`;

  return bundleInstanceId;
},

resolveFullPageOfferId() {
  const rawOfferId = this.selectedBundle?.offerId
    || this.selectedBundle?.bundleOfferId
    || this.selectedBundle?.id
    || 'UNKNOWN';
  const offerId = String(rawOfferId);
  return offerId.startsWith('FBP-') ? offerId : `FBP-${offerId}`;
},

async syncBundleDetailsCartMetafield(bundleDetailsKey: any, sourceProperties: any) {
  try {
    const displayProperties = this.buildBundleDetailsDisplayProperties(sourceProperties);
    if (!bundleDetailsKey || Object.keys(displayProperties).length === 0) return;

    const cartToken = await this.getBundleDetailsCartToken();
    if (!cartToken) return;

    const response = await fetch(buildStorefrontApiPath('cart-bundle-details'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cartToken,
        bundleDetailsKey,
        displayProperties
      })
    });

    if (!response.ok) {
      throw new Error(`bundle_details sync failed (${response.status})`);
    }

    const data = await response.json().catch(() => null);
    if (data?.ok !== true) {
      throw new Error(data?.error || 'bundle_details sync failed');
    }
  } catch (error: any) {
    console.warn('[Wolfpack Bundles] Failed to sync bundle_details cart metafield', error);
  }
},

buildBundleDetailsDisplayProperties(sourceProperties: any) {
  const displayProperties: any = {};
  const raw = sourceProperties?._bundle_display_properties;
  const cartLineLabels = this.getCartLineLabels();

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.box) displayProperties.Box = String(parsed.box);
      if (parsed?.items) displayProperties[cartLineLabels.items] = String(parsed.items);
      if (parsed?.retailPrice) displayProperties[cartLineLabels.retailPrice] = String(parsed.retailPrice);
      if (parsed?.youSave?.amountPercentage) displayProperties[cartLineLabels.youSave] = String(parsed.youSave.amountPercentage);
    } catch {
      // Ignore malformed display metadata; cart add must remain non-blocking.
    }
  }

  ['Box', cartLineLabels.items, cartLineLabels.retailPrice, cartLineLabels.youSave, 'Items', 'Retail Price', 'You Save'].forEach((key) => {
    if (sourceProperties?.[key] && !displayProperties[key]) {
      displayProperties[key] = String(sourceProperties[key]);
    }
  });

  return displayProperties;
},

getCartLineLabels() {
  const labels = this.config?.sharedCartLabels || {};
  return {
    items: labels.bundleContainsLabel || 'Items',
    retailPrice: labels.bundleOriginalPriceLabel || 'Retail Price',
    youSave: labels.bundleDiscountDisplayLabel || 'You Save',
  };
},

async getBundleDetailsCartToken() {
  const response = await fetch('/cart.js?app=wolfpackProductBundles', {
    credentials: 'same-origin'
  });
  if (!response.ok) return null;
  const cart = await response.json();
  return cart?.token || null;
},

generateBundleSessionKey() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const keyLength = 12;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(keyLength);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
  }

  return Math.random().toString(36).slice(2, 2 + keyLength).toUpperCase().padEnd(keyLength, '0');
},
// ========================================================================
// EVENT HANDLERS
// ========================================================================

// ========================================================================
// TIER PILL SELECTION
// ========================================================================

/**
 * Parses the JSON string from data-tier-config into a TierConfig array.
 * Returns [] on any error — pill bar is simply not shown.
 */
parseTierConfig(rawJson: string) {
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(t => typeof t?.label === 'string' && typeof t?.bundleId === 'string')
      .map(t => ({ label: t.label.trim(), bundleId: t.bundleId.trim() }))
      .filter(t => t.label !== '' && t.bundleId !== '')
      .slice(0, 4);
  } catch {
    return [];
  }
},

resolveTierConfig(apiTierConfig: any, dataTierConfig: any) {
  return resolveTierConfig(apiTierConfig, dataTierConfig);
},

/**
 * Resolves whether to show the step timeline.
 * Admin UI (API) value takes precedence over the theme editor data attribute when non-null.
 *
 * @param {boolean|null} apiValue - From selectedBundle.showStepTimeline (DB, nullable)
 * @param {boolean} dataAttrValue - From data-show-step-timeline attribute (theme editor)
 * @returns {boolean}
 */
resolveShowStepTimeline(apiValue: boolean | null | undefined, dataAttrValue: any) {
  if (apiValue !== null && apiValue !== undefined) return apiValue;
  return dataAttrValue;
},

resolveFullPageLayout(bundle: any = undefined) {
  if (bundle === undefined) bundle = this.selectedBundle;
  return 'footer_side';
},

getFullPageTemplate(bundle: any = undefined) {
  if (bundle === undefined) bundle = this.selectedBundle;
  return 'FBP_SIDE_FOOTER';
},

getFullPageDesignPreset(bundle: any = undefined) {
  if (bundle === undefined) bundle = this.selectedBundle;
  const rawPresetId =
    bundle?.bundleDesignPresetId
    || '';
  if (typeof runtimeCartTemplateSystem?.fpb?.resolvePresetId === 'function') {
    const resolved = runtimeCartTemplateSystem.fpb.resolvePresetId(rawPresetId);
    if (typeof resolved === "string" && resolved !== '') return resolved;
    return null;
  }

  if (typeof rawPresetId !== 'string') return null;
  const preset = rawPresetId.trim().toUpperCase();
  return isStandardFpbPreset(preset) || isClassicFpbPreset(preset) || isRowsFpbPreset(preset) || isHorizontalFpbPreset(preset)
    ? preset
    : null;
},

resolveFullPageCardCtaMode(bundle: any = undefined) {
  if (bundle === undefined) bundle = this.selectedBundle;
  const showTextOnAddButton =
    bundle?.showTextOnAddButton === true;

  return showTextOnAddButton ? 'text' : 'icon';
},

getProductAddButtonText() {
  if (this.resolveFullPageCardCtaMode() !== 'text') return '+';

  const textButtonFallback = isClassicFpbPreset(this.getFullPageDesignPreset())
    ? 'Add To Box'
    : 'Add +';
  return this._resolveText('productAddButton', textButtonFallback);
},

applyFullPageDesignPresetMarker() {
  if (!this.container || !this.elements?.stepsContainer) return;

  const fullPageTemplate = this.getFullPageTemplate();
  const fullPageDesignPreset = this.getFullPageDesignPreset();
  const fullPageTabStyle = isRowsFpbPreset(fullPageDesignPreset) ? 'underline' : 'pill';

  this.container.dataset.fpbTemplateType = fullPageTemplate;
  this.elements.stepsContainer.dataset.fpbTemplateType = fullPageTemplate;

  if (fullPageDesignPreset) {
    this.container.dataset.fpbDesignPreset = fullPageDesignPreset;
    this.elements.stepsContainer.dataset.fpbDesignPreset = fullPageDesignPreset;
  } else {
    delete this.container.dataset.fpbDesignPreset;
    delete this.elements.stepsContainer.dataset.fpbDesignPreset;
  }
  this.container.dataset.fpbTabStyle = fullPageTabStyle;
  this.elements.stepsContainer.dataset.fpbTabStyle = fullPageTabStyle;
  const cardCtaMode = this.resolveFullPageCardCtaMode();
  this.elements.stepsContainer.dataset.fpbCardCtaMode = cardCtaMode;
  this.container.classList.remove('fpb-preset-standard', 'fpb-preset-classic', 'fpb-preset-compact', 'fpb-preset-horizontal');
  if (fullPageDesignPreset) {
    const presetClass = `fpb-preset-${fullPageDesignPreset.toLowerCase()}`;
    this.container.classList.add(presetClass);
    this.elements.stepsContainer.classList.add(presetClass);
  }
  this.container.classList.toggle('fpb-h', isHorizontalFpbPreset(fullPageDesignPreset));
  this.container.classList.toggle('fpb-d', isStandardFpbPreset(fullPageDesignPreset));
  this.elements.stepsContainer.classList.remove('fpb-preset-standard', 'fpb-preset-classic', 'fpb-preset-compact', 'fpb-preset-horizontal');
  if (fullPageDesignPreset) {
    const presetClass = `fpb-preset-${fullPageDesignPreset.toLowerCase()}`;
    this.elements.stepsContainer.classList.add(presetClass);
  }
  this.elements.stepsContainer.classList.toggle('fpb-h', isHorizontalFpbPreset(fullPageDesignPreset));
  this.elements.stepsContainer.classList.toggle('fpb-d', isStandardFpbPreset(fullPageDesignPreset));
  this.elements.stepsContainer.classList.toggle('fpb-i', cardCtaMode === 'icon');
},

/** Returns true if the given tier index is the currently active one. */
isTierActive(tierIndex: any) {
  return tierIndex === this.activeTierIndex;
},

/**
 * Inserts the tier pill bar as the first child of the container.
 * No-op when fewer than 2 tiers are configured (backward-compatible).
 */
};
