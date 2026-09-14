import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundleWidgetSection } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleWidgetSection";

function renderSection(
  mode: "button" | "block",
  overrides: Record<string, unknown> = {},
) {
  const noop = () => undefined;
  const widget = {
    addBrowsedProduct: true,
    buttonText: "Build bundle",
    collections: [],
    description: "Save with a bundle",
    disabled: false,
    displayMode: mode,
    displayOn: "all" as const,
    enabled: true,
    imageUrl: "",
    multiLanguageDisabled: false,
    onAddBrowsedProductChange: noop,
    onButtonTextChange: noop,
    onDescriptionChange: noop,
    onDisplayModeChange: noop,
    onDisplayOnChange: noop,
    onEnabledChange: noop,
    onImageUrlChange: noop,
    onOpenCollectionPicker: noop,
    onOpenMultiLanguage: noop,
    onOpenProductPicker: noop,
    onPlaceWidget: noop,
    onRemoveCollection: noop,
    onRemoveProduct: noop,
    onTitleChange: noop,
    products: [],
    title: "Bundle and save",
    validationErrors: {},
    ...overrides,
  };

  return renderToStaticMarkup(
    React.createElement(BundleWidgetSection, {
      activeSection: "bundle_widget",
      widget: widget as never,
    }),
  );
}

describe("FPB Bundle Widget Admin controls", () => {
  it("uses ordinary guidance, the checkbox, placement action, and Block illustration", () => {
    const markup = renderSection("block");
    expect(markup).not.toContain("<s-banner");
    expect(markup).toContain(
      "Select if you want the upsell block or button to appear on product pages.",
    );
    expect(markup).toContain("<s-checkbox");
    expect(markup).toContain("Embed Upsell Block");
    expect(markup).toContain('src="/Upsell-Block.png"');
  });

  it("uses the Button illustration when Button mode is selected", () => {
    expect(renderSection("button")).toContain('src="/Upsell-Button.png"');
  });

  it("renders a selected product without requiring an injected identity helper", () => {
    const markup = renderSection("button", {
      displayOn: "specific_products",
      products: [
        { graphqlId: "gid://shopify/Product/1", title: "Selected product" },
      ],
    });

    expect(markup).toContain("Selected product");
  });

  it("renders a selected collection without requiring an injected identity helper", () => {
    const markup = renderSection("button", {
      displayOn: "specific_collections",
      collections: [
        { graphqlId: "gid://shopify/Collection/1", title: "Selected collection" },
      ],
    });

    expect(markup).toContain("Selected collection");
  });
});
