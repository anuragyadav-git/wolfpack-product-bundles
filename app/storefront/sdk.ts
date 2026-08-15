import { addBundleToCart } from '../assets/sdk/cart.js';
import { loadBundleConfig } from '../assets/sdk/config-loader.js';
import { debugLog, initDebugMode } from '../assets/sdk/debug.js';
import { emit } from '../assets/sdk/events.js';
import { getDisplayPrice } from '../assets/sdk/get-display-price.js';
import { addItem, clearStep, createState, removeItem } from '../assets/sdk/state.js';
import { validateBundle, validateStep } from '../assets/sdk/validate-bundle.js';

function createSdk(state: ReturnType<typeof createState>) {
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
      const result = addItem(state, stepId, variantId, quantity);
      if (result.success) emit('wbp:item-added', { stepId, variantId: String(variantId), quantity });
      debugLog('addItem', stepId, variantId, quantity);
      return result;
    },
    removeItem(stepId: string, variantId: string | number, quantity: number) {
      const result = removeItem(state, stepId, variantId, quantity);
      if (result.success) emit('wbp:item-removed', { stepId, variantId: String(variantId), quantity });
      return result;
    },
    clearStep(stepId: string) {
      const result = clearStep(state, stepId);
      if (result.success) emit('wbp:step-cleared', { stepId });
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
