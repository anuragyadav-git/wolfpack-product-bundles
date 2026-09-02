'use strict';

import { localizeBundleConfig } from '../widgets/shared/localized-bundle-config.js';

export function loadBundleConfig(container: HTMLElement, state: any, locale?: string) {
  var configValue = container && container.dataset && container.dataset.bundleConfig;

  if (!configValue || configValue.trim() === '' || configValue === 'null' || configValue === 'undefined') {
    return { success: false, error: 'No bundle config found on container. Ensure data-bundle-config attribute is set.' };
  }

  var bundleData;
  try {
    bundleData = localizeBundleConfig(
      JSON.parse(configValue),
      locale ?? (typeof window !== 'undefined' ? (window as any).Shopify?.locale || '' : ''),
    );
  } catch (e: any) {
    return { success: false, error: 'data-bundle-config is not valid JSON: ' + e.message };
  }

  if (!bundleData || typeof bundleData !== 'object' || !bundleData.id) {
    return { success: false, error: 'data-bundle-config is missing required "id" field.' };
  }
  if (
    bundleData.schemaVersion !== 3
    || bundleData.bundleType !== 'product_page'
    || !Array.isArray(bundleData.steps)
    || bundleData.runtimeAuthorization?.version !== 2
  ) {
    return { success: false, error: 'data-bundle-config must be a valid schema-v3 Product Page Bundle snapshot.' };
  }

  state.bundleId = bundleData.id;
  state.offerId = bundleData.offerId || bundleData.bundleOfferId || bundleData.id;
  state.bundleName = bundleData.name || null;
  state.bundleData = bundleData;
  state.steps = Array.isArray(bundleData.steps) ? bundleData.steps : [];
  state.discountConfiguration = bundleData.pricing || null;

  // Initialise selections map for every step
  state.steps.forEach(function (step: any) {
    if (step.id && !state.selections[step.id]) {
      state.selections[step.id] = {};
    }
  });

  state.stepProductData = state.steps.map(function () { return []; });
  state.isReady = false;
  return { success: true };
}
