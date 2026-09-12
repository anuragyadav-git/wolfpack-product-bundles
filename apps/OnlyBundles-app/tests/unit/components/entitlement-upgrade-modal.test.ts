import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  EntitlementUpgradeModal,
  syncEntitlementUpgradeModal,
} from "../../../app/components/billing/EntitlementUpgradeModal";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("syncEntitlementUpgradeModal", () => {
  it("opens and closes the Polaris overlay with its supported lifecycle methods", () => {
    const overlay = {
      showOverlay: jest.fn(),
      hideOverlay: jest.fn(),
    };
    const ref = { current: overlay };

    syncEntitlementUpgradeModal(ref, true);
    expect(overlay.showOverlay).toHaveBeenCalledTimes(1);
    expect(overlay.hideOverlay).not.toHaveBeenCalled();

    syncEntitlementUpgradeModal(ref, false);
    expect(overlay.hideOverlay).toHaveBeenCalledTimes(1);
  });
});

describe("EntitlementUpgradeModal", () => {
  it("renders a Polaris modal with primary and secondary actions for public bundle limit", () => {
    const view = renderToStaticMarkup(
      React.createElement(EntitlementUpgradeModal, {
        open: true,
        failure: {
          code: "LIMIT_REACHED",
          entitlement: "bundle.public.limit",
        },
        onClose: jest.fn(),
        onSaveAsDraft: jest.fn(),
        onViewPlans: jest.fn(),
      }),
    );

    expect(view).toContain("<s-modal");
    expect(view).toContain('id="entitlement-upgrade-modal"');
    expect(view).toContain('heading="billing.entitlements.publicLimitHeading"');
    expect(view).toContain('slot="primary-action"');
    expect(view).toContain("billing.actions.viewPlans");
    expect(view).toContain('slot="secondary-actions"');
    expect(view).toContain("billing.actions.saveAsDraft");
    expect(view).toContain("billing.entitlements.publicLimitDescription");
  });

  it("renders premium template modal copy when template entitlement fails", () => {
    const view = renderToStaticMarkup(
      React.createElement(EntitlementUpgradeModal, {
        open: true,
        failure: {
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "bundle.template.premium",
        },
        onClose: jest.fn(),
        onSaveAsDraft: jest.fn(),
      }),
    );

    expect(view).toContain('heading="billing.entitlements.premiumTemplateHeading"');
    expect(view).toContain("billing.entitlements.premiumTemplateDescription");
    expect(view).toContain("billing.actions.saveAsDraft");
  });

  it("omits the secondary action if onSaveAsDraft is not provided", () => {
    const view = renderToStaticMarkup(
      React.createElement(EntitlementUpgradeModal, {
        open: true,
        failure: {
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "design.advanced",
        },
        onClose: jest.fn(),
      }),
    );

    expect(view).not.toContain('slot="secondary-actions"');
  });
});
