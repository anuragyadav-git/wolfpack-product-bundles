import React from "react";

import {
  PpbDiscountMessageRuleFields,
  type PpbDiscountMessageRuleFieldsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountMessageRuleFields";
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

describe("PPB discount message field boundary", () => {
  it("updates the default rule message through its explicit owner", () => {
    const updateRuleMessage = jest.fn();
    const props = {
      activeDiscountLocale: "en",
      discountMessagingMultiLanguageEnabled: false,
      globalSuccessMessage: "Done",
      markAsDirty: jest.fn(),
      pricingState: {
        discountRules: [{ id: "rule-1" }],
        discountType: DiscountMethod.PERCENTAGE_OFF,
      },
      ruleMessages: {
        "rule-1": { discountText: "Old", successMessage: "" },
      },
      ruleMessagesByLocale: {},
      setGlobalSuccessMessage: jest.fn(),
      setRuleMessagesByLocale: jest.fn(),
      setSuccessMessageByLocale: jest.fn(),
      successMessageByLocale: {},
      updateRuleMessage,
    } as unknown as PpbDiscountMessageRuleFieldsProps;

    const view = PpbDiscountMessageRuleFields(props);
    const discountText = findElement(
      view,
      (element) => element.type === "s-text-field",
    );
    discountText!.props.onInput({ target: { value: "New message" } });

    expect(updateRuleMessage).toHaveBeenCalledWith(
      "rule-1",
      "discountText",
      "New message",
    );
  });
});
