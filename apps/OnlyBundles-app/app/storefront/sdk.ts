import { addBundleToCart } from '../assets/sdk/cart.js';
import { loadBundleConfig } from '../assets/sdk/config-loader.js';
import { debugLog, initDebugMode } from '../assets/sdk/debug.js';
import { emit } from '../assets/sdk/events.js';
import { getDisplayPrice } from '../assets/sdk/get-display-price.js';
import { hydrateSdkState } from '../assets/sdk/hydration.js';
import { addItem, clearStep, createState, removeItem } from '../assets/sdk/state.js';
import { validateBundle, validateStep } from '../assets/sdk/validate-bundle.js';
import {
  SDK_DISCOUNT_TIER_EVENT,
  captureDiscountTierState,
  getDiscountTierTransition,
} from '../assets/widgets/shared/discount-tier-feedback.js';
import { resolveSpecificLinkOfferStorefrontEligibility } from '../assets/widgets/shared/specific-link-offer-eligibility.js';
import { setStorefrontProxyRoot } from '../config/storefront-proxy-routes.js';

const contextElement = typeof document === 'undefined'
  ? null
  : document.querySelector<HTMLScriptElement>('[data-wpb-context="product-page"]');
if (contextElement?.textContent) {
  try {
    const context = JSON.parse(contextElement.textContent);
    Object.assign(window, context);
    const proxyRoot = context.__WOLFPACK_PPB_STOREFRONT_RUNTIME__?.storefrontProxyRoot;
    if (proxyRoot) setStorefrontProxyRoot(proxyRoot);
  } catch (_error) {
    // Initialization reports a stable configuration failure once an SDK container is found.
  }
}

function cloneJson<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value as Record<string, unknown>).forEach((entry) => deepFreeze(entry));
  return value;
}

function copySelections(selections: Record<string, Record<string, number>>) {
  return Object.fromEntries(
    Object.entries(selections || {}).map(([stepId, variants]) => [stepId, { ...variants }]),
  );
}

function hideSdkContainer(container: HTMLElement) {
  container.hidden = true;
}

function captureSdkDiscountTierState(state: any) {
  return captureDiscountTierState({
    selectedBundle: state.bundleData,
    selectedProducts: state.steps.map((step: { id: string|number; }) => state.selections[step.id] || {}),
    stepProductData: state.stepProductData,
  });
}

function emitSdkDiscountTierTransition(
  state: any,
  before: ReturnType<typeof captureDiscountTierState>,
) {
  const detail = getDiscountTierTransition(before, captureSdkDiscountTierState(state));
  if (detail) emit(SDK_DISCOUNT_TIER_EVENT, detail);
}

export function createSdk(state: any) {
  return {
    get state() {
      return {
        isReady: state.isReady,
        bundleId: state.bundleId,
        bundleName: state.bundleName,
        steps: deepFreeze(cloneJson(state.steps)),
        selections: copySelections(state.selections),
        discountConfiguration: deepFreeze(cloneJson(state.discountConfiguration)),
      };
    },
    addItem(stepId: string, variantId: string | number, quantity: number) {
      const before = captureSdkDiscountTierState(state);
      const result = addItem(state, stepId, variantId, quantity);
      if (result.success) {
        emit('wbp:item-added', { stepId, variantId: String(variantId), quantity });
        emitSdkDiscountTierTransition(state, before);
      }
      debugLog('addItem', stepId, variantId, quantity);
      return result;
    },
    removeItem(stepId: string, variantId: string | number, quantity: number) {
      const before = captureSdkDiscountTierState(state);
      const result = removeItem(state, stepId, variantId, quantity);
      if (result.success) {
        emit('wbp:item-removed', { stepId, variantId: String(variantId), quantity });
        emitSdkDiscountTierTransition(state, before);
      }
      return result;
    },
    clearStep(stepId: string) {
      const before = captureSdkDiscountTierState(state);
      const result = clearStep(state, stepId);
      if (result.success) {
        emit('wbp:step-cleared', { stepId });
        emitSdkDiscountTierTransition(state, before);
      }
      return result;
    },
    validateStep: (stepId: string) => validateStep(stepId, state),
    validateBundle: () => validateBundle(state),
    getDisplayPrice: () => getDisplayPrice(state),
    addBundleToCart: () => addBundleToCart(state, () => validateBundle(state), emit),
  };
}

type InitializeSdkOptions = {
  targetWindow?: any;
  runtime?: any;
  eligibilityResolver?: typeof resolveSpecificLinkOfferStorefrontEligibility;
  hydrateState?: typeof hydrateSdkState;
  emitFn?: typeof emit;
  fetchImpl?: typeof fetch;
};

export async function initializeSdk(
  container: HTMLElement,
  options: InitializeSdkOptions = {},
): Promise<void> {
  const targetWindow = options.targetWindow || window;
  const emitFn = options.emitFn || emit;
  const state = createState();
  const result = loadBundleConfig(container, state, targetWindow.Shopify?.locale || '');
  if (!result.success) {
    hideSdkContainer(container);
    emitFn('wbp:init-failed', { code: 'INVALID_CONFIGURATION', message: result.error });
    return;
  }

  const eligibilityResolver = options.eligibilityResolver || resolveSpecificLinkOfferStorefrontEligibility;
  const eligible = await eligibilityResolver({
    bundle: state.bundleData,
    locationSearch: targetWindow.location?.search || '',
    countryCode: targetWindow.currentCountryCode ?? targetWindow.Shopify?.country ?? null,
    fetchImpl: options.fetchImpl,
  });
  if (!eligible) {
    hideSdkContainer(container);
    return;
  }

  const runtime = options.runtime ?? targetWindow.__WOLFPACK_PPB_STOREFRONT_RUNTIME__;
  if (!runtime?.storefrontAccessToken || !runtime?.storefrontApiVersion) {
    hideSdkContainer(container);
    emitFn('wbp:init-failed', {
      code: 'MISSING_STOREFRONT_RUNTIME',
      message: 'Shopify Storefront runtime is unavailable.',
    });
    return;
  }

  try {
    const hydrateState = options.hydrateState || hydrateSdkState;
    await hydrateState(state, {
      runtime,
      shop: targetWindow.Shopify?.shop || container.dataset.shop,
      country: targetWindow.Shopify?.country || targetWindow.currentCountryCode || null,
      fetchImpl: options.fetchImpl || fetch,
    });
  } catch (_error) {
    hideSdkContainer(container);
    emitFn('wbp:init-failed', {
      code: 'PRODUCT_HYDRATION_FAILED',
      message: 'Shopify product data could not be loaded.',
    });
    return;
  }

  const sdk = createSdk(state);
  targetWindow.WolfpackBundles = sdk;
  initDebugMode(state, sdk);
  emitFn('wbp:ready', {
    bundleId: state.bundleId,
    steps: deepFreeze(cloneJson(state.steps)),
  });
}

async function mount(): Promise<void> {
  const container = document.querySelector<HTMLElement>('[data-sdk-mode="true"]');
  if (!container) return;
  await initializeSdk(container);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void mount(); }, { once: true });
  } else {
    void mount();
  }
}
