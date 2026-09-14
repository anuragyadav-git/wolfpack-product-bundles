import { BundleSubscriptionsSection } from "../../../app/routes/app/_shared/bundle-configure/BundleSubscriptionsSection";
import type { BundleSubscriptionsSectionProps } from "../../../app/routes/app/_shared/bundle-configure/bundle-subscription-section.types";
import { PpbSubscriptionsSection } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSubscriptionsSection";
import { normalizeBundleSubscriptionConfig } from "../../../app/lib/bundle-subscriptions";

describe("PPB subscriptions feature boundary", () => {
  it("forwards only the explicit subscription feature contract", () => {
    const props = {
      activeSection: "subscriptions",
      bundle: { personalizationData: null },
      pricingState: { discountType: "percentage" },
      setShowSubscriptionSetupGuide: jest.fn(),
      showSubscriptionSetupGuide: false,
      shopLocales: [{ locale: "en", name: "English", primary: true }],
      stepsState: { steps: [{ isFreeGift: false }] },
      subscriptionConfig: normalizeBundleSubscriptionConfig(null),
      setSubscriptionConfig: jest.fn(),
      subscriptionFetcher: {
        state: "idle",
        submit: jest.fn(),
      },
      validationErrors: {},
    } satisfies BundleSubscriptionsSectionProps;

    const element = PpbSubscriptionsSection(props);

    expect(element.type).toBe(BundleSubscriptionsSection);
    expect(element.props).toEqual(props);
  });
});
