import {
  PPB_BUNDLE_EMBED_DEFAULT,
  clearPpbBundleEmbedTargets,
  extractPpbBundleWidgetTranslations,
  localizePpbBundleEmbed,
  mergePpbBundleEmbedTranslations,
  mergePpbBundleWidgetTranslations,
  normalizePpbBundleEmbedConfig,
  removeLegacyPpbEmbedTextOverrides,
  serializePpbBundleEmbedConfig,
  validatePpbBundleEmbedConfig,
} from "../../../app/lib/ppb-bundle-embed";

describe("PPB bundle embed configuration", () => {
  it("normalizes missing and legacy-only values to disabled canonical defaults", () => {
    expect(normalizePpbBundleEmbedConfig(null)).toEqual(PPB_BUNDLE_EMBED_DEFAULT);
    expect(normalizePpbBundleEmbedConfig({ textOverrides: { bundleEmbedEnabled: "true", embedTitle: "Legacy" } })).toEqual(PPB_BUNDLE_EMBED_DEFAULT);
  });

  it("removes legacy embed override keys while preserving unrelated copy", () => {
    expect(removeLegacyPpbEmbedTextOverrides({
      addToCartButton: "Add",
      bundleEmbedEnabled: "true",
      embedTitle: "Legacy",
      embedSubTitle: "Legacy sub",
      embedDisplayOn: "all_products",
      embedAddBrowsedProduct: "true",
    })).toEqual({ addToCartButton: "Add" });
  });

  it("normalizes and serializes only the canonical configuration", () => {
    const config = normalizePpbBundleEmbedConfig({
      upsellConfiguration: {
        isEnabled: true,
        title: "  Build a box  ",
        subTitle: "Pick favourites",
        displayConfiguration: {
          showOnAllBundleProducts: false,
          selectedProducts: [{ productId: "1" }],
          showOnSpecificProductPages: [{ id: "gid://shopify/Product/1" }],
          collectionsSelectedData: "invalid",
          showOnSpecificCollectionPages: [],
        },
        useLinkProductAsDefaultProduct: true,
      },
      multiLangText: { fr: { upsellConfiguration: { title: "Ma boîte", subTitle: "Choisissez" } } },
    });
    expect(config.upsellConfiguration.title).toBe("Build a box");
    expect(config.upsellConfiguration.displayConfiguration.collectionsSelectedData).toEqual([]);
    expect(serializePpbBundleEmbedConfig(config)).toEqual(config);
  });

  it("localizes exact locale, language locale, then canonical copy", () => {
    const config = normalizePpbBundleEmbedConfig({
      upsellConfiguration: { title: "Base", subTitle: "Base sub" },
      multiLangText: {
        fr: { upsellConfiguration: { title: "Français", subTitle: "" } },
        "fr-CA": { upsellConfiguration: { title: "Québécois" } },
      },
    });
    expect(localizePpbBundleEmbed(config, "FR-ca")).toEqual({ title: "Québécois", subTitle: "Base sub" });
    expect(localizePpbBundleEmbed(config, "fr-FR")).toEqual({ title: "Français", subTitle: "Base sub" });
    expect(localizePpbBundleEmbed(config, "de")).toEqual({ title: "Base", subTitle: "Base sub" });
  });

  it("merges embed translations without overwriting Bundle Widget translations", () => {
    expect(mergePpbBundleEmbedTranslations(
      { fr: { widgetTitle: "Widget", upsellConfiguration: { title: "Old" } } },
      { fr: { upsellConfiguration: { title: "New", subTitle: "Sous-titre" } } },
    )).toEqual({
      fr: {
        widgetTitle: "Widget",
        upsellConfiguration: { title: "New", subTitle: "Sous-titre" },
      },
    });
  });

  it("extracts and merges Bundle Widget translations without overwriting embed copy", () => {
    const existing = {
      fr: {
        widgetTitle: "Widget",
        widgetDescription: "Description",
        widgetButtonText: "Acheter",
        upsellConfiguration: { title: "Embed" },
      },
    };
    expect(extractPpbBundleWidgetTranslations(existing)).toEqual({
      fr: {
        widgetTitle: "Widget",
        widgetDescription: "Description",
        widgetButtonText: "Acheter",
      },
    });
    expect(mergePpbBundleWidgetTranslations(existing, {
      fr: { widgetTitle: "Nouveau", widgetDescription: "", widgetButtonText: "Acheter" },
    })).toEqual({
      fr: {
        widgetTitle: "Nouveau",
        widgetButtonText: "Acheter",
        upsellConfiguration: { title: "Embed" },
      },
    });
  });

  it("clears both product and collection selections on a targeting-mode change", () => {
    const config = normalizePpbBundleEmbedConfig({ upsellConfiguration: { displayConfiguration: { selectedProducts: [{}], showOnSpecificProductPages: [{}], collectionsSelectedData: [{}], showOnSpecificCollectionPages: [{}] } } });
    expect(clearPpbBundleEmbedTargets(config.upsellConfiguration.displayConfiguration)).toEqual({
      showOnAllBundleProducts: false,
      selectedProducts: [],
      showOnSpecificProductPages: [],
      collectionsSelectedData: [],
      showOnSpecificCollectionPages: [],
    });
  });

  it("requires canonical title and specific-mode targets only when enabled", () => {
    const disabled = normalizePpbBundleEmbedConfig({ upsellConfiguration: { title: "", isEnabled: false } });
    expect(validatePpbBundleEmbedConfig(disabled)).toEqual([]);
    const enabled = normalizePpbBundleEmbedConfig({ upsellConfiguration: { title: "", isEnabled: true, displayConfiguration: { showOnAllBundleProducts: false } } });
    expect(validatePpbBundleEmbedConfig(enabled, "specific_products").map((issue) => issue.path)).toEqual(["embed.title", "embed.products"]);
  });
});
