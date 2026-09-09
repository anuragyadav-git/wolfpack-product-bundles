import React from "react";

import { FpbAddonTierRules } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FpbAddonTierRules";
import { FpbAddonTierEditor } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonTierEditor";
import {
  PpbFreeGiftAddonsSection,
  type PpbFreeGiftAddonsSectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbFreeGiftAddonsSection";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
}));

function textContent(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (!React.isValidElement(node)) return "";
  return React.Children.toArray(node.props.children)
    .map((child) => textContent(child))
    .join("");
}

function findClickable(
  node: React.ReactNode,
  label: string,
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (child.type === "s-clickable" && textContent(child).includes(label)) {
      return child;
    }
    const nested = findClickable(child.props.children, label);
    if (nested) return nested;
  }
  return null;
}

describe("full-width Polaris clickable action ownership", () => {
  it("delegates Add Tier Rule to the FPB tier owner", () => {
    const onAdd = jest.fn();
    const view = FpbAddonTierRules({
      actionClassName: "action",
      ruleCardClassName: "rule-card",
      ruleFieldsClassName: "rule-fields",
      ruleHeaderClassName: "rule-header",
      rules: [],
      rulesListClassName: "rules-list",
      tierIndex: 2,
      tierRulesClassName: "tier-rules",
      onAdd,
      onRemove: jest.fn(),
      onUpdate: jest.fn(),
    });

    const action = findClickable(view, "addTierRule");
    expect(action).not.toBeNull();
    action!.props.onClick();

    expect(onAdd).toHaveBeenCalledWith(2);
  });

  it("delegates Add Add Ons Tier to the FPB tier owner", () => {
    const onActiveTierIndexChange = jest.fn();
    const onTiersChange = jest.fn();
    const view = FpbAddonTierEditor({
      activeTierIndex: null,
      tiers: [],
      styles: {},
      onActiveTierIndexChange,
      onAddProducts: jest.fn(),
      onOpenSelectedProducts: jest.fn(),
      onTiersChange,
    });

    const action = findClickable(view, "addAddOnsTier");
    expect(action).not.toBeNull();
    action!.props.onClick();

    expect(onTiersChange).toHaveBeenCalledWith([expect.any(Object)]);
    expect(onActiveTierIndexChange).toHaveBeenCalledTimes(1);
  });

  it("delegates Add Add Ons Tier to the active PPB step owner", () => {
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
        steps: [
          {
            id: "step-1",
            name: "Gift",
            isFreeGift: true,
            addonUnlockAfterCompletion: true,
            addonTiers: [],
          },
        ],
        updateStepField,
      } as unknown as PpbFreeGiftAddonsSectionProps["stepsState"],
      templateVariablesModalRef: { current: null },
    } satisfies PpbFreeGiftAddonsSectionProps;

    const view = PpbFreeGiftAddonsSection(props);
    const action = findClickable(view, "addAddOnsTier");
    expect(action).not.toBeNull();
    action!.props.onClick();

    expect(updateStepField).toHaveBeenCalledWith("step-1", "addonTiers", [
      { displayFree: true },
    ]);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });
});
