import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../../../app/i18n/config";
import { SubscriptionQuotaCard } from "../../../app/components/billing/SubscriptionQuotaCard";

describe("SubscriptionQuotaCard", () => {
  it("renders the localized Free usage message", () => {
    const view = renderToStaticMarkup(React.createElement(SubscriptionQuotaCard, {
      currentBundleCount: 0,
      bundleLimit: 1,
      isFreePlan: true,
    }));

    expect(view).toContain(
      "You&#x27;re using 0 of 1 public bundles on Free. Growth includes unlimited public bundles.",
    );
    expect(view).not.toContain("billing.upgradePrompt.usageBody");
  });

  it("renders Unlimited instead of the internal Growth limit sentinel", () => {
    const view = renderToStaticMarkup(React.createElement(SubscriptionQuotaCard, {
      currentBundleCount: 42,
      bundleLimit: Number.MAX_SAFE_INTEGER,
      isFreePlan: false,
    }));

    expect(view).toContain("Unlimited");
    expect(view).not.toContain(String(Number.MAX_SAFE_INTEGER));
  });
});
