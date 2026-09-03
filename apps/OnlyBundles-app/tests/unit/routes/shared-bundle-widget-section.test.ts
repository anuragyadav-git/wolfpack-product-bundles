import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CommonBundleWidgetSection } from "../../../app/routes/app/_shared/bundle-configure/CommonBundleWidgetSection";

const noop = jest.fn();

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    addBrowsedProduct: true,
    buttonText: "Buy With Bundle",
    collections: [],
    description: "Save with a bundle",
    disabled: false,
    displayMode: "block" as const,
    displayOn: "all" as const,
    enabled: true,
    FilePicker: () => React.createElement("button", null, "Upload file"),
    imageUrl: "",
    multiLanguageDisabled: false,
    onAddBrowsedProductChange: noop,
    onButtonTextChange: noop,
    onDescriptionChange: noop,
    onDisplayModeChange: noop,
    onDisplayOnChange: noop,
    onEnabledChange: noop,
    onImageUrlChange: noop,
    onOpenMultiLanguage: noop,
    onOpenCollectionPicker: noop,
    onOpenProductPicker: noop,
    onPlaceWidget: noop,
    onRemoveCollection: noop,
    onRemoveProduct: noop,
    onTitleChange: noop,
    products: [],
    title: "Bundle & Save",
    validationErrors: {},
    ...overrides,
  };
}

describe("CommonBundleWidgetSection", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the complete shared Widget contract", () => {
    const view = renderToStaticMarkup(
      React.createElement(CommonBundleWidgetSection, makeProps()),
    );

    expect(view).toContain("Product Page Bundle Upsell Widgets");
    expect(view).toContain("Offer Upsell Block");
    expect(view).toContain("Offer Upsell Button");
    expect(view).toContain("Widget Settings");
    expect(view).toContain("All products in bundle");
    expect(view).toContain("Specific products");
    expect(view).toContain("Specific collections");
    expect(view).toContain("Add browsed product to bundle");
    expect(view).toContain("Embed Upsell Block");
  });

  it("keeps block-only copy out of Button mode while preserving button copy", () => {
    const view = renderToStaticMarkup(
      React.createElement(
        CommonBundleWidgetSection,
        makeProps({ displayMode: "button" }),
      ),
    );

    expect(view).toContain('src="/Upsell-Button.png"');
    expect(view).not.toContain('label="Widget Title"');
    expect(view).not.toContain('label="Widget Description"');
    expect(view).toContain('label="Widget Button Text"');
    expect(view).toContain("Embed Upsell Button");
  });

  it("keeps saved controls visible and inert when disabled", () => {
    const view = renderToStaticMarkup(
      React.createElement(
        CommonBundleWidgetSection,
        makeProps({ disabled: true, enabled: false }),
      ),
    );

    expect(view).toContain("Bundle &amp; Save");
    expect(view).toContain("inert");
    expect(view).toContain('aria-disabled="true"');
    expect(view).toMatch(
      /<s-button[^>]*disabled="true"[^>]*>Embed Upsell Block<\/s-button>/,
    );
  });
});
