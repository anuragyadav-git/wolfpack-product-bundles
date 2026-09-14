import React from "react";

import {
  PpbDiscountRulesPanel,
  type PpbDiscountRulesPanelProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountRulesPanel";
import { DiscountMethod } from "../../../app/types/pricing";

function findElement(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) return child;
    const nested = findElement(child.props.children, predicate);
    if (nested) return nested;
  }
  return null;
}

describe("PPB discount-rule boundary", () => {
  it("updates the explicit pricing owner without reading route context", () => {
    const setDiscountEnabled = jest.fn();
    const props = {
      pricingState: {
        addDiscountRule: jest.fn(),
        currencySymbol: "$",
        discountEnabled: false,
        discountRules: [],
        discountType: DiscountMethod.PERCENTAGE_OFF,
        removeDiscountRule: jest.fn(),
        replaceDiscountMethod: jest.fn(),
        setDiscountEnabled,
        updateDiscountRule: jest.fn(),
      },
      setGlobalSuccessMessage: jest.fn(),
      setRuleMessages: jest.fn(),
      setRuleMessagesByLocale: jest.fn(),
      setSuccessMessageByLocale: jest.fn(),
      validationErrors: {},
    } as unknown as PpbDiscountRulesPanelProps;

    const view = PpbDiscountRulesPanel(props);
    const enabledSwitch = findElement(
      view,
      (element) =>
        element.type === "s-switch" &&
        element.props.accessibilityLabel === "Enable discount pricing",
    );
    enabledSwitch!.props.onChange({ target: { checked: true } });

    expect(setDiscountEnabled).toHaveBeenCalledWith(true);
  });
});
