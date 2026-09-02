/**
 * Pricing Data Constants
 *
 * Shared constants for pricing and billing pages.
 * Extracted from app.billing_.plans.tsx for better maintainability.
 */

/**
 * Feature comparison data for pricing table
 * Used in the feature comparison table on the pricing page
 */
export interface FeatureComparisonRow {
  featureMessageId: string;
  free: boolean | string;
  growth: boolean | string;
  highlight?: boolean;
}

export const FEATURE_COMPARISON: FeatureComparisonRow[] = [
  { featureMessageId: "billing.comparison.publicBundles", free: "1", growth: "billing.values.unlimited", highlight: true },
  { featureMessageId: "billing.comparison.steps", free: "2", growth: "billing.values.unlimited", highlight: true },
  { featureMessageId: "billing.comparison.productPageBundles", free: true, growth: true },
  { featureMessageId: "billing.comparison.fullPageBundles", free: true, growth: true },
  { featureMessageId: "billing.comparison.merchandising", free: true, growth: true },
  { featureMessageId: "billing.comparison.customerSubscriptions", free: true, growth: true },
  { featureMessageId: "billing.comparison.customization", free: true, growth: true },
  { featureMessageId: "billing.comparison.templates", free: "billing.values.standard", growth: "billing.values.all", highlight: true },
  { featureMessageId: "billing.comparison.design", free: "billing.values.brandTypography", growth: "billing.values.allControls", highlight: true },
  { featureMessageId: "billing.comparison.analytics", free: "billing.values.summary30", growth: "billing.values.advanced", highlight: true },
  { featureMessageId: "billing.comparison.prioritySupport", free: false, growth: true, highlight: true },
];

/**
 * Value proposition items for upgrade marketing
 * Used in the "Why Upgrade" section on the pricing page
 */
export interface ValueProp {
  titleMessageId: string;
  descriptionMessageId: string;
  icon: "chart-histogram-growth" | "edit" | "view";
}

export const VALUE_PROPS: ValueProp[] = [
  {
    titleMessageId: "billing.valueProps.scaleTitle",
    descriptionMessageId: "billing.valueProps.scaleDescription",
    icon: "chart-histogram-growth",
  },
  {
    titleMessageId: "billing.valueProps.designTitle",
    descriptionMessageId: "billing.valueProps.designDescription",
    icon: "edit",
  },
  {
    titleMessageId: "billing.valueProps.analyticsTitle",
    descriptionMessageId: "billing.valueProps.analyticsDescription",
    icon: "view",
  },
];

/**
 * Growth plan benefits
 * Used in the upgrade confirmation modal
 */
/**
 * FAQ items for pricing page
 */
export interface FAQItem {
  questionMessageId: string;
  answerMessageId: string;
}

export const PRICING_FAQ: FAQItem[] = [
  {
    questionMessageId: "billing.faq.changeQuestion",
    answerMessageId: "billing.faq.changeAnswer",
  },
  {
    questionMessageId: "billing.faq.downgradeQuestion",
    answerMessageId: "billing.faq.downgradeAnswer",
  },
  {
    questionMessageId: "billing.faq.billingQuestion",
    answerMessageId: "billing.faq.billingAnswer",
  },
  {
    questionMessageId: "billing.faq.refundQuestion",
    answerMessageId: "billing.faq.refundAnswer",
  },
];
