import { BundleSubscriptionsSection } from "../_shared/bundle-configure/BundleSubscriptionsSection";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbSubscriptionsSection() {
  const flow = usePpbConfigureContext();
  return (
    <BundleSubscriptionsSection
      activeSection={flow.activeSection}
      bundle={flow.bundle as any}
      pricingState={flow.pricingState as any}
      setShowSubscriptionSetupGuide={flow.setShowSubscriptionSetupGuide}
      showSubscriptionSetupGuide={flow.showSubscriptionSetupGuide}
      shopLocales={flow.shopLocales}
      stepsState={flow.stepsState as any}
      subscriptionConfig={flow.subscriptionConfig}
      setSubscriptionConfig={flow.setSubscriptionConfig}
      subscriptionFetcher={flow.subscriptionFetcher as any}
      validationErrors={flow.validationErrors}
    />
  );
}
