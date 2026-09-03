import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PpbCategoryAccordion } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryAccordion";

const mockUsePpbConfigureContext = jest.fn();

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({
    usePpbConfigureContext: () => mockUsePpbConfigureContext(),
  }),
);

function makeFlow() {
  return {
    categoryActiveTabs: {},
    categoryOpen: { "step-1__cat-1": true },
    draggedCatKey: null,
    dragOverCatKey: null,
    productPageBundleStyles: {},
    handleCatDragEnd: jest.fn(),
    handleCatDragStart: jest.fn(),
    handleCatDrop: jest.fn(),
    markAsDirty: jest.fn(),
    openStepCategoryMultiLanguageModal: jest.fn(),
    setCategoryActiveTabs: jest.fn(),
    setCategoryOpen: jest.fn(),
    setDragOverCatKey: jest.fn(),
    showPolarisModal: jest.fn(),
    hidePolarisModal: jest.fn(),
    shopify: { resourcePicker: jest.fn() },
    stepsState: { updateStepField: jest.fn() },
  } as any;
}

describe("PPB category variant control", () => {
  it("renders the category's persisted variant merchandising controls", () => {
    const category = {
      id: "cat-1",
      name: "Category 1",
      products: [],
      collections: [],
      displayVariantsAsIndividualProducts: true,
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
    };
    const step = { id: "step-1", StepCategory: [category] };
    mockUsePpbConfigureContext.mockReturnValue(makeFlow());

    const view = renderToStaticMarkup(
      React.createElement(PpbCategoryAccordion, {
        step,
        cat: category,
        catIndex: 0,
      }),
    );

    expect(view).toContain('label="Display variants as individual products"');
    expect(view).toContain('checked="true"');
    expect(view).toContain('label="Variant selector style"');
    expect(view).toContain('value="color_swatch"');
    expect(view).toContain('label="Show color name on hover and focus"');
    expect(view).toContain("Shopify product option swatches");
    expect(view).not.toContain('label="Color mappings"');
  });

  it("explains Shopify option swatches for image mode", () => {
    const category = {
      id: "cat-1",
      name: "Category 1",
      products: [],
      collections: [],
      variantSelectorMode: "image_swatch",
    };
    mockUsePpbConfigureContext.mockReturnValue(makeFlow());

    const view = renderToStaticMarkup(
      React.createElement(PpbCategoryAccordion, {
        step: { id: "step-1", StepCategory: [category] },
        cat: category,
        catIndex: 0,
      }),
    );

    expect(view).toContain("Shopify product option swatches");
    expect(view).not.toContain('label="Show color name on hover and focus"');
  });
});
