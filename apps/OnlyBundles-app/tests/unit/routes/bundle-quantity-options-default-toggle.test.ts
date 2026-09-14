import React from "react";

import { FpbBundleQuantityOptions } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountBundleQuantityOptions";
import { PpbBundleQuantityOptions } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountDisplayOptions";
import { DiscountMethod } from "../../../app/types/pricing";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
  translateAdminCopy: (key: string) => key,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function findElements(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement[] {
  const matches: React.ReactElement[] = [];

  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) matches.push(child);
    matches.push(...findElements(child.props.children, predicate));
  }

  return matches;
}

describe("Bundle Quantity Options Default Rule Toggle", () => {
  describe("PPB PpbBundleQuantityOptions", () => {
    it("renders s-switch for each rule and sets checked state for the default rule", () => {
      const setQtyOptionsDefaultRuleId = jest.fn();
      const markAsDirty = jest.fn();
      const pricingState = {
        discountType: DiscountMethod.PERCENTAGE_OFF,
        discountRules: [
          { id: "rule-1", conditionValue: 2, discountValue: 10 },
          { id: "rule-2", conditionValue: 4, discountValue: 20 },
        ],
      } as any;

      const view = PpbBundleQuantityOptions({
        bundleQuantityOptionsEligible: true,
        markAsDirty,
        pricingState,
        qtyOptionsDefaultRuleId: "rule-1",
        qtyOptionsEnabled: true,
        qtyRuleLabels: {},
        qtyRuleSubtexts: {},
        setIsBundleQuantityMultiLangModalOpen: jest.fn(),
        setQtyOptionsDefaultRuleId,
        setQtyOptionsEnabled: jest.fn(),
        setQtyRuleLabels: jest.fn(),
        setQtyRuleSubtexts: jest.fn(),
        shopLocales: [],
      });

      // Find rule header switches (excluding the master enable switch)
      const switches = findElements(
        view,
        (el) =>
          el.type === "s-switch" &&
          el.props.label === "adminDynamic.makeRuleDefault",
      );

      expect(switches).toHaveLength(2);
      expect(switches[0].props.checked).toBe(true);
      expect(switches[1].props.checked).toBeUndefined();

      // Trigger change on rule 2 -> enables rule 2
      switches[1].props.onChange({ target: { checked: true } } as any);
      expect(setQtyOptionsDefaultRuleId).toHaveBeenCalledWith("rule-2");
      expect(markAsDirty).toHaveBeenCalled();

      // Trigger change on rule 1 (toggling off) -> clears default rule
      switches[0].props.onChange({ target: { checked: false } } as any);
      expect(setQtyOptionsDefaultRuleId).toHaveBeenCalledWith(null);
    });
  });

  describe("FPB FpbBundleQuantityOptions", () => {
    it("renders s-switch for each rule and sets checked state for the default rule", () => {
      const setBundleQuantityDefaultRule = jest.fn();
      const pricingState = {
        discountType: DiscountMethod.PERCENTAGE_OFF,
        pricingDisplayOptions: {
          bundleQuantityOptions: {
            enabled: true,
            defaultRuleId: "rule-1",
            optionsByRuleId: {},
          },
        },
        setBundleQuantityOptionsEnabled: jest.fn(),
        setBundleQuantityDefaultRule,
        updateBundleQuantityOption: jest.fn(),
      } as any;

      const normalizedOptions = [
        {
          ruleId: "rule-1",
          label: "Box of 2",
          subtext: "10% off",
          isDefault: true,
          compatibility: { status: "compatible" },
        },
        {
          ruleId: "rule-2",
          label: "Box of 4",
          subtext: "20% off",
          isDefault: false,
          compatibility: { status: "compatible" },
        },
      ];

      const view = FpbBundleQuantityOptions({
        eligible: true,
        normalizedOptions,
        pricingState,
        styles: {},
        translationsAvailable: true,
        onOpenTranslations: jest.fn(),
      });

      const switches = findElements(
        view,
        (el) =>
          el.type === "s-switch" &&
          el.props.label === "adminDynamic.makeRuleDefault",
      );

      expect(switches).toHaveLength(2);
      expect(switches[0].props.checked).toBe(true);
      expect(switches[1].props.checked).toBeUndefined();

      // Trigger change on option 2 -> enables option 2
      switches[1].props.onChange({ target: { checked: true } } as any);
      expect(setBundleQuantityDefaultRule).toHaveBeenCalledWith("rule-2");

      // Trigger change on option 1 (toggling off) -> clears default rule
      switches[0].props.onChange({ target: { checked: false } } as any);
      expect(setBundleQuantityDefaultRule).toHaveBeenCalledWith(null);
    });
  });
});
