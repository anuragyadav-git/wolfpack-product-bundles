import type { LocalizedSubscriptionCopy } from "./bundle-subscriptions";

export interface BundleConfigureLocale {
  locale: string;
  name: string;
  primary: boolean;
}

export type TranslationValuesByLocale = Record<
  string,
  Record<string, string>
>;

export interface TranslationFieldDefinition {
  key: string;
  label: string;
  fallback: string;
  multiline?: boolean;
  headingBefore?: string;
}

type PpbAddonStep = {
  addonLabel?: string | null;
  addonTitle?: string | null;
  addonAddText?: string | null;
  addonReplaceText?: string | null;
  freeGiftName?: string | null;
};

type RuleMessage = { discountText?: string; successMessage?: string };
type RuleMessagesByLocale = Record<string, Record<string, RuleMessage>>;
type SubscriptionTranslations = Record<string, Partial<LocalizedSubscriptionCopy>>;

export function selectDefaultTranslationLocale(
  locales: BundleConfigureLocale[],
): string {
  return locales.find((locale) => locale.primary)?.locale ?? locales[0]?.locale ?? "";
}

export function normalizeTranslationValues(
  valuesByLocale: TranslationValuesByLocale,
): TranslationValuesByLocale {
  const normalized: TranslationValuesByLocale = {};

  for (const [locale, values] of Object.entries(valuesByLocale)) {
    const retainedValues = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value.trim().length > 0),
    );
    if (Object.keys(retainedValues).length > 0) {
      normalized[locale] = retainedValues;
    }
  }

  return normalized;
}

export function buildPpbAddonTranslationFields(
  target: "step" | "section" | "footer",
  step: PpbAddonStep,
  footerMessages: RuleMessage = {},
): TranslationFieldDefinition[] {
  if (target === "section") {
    return [{
      key: "addonSectionTitle",
      label: "Add on Section title",
      fallback: step.freeGiftName ?? "",
    }];
  }
  if (target === "footer") {
    return [
      {
        key: "addonDiscountText",
        label: "Message when rule not met",
        fallback: footerMessages.discountText ?? "",
        multiline: true,
      },
      {
        key: "addonSuccessMessage",
        label: "Success Message",
        fallback: footerMessages.successMessage ?? "",
        multiline: true,
      },
    ];
  }
  return [
    { key: "addonLabel", label: "Step Name", fallback: step.addonLabel ?? step.freeGiftName ?? "" },
    { key: "addonAddText", label: "Add On", fallback: step.addonAddText ?? "" },
    { key: "addonTitle", label: "Step Title", fallback: step.addonTitle ?? "" },
    { key: "addonReplaceText", label: "Replace", fallback: step.addonReplaceText ?? "" },
  ];
}

export function getPpbAddonFooterTranslationValues(
  valuesByLocale: RuleMessagesByLocale,
  stepId: string,
): TranslationValuesByLocale {
  const messageKey = `addons-${stepId}`;
  return Object.fromEntries(
    Object.entries(valuesByLocale).flatMap(([locale, messages]) => {
      const message = messages[messageKey];
      if (!message) return [];
      const values = normalizeTranslationValues({
        [locale]: {
          addonDiscountText: message.discountText ?? "",
          addonSuccessMessage: message.successMessage ?? "",
        },
      });
      return values[locale] ? [[locale, values[locale]]] : [];
    }),
  );
}

export function mergePpbAddonFooterTranslationValues(
  current: RuleMessagesByLocale,
  stepId: string,
  translations: TranslationValuesByLocale,
): RuleMessagesByLocale {
  const messageKey = `addons-${stepId}`;
  const next: RuleMessagesByLocale = Object.fromEntries(
    Object.entries(current).map(([locale, messages]) => [locale, { ...messages }]),
  );
  const normalizedTranslations = normalizeTranslationValues(translations);
  const locales = new Set([...Object.keys(current), ...Object.keys(translations)]);

  for (const locale of locales) {
    const values = normalizedTranslations[locale];
    if (values) {
      next[locale] = {
        ...(next[locale] ?? {}),
        [messageKey]: {
          ...(values.addonDiscountText ? { discountText: values.addonDiscountText } : {}),
          ...(values.addonSuccessMessage ? { successMessage: values.addonSuccessMessage } : {}),
        },
      };
    } else if (next[locale]) {
      delete next[locale][messageKey];
      if (Object.keys(next[locale]).length === 0) delete next[locale];
    }
  }

  return next;
}

export function flattenSubscriptionTranslations(
  translations: SubscriptionTranslations,
): TranslationValuesByLocale {
  const flattened: TranslationValuesByLocale = {};

  for (const [locale, copy] of Object.entries(translations)) {
    const { planCopy, ...sharedCopy } = copy;
    const values: Record<string, string> = Object.fromEntries(
      Object.entries(sharedCopy).filter((entry): entry is [string, string] => (
        typeof entry[1] === "string"
      )),
    );
    for (const [planId, plan] of Object.entries(planCopy ?? {})) {
      for (const key of ["displayName", "discountPill", "description"] as const) {
        if (typeof plan[key] === "string") {
          values[`plan:${planId}:${key}`] = plan[key];
        }
      }
    }
    const normalized = normalizeTranslationValues({ [locale]: values });
    if (normalized[locale]) flattened[locale] = normalized[locale];
  }

  return flattened;
}

export function expandSubscriptionTranslationValues(
  valuesByLocale: TranslationValuesByLocale,
): SubscriptionTranslations {
  const translations: SubscriptionTranslations = {};

  for (const [locale, values] of Object.entries(
    normalizeTranslationValues(valuesByLocale),
  )) {
    const copy: Partial<LocalizedSubscriptionCopy> = {};
    for (const [key, value] of Object.entries(values)) {
      const planField = key.match(/^plan:(.*):(displayName|discountPill|description)$/);
      if (planField) {
        const [, planId, field] = planField;
        copy.planCopy = {
          ...(copy.planCopy ?? {}),
          [planId]: {
            ...(copy.planCopy?.[planId] ?? {}),
            [field]: value,
          },
        };
      } else {
        (copy as Record<string, unknown>)[key] = value;
      }
    }
    translations[locale] = copy;
  }

  return translations;
}
