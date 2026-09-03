export type PlanCode = "FREE" | "GROWTH";
export type BillingInterval = "NONE" | "MONTHLY" | "ANNUAL";
export type SubscriptionStatus =
  | "ACTIVE"
  | "PENDING"
  | "CANCELLED"
  | "FROZEN"
  | "EXPIRED"
  | "UNKNOWN";
export type SubscriptionProvider = "SHOPIFY_APP_PRICING";

export type EntitlementKey =
  | "bundle.public.limit"
  | "bundle.steps.limit"
  | "bundle.template.premium"
  | "design.advanced"
  | "analytics.advanced"
  | "support.priority";

export type EntitlementFailureCode =
  | "ENTITLEMENT_REQUIRED"
  | "LIMIT_REACHED"
  | "BILLING_UNVERIFIED";

export type EntitlementRemediation =
  | "UPGRADE"
  | "RETRY"
  | "EDIT_CONFIGURATION";

export interface EntitlementFailure {
  code: EntitlementFailureCode;
  entitlement: EntitlementKey;
  requiredPlan: "GROWTH";
  currentUsage?: number;
  limit?: number;
  remediation: EntitlementRemediation;
}

export interface PlanEntitlements {
  planCode: PlanCode;
  billingInterval: BillingInterval;
  limits: {
    publicBundles: number | null;
    enabledSteps: number | null;
  };
  capabilities: {
    premiumTemplates: boolean;
    advancedDesign: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    unlimitedDrafts: true;
  };
}

export interface BundleEntitlementCandidate {
  bundleType: "FULL_PAGE" | "PRODUCT_PAGE";
  status: "ACTIVE" | "UNLISTED" | "DRAFT" | "ARCHIVED";
  enabledStepCount: number;
  designTemplate?: string | null;
  designPresetId?: string | null;
  usesAdvancedDesign: boolean;
  usesBundleSubscriptions?: boolean;
  usesCustomCode?: boolean;
}

const FREE_ENTITLEMENTS: Omit<PlanEntitlements, "billingInterval"> = {
  planCode: "FREE",
  limits: {
    publicBundles: 1,
    enabledSteps: 2,
  },
  capabilities: {
    premiumTemplates: false,
    advancedDesign: false,
    advancedAnalytics: false,
    prioritySupport: false,
    unlimitedDrafts: true,
  },
};

const GROWTH_ENTITLEMENTS: Omit<PlanEntitlements, "billingInterval"> = {
  planCode: "GROWTH",
  limits: {
    publicBundles: null,
    enabledSteps: null,
  },
  capabilities: {
    premiumTemplates: true,
    advancedDesign: true,
    advancedAnalytics: true,
    prioritySupport: true,
    unlimitedDrafts: true,
  },
};

export function getPlanEntitlements(
  planCode: PlanCode,
  billingInterval: BillingInterval,
): PlanEntitlements {
  const source = planCode === "GROWTH"
    ? GROWTH_ENTITLEMENTS
    : FREE_ENTITLEMENTS;

  return {
    ...source,
    billingInterval,
    limits: { ...source.limits },
    capabilities: { ...source.capabilities },
  };
}

function isFreeTemplate(candidate: BundleEntitlementCandidate): boolean {
  const template = candidate.designTemplate?.trim().toUpperCase();
  const preset = candidate.designPresetId?.trim().toUpperCase();

  if (!template && !preset) return true;
  if (candidate.bundleType === "FULL_PAGE") {
    return (!template || template === "FBP_SIDE_FOOTER")
      && (!preset || preset === "STANDARD");
  }

  return (!template || template === "PDP_INPAGE")
    && (!preset || preset === "LIST");
}

export function detectBundleRequirements(
  candidate: BundleEntitlementCandidate,
): EntitlementKey[] {
  const requirements: EntitlementKey[] = [];

  if (candidate.enabledStepCount > 2) {
    requirements.push("bundle.steps.limit");
  }
  if (!isFreeTemplate(candidate)) {
    requirements.push("bundle.template.premium");
  }
  if (candidate.usesAdvancedDesign) {
    requirements.push("design.advanced");
  }

  return requirements;
}

export class EntitlementDeniedError extends Error {
  readonly code: EntitlementFailureCode;
  readonly entitlement: EntitlementKey;
  readonly requiredPlan = "GROWTH" as const;
  readonly currentUsage?: number;
  readonly limit?: number;
  readonly remediation: EntitlementRemediation;
  readonly status: 403 | 409 | 503;

  constructor(input: Omit<EntitlementFailure, "requiredPlan">) {
    super(input.code);
    this.name = "EntitlementDeniedError";
    this.code = input.code;
    this.entitlement = input.entitlement;
    this.currentUsage = input.currentUsage;
    this.limit = input.limit;
    this.remediation = input.remediation;
    this.status = input.code === "LIMIT_REACHED"
      ? 409
      : input.code === "BILLING_UNVERIFIED"
        ? 503
        : 403;
  }

  toJSON(): EntitlementFailure {
    return {
      code: this.code,
      entitlement: this.entitlement,
      requiredPlan: this.requiredPlan,
      ...(this.currentUsage === undefined ? {} : { currentUsage: this.currentUsage }),
      ...(this.limit === undefined ? {} : { limit: this.limit }),
      remediation: this.remediation,
    };
  }
}
