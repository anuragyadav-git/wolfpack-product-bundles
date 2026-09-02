'use strict';

import { ConditionValidator } from '../widgets/shared/condition-validator.js';
import {
  canIncreasePpbSelection,
  normalizePpbSelectionKey,
  resolvePpbSelectionMetric,
} from '../widgets/shared/ppb-condition-selections.js';

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

function _stepProducts(state: any, stepId: any) {
  const index = state.steps.findIndex((step: any) => step.id === stepId);
  return index >= 0 ? state.stepProductData[index] || [] : [];
}

function _validQuantity(quantity: number) {
  return Number.isInteger(quantity) && quantity > 0;
}

function _resolveVariant(state: any, stepId: any, variantId: any) {
  return resolvePpbSelectionMetric(_stepProducts(state, stepId), variantId);
}

export function addItem(state: any, stepId: string, variantId: string|number, qty: number) {
  if (!state.isReady) {
    return { success: false, error: 'Only Bundles SDK not ready yet.' };
  }
  const step = _findStep(state, stepId);
  if (!step) {
    return { success: false, error: 'stepId "' + stepId + '" not found in bundle.' };
  }

  if (!_validQuantity(qty)) {
    return { success: false, error: 'quantity must be a positive integer.' };
  }

  const resolved = _resolveVariant(state, stepId, variantId);
  const vid = normalizePpbSelectionKey(variantId);
  if (!resolved.metric || !vid) {
    return { success: false, error: 'variantId "' + variantId + '" is not available in this step.' };
  }
  if (resolved.metric.available !== true) {
    return { success: false, error: 'variantId "' + variantId + '" is currently unavailable.' };
  }
  const currentSelections = state.selections[stepId] || {};
  const nextQuantity = (currentSelections[vid] || 0) + qty;
  const productQuantityCheck = ConditionValidator.canUpdateProductQuantity(
    state.bundleData?.validateQuantityPerProduct,
    currentSelections[vid] || 0,
    nextQuantity,
  );
  if (!productQuantityCheck.allowed) {
    return { success: false, error: 'Maximum allowed quantity per product is ' + productQuantityCheck.limit + '.' };
  }
  const check = canIncreasePpbSelection({
    step,
    products: _stepProducts(state, stepId),
    selections: currentSelections,
    selectionKey: vid,
    nextQuantity,
  });
  if (!check.allowed) {
    const errorMessage = typeof ConditionValidator._formatStepLimitToast === 'function'
      ? ConditionValidator._formatStepLimitToast(check.limitText, step.conditionValue)
      : 'This step allows ' + check.limitText + ' product' + (step.conditionValue !== 1 ? 's' : '') + '.';
    return { success: false, error: errorMessage };
  }

  if (!state.selections[stepId]) state.selections[stepId] = {};
  state.selections[stepId][vid] = nextQuantity;
  return { success: true };
}

export function removeItem(state: any, stepId: string, variantId: string|number, qty: number) {
  if (!state.isReady) {
    return { success: false, error: 'Only Bundles SDK not ready yet.' };
  }
  const step = _findStep(state, stepId);
  if (!step) {
    return { success: false, error: 'stepId "' + stepId + '" not found in bundle.' };
  }

  if (!_validQuantity(qty)) {
    return { success: false, error: 'quantity must be a positive integer.' };
  }

  const vid = normalizePpbSelectionKey(variantId);
  const resolved = _resolveVariant(state, stepId, vid);
  const current = state.selections[stepId]?.[vid] || 0;
  if (!resolved.metric || !vid || current <= 0) {
    return { success: false, error: 'variantId "' + variantId + '" is not selected in this step.' };
  }
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
    return { success: false, error: 'Only Bundles SDK not ready yet.' };
  }
  const step = _findStep(state, stepId);
  if (!step) {
    return { success: false, error: 'stepId "' + stepId + '" not found in bundle.' };
  }
  state.selections[stepId] = {};
  return { success: true };
}
