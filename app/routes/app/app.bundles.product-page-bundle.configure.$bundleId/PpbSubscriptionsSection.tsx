import { BundleSubscriptionsSection } from "../_shared/bundle-configure/BundleSubscriptionsSection";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbSubscriptionsSection() {
  const flow = usePpbConfigureContext();
  return (
    <BundleSubscriptionsSection
      activeSection={flow.activeSection}
      bundle={flow.bundle}
      pricingState={flow.pricingState}
      setShowSubscriptionSetupGuide={flow.setShowSubscriptionSetupGuide}
      showSubscriptionSetupGuide={flow.showSubscriptionSetupGuide}
      shopLocales={flow.shopLocales}
      stepsState={flow.stepsState}
      subscriptionConfig={flow.subscriptionConfig}
      setSubscriptionConfig={flow.setSubscriptionConfig}
      subscriptionFetcher={flow.subscriptionFetcher}
      validationErrors={flow.validationErrors}
    />
  );
}
