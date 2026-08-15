export type NormalizedSellingPlanPricingPolicy = {
  kind: "percentage" | "fixed_amount" | "fixed_price";
  value: number;
  afterCycle: number;
  currencyCode?: string;
};

export type BundleSubscriptionPlan = {
  id: string;
  sourceName: string;
  position: number;
  options: string[];
  pricingPolicies: NormalizedSellingPlanPricingPolicy[];
};

export type SubscriptionCopy = {
  title: string;
  subtitle: string;
  unavailableMessage: string;
};

export type SubscriptionPlanCopy = {
  displayName: string;
  discountPill: string;
  description: string;
};

export type LocalizedSubscriptionCopy = Partial<SubscriptionCopy> & {
  oneTimePurchaseTitle?: string;
  planCopy?: Record<string, Partial<SubscriptionPlanCopy>>;
};

export type ResolvedSubscriptionCopy = SubscriptionCopy & {
  oneTimePurchaseTitle: string;
  planCopy: Record<string, SubscriptionPlanCopy>;
};

export type BundleDiscountPurchaseTarget = "subscription" | "one_time" | "both";

export type BundleSubscriptionConfigV1 = {
  version: 1;
  enabled: boolean;
  selectedGroup: {
    id: string;
    name: string;
    options: string[];
    plans: BundleSubscriptionPlan[];
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
  copy: SubscriptionCopy;
  planCopy: Record<string, SubscriptionPlanCopy>;
  showDiscountOnProductCards: boolean;
  recurringBundleDiscount: boolean;
  bundleDiscountAppliesOn: BundleDiscountPurchaseTarget;
  translations: Record<string, Partial<LocalizedSubscriptionCopy>>;
};

export type BundleSubscriptionValidationIssue = { path: string; message: string };
export type BundleSubscriptionCompatibilityIssue = BundleSubscriptionValidationIssue & {
  code: "buy_x_get_y" | "free_gift_or_addon" | "personalization";
};

export type BundlePurchaseOptionPresentation = {
  groupName: string;
  planId: string;
  displayName: string;
  discountPill: string;
  description: string;
  originalPrice: number;
  perDeliveryPrice: number;
};

export interface SellingPlanValidationSources {
  productIds: string[];
  collectionIds: string[];
  variantIdsByProductId: Record<string, string[]>;
}

export function getDefaultPurchaseOptionFromOneTimeToggle(
  config: Pick<BundleSubscriptionConfigV1, "selectedPlanIds" | "defaultPurchaseOption">,
  oneTimeSelected: boolean,
): BundleSubscriptionConfigV1["defaultPurchaseOption"] {
  if (oneTimeSelected) return { kind: "one_time" };
  const currentPlanId = config.defaultPurchaseOption.kind === "selling_plan"
    && config.selectedPlanIds.includes(config.defaultPurchaseOption.sellingPlanId)
    ? config.defaultPurchaseOption.sellingPlanId
    : config.selectedPlanIds[0];
  return currentPlanId
    ? { kind: "selling_plan", sellingPlanId: currentPlanId }
    : { kind: "one_time" };
}

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const bool = (value: unknown) => value === true;
const stringList = (value: unknown) => Array.from(new Set(
  (Array.isArray(value) ? value : []).map(text).filter(Boolean),
));

function normalizeProductId(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  if (value.startsWith("gid://shopify/Product/")) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/Product/${value}`;
  return null;
}

function normalizeCollectionId(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  if (value.startsWith("gid://shopify/Collection/")) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/Collection/${value}`;
  return null;
}

function normalizeVariantId(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const raw = String(value).trim();
  if (raw.startsWith("gid://shopify/ProductVariant/")) return raw;
  if (/^\d+$/.test(raw)) return `gid://shopify/ProductVariant/${raw}`;
  return null;
}

export function extractSellingPlanValidationSources(bundle: any): SellingPlanValidationSources {
  const productIds: string[] = [];
  const collectionIds: string[] = [];
  const variantIdsByProductId: Record<string, string[]> = {};
  const addUnique = (target: string[], value: string | null) => {
    if (value && !target.includes(value)) target.push(value);
  };
  const addProduct = (product: any) => {
    const productId = normalizeProductId(product?.graphqlId ?? product?.productId ?? product?.id);
    addUnique(productIds, productId);
    if (!productId) return;
    const variants = (Array.isArray(product?.variants) ? product.variants : [])
      .map((variant) => normalizeVariantId(
        typeof variant === "object"
          ? variant?.id ?? variant?.variantId ?? variant?.variantGraphqlId
          : variant,
      ))
      .filter((id): id is string => id !== null);
    if (variants.length > 0) {
      variantIdsByProductId[productId] = Array.from(new Set([
        ...(variantIdsByProductId[productId] ?? []),
        ...variants,
      ]));
    }
  };

  for (const product of Array.isArray(bundle?.defaultProductsData?.products)
    ? bundle.defaultProductsData.products
    : []) {
    addProduct(product);
  }
  for (const step of Array.isArray(bundle?.steps) ? bundle.steps : []) {
    for (const product of Array.isArray(step?.products) ? step.products : []) addProduct(product);
    for (const product of Array.isArray(step?.StepProduct) ? step.StepProduct : []) addProduct(product);
    for (const collection of Array.isArray(step?.collections) ? step.collections : []) {
      addUnique(collectionIds, normalizeCollectionId(collection?.id ?? collection?.collectionGid));
    }
    for (const category of Array.isArray(step?.StepCategory) ? step.StepCategory : []) {
      for (const product of Array.isArray(category?.products) ? category.products : []) addProduct(product);
      for (const collection of Array.isArray(category?.collections) ? category.collections : []) {
        addUnique(collectionIds, normalizeCollectionId(collection?.id ?? collection?.collectionGid));
      }
    }
  }

  return { productIds, collectionIds, variantIdsByProductId };
}

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

function normalizePlan(value: any): BundleSubscriptionPlan | null {
  const id = text(value?.id);
  if (!id) return null;
  return {
    id,
    sourceName: text(value?.sourceName ?? value?.name),
    position: Number.isFinite(Number(value?.position)) ? Number(value.position) : 0,
    options: stringList(value?.options),
    pricingPolicies: (Array.isArray(value?.pricingPolicies) ? value.pricingPolicies : [])
      .map(normalizePolicy)
      .filter((policy: NormalizedSellingPlanPricingPolicy | null): policy is NormalizedSellingPlanPricingPolicy => policy !== null),
  };
}

function dedupePlansById(plans: BundleSubscriptionPlan[]): BundleSubscriptionPlan[] {
  const seen = new Set<string>();
  const output: BundleSubscriptionPlan[] = [];
  for (const plan of plans) {
    if (seen.has(plan.id)) continue;
    seen.add(plan.id);
    output.push(plan);
  }
  return output;
}

export function normalizeBundleSubscriptionConfig(value: unknown): BundleSubscriptionConfigV1 {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as any : {};
  const plans: BundleSubscriptionPlan[] = dedupePlansById(
    [...(Array.isArray(input.selectedGroup?.plans) ? input.selectedGroup.plans : [])]
    .sort((left: any, right: any) => Number(left?.position ?? 0) - Number(right?.position ?? 0) || text(left?.id).localeCompare(text(right?.id)))
    .map(normalizePlan)
    .filter((plan: BundleSubscriptionPlan | null): plan is BundleSubscriptionPlan => plan !== null),
  );
  const selectedPlanIds = Array.from(new Set(
    stringList(input.selectedPlanIds).filter((id) => plans.some((plan: BundleSubscriptionPlan) => plan.id === id)),
  ));
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
    ...(text(copy?.oneTimePurchaseTitle) ? { oneTimePurchaseTitle: text(copy.oneTimePurchaseTitle) } : {}),
    ...(copy?.planCopy && typeof copy.planCopy === "object" ? {
      planCopy: Object.fromEntries(selectedPlanIds.map((planId) => {
        const plan = copy.planCopy?.[planId] ?? {};
        return [planId, {
          ...(text(plan.displayName) ? { displayName: text(plan.displayName) } : {}),
          ...(text(plan.discountPill) ? { discountPill: text(plan.discountPill) } : {}),
          ...(text(plan.description) ? { description: text(plan.description) } : {}),
        }];
      }).filter(([, plan]) => Object.keys(plan).length > 0)),
    } : {}),
  }]));
  const bundleDiscountAppliesOn = ["subscription", "one_time", "both"].includes(input.bundleDiscountAppliesOn)
    ? input.bundleDiscountAppliesOn as BundleDiscountPurchaseTarget
    : "both";

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
    bundleDiscountAppliesOn,
    translations,
  };
}

export function validateBundleSubscriptionConfig(value: unknown): BundleSubscriptionValidationIssue[] {
  const config = normalizeBundleSubscriptionConfig(value);
  if (!config.enabled) return [];
  const issues: BundleSubscriptionValidationIssue[] = [];
  if (!config.selectedGroup) issues.push({ path: "subscriptions.selectedGroup", message: "Select a selling-plan group." });
  if (config.selectedPlanIds.length === 0) issues.push({ path: "subscriptions.selectedPlanIds", message: "Select at least one selling plan." });
  if (!config.copy.title) issues.push({ path: "subscriptions.copy.title", message: "Enter a purchase-options title." });
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

export function buildPublicBundleSubscriptionConfig(value: unknown): BundleSubscriptionConfigV1 | null {
  const config = normalizeBundleSubscriptionConfig(value);
  return config.enabled && validateBundleSubscriptionConfig(config).length === 0 ? config : null;
}

export function resolveLocalizedSubscriptionCopy(value: unknown, locale: string): ResolvedSubscriptionCopy {
  const config = normalizeBundleSubscriptionConfig(value);
  const exact = config.translations[locale] ?? {};
  const language = config.translations[locale.split("-")[0]] ?? {};
  const mergePlanCopy = (planId: string) => ({
    ...config.planCopy[planId],
    ...(language.planCopy?.[planId] ?? {}),
    ...(exact.planCopy?.[planId] ?? {}),
  });
  return {
    ...config.copy,
    ...language,
    ...exact,
    oneTimePurchaseTitle: exact.oneTimePurchaseTitle
      ?? language.oneTimePurchaseTitle
      ?? config.oneTimePurchase.title,
    planCopy: Object.fromEntries(config.selectedPlanIds.map((planId) => [planId, mergePlanCopy(planId)])),
  };
}

export function shouldApplyBundleDiscount(
  target: BundleDiscountPurchaseTarget,
  sellingPlanId: string | null | undefined,
) {
  if (target === "both") return true;
  return sellingPlanId ? target === "subscription" : target === "one_time";
}

export function reconcileBundleSubscriptionPlanDiscovery(
  value: unknown,
  groups: Array<BundleSubscriptionConfigV1["selectedGroup"]>,
): BundleSubscriptionConfigV1 {
  const config = normalizeBundleSubscriptionConfig(value);
  const selectedGroup = groups.find((group) => group?.id === config.selectedGroup?.id) ?? null;
  if (!selectedGroup) {
    return {
      ...config,
      selectedGroup: null,
      selectedPlanIds: [],
      defaultPurchaseOption: config.oneTimePurchase.enabled
        ? { kind: "one_time" }
        : { kind: "selling_plan", sellingPlanId: "" },
      planCopy: {},
    };
  }
  const availablePlanIds = new Set(selectedGroup.plans.map((plan) => plan.id));
  const selectedPlanIds = config.selectedPlanIds.length > 0
    ? config.selectedPlanIds.filter((planId) => availablePlanIds.has(planId))
    : Array.from(availablePlanIds);
  const planCopy = Object.fromEntries(selectedPlanIds.map((planId) => [planId, config.planCopy[planId]]));
  const defaultPurchaseOption = config.defaultPurchaseOption.kind === "selling_plan"
    && !selectedPlanIds.includes(config.defaultPurchaseOption.sellingPlanId)
    ? (config.oneTimePurchase.enabled
        ? { kind: "one_time" as const }
        : { kind: "selling_plan" as const, sellingPlanId: selectedPlanIds[0] ?? "" })
    : config.defaultPurchaseOption;
  return normalizeBundleSubscriptionConfig({
    ...config,
    selectedGroup,
    selectedPlanIds,
    defaultPurchaseOption,
    planCopy,
  });
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

export function buildBundlePurchaseOptionPresentation(
  value: unknown,
  sellingPlanId: string | null | undefined,
  originalPrice: number,
): BundlePurchaseOptionPresentation | null {
  if (!sellingPlanId) return null;
  const config = normalizeBundleSubscriptionConfig(value);
  const plan = config.selectedGroup?.plans.find(
    (candidate) => candidate.id === sellingPlanId
      && config.selectedPlanIds.includes(candidate.id),
  );
  if (!config.enabled || !config.selectedGroup || !plan) return null;
  const price = Number.isFinite(originalPrice) ? Math.max(0, Math.round(originalPrice)) : 0;
  const copy = config.planCopy[plan.id];
  return {
    groupName: config.selectedGroup.name,
    planId: plan.id,
    displayName: copy?.displayName ?? plan.sourceName,
    discountPill: copy?.discountPill ?? "",
    description: copy?.description ?? "",
    originalPrice: price,
    perDeliveryPrice: applySellingPlanPricingPolicies(price, plan.pricingPolicies, 1),
  };
}

export function getBundleSubscriptionCompatibilityIssues({
  discountType,
  steps = [],
  personalizationEnabled = false,
}: {
  discountType?: string | null;
  steps?: Array<{ isFreeGift?: boolean | null }>;
  personalizationEnabled?: boolean;
}): BundleSubscriptionCompatibilityIssue[] {
  const issues: BundleSubscriptionCompatibilityIssue[] = [];
  if (discountType === "buy_x_get_y") {
    issues.push({
      path: "subscriptions.enabled",
      code: "buy_x_get_y",
      message: "Subscriptions are unavailable with Buy X Get Y pricing.",
    });
  }
  if (steps.some((step) => step?.isFreeGift === true)) {
    issues.push({
      path: "subscriptions.enabled",
      code: "free_gift_or_addon",
      message: "Subscriptions are unavailable while a free-gift or add-on step is enabled.",
    });
  }
  if (personalizationEnabled) {
    issues.push({
      path: "subscriptions.enabled",
      code: "personalization",
      message: "Subscriptions are unavailable while personalization is enabled.",
    });
  }
  return issues;
}

export function supportsBundleSubscriptions(bundleType: unknown): bundleType is "full_page" | "product_page" {
  return bundleType === "full_page" || bundleType === "product_page";
}

export const SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE =
  "To offer this bundle as a subscription, all of its products must be part of the same subscription plan in your Shopify settings. Please update your product selling plans and try again.";
