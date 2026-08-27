export type FpbUpsellOfferDto = {
  bundleId: string;
  publicNumber: number;
  bundleName: string;
  targetPath: string;
  mode: "button" | "block";
  copy: { title: string; description: string; buttonText: string };
  imageUrl: string | null;
  preselectBrowsedProduct: boolean;
};

type AnyRecord = Record<string, any>;

function id(value: unknown): string {
  const raw = String(value ?? "").trim();
  return raw.includes("/") ? (raw.split("/").pop() ?? "") : raw;
}
function resourceId(value: unknown, kind: "product" | "collection"): string {
  const item = value && typeof value === "object" ? value as AnyRecord : {};
  return id(kind === "product"
    ? item.productId ?? item.graphqlId ?? item.id ?? item.parentProductId
    : item.collectionId ?? item.graphqlId ?? item.admin_graphql_api_id ?? item.id);
}

function resources(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stepContainsContext(step: AnyRecord, productId: string, collectionIds: Set<string>) {
  if (step.enabled === false || step.isFreeGift === true) return false;
  const productSources = [step.StepProduct, step.products];
  const collectionSources = [step.collections];
  for (const category of resources(step.StepCategory ?? step.categories) as AnyRecord[]) {
    productSources.push(category.products);
    collectionSources.push(category.collections ?? category.collectionsSelectedData);
  }
  if (productSources.some((source) => resources(source).some((item) => resourceId(item, "product") === productId))) return true;
  return collectionSources.some((source) => resources(source).some((item) => collectionIds.has(resourceId(item, "collection"))));
}

function selectedTargetMatches(bundle: AnyRecord, productId: string, collectionIds: Set<string>) {
  const widget = bundle.bundleUpsellConfig?.widgetConfiguration ?? {};
  const display = widget.displayConfiguration ?? {};
  if (bundle.upsellWidgetDisplayOn === "specific_products") {
    const targets = resources(display.selectedProducts).length > 0
      ? resources(display.selectedProducts)
      : resources(display.showOnSpecificProductPages);
    return targets.length > 0 && targets.some((item) => resourceId(item, "product") === productId);
  }
  if (bundle.upsellWidgetDisplayOn === "specific_collections") {
    const targets = resources(display.collectionsSelectedData).length > 0
      ? resources(display.collectionsSelectedData)
      : resources(display.showOnSpecificCollectionPages);
    return targets.length > 0 && targets.some((item) => collectionIds.has(resourceId(item, "collection")));
  }
  return resources(bundle.steps).some((step) => stepContainsContext(step as AnyRecord, productId, collectionIds));
}

function copyForLocale(bundle: AnyRecord, locale: string) {
  const widget = bundle.bundleUpsellConfig?.widgetConfiguration ?? {};
  const translations = bundle.bundleUpsellConfig?.multiLangText ?? {};
  const normalizedLocale = locale.trim();
  const language = normalizedLocale.split("-")[0];
  const localized = translations[normalizedLocale] ?? translations[language] ?? {};
  return {
    title: String(localized.widgetTitle ?? widget.title ?? ""),
    description: String(localized.widgetDescription ?? widget.description ?? ""),
    buttonText: String(localized.widgetButtonText ?? widget.buttonText ?? ""),
  };
}

export function selectEligibleFpbUpsells(
  bundles: AnyRecord[],
  context: { productId: string; collectionIds: string[]; locale: string },
): FpbUpsellOfferDto[] {
  const productId = id(context.productId);
  const collectionIds = new Set(context.collectionIds.map((value) => id(value)).filter(Boolean));
  const seen = new Set<string>();
  return bundles
    .filter((bundle) => bundle.bundleType === "full_page")
    .filter((bundle) => bundle.status === "active" || bundle.status === "unlisted")
    .filter((bundle) => bundle.upsellWidgetEnabled === true)
    .filter((bundle) => Number.isInteger(bundle.publicNumber) && bundle.publicNumber > 0)
    .filter((bundle) => selectedTargetMatches(bundle, productId, collectionIds))
    .sort((a, b) => a.publicNumber - b.publicNumber)
    .flatMap((bundle) => {
      if (seen.has(bundle.id)) return [];
      seen.add(bundle.id);
      const mode = bundle.upsellWidgetDisplayMode === "button" ? "button" : "block";
      const copy = copyForLocale(bundle, context.locale);
      if (!copy.buttonText || (mode === "block" && !copy.title)) return [];
      return [{
        bundleId: String(bundle.id),
        publicNumber: Number(bundle.publicNumber),
        bundleName: String(bundle.name),
        targetPath: `/apps/product-bundles/wpb/${bundle.publicNumber}`,
        mode,
        copy,
        imageUrl: bundle.bundleUpsellConfig?.widgetConfiguration?.imageUrl || null,
        preselectBrowsedProduct: bundle.autoSelectBrowsedProduct === true,
      } satisfies FpbUpsellOfferDto];
    });
}
