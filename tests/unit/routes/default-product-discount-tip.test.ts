import React from "react";

import { DefaultProductDiscountTipBanner } from "../../../app/routes/app/_shared/bundle-configure/DefaultProductDiscountTipBanner";
import { FpbDefaultProductsSettings } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsDefaultProducts";
import { PpbDefaultProductsSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.defaultProducts";

const mockUsePpbConfigureContext = jest.fn();

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({
    usePpbConfigureContext: () => mockUsePpbConfigureContext(),
  }),
);

function findElement(
  node: React.ReactNode,
  type: React.ElementType,
): React.ReactElement<any> | null {
  if (!React.isValidElement(node)) return null;
  if (node.type === type) return node;

  for (const child of React.Children.toArray((node.props as any).children)) {
    const match = findElement(child, type);
    if (match) return match;
  }
  return null;
}

const baseFlow = {
  buildDefaultProductEntryFromPicker: jest.fn(),
  clearValidationError: jest.fn(),
  defaultProductsData: {},
  markAsDirty: jest.fn(),
  setDefaultProductsData: jest.fn(),
  shopify: {},
};

const ppbContext = {
  ...baseFlow,
  productPageBundleStyles: {
    defaultProductsPickerActions: "",
    defaultProductsPickerGroup: "",
    settingInlineSwitch: "",
    settingTitle: "",
    settingTitleRow: "",
  },
};

describe("Pre Selected Product discount tip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePpbConfigureContext.mockReturnValue(ppbContext);
  });

  it("dismisses the shared FPB Polaris banner without dirtying the bundle", () => {
    const setDismissed = jest.fn();
    (React.useState as jest.Mock).mockReturnValueOnce([false, setDismissed]);

    const banner = findElement(DefaultProductDiscountTipBanner(), "s-banner");

    expect(banner?.props.dismissible).toBe(true);
    expect(banner?.props.title).toBe("Discount tip");
    expect(banner?.props.heading).toBeUndefined();
    banner?.props.onDismiss?.();
    expect(setDismissed).toHaveBeenCalledWith(true);
    expect(baseFlow.markAsDirty).not.toHaveBeenCalled();
  });

  it.each([
    ["FPB", () => FpbDefaultProductsSettings({ flow: baseFlow as any })],
    ["PPB", () => PpbDefaultProductsSettings()],
  ])("renders the shared banner in %s", (_, render) => {
    expect(findElement(render(), DefaultProductDiscountTipBanner)).not.toBeNull();
  });

  it.each([
    { dismissed: false, expected: "renders" },
    { dismissed: true, expected: "hides" },
  ])("$expected the shared discount tip after dismissal state changes", ({ dismissed }) => {
    (React.useState as jest.Mock).mockReturnValueOnce([dismissed, jest.fn()]);

    const banner = findElement(DefaultProductDiscountTipBanner(), "s-banner");
    expect(Boolean(banner)).toBe(!dismissed);
  });
});
