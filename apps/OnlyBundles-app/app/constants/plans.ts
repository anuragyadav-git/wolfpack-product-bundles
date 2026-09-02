/**
 * Subscription Plan Configurations
 *
 * Shared constants for subscription plans.
 * Can be imported by both client and server code.
 */

import type { SubscriptionPlan } from "@prisma/client";

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  annualPrice?: number;
  trialDays: number;
  currencyCode: string;
  bundleLimit: number;
  featureMessageIds: string[];
}

export const PLANS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    id: "free",
    name: "Free Plan",
    price: 0,
    trialDays: 0,
    currencyCode: "USD",
    bundleLimit: 1,
    featureMessageIds: [
      "billing.planFeatures.onePublicBundle",
      "billing.planFeatures.twoSteps",
      "billing.planFeatures.productPageBundles",
      "billing.planFeatures.fullPageBundles",
      "billing.planFeatures.brandTypography",
      "billing.planFeatures.summary30",
      "billing.planFeatures.merchandising",
      "billing.planFeatures.standardSupport",
    ]
  },
  growth: {
    id: "growth",
    name: "Growth Plan",
    price: 19.99,
    annualPrice: 199,
    trialDays: 14,
    currencyCode: "USD",
    bundleLimit: Number.MAX_SAFE_INTEGER,
    featureMessageIds: [
      "billing.planFeatures.unlimitedBundlesSteps",
      "billing.planFeatures.allTemplates",
      "billing.planFeatures.advancedDesign",
      "billing.planFeatures.advancedAnalytics",
      "billing.planFeatures.prioritySupport",
    ]
  }
};
