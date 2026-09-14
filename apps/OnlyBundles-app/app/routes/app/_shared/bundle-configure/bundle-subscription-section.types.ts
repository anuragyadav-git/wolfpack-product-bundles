import type {
  BundleSubscriptionConfigV1,
  BundleSubscriptionPlan,
} from "../../../../lib/bundle-subscriptions";

export type SubscriptionValidationResponse = {
  success?: boolean;
  isValid?: boolean;
  groups?: BundleSubscriptionConfigV1["selectedGroup"][];
  message?: string | null;
  error?: string;
};

export type SetSubscriptionConfig = (
  updater: (current: BundleSubscriptionConfigV1) => BundleSubscriptionConfigV1
) => void;

export type SubscriptionFetcher = {
  data?: SubscriptionValidationResponse;
  state: string;
  submit: (formData: FormData, options: { method: "post" }) => void;
};

export type BundleSubscriptionsSectionProps = {
  activeSection: string;
  bundle: { personalizationData?: unknown };
  pricingState: { discountType?: string | null };
  setShowSubscriptionSetupGuide: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;
  showSubscriptionSetupGuide: boolean;
  shopLocales: Array<{ locale: string; name: string; primary: boolean }>;
  stepsState: { steps: Array<{ isFreeGift?: boolean | null }> };
  subscriptionConfig: BundleSubscriptionConfigV1;
  setSubscriptionConfig: SetSubscriptionConfig;
  subscriptionFetcher: SubscriptionFetcher;
  validationErrors: Record<string, string | undefined>;
};

export type BundleSubscriptionPlanTiersProps = {
  subscriptionConfig: BundleSubscriptionConfigV1;
  setSubscriptionConfig: SetSubscriptionConfig;
  subscriptionFetcher: SubscriptionFetcher;
  subscriptionsBlocked: boolean;
  uniquePlanRows: BundleSubscriptionPlan[];
  validationErrors: Record<string, string | undefined>;
};

export type BundleSubscriptionConfigurationProps = {
  subscriptionConfig: BundleSubscriptionConfigV1;
  setSubscriptionConfig: SetSubscriptionConfig;
  uniquePlanRows: BundleSubscriptionPlan[];
  validationErrors: Record<string, string | undefined>;
  shopLocales: Array<{ locale: string; name: string; primary: boolean }>;
  onOpenTranslations: () => void;
};
