import { PricingCalculator } from './pricing-calculator.js';
import {
  applyStorefrontSellingPlanPricingToUnitPrices,
  resolveSubscriptionProductCardPrice,
  shouldApplyStorefrontBundleDiscount,
} from './engine/selling-plan-pricing.js';

export const bundleSubscriptionStorefrontMethods: Record<string, any> & ThisType<any> = {
  getSubscriptionProductCardPrice(price) {
    return getSubscriptionProductCardPrice(this, price);
  },
  calculateBundleTotalForPurchaseOption(selectedProducts, stepProductData, steps = null) {
    return calculateBundleTotalForPurchaseOption(
      this,
      selectedProducts,
      stepProductData,
      steps,
    );
  },
  calculateBundleDiscountForPurchaseOption(totalPrice, totalQuantity, unitPrices = []) {
    return calculateBundleDiscountForPurchaseOption(
      this,
      totalPrice,
      totalQuantity,
      unitPrices,
    );
  },
};

export function calculateBundleDiscountForPurchaseOption(
  controller,
  totalPrice,
  totalQuantity,
  unitPrices = [],
) {
  const bundle = controller?.selectedBundle;
  const subscription = bundle?.subscription;
  if (subscription?.enabled && !shouldApplyStorefrontBundleDiscount(
    subscription,
    controller?.selectedSellingPlanId,
  )) {
    return PricingCalculator.calculateDiscount(
      { ...bundle, pricing: { ...(bundle?.pricing ?? {}), enabled: false } },
      totalPrice,
      totalQuantity,
      unitPrices,
    );
  }
  return PricingCalculator.calculateDiscount(bundle, totalPrice, totalQuantity, unitPrices);
}

export function getSubscriptionProductCardPrice(controller, price) {
  return resolveSubscriptionProductCardPrice(
    controller?.selectedBundle?.subscription,
    controller?.selectedSellingPlanId,
    Number(price || 0),
  );
}

export function calculateBundleTotalForPurchaseOption(
  controller,
  selectedProducts,
  stepProductData,
  steps = null,
) {
  const result = PricingCalculator.calculateBundleTotal(
    selectedProducts,
    stepProductData,
    steps,
  );
  const subscription = controller?.selectedBundle?.subscription;
  const sellingPlanId = controller?.selectedSellingPlanId;
  const plan = subscription?.selectedGroup?.plans?.find?.(
    (candidate) => candidate?.id === sellingPlanId,
  );
  if (!subscription?.enabled || !sellingPlanId || !plan) return result;
  const adjusted = applyStorefrontSellingPlanPricingToUnitPrices(
    result.unitPrices,
    plan.pricingPolicies ?? [],
    1,
  );
  return {
    ...result,
    totalPrice: adjusted.totalPrice,
    unitPrices: adjusted.unitPrices,
  };
}
