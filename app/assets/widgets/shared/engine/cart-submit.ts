/**
 * Shared cart submission payload helpers.
 *
 * Transport remains owned by each widget. These helpers only build payload
 * structures that must stay consistent across controller refactors.
 */

'use strict';

import { normalizeOfferAnalyticsDimensions } from '../../../../lib/analytics/offer-dimensions.js';

function normalizeBundleId(value: unknown) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= 128 ? normalized : null;
}

export function buildOfferAnalyticsCartProperties({
  bundleId,
  offerDelivery,
  tierId = null,
}: any = {}) {
  const normalizedBundleId = normalizeBundleId(bundleId);
  const dimensions = normalizeOfferAnalyticsDimensions({
    offerPolicyId: offerDelivery?.offerPolicyId,
    offerRuleVersion: offerDelivery?.ruleVersion,
    offerTierId: tierId,
    offerEligibilitySource: offerDelivery?.eligibilitySource,
  });
  const properties: Record<string, string> = {};
  if (normalizedBundleId) properties._wpb_bundle_id = normalizedBundleId;
  if (dimensions.offerPolicyId) properties._wpb_offer_policy_id = dimensions.offerPolicyId;
  if (dimensions.offerRuleVersion) {
    properties._wpb_offer_rule_version = String(dimensions.offerRuleVersion);
  }
  if (dimensions.offerTierId) properties._wpb_offer_tier_id = dimensions.offerTierId;
  if (dimensions.offerEligibilitySource) {
    properties._wpb_offer_eligibility_source = dimensions.offerEligibilitySource;
  }
  return properties;
}

export function extractBundleDetailsSourceProperties(cartItems: any[] = []) {
  const firstItem = cartItems.find(item => item?.properties?._bundle_display_properties);
  return firstItem?.properties || {};
}

export function normalizeSellingPlanIdForCart(value = '') {
  const raw = String(value).trim();
  const match = raw.match(/^gid:\/\/shopify\/SellingPlan\/(\d+)$/);
  return match ? match[1] : raw;
}

export function applySellingPlanToJsonCartItems(items: any[] = [], sellingPlanId = '') {
  if (!sellingPlanId) return items;
  const cartSellingPlanId = normalizeSellingPlanIdForCart(sellingPlanId);
  return items.map(item => {
    const properties: any = { ...(item?.properties || {}) };
    delete properties.Box;
    return {
      ...item,
      selling_plan: cartSellingPlanId,
      properties,
    };
  });
}

export function buildProductPageCartFormData(cartItems: any[] = [], {
  bundleName = '',
  offerId = '',
  sessionKey = '',
  runtimeToken = '',
  sellingPlanId = '',
}: any = {}) {
  const formData = new FormData();
  const cartSellingPlanId = normalizeSellingPlanIdForCart(sellingPlanId);

  cartItems.forEach((item, index) => {
    const itemNumber = index + 1;
    formData.append(`items[${index}][id]`, String(item.id));
    formData.append(`items[${index}][quantity]`, String(item.quantity));
    if (sellingPlanId) {
      formData.append(`items[${index}][selling_plan]`, cartSellingPlanId);
    }

    Object.entries(item.properties || {}).forEach(([key, value]: any) => {
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
