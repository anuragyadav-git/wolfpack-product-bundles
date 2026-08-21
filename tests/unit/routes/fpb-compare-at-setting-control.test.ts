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

  const createFlow = () => ({
    activeTabIndex: 0,
    bundle: {},
    DiscountMethod: { BUY_X_GET_Y: "BUY_X_GET_Y" },
    markAsDirty: jest.fn(),
    openMultiLanguageModal: jest.fn(),
    pricingState: { discountType: "PERCENTAGE" },
    setIndividualSellingPlanEnabled: jest.fn(),
    setShowTextOnAddButton: jest.fn(),
    setTextOverrides: jest.fn(),
    SettingsRow: ({ title, children }: any) =>
      createElement("section", null, title, children),
    setVariantSelectorEnabled: jest.fn(),
    showTextOnAddButton: false,
    stepsState: { steps: [{}] },
    textOverrides: {},
    variantSelectorEnabled: true,
  });

  it("does not expose a compare-at visibility control", () => {
    const flow = createFlow();
    const view = FpbSummaryTextSettings({ flow: flow as any });
    const control = findCompareAtSwitch(view);

    expect(control).toBeNull();
    expect(
      renderToStaticMarkup(createElement(FpbSummaryTextSettings, { flow: flow as any })),
    ).not.toContain("Show Compare At Price");
  });
});
