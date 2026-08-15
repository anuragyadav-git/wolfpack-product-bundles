/**
 * Shared cart submission payload helpers.
 *
 * Transport remains owned by each widget. These helpers only build payload
 * structures that must stay consistent across controller refactors.
 */

'use strict';

export function extractBundleDetailsSourceProperties(cartItems = []) {
  const firstItem = cartItems.find(item => item?.properties?._bundle_display_properties);
  return firstItem?.properties || {};
}

export function normalizeSellingPlanIdForCart(value = '') {
  const raw = String(value).trim();
  const match = raw.match(/^gid:\/\/shopify\/SellingPlan\/(\d+)$/);
  return match ? match[1] : raw;
}

export function applySellingPlanToJsonCartItems(items = [], sellingPlanId = '') {
  if (!sellingPlanId) return items;
  const cartSellingPlanId = normalizeSellingPlanIdForCart(sellingPlanId);
  return items.map(item => {
    const properties = { ...(item?.properties || {}) };
    delete properties.Box;
    return {
      ...item,
      selling_plan: cartSellingPlanId,
      properties,
    };
  });
}

export function buildProductPageCartFormData(cartItems = [], {
  bundleName = '',
  offerId = '',
  sessionKey = '',
  runtimeToken = '',
  sellingPlanId = '',
} = {}) {
  const formData = new FormData();
  const cartSellingPlanId = normalizeSellingPlanIdForCart(sellingPlanId);

  cartItems.forEach((item, index) => {
    const itemNumber = index + 1;
    formData.append(`items[${index}][id]`, String(item.id));
    formData.append(`items[${index}][quantity]`, String(item.quantity));
    if (sellingPlanId) {
      formData.append(`items[${index}][selling_plan]`, cartSellingPlanId);
    }

    Object.entries(item.properties || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(`items[${index}][properties][${key}]`, String(value));
    });
    if (!sellingPlanId) {
      formData.append(`items[${index}][properties][Box]`, String(itemNumber));
    }
    formData.append(`items[${index}][properties][_bundleName]`, bundleName);
    formData.append(`items[${index}][properties][_wolfpackProductBundle:OfferId]`, `${offerId}_${sessionKey}_${itemNumber}`);
    formData.append(`items[${index}][properties][_wolfpackProductBundle:prodQty]`, String(item.quantity));
    if (runtimeToken) {
      formData.append(`items[${index}][properties][_wolfpack_bundle_runtime]`, runtimeToken);
    }
  });

  return {
    formData,
    bundleDetailsKey: `${offerId}_${sessionKey}`,
    sourceProperties: extractBundleDetailsSourceProperties(cartItems),
  };
}
