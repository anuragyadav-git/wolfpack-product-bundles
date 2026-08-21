'use strict';

import { ConditionValidator } from '../widgets/shared/condition-validator.js';

export function createState() {
  return {
    isReady: false,
    bundleId: null,
    offerId: null,
    bundleName: null,
    bundleData: null,
    steps: [],
    stepProductData: [],
    selections: {},
    discountConfiguration: null,
  };
}

function _findStep(state: any, stepId: any) {
  return state.steps.find(function (s: any) { return s.id === stepId; }) || null;
}

export function addItem(state: any, stepId: string, variantId: string|number, qty: number) {
  if (!state.isReady) {
    return { success: false, error: 'WolfpackBundles SDK not ready yet.' };
  }
  const step = _findStep(state, stepId);
  if (!step) {
    return { success: false, error: 'stepId "' + stepId + '" not found in bundle.' };
  }

  const vid = String(variantId);
  const currentSelections = state.selections[stepId] || {};
  const check = ConditionValidator.canUpdateQuantity(step, currentSelections, vid, (currentSelections[vid] || 0) + qty);
  if (!check.allowed) {
    const errorMessage = typeof ConditionValidator._formatStepLimitToast === 'function'
      ? ConditionValidator._formatStepLimitToast(check.limitText, step.conditionValue)
      : 'This step allows ' + check.limitText + ' product' + (step.conditionValue !== 1 ? 's' : '') + '.';
    return { success: false, error: errorMessage };
  }

  if (!state.selections[stepId]) state.selections[stepId] = {};
  state.selections[stepId][vid] = (state.selections[stepId][vid] || 0) + qty;
  return { success: true };
}

export function removeItem(state: any, stepId: string, variantId: string|number, qty: number) {
  if (!state.isReady) {
    return { success: false, error: 'WolfpackBundles SDK not ready yet.' };
  }
  const step = _findStep(state, stepId);
  if (!step) {
    return { success: false, error: 'stepId "' + stepId + '" not found in bundle.' };
  }

  const vid = String(variantId);
  if (!state.selections[stepId]) state.selections[stepId] = {};
  const current = state.selections[stepId][vid] || 0;
  const next = Math.max(0, current - qty);
  if (next === 0) {
    delete state.selections[stepId][vid];
  } else {
    state.selections[stepId][vid] = next;
  }
  return { success: true };
}

export function clearStep(state: any, stepId: string) {
  if (!state.isReady) {
    return { success: false, error: 'WolfpackBundles SDK not ready yet.' };
  }
  const step = _findStep(state, stepId);
  if (!step) {
    return { success: false, error: 'stepId "' + stepId + '" not found in bundle.' };
  }
  state.selections[stepId] = {};
  return { success: true };
}
