import {
  localizePpbBundleEmbed,
  normalizePpbBundleEmbedConfig,
} from "../lib/ppb-bundle-embed";
import { applyOfferPriority } from "../lib/offer-policy-decision";
import { resolveOfferCountryEligibility } from "../lib/offer-country-eligibility";

type AnyRecord = Record<string, any>;

export type PpbBundleEmbedResolution = {
  bundle: AnyRecord;
  title: string;
  subTitle: string;
  preselectBrowsedProduct: boolean;
};

function identifiers(value: unknown): string[] {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return [];
  return raw.includes("/") ? [raw, raw.split("/").pop() ?? ""] : [raw];
}

function resourceIdentifiers(value: unknown, kind: "product" | "collection") {
  const item = value && typeof value === "object" ? (value as AnyRecord) : {};
  const values = kind === "product"
    ? [item.productId, item.graphqlId, item.admin_graphql_api_id, item.id, item.handle, item.parentProductId]
    : [item.collectionId, item.graphqlId, item.admin_graphql_api_id, item.id, item.handle];
  return new Set(values.flatMap((value) => identifiers(value)));
}

function resources(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function overlaps(left: Set<string>, right: Set<string>) {
  return [...left].some((value) => right.has(value));
}

function targetSet(values: unknown[], kind: "product" | "collection") {
  return new Set(values.flatMap((value) => [...resourceIdentifiers(value, kind)]));
}

function enabledStepMatches(
  step: AnyRecord,
  productIds: Set<string>,
  collectionIds: Set<string>,
) {
  if (step.enabled === false || step.isFreeGift === true) return false;
  const productSources = [step.StepProduct, step.products];
  const collectionSources = [step.collections];
  for (const category of resources(step.StepCategory ?? step.categories) as AnyRecord[]) {
    productSources.push(category.products);
    collectionSources.push(category.collections ?? category.collectionsSelectedData);
  }
  return productSources.some((source) =>
    resources(source).some((item) => overlaps(resourceIdentifiers(item, "product"), productIds)),
  ) || collectionSources.some((source) =>
    resources(source).some((item) => overlaps(resourceIdentifiers(item, "collection"), collectionIds)),
  );
}

function bundleMatches(bundle: AnyRecord, context: PpbBundleEmbedContext) {
  const config = normalizePpbBundleEmbedConfig(bundle.bundleUpsellConfig);
  if (!config.upsellConfiguration.isEnabled) return false;
  const display = config.upsellConfiguration.displayConfiguration;
  const productIds = new Set([
    ...identifiers(context.productId),
    ...identifiers(`gid://shopify/Product/${identifiers(context.productId).pop() ?? ""}`),
    ...identifiers(context.productHandle),
  ]);
  const collectionIds = new Set(
    context.collectionIds.flatMap((value) => [
      ...identifiers(value),
      ...identifiers(`gid://shopify/Collection/${identifiers(value).pop() ?? ""}`),
    ]),
  );
  if (display.showOnAllBundleProducts) {
    return resources(bundle.steps).some((step) =>
      enabledStepMatches(step as AnyRecord, productIds, collectionIds),
    );
  }
  const productTargets = [...display.selectedProducts, ...display.showOnSpecificProductPages];
  if (productTargets.length > 0) {
    return overlaps(targetSet(productTargets, "product"), productIds);
  }
  const collectionTargets = [
    ...display.collectionsSelectedData,
    ...display.showOnSpecificCollectionPages,
  ];
  return collectionTargets.length > 0 && overlaps(targetSet(collectionTargets, "collection"), collectionIds);
}

export type PpbBundleEmbedContext = {
  productId: string;
  productHandle: string;
  collectionIds: string[];
  locale: string;
  countryCode?: string | null;
  now?: Date;
};

export function selectEligiblePpbBundleEmbed(
  bundles: AnyRecord[],
  context: PpbBundleEmbedContext,
): PpbBundleEmbedResolution | null {
  const candidates = bundles
    .filter((bundle) => bundle.bundleType === "product_page")
    .filter((bundle) => bundle.status === "active" || bundle.status === "unlisted")
    .filter((bundle) => bundle.offerPolicy?.specificLinkRequired !== true)
    .filter((bundle) => resolveOfferCountryEligibility(
      bundle.offerPolicy,
      context.countryCode,
    ))
    .filter((bundle) => bundleMatches(bundle, context));
  const selected = applyOfferPriority<AnyRecord & { id: string }>(
    candidates as Array<AnyRecord & { id: string }>,
    context.now,
  )[0];
  if (!selected) return null;
  const config = normalizePpbBundleEmbedConfig(selected.bundleUpsellConfig);
  const localized = localizePpbBundleEmbed(config, context.locale);
  return {
    bundle: selected,
    title: localized.title,
    subTitle: localized.subTitle,
    preselectBrowsedProduct:
      config.upsellConfiguration.useLinkProductAsDefaultProduct,
  };
}
