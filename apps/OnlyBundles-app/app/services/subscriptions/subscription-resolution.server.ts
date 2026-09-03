import type {
  BillingInterval,
  PlanCode,
  SubscriptionProvider,
  SubscriptionStatus,
} from "../../lib/subscriptions/entitlements";

export type ProviderOutcome =
  | "ACTIVE_GROWTH"
  | "NO_PAID_CONTRACT"
  | "PENDING"
  | "CANCELLED"
  | "FROZEN"
  | "EXPIRED"
  | "UNKNOWN";

export interface ProviderVerification {
  provider: SubscriptionProvider;
  outcome: ProviderOutcome;
  status: SubscriptionStatus;
  planCode: PlanCode | null;
  billingInterval: BillingInterval;
  verifiedAt: Date;
  itemHandles?: string[];
  errorCode?: string;
}

export interface ResolvedSubscriptionState {
  planCode: PlanCode | null;
  billingInterval: BillingInterval;
  status: SubscriptionStatus;
  provider: SubscriptionProvider | null;
  verifiedAt: Date | null;
  isOutageGrace: boolean;
}

export interface ResolveSubscriptionStateInput {
  now?: Date;
  managed: ProviderVerification;
  cached?: ProviderVerification | null;
  activeOutageGraceMs?: number;
}

const DEFAULT_ACTIVE_OUTAGE_GRACE_MS = 24 * 60 * 60 * 1000;

function activeGrowth(
  verification: ProviderVerification,
): ResolvedSubscriptionState | null {
  if (verification.outcome !== "ACTIVE_GROWTH") return null;
  return {
    planCode: "GROWTH",
    billingInterval: verification.billingInterval,
    status: "ACTIVE",
    provider: verification.provider,
    verifiedAt: verification.verifiedAt,
    isOutageGrace: false,
  };
}

export function resolveSubscriptionState(
  input: ResolveSubscriptionStateInput,
): ResolvedSubscriptionState {
  const now = input.now ?? new Date();
  const managedGrowth = activeGrowth(input.managed);
  if (managedGrowth) return managedGrowth;

  if (input.managed.outcome === "NO_PAID_CONTRACT") {
    return {
      planCode: "FREE",
      billingInterval: "NONE",
      status: "ACTIVE",
      provider: "SHOPIFY_APP_PRICING",
      verifiedAt: input.managed.verifiedAt,
      isOutageGrace: false,
    };
  }

  const cached = input.cached;
  const graceMs = input.activeOutageGraceMs ?? DEFAULT_ACTIVE_OUTAGE_GRACE_MS;
  if (
    cached?.outcome === "ACTIVE_GROWTH"
    && now.getTime() - cached.verifiedAt.getTime() <= graceMs
  ) {
    return {
      planCode: "GROWTH",
      billingInterval: cached.billingInterval,
      status: "ACTIVE",
      provider: cached.provider,
      verifiedAt: cached.verifiedAt,
      isOutageGrace: true,
    };
  }

  const terminal = input.managed.outcome === "CANCELLED"
    || input.managed.outcome === "FROZEN"
    || input.managed.outcome === "EXPIRED";
  if (terminal) {
    return {
      planCode: "FREE",
      billingInterval: "NONE",
      status: input.managed.status,
      provider: input.managed.provider,
      verifiedAt: input.managed.verifiedAt,
      isOutageGrace: false,
    };
  }

  return {
    planCode: null,
    billingInterval: "NONE",
    status: "UNKNOWN",
    provider: null,
    verifiedAt: null,
    isOutageGrace: false,
  };
}
