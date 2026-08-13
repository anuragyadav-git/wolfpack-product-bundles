import React from "react";

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
  type: string,
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

  it.each([
    ["FPB", () => FpbDefaultProductsSettings({ flow: baseFlow as any })],
    ["PPB", () => PpbDefaultProductsSettings()],
  ])("dismisses the %s Polaris banner without dirtying the bundle", (_, render) => {
    const setDismissed = jest.fn();
    (React.useState as jest.Mock).mockReturnValueOnce([false, setDismissed]);

    const banner = findElement(render(), "s-banner");

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
  ])("hides the %s discount tip after dismissal", (_, render) => {
    (React.useState as jest.Mock).mockReturnValueOnce([true, jest.fn()]);

    expect(findElement(render(), "s-banner")).toBeNull();
  });
});
