import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { BundleDataManager } from '../../shared/bundle-data-manager.js';
import { ToastManager } from '../../shared/toast-manager.js';
import {
  claimCheckoutIntegrationInvocation,
  getCheckoutIntegrationProvider,
  invokeCheckoutIntegrationProvider,
  waitForCheckoutIntegrationCapability,
} from '../../shared/checkout-integration-adapters.js';

export const fullPageAnalyticsConfigMethods: Record<string, any> & ThisType<any> = {
_ensureWpbSessionId() {
  if (this._wpbSessionId) return this._wpbSessionId;
  try {
    const bundleId = this.selectedBundle?.id || this.container?.dataset?.bundleId || 'unknown';
    const storageKey = `wpb_session_${bundleId}`;
    const existing = sessionStorage.getItem(storageKey);
    if (existing) { this._wpbSessionId = existing; return existing; }
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `wpb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(storageKey, id);
    this._wpbSessionId = id;
    return id;
  } catch (_e) {
    this._wpbSessionId = `wpb-${Date.now()}`;
    return this._wpbSessionId;
  }
},

_emitStorefrontEvent(name, detail = {}) {
  try {
    const fullDetail = Object.assign({
      bundleId: this.selectedBundle?.id || null,
      bundleType: this.container?.dataset?.bundleType || 'full_page',
      presetId: this.getFullPageDesignPreset?.() || null,
      sessionId: this._ensureWpbSessionId(),
      timestamp: new Date().toISOString(),
    }, detail);
    window.dispatchEvent(new CustomEvent(`wpb:${name}`, { detail: fullDetail, bubbles: true }));
  } catch (_e) {
    // Listener errors must never break the widget.
  }
},

_sendEngagementBeacon(eventName) {
  try {
    const bundleId = this.selectedBundle?.id || this.container?.dataset?.bundleId;
    if (!bundleId) return;
    const guardKey = `wpb_engagement_${eventName}_${bundleId}`;
    if (sessionStorage.getItem(guardKey) === '1') return;
    const sessionId = this._ensureWpbSessionId();
    const shopId = window.Shopify?.shop || this.container?.dataset?.shop || window.location.hostname;
    const payload = {
      shopId,
      bundleId,
      sessionId,
      presetId: this.getFullPageDesignPreset?.() || null,
      bundleType: this.container?.dataset?.bundleType || 'full_page',
      eventName: `wpb:${eventName}`,
      landingPage: window.location.pathname + window.location.search,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(guardKey, '1');
    fetch('/apps/onlybundles/api/attribution/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { /* fire-and-forget */ });
  } catch (_e) {
    // Beacon failures must never break the widget.
  }
},

async loadLanguageSettings() {
  try {
    const shop = window.Shopify?.shop || this.container.dataset.shop;
    if (!shop) return;

    const locale = window.Shopify?.locale || 'en';
    const endpoint = `/apps/onlybundles/api/language-settings/${encodeURIComponent(shop)}?bundleType=full_page&locale=${encodeURIComponent(locale)}`;
    const response = await fetch(endpoint, { credentials: 'same-origin' });
    if (!response.ok) return;

    const languageSettings = await response.json();
    this.config.languageSettings = languageSettings;
    this.config.languageData = languageSettings.activeLanguageData || null;
    this.config.sharedCartLabels = languageSettings.sharedCartLabels || null;
    this.config.textOverrides = {
      ...(this.config.textOverrides || {}),
      ...(languageSettings.textOverrides || {})
    };
  } catch (_) {
    // Non-critical: default and bundle-level text still render.
  }
},

async loadControlsSettings() {
  try {
    const shop = window.Shopify?.shop || this.container.dataset.shop;
    if (!shop) return;

    const endpoint = `/apps/onlybundles/api/controls-settings/${encodeURIComponent(shop)}?bundleType=full_page`;
    const response = await fetch(endpoint, { credentials: 'same-origin' });
    if (!response.ok) return;

    this.config.controlsSettings = await response.json();
  } catch (_) {
    // Non-critical: the widget keeps its current default behavior.
  }
},

_getLandingPageControls() {
  return this.config.controlsSettings?.activeControls
    || this.config.controlsSettings?.settingsControls?.landingPage
    || null;
},

_runControlsScript(script) {
  if (!script || typeof script !== 'string') return;
  try {
    new Function(script).call(window);
  } catch (_) {
    // Merchant-authored integration script should not block bundle checkout.
  }
},

_getCheckoutIntegrationProvider(providerId) {
  return getCheckoutIntegrationProvider(providerId);
},

_isCheckoutIntegrationProvider(providerId) {
  return this._getCheckoutIntegrationProvider(providerId).id !== 'native';
},

_getCheckoutIntegrationFallbackTarget(provider) {
  return provider.fallbackAction === 'checkout' ? '/checkout' : '/cart';
},

async _openThemeCartDrawer() {
  let cart = null;
  try {
    const response = await fetch('/cart.js', {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (response.ok) {
      cart = await response.json();
    }
  } catch (_) {
    // Cart drawer refresh is best-effort.
  }

  const detail = { cart };
  [
    'cart:refresh',
    'cart:updated',
    'cart:open',
    'theme:cart:open',
  ].forEach((eventName) => {
    try {
      document.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    } catch (_) {
      // Keep trying the remaining event contracts.
    }
  });

  const drawer = document.querySelector('cart-drawer, cart-notification');
  if (drawer && typeof drawer.open === 'function') {
    drawer.open();
    return true;
  }

  const trigger = document.querySelector(
    '[aria-controls="CartDrawer"], [data-cart-drawer-open], [data-cart-open], [href="/cart"]',
  );
  if (trigger && typeof trigger.click === 'function') {
    trigger.click();
    return true;
  }

  return cart !== null;
},

_openGokwikCheckout(checkoutUrl) {
  try {
    if (typeof window.gokwikSdk?.initCheckout !== 'function') return false;
    window.gokwikSdk.initCheckout({
      checkoutUrl,
    });
    return true;
  } catch {
    return false;
  }
},

_openShopfloCheckout() {
  try {
    if (typeof window.Shopflo?.openCheckout !== 'function') return false;
    window.Shopflo.openCheckout();
    return true;
  } catch {
    return false;
  }
},

_setCheckoutIntegrationDiscountState(code) {
  if (!code) return;
  try {
    sessionStorage.setItem('wpbDiscountCode', code);
  } catch (_) {
    // Non-critical persistence.
  }
  try {
    document.cookie = `discount_code=${encodeURIComponent(code)}; path=/; Secure; SameSite=Lax`;
  } catch (_) {
    // Non-critical persistence.
  }
},

async _createCheckoutIntegrationDiscountCode(providerId) {
  const response = await fetch('/apps/onlybundles/api/checkout-integration-discount-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    body: JSON.stringify({ providerId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.code) {
    throw new Error(payload?.error || 'Checkout integration discount code could not be created');
  }
  return payload;
},

async _applyCheckoutIntegrationDiscountCode(code) {
  if (!code) return false;
  const discountUrl = `/discount/${encodeURIComponent(code)}?redirect=/cart`;
  const response = await fetch(discountUrl, {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    redirect: 'follow',
  });
  return response.ok;
},

async _invokeCheckoutIntegrationProvider(providerId, options = {}) {
  const adapterOptions = {
    ...options,
    openThemeCartDrawer: () => this._openThemeCartDrawer(),
    openGokwikCheckout: (checkoutUrl) => this._openGokwikCheckout(checkoutUrl),
    openShopfloCheckout: () => this._openShopfloCheckout(),
  };
  const capability = await waitForCheckoutIntegrationCapability(
    providerId,
    window,
    adapterOptions,
  );
  if (!capability.available) {
    return {
      ok: false,
      phase: 'capability',
      reason: capability.reason || 'capability-unavailable',
      provider: capability.provider,
    };
  }
  return invokeCheckoutIntegrationProvider(providerId, window, adapterOptions);
},

async _handleCheckoutIntegrationProvider(checkout) {
  const provider = this._getCheckoutIntegrationProvider(checkout?.providerId || 'native');
  const providerId = provider.id;
  let payload = null;

  if (provider.requiresDiscountCode) {
    payload = await this._createCheckoutIntegrationDiscountCode(providerId);
    this._setCheckoutIntegrationDiscountState(payload.code);
    const applied = await this._applyCheckoutIntegrationDiscountCode(payload.code);

    if (!applied) {
      window.location.href = `/discount/${encodeURIComponent(payload.code)}?redirect=/checkout`;
      return;
    }

    this._emitStorefrontEvent('checkout-integration-discount-code-created', {
      providerId,
      expiresAt: payload.expiresAt || null,
    });
  }

  const invocation = await this._invokeCheckoutIntegrationProvider(providerId, {
    checkoutUrl: checkout?.checkoutUrl,
    executeScript: () => this._runControlsScript(checkout?.executeScript),
  });
  if (invocation.ok) {
    this._emitStorefrontEvent('checkout-integration-provider-invoked', { providerId });
    return;
  }

  this._emitStorefrontEvent('checkout-integration-provider-fallback', {
    providerId,
    reason: invocation.reason,
    phase: invocation.phase,
  });
  if (payload?.code) {
    window.location.href = `/discount/${encodeURIComponent(payload.code)}?redirect=/checkout`;
    return;
  }
  window.location.href = this._getCheckoutIntegrationFallbackTarget(provider);
},

async _handlePostAddToCartAction(actionConfig, lifecycleKey) {
  const checkout = actionConfig || this._getLandingPageControls()?.checkout || {};
  const provider = getCheckoutIntegrationProvider(checkout.providerId || 'native');

  if (lifecycleKey) {
    this._checkoutIntegrationInvocations ||= new Set();
    if (!claimCheckoutIntegrationInvocation(this._checkoutIntegrationInvocations, lifecycleKey)) {
      return;
    }
  }

  if (provider.id !== 'custom_script') {
    this._runControlsScript(checkout.executeScript);
  }
  const target = checkout.action === 'checkout' ? '/checkout' : '/cart';
  const providerId = provider.id;
  this._emitStorefrontEvent('checkout-clicked', { target, providerId });

  if (this._isCheckoutIntegrationProvider(providerId)) {
    try {
      await this._handleCheckoutIntegrationProvider(checkout);
      return;
    } catch (error) {
      this._emitStorefrontEvent('checkout-integration-provider-fallback', {
        providerId,
        reason: 'discount-code-error',
        message: String(error && error.message || error),
      });
      ToastManager.show('Checkout discount could not be prepared. Redirecting to checkout.');
    }
  }

  setTimeout(() => {
    window.location.href = target;
  }, 1000);
},

parseConfiguration() {
  const dataset = this.container.dataset;

  this.config = {
    bundleId: dataset.bundleId || null,
    isContainerProduct: dataset.isContainerProduct === 'true',
    containerBundleId: dataset.containerBundleId || null,
    hideDefaultButtons: dataset.hideDefaultButtons === 'true',
    showTitle: dataset.showTitle === 'true', // Default to false to avoid duplicate with main header
    showDescription: dataset.showDescription !== 'false',
    showStepNumbers: dataset.showStepNumbers !== 'false',
    showFooterMessaging: dataset.showFooterMessaging !== 'false',
    showStepTimeline: dataset.showStepTimeline !== 'false',
    showCategoryTabs: dataset.showCategoryTabs !== 'false',
    // Custom content from theme editor
    customTitle: dataset.customTitle || null,
    customDescription: dataset.customDescription || null,
    // Quantity selector visibility settings (default: show on both)
    showQuantitySelectorOnCard: dataset.showQuantitySelectorOnCard !== 'false',
    // Messages will be set from bundle.pricing.messages after bundle loads
    discountTextTemplate: 'Add {conditionText} to get {discountText}',
    successMessageTemplate: 'Congratulations! You got {discountText}!',
    showDiscountProgressBar: false,
    discountProgressBarType: 'step_based',
    discountProgressTextTemplate: null,
    discountProgressSuccessTemplate: null,
    currentProductId: window.currentProductId,
    currentProductGid: window.currentProductGid,
    currentProductHandle: window.currentProductHandle,
    currentProductCollections: window.currentProductCollections,
    tierConfig: this.parseTierConfig(dataset.tierConfig || '[]'),
    loadingScreen: {
      gifUrl: dataset.fpbLoadingGif || '',
      backgroundColor: dataset.fpbLoadingBackground || '#ffffff',
    },
  };

  this.tierConfig = this.config.tierConfig;

  // Parse bundle_settings metafield (Settings design display settings — promoBanner, badge, etc.)
  try {
    this.bundleSettings = JSON.parse(dataset.bundleSettings || 'null') || {};
  } catch {
    this.bundleSettings = {};
  }

  this._bundleConfigCacheMode = 'none';
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
    payload.type === 'full_page' &&
    typeof payload.id === 'string' &&
    payload.id.trim() !== ''
  );
},

async loadBundleData() {
  let bundleData = null;

  const bundleId = this.container.dataset.bundleId;

  if (!bundleId) {
    throw new Error('Full-page bundle ID is required');
  }

  {
    // Only a source-marked, bundle-ID-matched app-proxy payload is authoritative.
    const cachedConfig = this.container.dataset.bundleConfig;
    const cachedPayload = this._parseBundleConfigPayload(cachedConfig);
    if (cachedPayload) {
      const isCurrentAppProxyDocumentPayload =
        this.container.dataset.bundleConfigSource === 'app_proxy' &&
        cachedPayload.id === bundleId &&
        cachedPayload.bundleType === 'full_page' &&
        Array.isArray(cachedPayload.steps);

      if (isCurrentAppProxyDocumentPayload) {
        bundleData = { [cachedPayload.id]: cachedPayload };
        this._bundleConfigCacheMode = 'app-proxy-inline';
      } else if (this._isBundleConfigBootstrapPayload(cachedPayload)) {
        this._bundleConfigCacheMode = 'bootstrap';
      }
    }

    // Hydrate through the app proxy when the authoritative payload is unavailable.
    if (!bundleData) {
      this._bundleConfigCacheMode = 'proxy';

      // Retry once after a short delay for transient server errors (504/503).
      // This handles Render cold-start: the first request times out while the
      // server is warming up; the retry ~3 s later succeeds.
      const RETRY_DELAY_MS = 3000;
      const RETRYABLE_STATUSES = new Set([503, 504]);

      const fetchBundleData = async () => {
        // Use Shopify app proxy path - Shopify automatically adds signature and auth params
        // App proxy config: /apps/onlybundles -> https://wolfpack-product-bundle-app.onrender.com
        // CRITICAL: URL-encode bundle ID to handle special characters in cuid() format
        const apiUrl = `/apps/onlybundles/api/bundle/${encodeURIComponent(bundleId)}.json`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          // Try to get error details from response body
          let errorDetails = `${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
          } catch (e) {
          }
          const err = new Error(`API request failed: ${errorDetails}`);
          err.status = response.status;
          throw err;
        }

        const data = await response.json();

        if (data.success && data.bundle) {
          return { [data.bundle.id]: data.bundle };
        } else {
          throw new Error('Invalid API response structure');
        }
      };

      try {
        try {
          bundleData = await fetchBundleData();
        } catch (firstErr) {
          // Retry once for 504/503 (server cold-start)
          if (RETRYABLE_STATUSES.has(firstErr.status)) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            bundleData = await fetchBundleData();
          } else {
            throw firstErr;
          }
        }
      } catch (error) {
        throw error;
      }
    }
  }

  this.bundleData = bundleData;
},

selectBundle() {
  this.selectedBundle = BundleDataManager.selectBundle(this.bundleData, this.config);
  if (!this.selectedBundle && this.config?.bundleId && this.bundleData?.[this.config.bundleId]?.bundleType === BUNDLE_WIDGET.BUNDLE_TYPES.FULL_PAGE) {
    this.selectedBundle = this.bundleData[this.config.bundleId];
  }
  if (this.selectedBundle) {
    this.config.showStepTimeline = this.resolveShowStepTimeline(
      this.selectedBundle.showStepTimeline ?? null,
      this.config.showStepTimeline
    );
  }

  // Update message templates from bundle pricing messages
  this.updateMessagesFromBundle();
},
};
