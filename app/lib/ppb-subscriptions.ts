export type NormalizedSellingPlanPricingPolicy = {
  kind: "percentage" | "fixed_amount" | "fixed_price";
  value: number;
  afterCycle: number;
  currencyCode?: string;
};

export type PpbSubscriptionPlan = {
  id: string;
  sourceName: string;
  options: string[];
  pricingPolicies: NormalizedSellingPlanPricingPolicy[];
};

export type LocalizedSubscriptionCopy = {
  title: string;
  subtitle: string;
  unavailableMessage: string;
};

export type PpbSubscriptionConfigV1 = {
  version: 1;
  enabled: boolean;
  selectedGroup: {
    id: string;
    name: string;
    options: string[];
    plans: PpbSubscriptionPlan[];
  } | null;
  selectedPlanIds: string[];
  defaultPurchaseOption:
    | { kind: "one_time" }
    | { kind: "selling_plan"; sellingPlanId: string };
  oneTimePurchase: {
    enabled: boolean;
    title: string;
    description: string;
  };
  copy: LocalizedSubscriptionCopy;
  planCopy: Record<string, {
    displayName: string;
    discountPill: string;
    description: string;
  }>;
  showDiscountOnProductCards: boolean;
  recurringBundleDiscount: boolean;
  translations: Record<string, Partial<LocalizedSubscriptionCopy>>;
};

export type PpbSubscriptionValidationIssue = { path: string; message: string };

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const bool = (value: unknown) => value === true;
const stringList = (value: unknown) => Array.from(new Set(
  (Array.isArray(value) ? value : []).map(text).filter(Boolean),
));

function normalizePolicy(value: any): NormalizedSellingPlanPricingPolicy | null {
  const kind = value?.kind;
  const amount = Number(value?.value);
  const afterCycle = Number(value?.afterCycle ?? 0);
  if (!["percentage", "fixed_amount", "fixed_price"].includes(kind)) return null;
  if (!Number.isFinite(amount) || amount < 0) return null;
  return {
    kind,
    value: amount,
    afterCycle: Number.isInteger(afterCycle) && afterCycle >= 0 ? afterCycle : 0,
    ...(text(value?.currencyCode) ? { currencyCode: text(value.currencyCode) } : {}),
  } as NormalizedSellingPlanPricingPolicy;
}

function normalizePlan(value: any): PpbSubscriptionPlan | null {
  const id = text(value?.id);
  if (!id) return null;
  return {
    id,
    sourceName: text(value?.sourceName ?? value?.name),
    options: stringList(value?.options),
    pricingPolicies: (Array.isArray(value?.pricingPolicies) ? value.pricingPolicies : [])
      .map(normalizePolicy)
      .filter((policy: NormalizedSellingPlanPricingPolicy | null): policy is NormalizedSellingPlanPricingPolicy => policy !== null),
  };
}

export function normalizePpbSubscriptionConfig(value: unknown): PpbSubscriptionConfigV1 {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as any : {};
  const plans: PpbSubscriptionPlan[] = [...(Array.isArray(input.selectedGroup?.plans) ? input.selectedGroup.plans : [])]
    .sort((left: any, right: any) => Number(left?.position ?? 0) - Number(right?.position ?? 0) || text(left?.id).localeCompare(text(right?.id)))
    .map(normalizePlan)
    .filter((plan: PpbSubscriptionPlan | null): plan is PpbSubscriptionPlan => plan !== null);
  const selectedPlanIds = stringList(input.selectedPlanIds).filter((id) => plans.some((plan: PpbSubscriptionPlan) => plan.id === id));
  const planCopy = Object.fromEntries(selectedPlanIds.map((planId) => {
    const source = input.planCopy?.[planId] ?? {};
    return [planId, {
      displayName: text(source.displayName),
      discountPill: text(source.discountPill),
      description: text(source.description),
    }];
  }));
  const selectedGroupId = text(input.selectedGroup?.id);
  const requestedDefault = input.defaultPurchaseOption;
  const defaultPurchaseOption = requestedDefault?.kind === "selling_plan"
    ? { kind: "selling_plan" as const, sellingPlanId: text(requestedDefault.sellingPlanId) }
    : { kind: "one_time" as const };
  const translations = Object.fromEntries(Object.entries(
    input.translations && typeof input.translations === "object" ? input.translations : {},
  ).map(([locale, copy]: [string, any]) => [locale, {
    ...(text(copy?.title) ? { title: text(copy.title) } : {}),
    ...(text(copy?.subtitle) ? { subtitle: text(copy.subtitle) } : {}),
    ...(text(copy?.unavailableMessage) ? { unavailableMessage: text(copy.unavailableMessage) } : {}),
  }]));

  return {
    version: 1,
    enabled: bool(input.enabled),
    selectedGroup: selectedGroupId ? {
      id: selectedGroupId,
      name: text(input.selectedGroup?.name),
      options: stringList(input.selectedGroup?.options),
      plans,
    } : null,
    selectedPlanIds,
    defaultPurchaseOption,
    oneTimePurchase: {
      enabled: input.oneTimePurchase?.enabled !== false,
      title: text(input.oneTimePurchase?.title),
      description: text(input.oneTimePurchase?.description),
    },
    copy: {
      title: text(input.copy?.title),
      subtitle: text(input.copy?.subtitle),
      unavailableMessage: text(input.copy?.unavailableMessage),
    },
    planCopy,
    showDiscountOnProductCards: bool(input.showDiscountOnProductCards),
    recurringBundleDiscount: bool(input.recurringBundleDiscount),
    translations,
  };
}

export function validatePpbSubscriptionConfig(value: unknown): PpbSubscriptionValidationIssue[] {
  const config = normalizePpbSubscriptionConfig(value);
  if (!config.enabled) return [];
  const issues: PpbSubscriptionValidationIssue[] = [];
  if (!config.selectedGroup) issues.push({ path: "subscriptions.selectedGroup", message: "Select a selling-plan group." });
  if (config.selectedPlanIds.length === 0) issues.push({ path: "subscriptions.selectedPlanIds", message: "Select at least one selling plan." });
  if (!config.copy.title) issues.push({ path: "subscriptions.copy.title", message: "Enter a purchase-options title." });
  if (config.recurringBundleDiscount) {
    issues.push({
      path: "subscriptions.recurringBundleDiscount",
      message: "Recurring bundle discounts are unavailable until recurring-order validation is complete.",
    });
  }
  if (config.oneTimePurchase.enabled && !config.oneTimePurchase.title) {
    issues.push({ path: "subscriptions.oneTimePurchase.title", message: "Enter a one-time purchase label." });
  }
  if (config.defaultPurchaseOption.kind === "one_time" && !config.oneTimePurchase.enabled) {
    issues.push({ path: "subscriptions.defaultPurchaseOption", message: "Choose an enabled default purchase option." });
  }
  if (config.defaultPurchaseOption.kind === "selling_plan" && !config.selectedPlanIds.includes(config.defaultPurchaseOption.sellingPlanId)) {
    issues.push({ path: "subscriptions.defaultPurchaseOption", message: "Choose a selected selling plan as the default." });
  }
  for (const planId of config.selectedPlanIds) {
    if (!config.planCopy[planId]?.displayName) {
      issues.push({ path: `subscriptions.planCopy.${planId}.displayName`, message: "Enter a display name for every selected plan." });
    }
  }
  return issues;
}

export function buildPublicPpbSubscriptionConfig(value: unknown): PpbSubscriptionConfigV1 | null {
  const config = normalizePpbSubscriptionConfig(value);
  return config.enabled && validatePpbSubscriptionConfig(config).length === 0 ? config : null;
}

export function resolveLocalizedSubscriptionCopy(value: unknown, locale: string): LocalizedSubscriptionCopy {
  const config = normalizePpbSubscriptionConfig(value);
  const exact = config.translations[locale] ?? {};
  const language = config.translations[locale.split("-")[0]] ?? {};
  return { ...config.copy, ...language, ...exact };
}

export function applySellingPlanPricingPolicies(
  price: number,
  policies: NormalizedSellingPlanPricingPolicy[],
  cycle = 1,
): number {
  const applicable = policies
    .filter((policy) => policy.afterCycle < cycle)
    .sort((left, right) => left.afterCycle - right.afterCycle)
    .at(-1);
  if (!applicable) return Math.max(0, Math.round(price));
  if (applicable.kind === "percentage") return Math.max(0, Math.round(price * (1 - applicable.value / 100)));
  if (applicable.kind === "fixed_amount") return Math.max(0, Math.round(price - applicable.value));
  return Math.max(0, Math.round(applicable.value));
}
