/**
 * Shared bundle actions.
 *
 * Actions return a new state object and cloned selection arrays so migration
 * loops can adopt them without mutating legacy widget state by accident.
 */

'use strict';

import { cloneSelectedProducts } from './create-bundle-state.js';

export function addSelectedProduct(state: any, { stepIndex, variantId, quantity = 1 }: any) {
  const selectedProducts = cloneSelectedProducts(state?.selectedProducts);
  ensureStep(selectedProducts, stepIndex);

  const currentQuantity = Number(selectedProducts[stepIndex][variantId] || 0);
  selectedProducts[stepIndex][variantId] = currentQuantity + Math.max(0, Number(quantity || 0));

  return { ...state, selectedProducts };
}

export function removeSelectedProduct(state: any, { stepIndex, variantId, quantity = 1 }: any) {
  const selectedProducts = cloneSelectedProducts(state?.selectedProducts);
  ensureStep(selectedProducts, stepIndex);

  const currentQuantity = Number(selectedProducts[stepIndex][variantId] || 0);
  const nextQuantity = currentQuantity - Math.max(1, Number(quantity || 1));

  if (nextQuantity > 0) {
    selectedProducts[stepIndex][variantId] = nextQuantity;
  } else {
    delete selectedProducts[stepIndex][variantId];
  }

  return { ...state, selectedProducts };
}

export function clearStepSelection(state: any, stepIndex: string|number) {
  const selectedProducts = cloneSelectedProducts(state?.selectedProducts);
  const normalizedStepIndex = Number(stepIndex);
  ensureStep(selectedProducts, normalizedStepIndex);
  selectedProducts[normalizedStepIndex] = {};

  return { ...state, selectedProducts };
}

function ensureStep(selectedProducts: any[], stepIndex: number) {
  while (selectedProducts.length <= stepIndex) {
    selectedProducts.push({});
  }
  if (!selectedProducts[stepIndex] || typeof selectedProducts[stepIndex] !== 'object') {
    selectedProducts[stepIndex] = {};
  }
}
