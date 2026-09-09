import React from "react";

import { SettingsControlsWorkspace } from "../../../app/routes/app/app.settings/SettingsControlsWorkspace";
import {
  PpbDefaultProductsSettings,
  type PpbDefaultProductsSettingsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.defaultProducts";
import {
  PpbQuantitySettings,
  type PpbQuantitySettingsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.quantity";
import { PpbStepSetupDetailsCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupDetailsCard";
import { FpbStepSetupDetailsCard } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupDetailsCard";

function findElements(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean
): React.ReactElement[] {
  const matches: React.ReactElement[] = [];

  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) matches.push(child);
    matches.push(...findElements(child.props.children, predicate));
  }

  return matches;
}

describe("Polaris wrapper ownership", () => {
  it("keeps the native Settings select as the layout-change event owner", () => {
    const onLayoutChange = jest.fn();
    const layout = {
      id: "landing-page",
      label: "Landing Page Layout",
      tabs: [{ title: "Product Card", fields: [] }],
    };
    const view = SettingsControlsWorkspace({
      activeControlLayout: layout.label,
      controlFieldValues: {},
      controlsNavigationRef: { current: null },
      hasNestedControlGroups: false,
      isControlsNavigationOpen: false,
      isDirty: false,
      selectedControlFields: [],
      selectedControlGroupTitle: "",
      selectedControlGroupTitles: [],
      selectedControlLayout: layout as never,
      selectedControlTab: layout.tabs[0] as never,
      settingsHelpArticle: null,
      settingsVariablesModal: null,
      taskAlert: null,
      onBack: jest.fn(),
      onDismissAlert: jest.fn(),
      onDiscard: jest.fn(),
      onFieldAction: jest.fn(),
      onFieldChange: jest.fn(),
      onGroupChange: jest.fn(),
      onHelpClose: jest.fn(),
      onLayoutChange,
      onNavigationOpenChange: jest.fn(),
      onSave: jest.fn(),
      onTabChange: jest.fn(),
      onVariablesClose: jest.fn(),
    });
    const [layoutSelect] = findElements(
      view,
      (element) => element.type === "s-select"
    );

    layoutSelect.props.onChange({ currentTarget: { value: "Sidebar Layout" } });

    expect(onLayoutChange).toHaveBeenCalledWith("Sidebar Layout");
  });

  it("keeps native PPB switches as the setting-change event owners", () => {
    const setQuantityValidationEnabled = jest.fn();
    const markAsDirty = jest.fn();
    const quantityView = PpbQuantitySettings({
      clearValidationError: jest.fn(),
      lowStockAlertEnabled: false,
      lowStockAlertMessage: "Only {{stock}} left",
      lowStockAlertThreshold: "5",
      markAsDirty,
      maxQtyPerProduct: "1",
      quantityValidationEnabled: false,
      setLowStockAlertEnabled: jest.fn(),
      setLowStockAlertMessage: jest.fn(),
      setLowStockAlertThreshold: jest.fn(),
      setMaxQtyPerProduct: jest.fn(),
      setQuantityValidationEnabled,
      setVariantSelectorEnabled: jest.fn(),
      validationErrors: {},
      variantSelectorEnabled: true,
    } satisfies PpbQuantitySettingsProps);
    const [quantitySwitch] = findElements(
      quantityView,
      (element) => element.type === "s-switch"
    );

    quantitySwitch.props.onChange({ target: { checked: true } });

    expect(setQuantityValidationEnabled).toHaveBeenCalledWith(true);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });

  it("keeps the default-products switch as the direct state owner", () => {
    const setDefaultProductsData = jest.fn();
    const markAsDirty = jest.fn();
    const view = PpbDefaultProductsSettings({
      clearValidationError: jest.fn(),
      defaultProductsData: {
        isDefaultProductsEnabled: false,
        defaultProductsTitle: "",
        products: [],
      },
      markAsDirty,
      setDefaultProductsData,
      validationErrors: {},
    } satisfies PpbDefaultProductsSettingsProps);
    const [toggle] = findElements(
      view,
      (element) => element.type === "s-switch"
    );

    toggle.props.onChange({ target: { checked: true } });

    expect(setDefaultProductsData).toHaveBeenCalledTimes(1);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["FPB", FpbStepSetupDetailsCard],
    ["PPB", PpbStepSetupDetailsCard],
  ])(
    "links every %s step action directly to a native tooltip",
    (_type, Card) => {
      const step = { id: "step-1", name: "Choose products", enabled: true };
      const common = {
        step,
        isFirstStep: false,
        validationErrors: {},
      };
      const view =
        Card === FpbStepSetupDetailsCard
          ? Card({
              ...common,
              styles: new Proxy({}, { get: () => "test-class" }),
              stepCount: 2,
              translationsDisabled: false,
              onClearValidationError: jest.fn(),
              onClone: jest.fn(),
              onDelete: jest.fn(),
              onEnabledChange: jest.fn(),
              onNameChange: jest.fn(),
              onOpenTranslations: jest.fn(),
            })
          : Card({
              ...common,
              clearValidationError: jest.fn(),
              cloneStep: jest.fn(),
              deleteStep: jest.fn(),
              markAsDirty: jest.fn(),
              openStepMultiLanguageModal: jest.fn(),
              shopLocales: ["en"],
              stepsState: {
                steps: [step, { id: "step-2", name: "Second" }],
                updateStepField: jest.fn(),
              },
            } as never);
      const tooltipIds = findElements(
        view,
        (element) => element.type === "s-tooltip"
      ).map((element) => element.props.id);
      const actionInterests = findElements(
        view,
        (element) =>
          element.type === "s-button" &&
          typeof element.props.interestFor === "string"
      ).map((element) => element.props.interestFor);

      expect(actionInterests).toEqual(tooltipIds);
      expect(actionInterests).toHaveLength(3);
    }
  );
});
