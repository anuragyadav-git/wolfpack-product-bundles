import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundleWidgetSection } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleWidgetSection";

function renderSection(
  mode: "button" | "block",
  overrides: Record<string, unknown> = {},
) {
  const noop = () => undefined;
  const flow = {
    activeSection: "bundle_widget",
    autoSelectBrowsedProduct: true,
    FilePicker: () => React.createElement("div"),
    fullPageBundleStyles: new Proxy({}, { get: (_, key) => String(key) }),
    handlePlaceWidget: noop,
    markAsDirty: noop,
    openMultiLanguageModal: noop,
    openVisibilityCollectionPicker: noop,
    openVisibilityProductPicker: noop,
    removeVisibilityCollectionTarget: noop,
    removeVisibilityProductTarget: noop,
    setAutoSelectBrowsedProduct: noop,
    setTextOverrides: noop,
    setUpsellWidgetButtonText: noop,
    setUpsellWidgetDescription: noop,
    setUpsellWidgetDisplayMode: noop,
    setUpsellWidgetDisplayOn: noop,
    setUpsellWidgetEnabled: noop,
    setUpsellWidgetImageUrl: noop,
    setUpsellWidgetTitle: noop,
    shopLocales: [{ locale: "en" }],
    upsellWidgetButtonText: "Build bundle",
    upsellWidgetCollectionsSelectedData: [],
    upsellWidgetDescription: "Save with a bundle",
    upsellWidgetDisplayMode: mode,
    upsellWidgetDisplayOn: "all",
    upsellWidgetEnabled: true,
    upsellWidgetImageUrl: "",
    upsellWidgetSelectedProducts: [],
    upsellWidgetTitle: "Bundle and save",
    ...overrides,
  };

  return renderToStaticMarkup(
    React.createElement(BundleWidgetSection, { flow: flow as never }),
  );
}

describe("FPB Bundle Widget Admin controls", () => {
  it("uses the shared tip, checkbox, placement action, and Block illustration", () => {
    const markup = renderSection("block");
    expect(markup).toContain("<s-banner");
    expect(markup).not.toContain('heading="Widget visibility tip"');
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
      upsellWidgetDisplayOn: "specific_products",
      upsellWidgetSelectedProducts: [
        { graphqlId: "gid://shopify/Product/1", title: "Selected product" },
      ],
    });

    expect(markup).toContain("Selected product");
  });

  it("renders a selected collection without requiring an injected identity helper", () => {
    const markup = renderSection("button", {
      upsellWidgetDisplayOn: "specific_collections",
      upsellWidgetCollectionsSelectedData: [
        { graphqlId: "gid://shopify/Collection/1", title: "Selected collection" },
      ],
    });

    expect(markup).toContain("Selected collection");
  });
});
