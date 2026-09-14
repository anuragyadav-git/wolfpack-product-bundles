import React from "react";

import {
  PpbDiscountMessagingOptions,
  type PpbDiscountMessagingOptionsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountMessagingOptions";
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

describe("PPB discount messaging boundary", () => {
  it("updates messaging enablement through the explicit pricing owner", () => {
    const setDiscountMessagingEnabled = jest.fn();
    const props = {
      activeDiscountLocale: "en",
      discountMessagingMultiLanguageEnabled: false,
      globalSuccessMessage: "",
      markAsDirty: jest.fn(),
      pricingState: {
        discountMessagingEnabled: false,
        discountRules: [],
        discountType: DiscountMethod.PERCENTAGE_OFF,
        setDiscountMessagingEnabled,
      },
      ruleMessages: {},
      ruleMessagesByLocale: {},
      setActiveDiscountLocale: jest.fn(),
      setDiscountMessagingMultiLanguageEnabled: jest.fn(),
      setGlobalSuccessMessage: jest.fn(),
      setIsDiscountVariablesModalOpen: jest.fn(),
      setRuleMessagesByLocale: jest.fn(),
      setSuccessMessageByLocale: jest.fn(),
      shopLocales: [],
      successMessageByLocale: {},
      updateRuleMessage: jest.fn(),
    } as unknown as PpbDiscountMessagingOptionsProps;

    const view = PpbDiscountMessagingOptions(props);
    const enabledSwitch = findElement(
      view,
      (element) => element.type === "s-switch",
    );
    enabledSwitch!.props.onChange({ target: { checked: true } });

    expect(setDiscountMessagingEnabled).toHaveBeenCalledWith(true);
  });
});
