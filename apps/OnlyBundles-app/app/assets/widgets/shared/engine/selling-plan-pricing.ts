type SellingPlanPricingPolicy = {
  kind?: string;
  value?: number;
  afterCycle?: number;
};

export function resolveStorefrontSubscriptionPresentation(subscription: any, locale = "") {
  const normalizedLocale = String(locale || "").trim();
  const languageLocale = normalizedLocale.split("-")[0];
  const language = subscription?.translations?.[languageLocale] ?? {};
  const exact = subscription?.translations?.[normalizedLocale] ?? {};
  const selectedPlanIds = Array.isArray(subscription?.selectedPlanIds)
    ? subscription.selectedPlanIds
    : [];
  const localizedCopy: any = {
    title: exact.title ?? language.title ?? subscription?.copy?.title ?? "",
    subtitle: exact.subtitle ?? language.subtitle ?? subscription?.copy?.subtitle ?? "",
    ...(exact.unavailableMessage ?? language.unavailableMessage ?? subscription?.copy?.unavailableMessage
      ? { unavailableMessage: exact.unavailableMessage ?? language.unavailableMessage ?? subscription.copy.unavailableMessage }
      : {}),
  };
  return {
    ...subscription,
    copy: localizedCopy,
    oneTimePurchase: {
      ...(subscription?.oneTimePurchase ?? {}),
      title: exact.oneTimePurchaseTitle
        ?? language.oneTimePurchaseTitle
        ?? subscription?.oneTimePurchase?.title
        ?? "",
    },
    planCopy: Object.fromEntries(selectedPlanIds.map((planId: string) => [planId, {
      ...(subscription?.planCopy?.[planId] ?? {}),
      ...(language?.planCopy?.[planId] ?? {}),
      ...(exact?.planCopy?.[planId] ?? {}),
    }])),
  };
}

export function shouldApplyStorefrontBundleDiscount(
  subscription: any,
  sellingPlanId: string | null | undefined,
) {
  const target = subscription?.bundleDiscountAppliesOn ?? "both";
  if (target === "both") return true;
  return sellingPlanId ? target === "subscription" : target === "one_time";
}

export function applyStorefrontSellingPlanPricing(
  price: number,
  policies: SellingPlanPricingPolicy[] = [],
  cycle = 1,
) {
  const normalizedPrice = Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0;
  const applicable = policies
    .filter((policy) => Number(policy?.afterCycle ?? 0) < cycle)
    .sort((left, right) => Number(left?.afterCycle ?? 0) - Number(right?.afterCycle ?? 0))
    .at(-1);
  if (!applicable) return normalizedPrice;
  const value = Number(applicable.value ?? 0);
  if (!Number.isFinite(value) || value < 0) return normalizedPrice;
  if (applicable.kind === "percentage") {
    return Math.max(0, Math.round(normalizedPrice * (1 - value / 100)));
  }
  if (applicable.kind === "fixed_amount") {
    return Math.max(0, Math.round(normalizedPrice - value));
  }
  if (applicable.kind === "fixed_price") {
    return Math.max(0, Math.round(value));
  }
  return normalizedPrice;
}

export function applyStorefrontSellingPlanPricingToUnitPrices(
  unitPrices: number[] = [],
  policies: SellingPlanPricingPolicy[] = [],
  cycle = 1,
) {
  const adjustedUnitPrices = unitPrices.map((price) =>
    applyStorefrontSellingPlanPricing(price, policies, cycle));
  return {
    unitPrices: adjustedUnitPrices,
    totalPrice: adjustedUnitPrices.reduce((sum, price) => sum + price, 0),
  };
}

export function buildStorefrontPlanPresentation(
  subscription: any,
  sellingPlanId: string | null | undefined,
  originalPrice: number,
  unitPrices: number[] = [],
) {
  if (!subscription?.enabled || !sellingPlanId || !subscription?.selectedGroup) return null;
  if (!subscription.selectedPlanIds?.includes?.(sellingPlanId)) return null;
  const plan = subscription.selectedGroup.plans?.find?.(
    (candidate: any) => candidate?.id === sellingPlanId,
  );
  if (!plan) return null;
  const price = Number.isFinite(originalPrice) ? Math.max(0, Math.round(originalPrice)) : 0;
  const copy = subscription.planCopy?.[sellingPlanId] ?? {};
  return {
    groupName: subscription.selectedGroup.name ?? "",
    planId: sellingPlanId,
    displayName: copy.displayName ?? plan.sourceName ?? "",
    discountPill: copy.discountPill ?? "",
    description: copy.description ?? "",
    originalPrice: price,
    perDeliveryPrice: unitPrices.length > 0
      ? applyStorefrontSellingPlanPricingToUnitPrices(
          unitPrices,
          plan.pricingPolicies ?? [],
          1,
        ).totalPrice
      : applyStorefrontSellingPlanPricing(
          price,
          plan.pricingPolicies ?? [],
          1,
        ),
  };
}

export function resolveSubscriptionProductCardPrice(
  subscription: any,
  sellingPlanId: string | null | undefined,
  originalPrice: number,
) {
  if (subscription?.showDiscountOnProductCards !== true) return originalPrice;
  return buildStorefrontPlanPresentation(
    subscription,
    sellingPlanId,
    originalPrice,
  )?.perDeliveryPrice ?? originalPrice;
}
