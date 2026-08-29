import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

type UnknownRecord = Record<string, unknown>;

interface NormalizedStep extends UnknownRecord {
  categories: UnknownRecord[];
  filters: unknown;
  products: UnknownRecord[];
}

export interface NormalizedFpbConfiguration extends UnknownRecord {
  defaults: UnknownRecord;
  identity: UnknownRecord;
  presentation: UnknownRecord;
  steps: NormalizedStep[];
  template: UnknownRecord;
}

export interface ConfigurationDiff {
  added: string[];
  changed: string[];
  removed: string[];
}

interface MarkdownInput {
  bundleId: string;
  shop: string;
  label: string;
  capturedAt: string;
  configuration: UnknownRecord;
  configurationHash: string;
  changes: ConfigurationDiff;
}

interface SnapshotInput {
  bundle: unknown;
  expectedShop: string;
  label: string;
  capturedAt?: Date;
  outputRoot: string;
}

const record = (value: unknown): UnknownRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};

const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as UnknownRecord)
        .sort(([left]: any, [right]: any) => left.localeCompare(right))
        .map(([key, child]: any) => [key, canonicalize(child)]),
    );
  }
  return value;
}

function normalizeVariants(value: unknown) {
  if (value === null || value === undefined) return null;
  return array(value).map((entry) => {
    const variant = record(entry);
    return {
      variantId: variant.selectionId ?? variant.variantId ?? variant.id ?? null,
      title: variant.title ?? null,
    };
  });
}

function normalizePickerProducts(value: unknown) {
  if (value === null || value === undefined) return null;
  return array(value).map((entry) => {
    const product = record(entry);
    return {
      productId: product.selectionId ?? product.productId ?? product.id ?? null,
      title: product.title ?? null,
      variants: normalizeVariants(product.variants),
    };
  });
}

function normalizeCollections(value: unknown) {
  if (value === null || value === undefined) return null;
  return array(value).map((entry) => {
    const collection = record(entry);
    return {
      collectionId: collection.selectionId ?? collection.collectionId ?? collection.id ?? null,
      title: collection.title ?? null,
    };
  });
}

function normalizeCategory(value: unknown) {
  const category = record(value);
  return {
    id: category.id ?? null,
    name: category.name ?? "",
    title: category.title ?? null,
    subtitle: category.subTitle ?? null,
    position: category.sortOrder ?? 0,
    products: normalizePickerProducts(category.products),
    collections: normalizeCollections(category.collections),
    conditions: canonicalize(category.conditions ?? null),
    banner: category.categoryBanner ?? null,
    image: category.categoryImg ?? null,
    autoAdvance: category.autoNextStepOnConditionMet ?? false,
    variantsAsProducts: category.displayVariantsAsIndividualProducts ?? false,
    variantsAsSwatches: category.displayVariantsAsSwatches ?? false,
    translations: canonicalize(category.multiLangData ?? null),
  };
}

function normalizeStep(value: unknown) {
  const step = record(value);
  return {
    name: step.name ?? "",
    icon: step.icon ?? null,
    position: step.position ?? 0,
    enabled: step.enabled ?? false,
    pageTitle: step.pageTitle ?? null,
    minimumQuantity: step.minQuantity ?? 0,
    maximumQuantity: step.maxQuantity ?? 0,
    variantsAsProducts: step.displayVariantsAsIndividual ?? false,
    completionCondition: {
      type: step.conditionType ?? null,
      operator: step.conditionOperator ?? null,
      value: step.conditionValue ?? null,
      secondaryOperator: step.conditionOperator2 ?? null,
      secondaryValue: step.conditionValue2 ?? null,
      autoAdvance: step.autoNextStepOnConditionMet ?? false,
    },
    freeGift: {
      enabled: step.isFreeGift ?? false,
      name: step.freeGiftName ?? null,
    },
    addon: {
      label: step.addonLabel ?? null,
      title: step.addonTitle ?? null,
      addText: step.addonAddText ?? null,
      replaceText: step.addonReplaceText ?? null,
      icon: step.addonIconUrl ?? null,
      displayFree: step.addonDisplayFree ?? true,
      tiers: canonicalize(step.addonTiers ?? null),
      unlockAfterCompletion: step.addonUnlockAfterCompletion ?? true,
    },
    defaultSelection: {
      enabled: step.isDefault ?? false,
      variantId: step.defaultVariantId ?? null,
    },
    media: {
      image: step.imageUrl ?? null,
      banner: step.bannerImageUrl ?? null,
      timelineIcon: step.timelineIconUrl ?? null,
    },
    translations: canonicalize(step.multiLangData ?? null),
    filters: canonicalize(step.filters ?? null),
    primaryVariantOption: step.primaryVariantOption ?? null,
    selectionSources: {
      products: normalizePickerProducts(step.products),
      collections: normalizeCollections(step.collections),
    },
    products: array(step.StepProduct).map((entry) => {
      const product = record(entry);
      return {
        productId: product.productId ?? null,
        title: product.title ?? null,
        position: product.position ?? 0,
        minimumQuantity: product.minQuantity ?? 0,
        maximumQuantity: product.maxQuantity ?? 0,
        variants: normalizeVariants(product.variants),
      };
    }),
    categories: array(step.StepCategory).map(normalizeCategory),
  };
}

export function normalizeFpbConfiguration(bundleValue: unknown): NormalizedFpbConfiguration {
  const bundle = record(bundleValue);
  const pricing = bundle.pricing === null ? null : record(bundle.pricing);

  return canonicalize({
    identity: {
      name: bundle.name ?? "",
      description: bundle.description ?? null,
      status: bundle.status ?? null,
    },
    template: {
      designTemplate: bundle.bundleDesignTemplate ?? null,
      designPreset: bundle.bundleDesignPresetId ?? null,
      tierConfiguration: canonicalize(bundle.tierConfig ?? null),
    },
    presentation: {
      templateName: bundle.templateName ?? null,
      promoBannerBackground: bundle.promoBannerBgImage ?? null,
      loadingAnimation: bundle.loadingGif ?? null,
      stepTimeline: bundle.showStepTimeline ?? null,
      floatingBadge: {
        enabled: bundle.floatingBadgeEnabled ?? false,
        text: bundle.floatingBadgeText ?? "",
      },
      banners: {
        desktop: bundle.bundleBannerDesktopUrl ?? null,
        mobile: bundle.bundleBannerMobileUrl ?? null,
      },
      bundleLevelCss: bundle.bundleLevelCss ?? null,
    },
    steps: array(bundle.steps).map(normalizeStep),
    selection: {
      maximumQuantityPerProduct: bundle.maxQtyPerProduct ?? null,
      quantityValidation: canonicalize(bundle.validateQuantityPerProduct ?? null),
      productSlots: {
        enabled: bundle.productSlotsEnabled ?? false,
        icon: bundle.productSlotIconUrl ?? null,
      },
      boxSelection: canonicalize(bundle.boxSelection ?? null),
    },
    pricing: pricing === null ? null : canonicalize({
      enabled: pricing.enabled ?? false,
      method: pricing.method ?? null,
      rules: pricing.rules ?? null,
      showFooter: pricing.showFooter ?? true,
      showProgressBar: pricing.showProgressBar ?? false,
      messages: pricing.messages ?? null,
      messagesByLocale: pricing.ruleMessagesByLocale ?? null,
      displayOptions: pricing.displayOptions ?? null,
      discountDisplayOverride: bundle.discountDisplayOverride ?? null,
    }),
    productPresentation: {
      showPrices: bundle.showProductPrices ?? true,
      showCompareAtPrices: bundle.showCompareAtPrices ?? false,
      variantSelector: bundle.variantSelectorEnabled ?? true,
      showTextOnAddButton: bundle.showTextOnAddButton ?? false,
    },
    summaryAndMedia: {
      cartTitle: bundle.bundleCartTitle ?? null,
      cartSubtitle: bundle.bundleCartSubtitle ?? null,
      textConfiguration: canonicalize(bundle.bundleTextConfig ?? null),
      personalization: canonicalize(bundle.personalizationData ?? null),
    },
    giftsAddonsAndUpsells: {
      upsellWidget: {
        enabled: bundle.upsellWidgetEnabled ?? false,
        displayMode: bundle.upsellWidgetDisplayMode ?? null,
        displayOn: bundle.upsellWidgetDisplayOn ?? null,
        configuration: canonicalize(bundle.bundleUpsellConfig ?? null),
      },
    },
    storefrontBehaviorAndVisibility: {
      redirectToCheckout: bundle.cartRedirectToCheckout ?? false,
      allowQuantityChanges: bundle.allowQuantityChanges ?? true,
      searchBar: bundle.searchBarEnabled ?? false,
      autoSelectBrowsedProduct: bundle.autoSelectBrowsedProduct ?? false,
      singleStepCategoriesAsSteps: bundle.useSingleStepCategoriesAsBundleSteps ?? false,
    },
    defaults: {
      products: canonicalize(bundle.defaultProductsData ?? null),
      preselectedVariantId: bundle.preSelectedProductVariantId ?? null,
    },
    text: {
      overrides: canonicalize(bundle.textOverrides ?? null),
      overridesByLocale: canonicalize(bundle.textOverridesByLocale ?? null),
    },
  }) as NormalizedFpbConfiguration;
}

export function buildConfigurationHash(configuration: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(configuration)))
    .digest("hex");
}

function collectDiff(
  previous: unknown,
  current: unknown,
  currentPath: string,
  changes: ConfigurationDiff,
) {
  const previousObject = previous !== null && typeof previous === "object" && !Array.isArray(previous);
  const currentObject = current !== null && typeof current === "object" && !Array.isArray(current);

  if (!previousObject && currentObject) {
    collectLeaves(current, currentPath, changes.added);
    return;
  }
  if (previousObject && !currentObject) {
    collectLeaves(previous, currentPath, changes.removed);
    return;
  }

  if (previousObject && currentObject) {
    const previousMap = previous as UnknownRecord;
    const currentMap = current as UnknownRecord;
    const keys = [...new Set([...Object.keys(previousMap), ...Object.keys(currentMap)])].sort();
    for (const key of keys) {
      const childPath = currentPath ? `${currentPath}.${key}` : key;
      if (!(key in previousMap)) collectLeaves(currentMap[key], childPath, changes.added);
      else if (!(key in currentMap)) collectLeaves(previousMap[key], childPath, changes.removed);
      else collectDiff(previousMap[key], currentMap[key], childPath, changes);
    }
    return;
  }

  if (JSON.stringify(canonicalize(previous)) !== JSON.stringify(canonicalize(current))) {
    changes.changed.push(currentPath);
  }
}

function collectLeaves(value: unknown, currentPath: string, target: string[]) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as UnknownRecord);
    if (entries.length > 0) {
      for (const [key, child] of entries.sort(([left]: any, [right]: any) => left.localeCompare(right))) {
        collectLeaves(child, `${currentPath}.${key}`, target);
      }
      return;
    }
  }
  target.push(currentPath);
}

export function diffConfigurations(previous: unknown, current: unknown): ConfigurationDiff {
  const changes: ConfigurationDiff = { added: [], changed: [], removed: [] };
  collectDiff(previous, current, "", changes);
  return changes;
}

function state(value: unknown): string {
  if (value === null || value === undefined) return "Not configured";
  if (value === true) return "Enabled";
  if (value === false) return "Disabled";
  if (value === "") return "Empty";
  if (Array.isArray(value) && value.length === 0) return "Empty list";
  if (typeof value === "object" && Object.keys(value as object).length === 0) return "Empty object";
  if (typeof value === "object") return `\`${JSON.stringify(value).replaceAll("|", "\\|")}\``;
  return String(value).replaceAll("|", "\\|");
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function changeList(title: string, values: string[]): string[] {
  return [`### ${title}`, "", ...(values.length ? values.map((value) => `- \`${value}\``) : ["- None"]), ""];
}

export function renderConfigurationMarkdown(input: MarkdownInput): string {
  const presentation = record(input.configuration.presentation);
  const identity = record(input.configuration.identity);
  const pricing = record(input.configuration.pricing);
  const selection = record(input.configuration.selection);
  const productPresentation = record(input.configuration.productPresentation);
  const summaryAndMedia = record(input.configuration.summaryAndMedia);
  const giftsAddonsAndUpsells = record(input.configuration.giftsAddonsAndUpsells);
  const storefrontBehavior = record(input.configuration.storefrontBehaviorAndVisibility);
  const defaults = record(input.configuration.defaults);
  const textConfiguration = record(input.configuration.text);
  const steps = array(input.configuration.steps).map(record);
  const products = steps.flatMap((step) => array(step.products).map(record));
  const categories = steps.flatMap((step) => array(step.categories).map(record));
  const categoryProducts = categories.flatMap((category) => array(category.products).map(record));
  const allProducts = [...products, ...categoryProducts].filter((product, index, values) =>
    values.findIndex((candidate) => candidate.productId === product.productId) === index,
  );
  const title = input.label.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
  const lines = [
    "---",
    "schema_version: 1",
    `id: ${slugify(`${input.bundleId}-${input.label}-${input.capturedAt}`)}`,
    `title: ${yamlString(`FPB Configuration: ${title}`)}`,
    "type: bundle-configuration-snapshot",
    "status: active",
    `summary: ${yamlString(`Merchant configuration snapshot for FPB ${input.bundleId}.`)}`,
    `last_audited: ${input.capturedAt.slice(0, 10)}`,
    "owners:",
    "  - Only Bundles",
    "domains:",
    "  - storefront",
    "systems:",
    "  - bundle-configuration-registry",
    "source_paths:",
    "  - scripts/record-bundle-configuration.ts",
    "related_docs:",
    `  - docs/fixtures/bundle-configurations/fpb/${input.bundleId}/index.md`,
    "tags:",
    "  - fpb",
    "  - configuration",
    "keywords:",
    `  - ${input.label}`,
    "---",
    "",
    `# FPB Configuration: ${title}`,
    "",
    `Bundle: \`${input.bundleId}\``,
    "",
    `Shop: \`${input.shop}\``,
    "",
    `Captured: \`${input.capturedAt}\``,
    `SHA-256: \`${input.configurationHash}\``,
    "",
    "## Identity and status",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Name | ${state(identity.name)} |`,
    `| Description | ${state(identity.description)} |`,
    `| Status | ${state(identity.status)} |`,
    "",
    "## Template and presentation",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Design template | ${state(record(input.configuration.template).designTemplate)} |`,
    `| Design preset | ${state(record(input.configuration.template).designPreset)} |`,
    `| Loading animation | ${state(presentation.loadingAnimation)} |`,
    `| Step timeline | ${state(presentation.stepTimeline)} |`,
    `| Progress bar | ${state(pricing.showProgressBar)} |`,
    "",
    "## Steps, categories, and products",
    "",
    "| Step | Position | Enabled | Products | Categories |",
    "| --- | ---: | --- | ---: | ---: |",
    ...steps.map((step) => `| ${state(step.name)} | ${state(step.position)} | ${state(step.enabled)} | ${array(step.products).length} | ${array(step.categories).length} |`),
    "",
    "### Products",
    "",
    "| Product | Product ID | Position |",
    "| --- | --- | ---: |",
    ...(allProducts.length ? allProducts.map((product) => `| ${state(product.title)} | ${state(product.productId)} | ${state(product.position ?? null)} |`) : ["| None | - | - |"]),
    "",
    "### Categories",
    "",
    "| Category | Position | Products | Collections |",
    "| --- | ---: | ---: | ---: |",
    ...(categories.length ? categories.map((category) => `| ${state(category.name)} | ${state(category.position)} | ${array(category.products).length} | ${array(category.collections).length} |`) : ["| None | - | - | - |"]),
    "",
    "## Selection and quantity",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Maximum quantity per product | ${state(selection.maximumQuantityPerProduct)} |`,
    `| Quantity validation | ${state(selection.quantityValidation)} |`,
    `| Product slots | ${state(selection.productSlots)} |`,
    `| Box selection | ${state(selection.boxSelection)} |`,
    `| Default products | ${state(defaults.products)} |`,
    `| Preselected variant | ${state(defaults.preselectedVariantId)} |`,
    "",
    "## Pricing, discounts, messages, and progress",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Pricing | ${state(pricing.enabled)} |`,
    `| Method | ${state(pricing.method)} |`,
    `| Rules | ${state(pricing.rules)} |`,
    `| Footer | ${state(pricing.showFooter)} |`,
    `| Progress bar | ${state(pricing.showProgressBar)} |`,
    `| Messages | ${state(pricing.messages)} |`,
    `| Localized messages | ${state(pricing.messagesByLocale)} |`,
    `| Display options | ${state(pricing.displayOptions)} |`,
    `| Discount display override | ${state(pricing.discountDisplayOverride)} |`,
    "",
    "## Product and variant presentation",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Product prices | ${state(productPresentation.showPrices)} |`,
    `| Compare-at prices | ${state(productPresentation.showCompareAtPrices)} |`,
    `| Variant selector | ${state(productPresentation.variantSelector)} |`,
    `| Text on add button | ${state(productPresentation.showTextOnAddButton)} |`,
    "",
    "## Summary, media, and CSS",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Cart title | ${state(summaryAndMedia.cartTitle)} |`,
    `| Cart subtitle | ${state(summaryAndMedia.cartSubtitle)} |`,
    `| Bundle text | ${state(summaryAndMedia.textConfiguration)} |`,
    `| Personalization | ${state(summaryAndMedia.personalization)} |`,
    `| Desktop banner | ${state(record(presentation.banners).desktop)} |`,
    `| Mobile banner | ${state(record(presentation.banners).mobile)} |`,
    `| Bundle CSS | ${state(presentation.bundleLevelCss)} |`,
    `| Text overrides | ${state(textConfiguration.overrides)} |`,
    `| Localized text overrides | ${state(textConfiguration.overridesByLocale)} |`,
    "",
    "## Gifts, add-ons, and upsells",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Upsell widget | ${state(giftsAddonsAndUpsells.upsellWidget)} |`,
    `| Step gifts | ${state(steps.map((step) => step.freeGift))} |`,
    `| Step add-ons | ${state(steps.map((step) => step.addon))} |`,
    "",
    "## Storefront behavior and visibility",
    "",
    "| Setting | State |",
    "| --- | --- |",
    `| Redirect to checkout | ${state(storefrontBehavior.redirectToCheckout)} |`,
    `| Quantity changes | ${state(storefrontBehavior.allowQuantityChanges)} |`,
    `| Search bar | ${state(storefrontBehavior.searchBar)} |`,
    `| Auto-select browsed product | ${state(storefrontBehavior.autoSelectBrowsedProduct)} |`,
    `| Single-step categories as steps | ${state(storefrontBehavior.singleStepCategoriesAsSteps)} |`,
    "",
    "## Changes from previous snapshot",
    "",
    ...changeList("Added", input.changes.added),
    ...changeList("Changed", input.changes.changed),
    ...changeList("Removed", input.changes.removed),
    "## Canonical configuration",
    "",
    "```json",
    JSON.stringify(canonicalize(input.configuration), null, 2),
    "```",
    "",
  ];
  return lines.join("\n");
}

export function validateBundleForRecord(bundleValue: unknown, expectedShop: string): void {
  if (!bundleValue) throw new Error("Bundle was not found");
  const bundle = record(bundleValue);
  if (bundle.shopId !== expectedShop) {
    throw new Error(`Bundle ${String(bundle.id)} does not belong to shop ${expectedShop}`);
  }
  if (bundle.bundleType !== "full_page") {
    throw new Error(`Bundle ${String(bundle.id)} is not a full-page bundle`);
  }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function timestampStem(date: Date): string {
  return date.toISOString().replace(/[.:]/g, "-");
}

async function readPreviousConfiguration(directory: string): Promise<unknown | null> {
  let files: string[];
  try {
    files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
  } catch (error: any) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  if (!files.length) return null;
  const snapshot = JSON.parse(await readFile(path.join(directory, files.at(-1)!), "utf8"));
  return snapshot.configuration ?? null;
}

async function renderIndex(directory: string, bundleId: string, shop: string): Promise<string> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort().reverse();
  const entries = await Promise.all(files.map(async (file) => {
    const snapshot = JSON.parse(await readFile(path.join(directory, file), "utf8"));
    const stem = file.slice(0, -5);
    return `| ${snapshot.captured_at} | ${snapshot.label} | \`${String(snapshot.configuration_hash).slice(0, 12)}\` | [Markdown](./${stem}.md) · [JSON](./${file}) |`;
  }));
  return [
    "---",
    "schema_version: 1",
    `id: ${slugify(`fpb-${bundleId}-configuration-history`)}`,
    `title: ${yamlString(`FPB Configuration History: ${bundleId}`)}`,
    "type: bundle-configuration-index",
    "status: active",
    `summary: ${yamlString(`Immutable merchant configuration history for FPB ${bundleId}.`)}`,
    `last_audited: ${new Date().toISOString().slice(0, 10)}`,
    "owners:",
    "  - Only Bundles",
    "domains:",
    "  - storefront",
    "systems:",
    "  - bundle-configuration-registry",
    "source_paths:",
    "  - scripts/record-bundle-configuration.ts",
    "related_docs: []",
    "tags:",
    "  - fpb",
    "  - configuration",
    "keywords:",
    `  - ${bundleId}`,
    "---",
    "",
    `# FPB Configuration History: ${bundleId}`,
    "",
    `Shop: \`${shop}\``,
    "",
    "| Captured | Label | SHA-256 | Files |",
    "| --- | --- | --- | --- |",
    ...entries,
    "",
  ].join("\n");
}

export async function writeConfigurationSnapshot(input: SnapshotInput) {
  validateBundleForRecord(input.bundle, input.expectedShop);
  const bundle = record(input.bundle);
  const capturedAt = input.capturedAt ?? new Date();
  const capturedAtIso = capturedAt.toISOString();
  const label = slugify(input.label);
  if (!label) throw new Error("Snapshot label must contain a letter or number");

  const directory = path.join(input.outputRoot, String(bundle.id));
  const stem = `${timestampStem(capturedAt)}--${label}`;
  const jsonPath = path.join(directory, `${stem}.json`);
  const markdownPath = path.join(directory, `${stem}.md`);
  const indexPath = path.join(directory, "index.md");
  await mkdir(directory, { recursive: true });

  const configuration = normalizeFpbConfiguration(bundle);
  const previous = await readPreviousConfiguration(directory);
  const changes = previous === null
    ? { added: [], changed: [], removed: [] }
    : diffConfigurations(previous, configuration);
  const configurationHash = buildConfigurationHash(configuration);
  const snapshot = {
    schema_version: 1,
    bundle_id: bundle.id,
    bundle_type: "full_page",
    shop: input.expectedShop,
    label,
    captured_at: capturedAtIso,
    configuration_hash: configurationHash,
    configuration,
  };

  try {
    await writeFile(jsonPath, `${JSON.stringify(snapshot, null, 2)}\n`, { flag: "wx" });
    await writeFile(markdownPath, renderConfigurationMarkdown({
      bundleId: String(bundle.id),
      shop: input.expectedShop,
      label,
      capturedAt: capturedAtIso,
      configuration,
      configurationHash,
      changes,
    }), { flag: "wx" });
  } catch (error: any) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`Configuration snapshot ${stem} already exists`);
    }
    throw error;
  }

  await writeFile(indexPath, await renderIndex(directory, String(bundle.id), input.expectedShop));
  return { jsonPath, markdownPath, indexPath, configurationHash, changes };
}
