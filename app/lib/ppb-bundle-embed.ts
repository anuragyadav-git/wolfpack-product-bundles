export type PpbBundleEmbedDisplayConfiguration = {
  showOnAllBundleProducts: boolean;
  selectedProducts: unknown[];
  showOnSpecificProductPages: unknown[];
  collectionsSelectedData: unknown[];
  showOnSpecificCollectionPages: unknown[];
};

export type PpbBundleEmbedConfig = {
  upsellConfiguration: {
    isEnabled: boolean;
    title: string;
    subTitle: string;
    displayConfiguration: PpbBundleEmbedDisplayConfiguration;
    useLinkProductAsDefaultProduct: boolean;
  };
  multiLangText: Record<
    string,
    { upsellConfiguration?: { title?: string; subTitle?: string } }
  >;
};

export type PpbBundleEmbedValidationIssue = {
  path: "embed.title" | "embed.products" | "embed.collections";
  message: string;
};

const LEGACY_EMBED_OVERRIDE_KEYS = new Set([
  "bundleEmbedEnabled",
  "embedTitle",
  "embedSubTitle",
  "embedDisplayOn",
  "embedAddBrowsedProduct",
]);

const EMPTY_DISPLAY_CONFIGURATION: PpbBundleEmbedDisplayConfiguration = {
  showOnAllBundleProducts: true,
  selectedProducts: [],
  showOnSpecificProductPages: [],
  collectionsSelectedData: [],
  showOnSpecificCollectionPages: [],
};

export const PPB_BUNDLE_EMBED_DEFAULT: PpbBundleEmbedConfig = {
  upsellConfiguration: {
    isEnabled: false,
    title: "Build Your Bundle & Save More",
    subTitle: "",
    displayConfiguration: EMPTY_DISPLAY_CONFIGURATION,
    useLinkProductAsDefaultProduct: false,
  },
  multiLangText: {},
};

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function copy(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export function normalizePpbBundleEmbedConfig(
  bundleUpsellConfig: unknown,
): PpbBundleEmbedConfig {
  const root = record(bundleUpsellConfig);
  const upsell = record(root.upsellConfiguration);
  const display = record(upsell.displayConfiguration);
  const translations = record(root.multiLangText);
  const multiLangText = Object.fromEntries(
    Object.entries(translations).flatMap(([locale, rawEntry]: any) => {
      const localized = record(record(rawEntry).upsellConfiguration);
      if (!locale.trim() || Object.keys(localized).length === 0) return [];
      const entry: { title?: string; subTitle?: string } = {};
      if (typeof localized.title === "string") entry.title = localized.title.trim();
      if (typeof localized.subTitle === "string") entry.subTitle = localized.subTitle.trim();
      return [[locale, { upsellConfiguration: entry }]];
    }),
  );

  return {
    upsellConfiguration: {
      isEnabled: upsell.isEnabled === true,
      title: copy(upsell.title, PPB_BUNDLE_EMBED_DEFAULT.upsellConfiguration.title),
      subTitle: copy(upsell.subTitle),
      displayConfiguration: {
        showOnAllBundleProducts: display.showOnAllBundleProducts !== false,
        selectedProducts: list(display.selectedProducts),
        showOnSpecificProductPages: list(display.showOnSpecificProductPages),
        collectionsSelectedData: list(display.collectionsSelectedData),
        showOnSpecificCollectionPages: list(display.showOnSpecificCollectionPages),
      },
      useLinkProductAsDefaultProduct:
        upsell.useLinkProductAsDefaultProduct === true,
    },
    multiLangText,
  };
}

export function removeLegacyPpbEmbedTextOverrides<T>(
  overrides: Record<string, T>,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(overrides).filter(
      ([key]: any) => !LEGACY_EMBED_OVERRIDE_KEYS.has(key),
    ),
  );
}

export function serializePpbBundleEmbedConfig(
  config: PpbBundleEmbedConfig,
): PpbBundleEmbedConfig {
  return normalizePpbBundleEmbedConfig(config);
}

export function localizePpbBundleEmbed(
  config: PpbBundleEmbedConfig,
  locale: string,
): { title: string; subTitle: string } {
  const normalizedLocale = locale.trim();
  const language = normalizedLocale.split("-")[0];
  const localized = {
    ...(config.multiLangText[language]?.upsellConfiguration ?? {}),
    ...(config.multiLangText[normalizedLocale]?.upsellConfiguration ?? {}),
  };
  return {
    title:
      typeof localized.title === "string"
        ? localized.title
        : config.upsellConfiguration.title,
    subTitle:
      typeof localized.subTitle === "string"
        ? localized.subTitle
        : config.upsellConfiguration.subTitle,
  };
}

export function mergePpbBundleEmbedTranslations(
  existing: Record<string, Record<string, unknown>>,
  embedTranslations: PpbBundleEmbedConfig["multiLangText"],
): Record<string, Record<string, unknown>> {
  const locales = new Set([
    ...Object.keys(existing),
    ...Object.keys(embedTranslations),
  ]);
  return Object.fromEntries(
    [...locales].map((locale) => [
      locale,
      {
        ...(existing[locale] ?? {}),
        ...(embedTranslations[locale] ?? {}),
        upsellConfiguration:
          embedTranslations[locale]?.upsellConfiguration ??
          record(existing[locale]?.upsellConfiguration),
      },
    ]),
  );
}

export function clearPpbBundleEmbedTargets(
  displayConfiguration: PpbBundleEmbedDisplayConfiguration,
): PpbBundleEmbedDisplayConfiguration {
  return {
    showOnAllBundleProducts: false,
    selectedProducts: [],
    showOnSpecificProductPages: [],
    collectionsSelectedData: [],
    showOnSpecificCollectionPages: [],
  };
}

export function validatePpbBundleEmbedConfig(
  config: PpbBundleEmbedConfig,
  targetMode?: string,
): PpbBundleEmbedValidationIssue[] {
  const upsell = config.upsellConfiguration;
  if (!upsell.isEnabled) return [];
  const issues: PpbBundleEmbedValidationIssue[] = [];
  if (!upsell.title.trim()) {
    issues.push({ path: "embed.title", message: "Enter a bundle embed title." });
  }
  const display = upsell.displayConfiguration;
  if (
    targetMode === "specific_products" &&
    display.selectedProducts.length === 0 &&
    display.showOnSpecificProductPages.length === 0
  ) {
    issues.push({ path: "embed.products", message: "Add at least one product." });
  }
  if (
    targetMode === "specific_collections" &&
    display.collectionsSelectedData.length === 0 &&
    display.showOnSpecificCollectionPages.length === 0
  ) {
    issues.push({ path: "embed.collections", message: "Add at least one collection." });
  }
  return issues;
}
