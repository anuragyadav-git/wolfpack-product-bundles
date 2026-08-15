import { normalizeFpbUpsellSave } from "../../../app/lib/fpb-upsell-config.server";

describe("normalizeFpbUpsellSave", () => {
  const baseConfig = {
    multiLangText: { "fr-CA": { widgetTitle: "Titre", widgetButtonText: "Voir" } },
    widgetConfiguration: {
      title: "Bundle title",
      description: "Description",
      buttonText: "View bundle",
      imageUrl: "https://cdn.example.test/offer.jpg",
      displayConfiguration: {
        showOnAllBundleProducts: true,
        selectedProducts: [{ productId: "111" }],
        collectionsSelectedData: [{ collectionId: "222" }],
      },
    },
  };

  it("normalizes a valid enabled button configuration without requiring a title", () => {
    const result = normalizeFpbUpsellSave({
      enabled: true,
      displayMode: "button",
      displayOn: "all",
      autoSelectBrowsedProduct: true,
      config: { ...baseConfig, widgetConfiguration: { ...baseConfig.widgetConfiguration, title: "" } },
    });

    expect(result.direct).toEqual({
      upsellWidgetEnabled: true,
      upsellWidgetDisplayMode: "button",
      upsellWidgetDisplayOn: "all",
      autoSelectBrowsedProduct: true,
    });
    expect(result.config.widgetConfiguration.displayConfiguration).toEqual({
      showOnAllBundleProducts: true,
      selectedProducts: [],
      showOnSpecificProductPages: [],
      collectionsSelectedData: [],
      showOnSpecificCollectionPages: [],
    });
  });

  it("requires title in block mode and CTA text in both modes", () => {
    expect(() => normalizeFpbUpsellSave({ enabled: true, displayMode: "block", displayOn: "all", autoSelectBrowsedProduct: false, config: { widgetConfiguration: { title: "", buttonText: "View" } } })).toThrow("title");
    expect(() => normalizeFpbUpsellSave({ enabled: true, displayMode: "button", displayOn: "all", autoSelectBrowsedProduct: false, config: { widgetConfiguration: { buttonText: "" } } })).toThrow("CTA");
  });

  it("persists only the selected targeting branch and rejects an empty specific branch", () => {
    const result = normalizeFpbUpsellSave({ enabled: true, displayMode: "block", displayOn: "specific_products", autoSelectBrowsedProduct: false, config: baseConfig });
    expect(result.config.widgetConfiguration.displayConfiguration.selectedProducts).toEqual([{ productId: "111", graphqlId: "gid://shopify/Product/111" }]);
    expect(result.config.widgetConfiguration.displayConfiguration.collectionsSelectedData).toEqual([]);

    expect(() => normalizeFpbUpsellSave({ enabled: true, displayMode: "button", displayOn: "specific_collections", autoSelectBrowsedProduct: false, config: { widgetConfiguration: { buttonText: "View", displayConfiguration: {} } } })).toThrow("collection");
  });

  it("keeps only localized widget copy strings", () => {
    const result = normalizeFpbUpsellSave({ enabled: true, displayMode: "block", displayOn: "all", autoSelectBrowsedProduct: false, config: baseConfig });
    expect(result.config.multiLangText).toEqual({ "fr-CA": { widgetTitle: "Titre", widgetButtonText: "Voir" } });
  });
});
