import React from "react";

import {
  PpbFreeGiftAddonsSection,
  type PpbFreeGiftAddonsSectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbFreeGiftAddonsSection";

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

describe("PPB Free Gifts and Add-ons boundary", () => {
  it("updates the active gifting step through its explicit state owner", () => {
    const markAsDirty = jest.fn();
    const updateStepField = jest.fn();
    const props = {
      activeSection: "free_gift_addons",
      activeTabIndex: 0,
      markAsDirty,
      openAddonMultiLanguageModal: jest.fn(),
      ruleMessages: {},
      setRuleMessages: jest.fn(),
      setShowIconPickerForStep: jest.fn(),
      shopLocales: [],
      showIconPickerForStep: null,
      stepsState: {
        steps: [{ id: "step-1", name: "Gift", isFreeGift: true }],
        updateStepField,
      } as unknown as PpbFreeGiftAddonsSectionProps["stepsState"],
      templateVariablesModalRef: { current: null },
    } satisfies PpbFreeGiftAddonsSectionProps;

    const view = PpbFreeGiftAddonsSection(props);
    const toggle = findElement(
      view,
      (element) =>
        element.type === "s-checkbox" &&
        element.props.accessibilityLabel === "Enable add-ons and gifting step",
    );
    toggle!.props.onChange({ target: { checked: false } });

    expect(updateStepField).toHaveBeenCalledWith(
      "step-1",
      "isFreeGift",
      false,
    );
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });
});
