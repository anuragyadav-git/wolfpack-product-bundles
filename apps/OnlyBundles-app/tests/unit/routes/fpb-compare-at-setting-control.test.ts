import {
  Children,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FpbSummaryTextSettings } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSummaryText";

describe("FPB compare-at price setting control", () => {
  const findCompareAtSwitch = (node: ReactNode): ReactElement | null => {
    if (!isValidElement(node)) return null;
    if (
      node.type === "s-switch" &&
      node.props.accessibilityLabel === "Show compare-at prices"
    ) {
      return node;
    }
    for (const child of Children.toArray(node.props.children)) {
      const match = findCompareAtSwitch(child);
      if (match) return match;
    }
    return null;
  };

  const createProps = () => ({
    countdownEnabled: false,
    countdownExpiryAction: "hide",
    countdownExpiredMessage: "",
    countdownLayout: "compact",
    countdownPosition: "above",
    countdownTitle: "",
    clearValidationError: jest.fn(),
    lowStockAlertEnabled: false,
    lowStockAlertMessage: "Only {{stock}} left",
    lowStockAlertThreshold: "5",
    markAsDirty: jest.fn(),
    openMultiLanguageModal: jest.fn(),
    offerDeliveryState: { endsAt: null },
    setCountdownEnabled: jest.fn(),
    setCountdownExpiryAction: jest.fn(),
    setCountdownExpiredMessage: jest.fn(),
    setCountdownLayout: jest.fn(),
    setCountdownPosition: jest.fn(),
    setCountdownTitle: jest.fn(),
    setLowStockAlertEnabled: jest.fn(),
    setLowStockAlertMessage: jest.fn(),
    setLowStockAlertThreshold: jest.fn(),
    setShowTextOnAddButton: jest.fn(),
    setTextOverrides: jest.fn(),
    setVariantSelectorEnabled: jest.fn(),
    showTextOnAddButton: false,
    shopLocales: [],
    textOverrides: {},
    variantSelectorEnabled: true,
  });

  it("does not expose a compare-at visibility control", () => {
    const props = createProps();
    const view = FpbSummaryTextSettings(props as any);
    const control = findCompareAtSwitch(view);

    expect(control).toBeNull();
    expect(
      renderToStaticMarkup(createElement(FpbSummaryTextSettings, props as any)),
    ).not.toContain("Show Compare At Price");
  });
});
