import { addBundleToCart } from '../assets/sdk/cart.js';
import { loadBundleConfig } from '../assets/sdk/config-loader.js';
import { debugLog, initDebugMode } from '../assets/sdk/debug.js';
import { emit } from '../assets/sdk/events.js';
import { getDisplayPrice } from '../assets/sdk/get-display-price.js';
import { addItem, clearStep, createState, removeItem } from '../assets/sdk/state.js';
import { validateBundle, validateStep } from '../assets/sdk/validate-bundle.js';
import {
  SDK_DISCOUNT_TIER_EVENT,
  captureDiscountTierState,
  getDiscountTierTransition,
} from '../assets/widgets/shared/discount-tier-feedback.js';

function captureSdkDiscountTierState(state: any) {
  return captureDiscountTierState({
    selectedBundle: state.bundleData,
    selectedProducts: state.steps.map((step) => state.selections[step.id] || {}),
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
        steps: state.steps,
        selections: state.selections,
        discountConfiguration: state.discountConfiguration,
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

function mount(): void {
  const container = document.querySelector<HTMLElement>('[data-sdk-mode="true"]');
  if (!container) return;

  const state = createState();
  const result = loadBundleConfig(container, state);
  if (!result.success) throw new Error(result.error);

  const sdk = createSdk(state);
  (window as Window & { WolfpackBundles?: ReturnType<typeof createSdk> }).WolfpackBundles = sdk;
  initDebugMode(state, sdk);
  emit('wbp:ready', { bundleId: state.bundleId, steps: state.steps });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
}
