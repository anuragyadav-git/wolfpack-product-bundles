import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PpbBundleEmbedSection } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleEmbedSection";
import { PpbBundleWidgetSection } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleWidgetSection";
import { PpbFreeGiftAddonsSection } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbFreeGiftAddonsSection";

const mockUsePpbConfigureContext = jest.fn();

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({
    usePpbConfigureContext: () => mockUsePpbConfigureContext(),
  })
);

jest.mock(
  "../../../app/components/bundle-configure/LiveUpsellWidgetPreview",
  () => ({
    LiveUpsellWidgetPreview: ({ title }: { title: string }) =>
      React.createElement("div", null, title),
  })
);

const noop = jest.fn();

function makeFlow(overrides: Record<string, unknown> = {}) {
  return {
    activeSection: "bundle_widget",
    appEmbedEnabled: true,
    autoSelectBrowsedProduct: true,
    bundleEmbedAddBrowsedProduct: true,
    bundleEmbedCollectionsSelectedData: [],
    bundleEmbedDisplayOn: "all_products",
    bundleEmbedEnabled: false,
    bundleEmbedSelectedProducts: [],
    bundleEmbedSubTitle: "Saved embed subtitle",
    bundleEmbedTitle: "Saved embed title",
    clearValidationError: noop,
    FilePicker: ({
      value,
      disabled,
    }: {
      value: string | null;
      disabled?: boolean;
    }) =>
      React.createElement(
        "button",
        { disabled, "aria-label": "Image picker" },
        value ?? "No image"
      ),
    getVisibilityResourceId: (resource: { id?: string }) => resource.id,
    handlePlaceWidget: noop,
    markAsDirty: noop,
    openMultiLanguageModal: noop,
    openThemeEditorForAppEmbed: noop,
    openVisibilityCollectionPicker: noop,
    openVisibilityProductPicker: noop,
    removeVisibilityCollectionTarget: noop,
    removeVisibilityProductTarget: noop,
    setAutoSelectBrowsedProduct: noop,
    setBundleEmbedAddBrowsedProduct: noop,
    setBundleEmbedCollectionsSelectedData: noop,
    setBundleEmbedDisplayOn: noop,
    setBundleEmbedEnabled: noop,
    setBundleEmbedSelectedProducts: noop,
    setBundleEmbedSpecificCollectionPages: noop,
    setBundleEmbedSpecificProductPages: noop,
    setBundleEmbedSubTitle: noop,
    setBundleEmbedTitle: noop,
    setUpsellWidgetButtonText: noop,
    setUpsellWidgetDescription: noop,
    setUpsellWidgetDisplayMode: noop,
    setUpsellWidgetDisplayOn: noop,
    setUpsellWidgetEnabled: noop,
    setUpsellWidgetImageUrl: noop,
    setUpsellWidgetTitle: noop,
    upsellWidgetButtonText: "Saved button text",
    upsellWidgetCollectionsSelectedData: [],
    upsellWidgetDescription: "Saved widget description",
    upsellWidgetDisplayMode: "block",
    upsellWidgetDisplayOn: "all",
    upsellWidgetEnabled: false,
    upsellWidgetImageUrl: "https://cdn.example.test/saved.png",
    upsellWidgetSelectedProducts: [],
    upsellWidgetTitle: "Saved widget title",
    validationErrors: {},
    ...overrides,
  };
}

function findElement(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) return child;
    const nested = findElement(child.props.children, predicate);
    if (nested) return nested;
  }
  return null;
}

describe("PPB disabled configuration surfaces", () => {
  beforeEach(() => jest.clearAllMocks());

  it("keeps saved Widget settings visible and disables the full dependent surface", () => {
    mockUsePpbConfigureContext.mockReturnValue(makeFlow());

    const view = renderToStaticMarkup(
      React.createElement(PpbBundleWidgetSection)
    );

    expect(view).toContain("Saved widget title");
    expect(view).toContain("Saved widget description");
    expect(view).toContain("https://cdn.example.test/saved.png");
    expect(view).toContain("inert");
    expect(view).toContain('aria-disabled="true"');
    expect(view).toMatch(
      /<s-button[^>]*disabled="true"[^>]*>Place Widget<\/s-button>/
    );
  });

  it("keeps saved Embed settings visible and disables placement", () => {
    mockUsePpbConfigureContext.mockReturnValue(
      makeFlow({ activeSection: "bundle_embed" })
    );

    const view = renderToStaticMarkup(
      React.createElement(PpbBundleEmbedSection)
    );

    expect(view).toContain("Saved embed title");
    expect(view).toContain("Saved embed subtitle");
    expect(view).toContain("inert");
    expect(view).toContain('aria-disabled="true"');
    expect(view).toMatch(
      /<s-button[^>]*disabled="true"[^>]*>Place Block<\/s-button>/
    );
  });

  it("restores interaction without changing saved values when Widget is enabled", () => {
    mockUsePpbConfigureContext.mockReturnValue(
      makeFlow({ upsellWidgetEnabled: true })
    );

    const view = renderToStaticMarkup(
      React.createElement(PpbBundleWidgetSection)
    );

    expect(view).toContain("Saved widget title");
    expect(view).not.toContain("inert");
    expect(view).not.toContain('aria-disabled="true"');
  });

  it("disables the PPB gifting step without clearing its saved configuration", () => {
    const updateStepField = jest.fn();
    mockUsePpbConfigureContext.mockReturnValue(
      makeFlow({
        activeSection: "free_gift_addons",
        activeTabIndex: 0,
        productPageBundleStyles: new Proxy(
          {},
          { get: (_, key) => String(key) }
        ),
        ruleMessages: {},
        setRuleMessages: noop,
        setShowIconPickerForStep: noop,
        showIconPickerForStep: null,
        showPolarisModal: noop,
        stepsState: {
          steps: [
            {
              id: "step-1",
              isFreeGift: true,
              addonLabel: "Saved add-on",
              addonTitle: "Saved title",
              addonIconUrl: "https://cdn.example.test/icon.png",
              addonUnlockAfterCompletion: true,
              addonTiers: [],
            },
          ],
          updateStepField,
        },
        templateVariablesModalRef: { current: null },
      })
    );

    const view = PpbFreeGiftAddonsSection();
    const switchControl = findElement(
      view,
      (element) =>
        element.type === "s-checkbox" &&
        element.props.accessibilityLabel === "Enable add-ons and gifting step"
    );
    switchControl!.props.onChange({ target: { checked: false } });

    expect(updateStepField).toHaveBeenCalledTimes(1);
    expect(updateStepField).toHaveBeenCalledWith("step-1", "isFreeGift", false);
  });
});
