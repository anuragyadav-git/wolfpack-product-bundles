import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FpbSummaryTextSettings } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSummaryText";
import { PpbQuantitySettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.quantity";

const mockUsePpbConfigureContext = jest.fn();

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({
    usePpbConfigureContext: () => mockUsePpbConfigureContext(),
  }),
);

const removedCopy = [
  "Pre-order &amp; Subscription Integration",
  "Enable pre-order and subscription integration",
  "Apply to products",
  "Show for all products",
  "Action required",
];

describe("Admin Bundle Settings integration removal", () => {
  it("omits pre-order and subscription controls from FPB settings", () => {
    const flow = {
      activeTabIndex: 0,
      bundle: {},
      DiscountMethod: { BUY_X_GET_Y: "BUY_X_GET_Y" },
      markAsDirty: jest.fn(),
      openMultiLanguageModal: jest.fn(),
      pricingState: { discountType: "BUY_X_GET_Y" },
      setIndividualSellingPlanEnabled: jest.fn(),
      setShowTextOnAddButton: jest.fn(),
      setTextOverrides: jest.fn(),
      SettingsRow: ({ title, children }: any) =>
        createElement("section", null, title, children),
      setVariantSelectorEnabled: jest.fn(),
      showTextOnAddButton: false,
      stepsState: { steps: [{}] },
      textOverrides: {},
      variantSelectorEnabled: true,
    };

    const markup = renderToStaticMarkup(
      createElement(FpbSummaryTextSettings, { flow: flow as any }),
    );

    expect(markup).toContain("Variant Selector");
    removedCopy.forEach((copy) => expect(markup).not.toContain(copy));
  });

  it("omits pre-order and subscription controls from PPB settings", () => {
    mockUsePpbConfigureContext.mockReturnValue({
      DiscountMethod: { BUY_X_GET_Y: "BUY_X_GET_Y" },
      markAsDirty: jest.fn(),
      maxQtyPerProduct: "2",
      pricingState: { discountType: "BUY_X_GET_Y" },
      productPageBundleStyles: {
        settingInlineSwitch: "settingInlineSwitch",
        settingTitle: "settingTitle",
        settingTitleMuted: "settingTitleMuted",
        settingTitleRow: "settingTitleRow",
      },
      quantityValidationEnabled: true,
      QuestionHelpTooltip: () => null,
      setIndividualSellingPlanEnabled: jest.fn(),
      setMaxQtyPerProduct: jest.fn(),
      setQuantityValidationEnabled: jest.fn(),
      setVariantSelectorEnabled: jest.fn(),
      variantSelectorEnabled: true,
    });

    const markup = renderToStaticMarkup(
      createElement(PpbQuantitySettings),
    );

    expect(markup).toContain("Enable Quantity Validation");
    expect(markup).toContain("Variant Selector");
    removedCopy.forEach((copy) => expect(markup).not.toContain(copy));
  });

  it("omits the promotional Search filters banner from PPB settings", () => {
    mockUsePpbConfigureContext.mockReturnValue({
      markAsDirty: jest.fn(),
      maxQtyPerProduct: "2",
      productPageBundleStyles: {
        settingInlineSwitch: "settingInlineSwitch",
        settingTitle: "settingTitle",
        settingTitleRow: "settingTitleRow",
      },
      quantityValidationEnabled: true,
      QuestionHelpTooltip: () => null,
      setMaxQtyPerProduct: jest.fn(),
      setQuantityValidationEnabled: jest.fn(),
      setVariantSelectorEnabled: jest.fn(),
      variantSelectorEnabled: true,
      validationErrors: {},
      clearValidationError: jest.fn(),
    });

    const markup = renderToStaticMarkup(createElement(PpbQuantitySettings));

    expect(markup).not.toContain("Search filters");
    expect(markup).not.toContain("24% higher conversion rates");
    expect(markup).toContain("Enable Quantity Validation");
    expect(markup).toContain("Variant Selector");
  });
});
