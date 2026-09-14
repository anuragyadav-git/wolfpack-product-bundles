import React from "react";

import { BundleTypeSelectionCard } from "../../../app/routes/app/app.bundles.create/BundleTypeSelectionCard";
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

function findBadge(node: React.ReactNode): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (child.type === "s-badge") {
      return child;
    }
    const nested = findBadge(child.props.children);
    if (nested) return nested;
  }
  return null;
}

function findActionOwners(node: React.ReactNode): React.ReactElement[] {
  if (!React.isValidElement(node)) return [];
  const current = ["button", "s-button", "s-clickable"].includes(
    String(node.type),
  )
    ? [node]
    : [];
  return [
    ...current,
    ...React.Children.toArray(node.props.children).flatMap((child) =>
      findActionOwners(child),
    ),
  ];
}

describe("full-width Polaris clickable action ownership", () => {
  it("delegates bundle-type card activation to one clickable owner without select text", () => {
    const onSelect = jest.fn();
    const view = BundleTypeSelectionCard({
      description: "Display this builder on an existing product page",
      selected: false,
      selectedLabel: "Selected",
      thumbnail: "product-page",
      title: "Product page bundle builder",
      onSelect,
    });

    expect(view.type).toBe("s-clickable");
    const action = findClickable(view, "Product page bundle builder");
    expect(action?.type).toBe("s-clickable");
    expect(findActionOwners(view)).toHaveLength(1);
    expect(textContent(view)).not.toContain("Select");
    expect(textContent(view)).not.toContain("Selected");
    action!.props.onClick();

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders a native Polaris success badge when bundle-type card is selected", () => {
    const onSelect = jest.fn();
    const view = BundleTypeSelectionCard({
      description: "Create a dedicated landing page for your bundle",
      selected: true,
      selectedLabel: "Selected",
      thumbnail: "full-page",
      title: "Full page bundle builder",
      onSelect,
    });

    expect(view.type).toBe("s-clickable");
    expect(findActionOwners(view)).toHaveLength(1);
    const badge = findBadge(view);
    expect(badge).not.toBeNull();
    expect(badge?.props.tone).toBe("success");
    expect(textContent(badge)).toBe("Selected");
  });

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
