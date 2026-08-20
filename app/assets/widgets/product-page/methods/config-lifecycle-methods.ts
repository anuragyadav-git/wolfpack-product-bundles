import { BundleDataManager } from '../../shared/bundle-data-manager.js';
import { TemplateManager } from '../../shared/template-manager.js';
import {
  claimCheckoutIntegrationInvocation,
  invokeCheckoutIntegrationProvider,
} from '../../shared/checkout-integration-adapters.js';
import { TemplateDesignSystem } from '../../shared/template-design-system.js';
import { buildBundleConfigApiUrl } from '../../../../lib/bundle-preview-url.js';
import { ppbExpandSingleStepCategoriesAsSteps } from '../single-step-categories.js';

function getWindow() {
  return typeof window === 'undefined' ? null : window;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (['true', 'checked', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', 'unchecked', '0', 'off', 'no'].includes(normalized)) return false;
  return undefined;
}

function parseControlBoolean(controls, labels, fallback) {
  if (!controls || typeof controls !== 'object') {
    return fallback;
  }

  for (const label of labels) {
    if (!(label in controls)) continue;
    const parsed = parseBoolean(controls[label]);
    if (parsed === undefined) continue;
    return parsed;
  }
  return fallback;
}

const templateDesignSystem = TemplateDesignSystem;

function resolvePpbTemplateContract({
  templateType = '',
  designPreset = '',
}) {
  if (!templateDesignSystem?.resolvePpbTemplate) return null;
  return templateDesignSystem.resolvePpbTemplate({
    templateType,
    designPreset,
  }) || null;
}

function resolvePpbTemplatePresetId({
  templateType = '',
  designPreset = '',
}) {
  if (typeof designPreset !== 'string') {
    return null;
  }
  return resolvePpbTemplateContract({
    templateType,
    designPreset,
  })?.id || null;
}

export const ProductPageConfigLifecycleMethods: Record<string, any> & ThisType<any> = {
_getProductPageControls() {
  return this.config.controlsSettings?.activeControls
    || this.config.controlsSettings?.settingsControls?.productPage
    || null;
},

_isProductCardClickAddEnabled() {
  const controls = this._getProductPageControls();
  return parseControlBoolean(
    controls,
    ['addToCartWhenProductCardClicked'],
    false,
  ) === true;
},

_isConditionValidationEnabled() {
  const controls = this._getProductPageControls();
  return parseControlBoolean(controls, ['validateConditionsBeforeAddToCart'], true) !== false;
},

_runControlsScript(script) {
  if (!script || typeof script !== 'string') return;
  const runtimeWindow = getWindow();
  if (!runtimeWindow) return;
  try {
    new Function(script).call(runtimeWindow);
  } catch (_) {
    // Merchant-authored integration script should not block bundle checkout.
  }
},

async _handlePostAddToCartAction(actionConfig, lifecycleKey) {
  const controls = this._getProductPageControls();
  const redirect = actionConfig || controls?.redirect || {};

  if (lifecycleKey) {
    this._checkoutIntegrationInvocations ||= new Set();
    if (!claimCheckoutIntegrationInvocation(this._checkoutIntegrationInvocations, lifecycleKey)) {
      return;
    }
  }

  this._runControlsScript(redirect.executeScript);
  this._runControlsScript(controls?.scripts?.executeCustomScript);

  const action = redirect.action || 'cart';
  if (action === 'checkout') {
    const runtimeWindow = getWindow();
    if (!runtimeWindow) return;

    setTimeout(() => {
      runtimeWindow.location.href = '/checkout';
    }, 1000);
    return;
  }

  if (action === 'side_cart') {
    const selector = redirect.selectors?.sideCartOpenButton
      || controls?.selectors?.sideCartOpenButton
      || controls?.selectors?.sideCart;
    const invocation = await invokeCheckoutIntegrationProvider(
      'theme_cart_drawer',
      getWindow(),
      {
        openThemeCartDrawer: () => {
          if (!selector) return false;
          const sideCartTrigger = document.querySelector(selector);
          if (!sideCartTrigger) return false;
          setTimeout(() => sideCartTrigger.click(), 300);
          return true;
        },
      },
    );
    if (invocation.ok) return;
  }

  setTimeout(() => {
    const runtimeWindow = getWindow();
    if (!runtimeWindow) return;

    runtimeWindow.location.href = '/cart';
  }, 1000);
},

parseConfiguration() {
  const runtimeWindow = getWindow();
  const dataset = this.container.dataset;
  const existingConfig = this.config || {};
  const controlsSettings = existingConfig.controlsSettings || null;
  const controls = this._getProductPageControls() || {};
  const datasetShowQuantity = dataset.showQuantitySelectorOnCard !== 'false';
  const showQuantitySelectorOnCard = parseControlBoolean(
    controls,
    ['showQuantitySelectorOnCard'],
    datasetShowQuantity,
  );
  const displaySeeMoreLink = parseControlBoolean(
    controls,
    ['displaySeeMoreLink'],
    undefined,
  );
  const expandProductCardOnHover = parseControlBoolean(
    controls,
    ['expandProductCardOnHover'],
    false,
  );

  this.config = {
    ...existingConfig,
    bundleId: dataset.bundleId || null,
    isContainerProduct: dataset.isContainerProduct === 'true',
    containerBundleId: dataset.containerBundleId || null,
    isEmbedSource: dataset.wpbPpbEmbedSource === 'true',
    preselectBrowsedProduct: dataset.preselectBrowsedProduct === 'true',
    selectedVariantId: dataset.selectedVariantId || null,
    hideDefaultButtons: dataset.hideDefaultButtons === 'true',
    showStepNumbers: dataset.showStepNumbers !== 'false',
    // Quantity selector visibility settings (default: show on card)
    showQuantitySelectorOnCard,
    // Product card expansion and truncation settings.
    displaySeeMoreLink,
    expandProductCardOnHover,
    controlsSettings,
    // Messages will be set from bundle.pricing.messages after bundle loads
    discountTextTemplate: 'Add {conditionText} to get {discountText}',
    successMessageTemplate: 'Congratulations! You got {discountText}!',
    currentProductId: runtimeWindow ? runtimeWindow.currentProductId : null,
    currentProductGid: runtimeWindow ? runtimeWindow.currentProductGid : null,
    currentProductHandle: runtimeWindow ? runtimeWindow.currentProductHandle : null,
    currentProductCollections: runtimeWindow ? runtimeWindow.currentProductCollections : null
  };
},

_parseBundleConfigPayload(rawValue) {
    if (!rawValue || rawValue.trim() === '' || rawValue === 'null' || rawValue === 'undefined') {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue);
      return typeof parsed === 'object' && parsed !== null ? parsed : null;
    } catch (_error) {
      return null;
    }
  },

  _isBundleConfigBootstrapPayload(payload) {
    return !!(
      payload &&
      typeof payload === 'object' &&
      payload.v &&
      payload.type === 'product_page' &&
      typeof payload.id === 'string' &&
      payload.id.trim() !== ''
    );
  },

  async loadBundleData() {
    let bundleData = null;
    const bundleType = this.container.dataset.bundleType;
    const bundleId = this.container.dataset.bundleId;
    const configValue = this._parseBundleConfigPayload(this.container.dataset.bundleConfig);

    if (
      this.container.dataset.wpbPpbEmbedSource === 'true' &&
      configValue &&
      typeof configValue.id === 'string' &&
      Array.isArray(configValue.steps)
    ) {
      bundleData = { [configValue.id]: configValue };
    }

    if (!bundleData && bundleType === 'product_page' && this._isBundleConfigBootstrapPayload(configValue)) {
      const RETRY_DELAY_MS = 3000;
      const RETRYABLE_STATUSES = new Set([503, 504]);

      const fetchBundleData = async () => {
        const apiUrl = buildBundleConfigApiUrl(
          configValue.id,
          getWindow()?.location?.search || '',
        );
        const response = await fetch(apiUrl);

        if (!response.ok) {
          let errorDetails = `${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
          } catch (_) {
            // Ignore parse failures for error body.
          }
          const err = new Error(`API request failed: ${errorDetails}`);
          err.status = response.status;
          throw err;
        }

        const data = await response.json();
        if (data.success && data.bundle) {
          return { [data.bundle.id]: data.bundle };
        }

        throw new Error('Invalid API response structure');
      };

      try {
        try {
          bundleData = await fetchBundleData();
        } catch (firstErr) {
          if (RETRYABLE_STATUSES.has(firstErr.status)) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            bundleData = await fetchBundleData();
          } else {
            throw firstErr;
          }
        }
      } catch (_error) {
      }
    }

    // Widget only works on container products with bundleConfig marker.
    if (!bundleData || (typeof bundleData === 'object' && Object.keys(bundleData).length === 0)) {
      const runtimeWindow = getWindow();
      const isThemeEditor = runtimeWindow?.Shopify?.designMode ||
                           runtimeWindow?.isThemeEditorContext ||
                           runtimeWindow?.location?.pathname?.includes('/editor') ||
                           runtimeWindow?.location?.search?.includes('preview_theme_id');

      const bundleIdFromDataset = bundleId || this.container.dataset.bundleId;

      if (isThemeEditor && bundleIdFromDataset) {
        this.showThemeEditorPreview(bundleIdFromDataset);
        return; // Don't throw error, just show preview.
      }

      this.container.style.display = 'none';
      return;
    }

    this.bundleData = bundleData;
  },

selectBundle() {
  this.selectedBundle = ppbExpandSingleStepCategoriesAsSteps(
    BundleDataManager.selectBundle(this.bundleData, this.config)
  );

  this.widgetStyle = 'bottom-sheet';

  // Update message templates from bundle pricing messages
  this.updateMessagesFromBundle();
},

_getProductPageTemplateType() {
  const templateType = this.selectedBundle?.bundleDesignTemplate;
  return templateType === 'PDP_INPAGE' || templateType === 'PDP_MODAL'
    ? templateType
    : '';
},

_getProductPageTemplateContract() {
  return resolvePpbTemplateContract({
    templateType: this._getProductPageTemplateType(),
    designPreset: this._getProductPageDesignPreset(),
  });
},

_getProductPageDesignPreset() {
  const presetCandidates = [
    this.selectedBundle?.bundleDesignPresetId,
    this.selectedBundle?.bundleDesignTemplateData?.templateId,
  ];

  for (const candidate of presetCandidates) {
    if (typeof candidate !== 'string' || candidate.trim() === '') continue;

    const resolved = resolvePpbTemplatePresetId({
      templateType: this._getProductPageTemplateType(),
      designPreset: candidate.trim().toUpperCase(),
    });

    if (resolved) {
      return resolved;
    }
  }

  return null;
},

_isProductPageInpageTemplate() {
  return this._getProductPageTemplateContract?.()?.templateType === 'PDP_INPAGE';
},

ensureProductPageTemplateStylesheet(templateType, designPreset) {
  const templateContract = this._getProductPageTemplateContract();
  const templateKey = String(templateContract?.templateType || templateType || 'PDP_MODAL')
    .trim()
    .toUpperCase() || 'PDP_MODAL';
  const presetContractId = templateContract?.id;
  const presetKey = String(presetContractId || designPreset || '').trim().toUpperCase();
  const normalizedSlotOrientation = templateContract?.slots?.orientation === 'vertical'
    ? 'vertical'
    : 'horizontal';
  const runtimeWindow = getWindow();
  const urls = runtimeWindow?.__WOLFPACK_PPB_TEMPLATE_CSS_URLS__ || {};
  const isModalTemplate = templateKey === 'PDP_MODAL';
  const modalAssetKey = normalizedSlotOrientation === 'vertical' ? 'VERTICAL_SLOTS' : 'HORIZONTAL_SLOTS';
  const href = urls[isModalTemplate
    ? modalAssetKey
    : presetKey];

  if (!templateContract || (!isModalTemplate && !presetKey) || !href || typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (!this._ppbTemplateStylesheetPromises) {
    this._ppbTemplateStylesheetPromises = new Map();
  }

  const assetKey = isModalTemplate
    ? modalAssetKey
    : presetKey;
  const pendingPromise = this._ppbTemplateStylesheetPromises.get(href);
  if (pendingPromise) {
    return pendingPromise;
  }

  const existingLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find((link) =>
    link.getAttribute('href') === href
    || link.href === href
    || link.dataset.wpbPpbTemplateCss === assetKey
  );

  const markLoaded = (link) => {
    if (link instanceof HTMLLinkElement) {
      link.dataset.wpbPpbTemplateCssLoaded = '1';
    }
  };

  const isStylesheetLoaded = (link) => {
    if (!link) return false;
    if (link.dataset?.wpbPpbTemplateCssLoaded === '1') return true;

    try {
      return !!link.sheet;
    } catch (_error) {
      return false;
    }
  };

  if (existingLink) {
    if (isStylesheetLoaded(existingLink)) {
      markLoaded(existingLink);
      return Promise.resolve();
    }

    const promise = new Promise((resolve) => {
      const done = () => {
        markLoaded(existingLink);
        this._ppbTemplateStylesheetPromises.delete(href);
        resolve();
      };

      existingLink.addEventListener('load', done, { once: true });
      existingLink.addEventListener('error', done, { once: true });
    });

    this._ppbTemplateStylesheetPromises.set(href, promise);
    return promise;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.wpbPpbTemplateCss = assetKey;

  const promise = new Promise((resolve) => {
    const done = () => {
      markLoaded(link);
      this._ppbTemplateStylesheetPromises.delete(href);
      resolve();
    };

    link.addEventListener('load', done, { once: true });
    link.addEventListener('error', done, { once: true });
  });

  this._ppbTemplateStylesheetPromises.set(href, promise);
  document.head.appendChild(link);

  return promise;
},

_markProductPageTemplate() {
  if (!this.container || !this.elements?.stepsContainer || !this.selectedBundle) return;

  const templateType = this._getProductPageTemplateType();
  const designPreset = this._getProductPageDesignPreset();
  const templateContract = this._getProductPageTemplateContract();
  const isInpageTemplate = templateContract?.templateType === 'PDP_INPAGE';
  const isModalTemplate = templateContract?.templateType === 'PDP_MODAL';
  const isListInpageTemplate = templateContract?.id === 'LIST';
  const canonicalPreset = templateContract?.id || designPreset || '';
  const slotOrientation = templateContract?.slots?.orientation === 'vertical' ? 'vertical' : 'horizontal';

  this.container.classList.toggle(
    'wpbMixPageWrapper',
    isInpageTemplate && isListInpageTemplate
  );
  this.container.classList.toggle(
    'wpbMixProductPageWrapperV2',
    isInpageTemplate && isListInpageTemplate
  );

  this.container.dataset.ppbTemplateType = templateType;
  this.container.dataset.ppbDesignPreset = canonicalPreset;
  this.container.dataset.ppbTemplateId = canonicalPreset;
  this.container.setAttribute('template-id', canonicalPreset);
  this.container.setAttribute('template-type', templateType);
  this.elements.stepsContainer.dataset.ppbTemplateType = templateType;
  this.elements.stepsContainer.dataset.ppbDesignPreset = canonicalPreset;
  this.elements.stepsContainer.dataset.ppbTemplateId = canonicalPreset;

  document.body?.setAttribute('wpbmix-template-id', canonicalPreset);
  document.body?.setAttribute('wpbmix-template-type', templateType);
  document.body?.setAttribute('wpb-mix-consolidated-design', 'true');
  void this.ensureProductPageTemplateStylesheet(templateType, designPreset);

  if (isModalTemplate) {
    this.container.dataset.ppbSlotOrientation = slotOrientation;
    this.elements.stepsContainer.dataset.ppbSlotOrientation = slotOrientation;
  } else {
    delete this.container.dataset.ppbSlotOrientation;
    delete this.elements.stepsContainer.dataset.ppbSlotOrientation;
  }
},

// ========================================================================
// STEP TYPE GETTERS
// ========================================================================

/** Steps that are neither free gift nor default — require user selection */
get paidSteps() {
  return this.selectedBundle?.steps?.filter(s => !s.isFreeGift && !s.isDefault) ?? [];
},

/** The free gift step, if any */
get freeGiftStep() {
  return this.selectedBundle?.steps?.find(s => s.isFreeGift) ?? null;
},

/** Index of the free gift step, or -1 */
get freeGiftStepIndex() {
  return this.selectedBundle?.steps?.findIndex(s => s.isFreeGift) ?? -1;
},

/** Steps that are pre-filled with a compulsory product */
get defaultStepsList() {
  return this.selectedBundle?.steps?.filter(s => s.isDefault) ?? [];
},

/**
 * True when all paid (non-free-gift, non-default) steps are fully satisfied.
 * Used to unlock the free gift slot.
 */
get isFreeGiftUnlocked() {
  if (!this.selectedBundle) return false;
  return this.selectedBundle.steps.every((step, i) => {
    if (step.isFreeGift || step.isDefault) return true; // skip these
    return this.validateStep(i);
  });
},

updateMessagesFromBundle() {
  const messaging = this.selectedBundle?.messaging;

  if (messaging) {
    if (messaging.progressTemplate) {
      this.config.discountTextTemplate = messaging.progressTemplate;
    }
    if (messaging.successTemplate) {
      this.config.successMessageTemplate = messaging.successTemplate;
    }

    this.config.showDiscountMessaging = messaging.showDiscountMessaging !== false;

  } else {
    this.config.showDiscountMessaging = this.selectedBundle?.pricing?.enabled || false;
  }
}
};
