import type {
  BillingInterval,
  EntitlementFailureCode,
  EntitlementKey,
  PlanCode,
} from "../../lib/subscriptions/entitlements";
import { recordBusinessEvent } from "../app-events.server";

export type SubscriptionEventHandle =
  | "subscription_pricing_page_viewed"
  | "subscription_interval_selected"
  | "subscription_checkout_started"
  | "subscription_redirect_received"
  | "subscription_verification_succeeded"
  | "subscription_verification_failed"
  | "subscription_growth_activated"
  | "subscription_downgrade_requested"
  | "subscription_downgrade_effective"
  | "subscription_cancelled"
  | "subscription_frozen"
  | "subscription_cache_stale"
  | "entitlement_locked_feature_viewed"
  | "entitlement_locked_feature_clicked"
  | "entitlement_limit_warning_shown"
  | "entitlement_action_blocked"
  | "entitlement_growth_draft_saved"
  | "entitlement_publish_blocked";

export async function recordSubscriptionEvent(input: {
  eventHandle: SubscriptionEventHandle;
  shopDomain: string;
  planCode: PlanCode | null;
  billingInterval: BillingInterval | null;
  featureKey?: EntitlementKey | null;
  gateLocation?: string | null;
  bundleId?: string | null;
  bundleType?: "FULL_PAGE" | "PRODUCT_PAGE" | null;
  action?: string | null;
  result: string;
  errorCode?: EntitlementFailureCode | string | null;
}) {
  return recordBusinessEvent({
    eventHandle: input.eventHandle,
    shopDomain: input.shopDomain,
    bundleId: input.bundleId,
    bundleType: input.bundleType,
    surface: input.gateLocation,
    result: input.result,
    errorCode: input.errorCode,
    attributes: {
      plan_code: input.planCode,
      billing_interval: input.billingInterval,
      feature_key: input.featureKey,
      gate_location: input.gateLocation,
      action: input.action,
      app_version: process.env.npm_package_version ?? "unknown",
    },
    sendToShopify: false,
  });
}
