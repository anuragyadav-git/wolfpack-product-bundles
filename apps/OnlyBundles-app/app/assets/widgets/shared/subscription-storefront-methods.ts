import { PricingCalculator } from './pricing-calculator.js';
import {
  applyStorefrontSellingPlanPricingToUnitPrices,
  resolveSubscriptionProductCardPrice,
  shouldApplyStorefrontBundleDiscount,
} from './engine/selling-plan-pricing.js';

export const bundleSubscriptionStorefrontMethods: Record<string, any> & ThisType<any> = {
  getSubscriptionProductCardPrice(price: any) {
    return getSubscriptionProductCardPrice(this, price);
  },
  calculateBundleTotalForPurchaseOption(selectedProducts: any, stepProductData: any, steps: any = null) {
    return calculateBundleTotalForPurchaseOption(
      this,
      selectedProducts,
      stepProductData,
      steps,
    );
  },
  calculateBundleDiscountForPurchaseOption(totalPrice: any, totalQuantity: any, unitPrices: any[] = []) {
    return calculateBundleDiscountForPurchaseOption(
      this,
      totalPrice,
      totalQuantity,
      unitPrices,
    );
  },
};

export function calculateBundleDiscountForPurchaseOption(
  controller: any,
  totalPrice: number,
  totalQuantity: number,
  unitPrices: any[] = [],
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

export function getSubscriptionProductCardPrice(controller: any, price: any) {
  return resolveSubscriptionProductCardPrice(
    controller?.selectedBundle?.subscription,
    controller?.selectedSellingPlanId,
    Number(price || 0),
  );
}

export function calculateBundleTotalForPurchaseOption(
  controller: any,
  selectedProducts: any,
  stepProductData: any,
  steps: any = null,
) {
  const result = PricingCalculator.calculateBundleTotal(
    selectedProducts,
    stepProductData,
    steps,
  );
  const subscription = controller?.selectedBundle?.subscription;
  const sellingPlanId = controller?.selectedSellingPlanId;
  const plan = subscription?.selectedGroup?.plans?.find?.(
    (candidate: any) => candidate?.id === sellingPlanId,
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
