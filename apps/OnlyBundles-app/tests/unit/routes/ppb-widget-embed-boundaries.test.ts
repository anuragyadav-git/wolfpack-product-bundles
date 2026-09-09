import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PpbBundleEmbedSection,
  type PpbBundleEmbedSectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleEmbedSection";
import {
  PpbBundleWidgetSection,
  type PpbBundleWidgetSectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleWidgetSection";

const mockWidgetSection = jest.fn<unknown, [Record<string, unknown>]>(() => null);

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/CommonBundleWidgetSection",
  () => ({
    CommonBundleWidgetSection: (props: Record<string, unknown>) =>
      mockWidgetSection(props),
  }),
);

const noop = jest.fn();

function widgetProps(): PpbBundleWidgetSectionProps {
  return {
    activeSection: "bundle_widget",
    autoSelectBrowsedProduct: true,
    clearValidationError: noop,
    handlePlaceWidget: noop,
    markAsDirty: noop,
    openMultiLanguageModal: noop,
    openVisibilityCollectionPicker: noop,
    openVisibilityProductPicker: noop,
    removeVisibilityCollectionTarget: noop,
    removeVisibilityProductTarget: noop,
    setAutoSelectBrowsedProduct: noop,
    setUpsellWidgetButtonText: noop,
    setUpsellWidgetDescription: noop,
    setUpsellWidgetDisplayMode: noop,
    setUpsellWidgetDisplayOn: noop,
    setUpsellWidgetEnabled: noop,
    setUpsellWidgetImageUrl: noop,
    setUpsellWidgetTitle: noop,
    shopLocales: [],
    upsellWidgetButtonText: "Add bundle",
    upsellWidgetCollectionsSelectedData: [],
    upsellWidgetDescription: "Description",
    upsellWidgetDisplayMode: "block",
    upsellWidgetDisplayOn: "all",
    upsellWidgetEnabled: false,
    upsellWidgetImageUrl: "https://cdn.example.test/widget.png",
    upsellWidgetSelectedProducts: [],
    upsellWidgetTitle: "Bundle and save",
    validationErrors: {},
  };
}

function embedProps(
  overrides: Partial<PpbBundleEmbedSectionProps> = {},
): PpbBundleEmbedSectionProps {
  return {
    activeSection: "bundle_embed",
    bundleEmbedAddBrowsedProduct: true,
    bundleEmbedCollectionsSelectedData: [],
    bundleEmbedDisplayOn: "all_products",
    bundleEmbedEnabled: false,
    bundleEmbedSelectedProducts: [],
    bundleEmbedSubTitle: "Saved embed subtitle",
    bundleEmbedTitle: "Saved embed title",
    clearValidationError: noop,
    handlePlaceWidget: noop,
    markAsDirty: noop,
    openMultiLanguageModal: noop,
    openVisibilityCollectionPicker: noop,
    openVisibilityProductPicker: noop,
    removeVisibilityCollectionTarget: noop,
    removeVisibilityProductTarget: noop,
    setBundleEmbedAddBrowsedProduct: noop,
    setBundleEmbedCollectionsSelectedData: noop,
    setBundleEmbedDisplayOn: noop,
    setBundleEmbedEnabled: noop,
    setBundleEmbedSelectedProducts: noop,
    setBundleEmbedSpecificCollectionPages: noop,
    setBundleEmbedSpecificProductPages: noop,
    setBundleEmbedSubTitle: noop,
    setBundleEmbedTitle: noop,
    shopLocales: [],
    validationErrors: {},
    ...overrides,
  };
}

function findElement(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) return child;
    const nested = findElement(child.props.children, predicate);
    if (nested) return nested;
  }
  return null;
}

describe("PPB widget and embed feature boundaries", () => {
  beforeEach(() => jest.clearAllMocks());

  it("projects explicit widget values and owned callbacks", () => {
    renderToStaticMarkup(
      React.createElement(PpbBundleWidgetSection, widgetProps()),
    );

    expect(mockWidgetSection).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        enabled: false,
        title: "Bundle and save",
        imageUrl: "https://cdn.example.test/widget.png",
      }),
    );
  });

  it("keeps embed settings inert while leaving placement available", () => {
    const view = renderToStaticMarkup(
      React.createElement(PpbBundleEmbedSection, embedProps()),
    );

    expect(view).toContain("Saved embed title");
    expect(view).toContain("Saved embed subtitle");
    expect(view).toContain("inert");
    expect(view).toMatch(/<s-button[^>]*>Place Block<\/s-button>/);
    expect(view).not.toMatch(
      /<s-button[^>]*disabled="true"[^>]*>Place Block<\/s-button>/,
    );
  });

  it("clears incompatible embed targets before changing targeting mode", () => {
    const setBundleEmbedCollectionsSelectedData = jest.fn();
    const setBundleEmbedSpecificCollectionPages = jest.fn();
    const setBundleEmbedSelectedProducts = jest.fn();
    const setBundleEmbedSpecificProductPages = jest.fn();
    const setBundleEmbedDisplayOn = jest.fn();
    const view = PpbBundleEmbedSection(
      embedProps({
        bundleEmbedEnabled: true,
        setBundleEmbedCollectionsSelectedData,
        setBundleEmbedDisplayOn,
        setBundleEmbedSelectedProducts,
        setBundleEmbedSpecificCollectionPages,
        setBundleEmbedSpecificProductPages,
      }),
    );
    const targeting = findElement(
      view,
      (element) =>
        element.type === "s-choice-list" &&
        element.props.name === "ppbEmbedDisplayOn",
    );

    targeting!.props.onChange({ target: { values: ["specific_products"] } });

    expect(setBundleEmbedSelectedProducts).toHaveBeenCalledWith([]);
    expect(setBundleEmbedSpecificProductPages).toHaveBeenCalledWith([]);
    expect(setBundleEmbedCollectionsSelectedData).toHaveBeenCalledWith([]);
    expect(setBundleEmbedSpecificCollectionPages).toHaveBeenCalledWith([]);
    expect(setBundleEmbedDisplayOn).toHaveBeenCalledWith("specific_products");
  });
});
