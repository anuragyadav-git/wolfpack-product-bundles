type LocaleValues = Record<string, any>;
type ValuesByLocale = Record<string, LocaleValues> | null | undefined;

function findLocaleValues(
  valuesByLocale: ValuesByLocale,
  locale: string,
): LocaleValues | undefined {
  if (!valuesByLocale || !locale) return undefined;

  const normalizedLocale = locale.toLowerCase();
  const exactKey = Object.keys(valuesByLocale).find(
    (key) => key.toLowerCase() === normalizedLocale,
  );
  if (exactKey) return valuesByLocale[exactKey];

  const baseLocale = normalizedLocale.split("-")[0];
  const baseKey = Object.keys(valuesByLocale).find(
    (key) => key.toLowerCase() === baseLocale,
  );
  return baseKey ? valuesByLocale[baseKey] : undefined;
}

function findLocaleString(
  valuesByLocale: Record<string, string> | null | undefined,
  locale: string,
): string | undefined {
  if (!valuesByLocale || !locale) return undefined;

  const normalizedLocale = locale.toLowerCase();
  const exactKey = Object.keys(valuesByLocale).find(
    (key) => key.toLowerCase() === normalizedLocale,
  );
  const baseLocale = normalizedLocale.split("-")[0];
  const baseKey = Object.keys(valuesByLocale).find(
    (key) => key.toLowerCase() === baseLocale,
  );
  const value = valuesByLocale[exactKey ?? baseKey ?? ""];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function nonBlankValues(values: LocaleValues | undefined): LocaleValues {
  if (!values) return {};
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => (
      typeof value !== "string" || value.trim().length > 0
    )),
  );
}

function overlayLocaleMap(
  baseValues: LocaleValues | null | undefined,
  valuesByLocale: ValuesByLocale,
  locale: string,
): LocaleValues {
  return {
    ...(baseValues ?? {}),
    ...nonBlankValues(findLocaleValues(valuesByLocale, locale)),
  };
}

function localizeCategory(category: any, locale: string): any {
  const translated = nonBlankValues(findLocaleValues(category?.multiLangData, locale));
  return { ...category, ...translated };
}

function localizeStep(step: any, locale: string): any {
  const translated = nonBlankValues(findLocaleValues(step?.multiLangData, locale));
  const localizedStep = {
    ...step,
    ...(translated.productPageStepText ? { name: translated.productPageStepText } : {}),
    ...(translated.productPageSubtext ? { pageTitle: translated.productPageSubtext } : {}),
    ...(translated.addonLabel ? { addonLabel: translated.addonLabel } : {}),
    ...(translated.addonTitle ? { addonTitle: translated.addonTitle } : {}),
    ...(translated.addonAddText ? { addonAddText: translated.addonAddText } : {}),
    ...(translated.addonReplaceText ? { addonReplaceText: translated.addonReplaceText } : {}),
    ...(translated.addonSectionTitle ? { freeGiftName: translated.addonSectionTitle } : {}),
  };

  if (Array.isArray(step?.categories)) {
    localizedStep.categories = step.categories.map((category: any) => (
      localizeCategory(category, locale)
    ));
  }
  if (Array.isArray(step?.StepCategory)) {
    localizedStep.StepCategory = step.StepCategory.map((category: any) => (
      localizeCategory(category, locale)
    ));
  }

  return localizedStep;
}

function localizePricing(pricing: any, locale: string): any {
  if (!pricing) return pricing;

  const messages = pricing.messages ?? {};
  const displayOptions = pricing.displayOptions ?? messages.displayOptions ?? {};
  const quantityOptions = displayOptions.bundleQuantityOptions ?? {};
  const localizedMessages = {
    ...messages,
    ...(findLocaleString(messages.successMessageByLocale, locale)
      ? { successMessage: findLocaleString(messages.successMessageByLocale, locale) }
      : {}),
    ruleMessages: overlayLocaleMap(
      messages.ruleMessages,
      messages.ruleMessagesByLocale,
      locale,
    ),
    tierTextByRuleId: overlayLocaleMap(
      messages.tierTextByRuleId,
      messages.tierTextByLocaleByRuleId,
      locale,
    ),
  };
  const localizedDisplayOptions = {
    ...displayOptions,
    bundleQuantityOptions: {
      ...quantityOptions,
      optionsByRuleId: overlayLocaleMap(
        quantityOptions.optionsByRuleId,
        quantityOptions.optionsByLocaleByRuleId,
        locale,
      ),
    },
  };

  return {
    ...pricing,
    messages: localizedMessages,
    displayOptions: localizedDisplayOptions,
  };
}

function localizePersonalization(personalizationData: any, locale: string): any {
  const addonProducts = personalizationData?.addonProducts;
  if (!addonProducts) return personalizationData;

  const translated = nonBlankValues(
    findLocaleValues(addonProducts.multiLangData, locale),
  );
  const tiers = Array.isArray(addonProducts.tiers)
    ? addonProducts.tiers.map((tier: any, index: number) => ({
        ...tier,
        ...(translated[`tier${index + 1}Title`]
          ? { title: translated[`tier${index + 1}Title`] }
          : {}),
      }))
    : addonProducts.tiers;
  const addonsMessaging = {
    ...(addonProducts.addonsMessaging ?? {}),
  };
  const tierCount = Math.max(
    Array.isArray(addonProducts.tiers) ? addonProducts.tiers.length : 0,
    1,
  );
  for (let index = 0; index < tierCount; index += 1) {
    const tierKey = `tier${index + 1}`;
    const ineligibleState = translated[`${tierKey}MessageWhenRuleNotMet`];
    const eligibleState = translated[`${tierKey}SuccessMessage`];
    if (ineligibleState || eligibleState) {
      addonsMessaging[tierKey] = {
        ...(addonsMessaging[tierKey] ?? {}),
        ...(ineligibleState ? { ineligibleState } : {}),
        ...(eligibleState ? { eligibleState } : {}),
      };
    }
  }

  return {
    ...personalizationData,
    ...(translated.personalizeStepText
      ? { personalizeStepText: translated.personalizeStepText }
      : {}),
    ...(translated.personalizePageSubtext
      ? { personalizePageSubtext: translated.personalizePageSubtext }
      : {}),
    addonProducts: {
      ...addonProducts,
      ...(translated.addonProductsTitle
        ? { title: translated.addonProductsTitle }
        : {}),
      tiers,
      addonsMessaging,
    },
  };
}

export function localizeBundleConfig(bundle: any, locale: string): any {
  if (!bundle || !locale) return bundle;

  const localizedUpsell = nonBlankValues(
    findLocaleValues(bundle.bundleUpsellConfig?.multiLangText, locale),
  );
  const {
    widgetTitle,
    widgetDescription,
    widgetButtonText,
    upsellConfiguration,
    ...otherLocalizedUpsell
  } = localizedUpsell;
  return {
    ...bundle,
    textOverrides: overlayLocaleMap(
      bundle.textOverrides,
      bundle.textOverridesByLocale,
      locale,
    ),
    bundleUpsellConfig: bundle.bundleUpsellConfig
      ? {
          ...bundle.bundleUpsellConfig,
          ...otherLocalizedUpsell,
          widgetConfiguration: {
            ...(bundle.bundleUpsellConfig.widgetConfiguration ?? {}),
            ...(widgetTitle ? { title: widgetTitle } : {}),
            ...(widgetDescription ? { description: widgetDescription } : {}),
            ...(widgetButtonText ? { buttonText: widgetButtonText } : {}),
          },
          upsellConfiguration: {
            ...(bundle.bundleUpsellConfig.upsellConfiguration ?? {}),
            ...nonBlankValues(upsellConfiguration),
          },
        }
      : bundle.bundleUpsellConfig,
    personalizationData: localizePersonalization(
      bundle.personalizationData,
      locale,
    ),
    steps: Array.isArray(bundle.steps)
      ? bundle.steps.map((step: any) => localizeStep(step, locale))
      : bundle.steps,
    pricing: localizePricing(bundle.pricing, locale),
  };
}
