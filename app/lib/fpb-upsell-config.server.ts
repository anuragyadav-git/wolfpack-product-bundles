export type FpbUpsellDisplayMode = "button" | "block";
export type FpbUpsellDisplayOn = "all" | "specific_products" | "specific_collections";

export class FpbUpsellValidationError extends Error {}

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numericResourceId(value: unknown): string {
  const source = record(value);
  const candidate = source.productId ?? source.collectionId ?? source.graphqlId ?? source.id;
  const normalized = text(candidate);
  return normalized.includes("/") ? (normalized.split("/").pop() ?? "") : normalized;
}

function compactResources(value: unknown, kind: "product" | "collection") {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    const source = record(item);
    const id = numericResourceId(source);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const graphqlId = `gid://shopify/${kind === "product" ? "Product" : "Collection"}/${id}`;
    const result: RecordValue = kind === "product"
      ? { productId: id, graphqlId }
      : { collectionId: id, graphqlId };
    const handle = text(source.handle);
    const title = text(source.title);
    if (handle) result.handle = handle;
    if (title) result.title = title;
    return [result];
  });
}

function localizedCopy(value: unknown) {
  const source = record(value);
  const result: Record<string, Record<string, string>> = {};
  for (const [locale, copyValue] of Object.entries(source)) {
    const normalizedLocale = locale.trim();
    if (!normalizedLocale) continue;
    const copy = record(copyValue);
    const normalized: Record<string, string> = {};
    for (const key of ["widgetTitle", "widgetDescription", "widgetButtonText"] as const) {
      const value = text(copy[key]);
      if (value) normalized[key] = value;
    }
    if (Object.keys(normalized).length > 0) result[normalizedLocale] = normalized;
  }
  return result;
}

export function normalizeFpbUpsellSave(input: {
  enabled: boolean;
  displayMode: unknown;
  displayOn: unknown;
  autoSelectBrowsedProduct: boolean;
  config: unknown;
}) {
  const displayMode: FpbUpsellDisplayMode = input.displayMode === "button" ? "button" : "block";
  const displayOn: FpbUpsellDisplayOn = input.displayOn === "specific_products"
    ? "specific_products"
    : input.displayOn === "specific_collections"
      ? "specific_collections"
      : "all";
  const config = record(input.config);
  const widget = record(config.widgetConfiguration);
  const display = record(widget.displayConfiguration);
  const title = text(widget.title);
  const description = text(widget.description);
  const buttonText = text(widget.buttonText);
  const imageUrl = text(widget.imageUrl);
  const products = compactResources(
    (Array.isArray(display.selectedProducts) && display.selectedProducts.length > 0)
      ? display.selectedProducts
      : display.showOnSpecificProductPages,
    "product",
  );
  const collections = compactResources(
    (Array.isArray(display.collectionsSelectedData) && display.collectionsSelectedData.length > 0)
      ? display.collectionsSelectedData
      : display.showOnSpecificCollectionPages,
    "collection",
  );

  if (input.enabled && !buttonText) throw new FpbUpsellValidationError("Upsell CTA text is required.");
  if (input.enabled && displayMode === "block" && !title) throw new FpbUpsellValidationError("Upsell title is required in Block mode.");
  if (input.enabled && displayOn === "specific_products" && products.length === 0) {
    throw new FpbUpsellValidationError("Select at least one product for the upsell target.");
  }
  if (input.enabled && displayOn === "specific_collections" && collections.length === 0) {
    throw new FpbUpsellValidationError("Select at least one collection for the upsell target.");
  }

  const selectedProducts = displayOn === "specific_products" ? products : [];
  const selectedCollections = displayOn === "specific_collections" ? collections : [];
  return {
    direct: {
      upsellWidgetEnabled: input.enabled,
      upsellWidgetDisplayMode: displayMode,
      upsellWidgetDisplayOn: displayOn,
      autoSelectBrowsedProduct: input.autoSelectBrowsedProduct,
    },
    config: {
      multiLangText: localizedCopy(config.multiLangText),
      languageMode: text(config.languageMode) || text(widget.languageMode) || "SINGLE",
      widgetConfiguration: {
        isEnabled: input.enabled,
        type: "OFFER_WIDGET",
        imageUrl: imageUrl || null,
        title,
        description,
        buttonText,
        displayConfiguration: {
          showOnAllBundleProducts: displayOn === "all",
          selectedProducts,
          showOnSpecificProductPages: selectedProducts,
          collectionsSelectedData: selectedCollections,
          showOnSpecificCollectionPages: selectedCollections,
        },
        useLinkProductAsDefaultProduct: input.autoSelectBrowsedProduct,
        languageMode: text(config.languageMode) || text(widget.languageMode) || "SINGLE",
      },
    },
  };
}
