import { translateAdmin } from "~/i18n/config";
import { MultiLanguageTextModal } from "../../../../components/bundle-configure/MultiLanguageTextModal";

type ShopLocale = { locale: string; name: string; primary: boolean };
type RuleCopy = { label?: string; subtext?: string };
type TierCopy = { tierText?: string; tierSubtext?: string };

type PricingTranslationRule = {
  id: string;
  heading: string;
  quantityFallback: RuleCopy;
  tierFallback: TierCopy;
};

type PricingTranslationModalsProps = {
  locales: ShopLocale[];
  rules: PricingTranslationRule[];
  quantity: {
    open: boolean;
    activeLocale: string;
    values: Record<string, Record<string, RuleCopy>>;
    onActiveLocaleChange: (locale: string) => void;
    onApply: (values: Record<string, Record<string, RuleCopy>>) => void;
    onClose: () => void;
  };
  progress: {
    open: boolean;
    activeLocale: string;
    values: Record<string, Record<string, TierCopy>>;
    onActiveLocaleChange: (locale: string) => void;
    onApply: (values: Record<string, Record<string, TierCopy>>) => void;
    onClose: () => void;
  };
};

function flattenRuleValues(
  valuesByLocale: Record<
    string,
    Record<string, Record<string, string | undefined>>
  >,
  keys: string[]
) {
  return Object.fromEntries(
    Object.entries(valuesByLocale).map(([locale, valuesByRuleId]) => [
      locale,
      Object.fromEntries(
        Object.entries(valuesByRuleId).flatMap(([ruleId, values]) =>
          keys.flatMap((key) =>
            typeof values[key] === "string"
              ? [[`${ruleId}:${key}`, values[key]]]
              : []
          )
        )
      ),
    ])
  );
}

function expandRuleValues<T extends Record<string, string | undefined>>(
  valuesByLocale: Record<string, Record<string, string>>,
  keys: string[]
): Record<string, Record<string, T>> {
  const expanded: Record<string, Record<string, T>> = {};
  for (const [locale, values] of Object.entries(valuesByLocale)) {
    for (const [compoundKey, value] of Object.entries(values)) {
      const separator = compoundKey.lastIndexOf(":");
      const ruleId = compoundKey.slice(0, separator);
      const key = compoundKey.slice(separator + 1);
      if (!ruleId || !keys.includes(key)) continue;
      expanded[locale] ??= {};
      expanded[locale][ruleId] = {
        ...(expanded[locale][ruleId] ?? {}),
        [key]: value,
      } as T;
    }
  }
  return expanded;
}

export function PricingTranslationModals({
  locales,
  rules,
  quantity,
  progress,
}: PricingTranslationModalsProps) {
  const quantityFields = rules.flatMap((rule) => [
    {
      key: `${rule.id}:label`,
      label: "Box Label",
      fallback: rule.quantityFallback.label ?? "",
      headingBefore: rule.heading,
    },
    {
      key: `${rule.id}:subtext`,
      label: "Box Subtext",
      fallback: rule.quantityFallback.subtext ?? "",
    },
  ]);
  const progressFields = rules.flatMap((rule) => [
    {
      key: `${rule.id}:tierText`,
      label: "Tier Text",
      fallback: rule.tierFallback.tierText ?? "",
      multiline: true,
      headingBefore: rule.heading,
    },
    {
      key: `${rule.id}:tierSubtext`,
      label: "Tier Subtext",
      fallback: rule.tierFallback.tierSubtext ?? "",
      multiline: true,
    },
  ]);

  return (
    <>
      <MultiLanguageTextModal
        id="discount-bundle-quantity-language-modal"
        open={quantity.open}
        title={translateAdmin("common.multiLanguage.title")}
        layout="compact"
        locales={locales}
        activeLocale={quantity.activeLocale}
        fields={quantityFields}
        valuesByLocale={flattenRuleValues(quantity.values, [
          "label",
          "subtext",
        ])}
        onActiveLocaleChange={quantity.onActiveLocaleChange}
        onSave={(values) =>
          quantity.onApply(
            expandRuleValues<RuleCopy>(values, ["label", "subtext"])
          )
        }
        onClose={quantity.onClose}
      />
      <MultiLanguageTextModal
        id="discount-progress-language-modal"
        open={progress.open}
        title={translateAdmin("common.multiLanguage.title")}
        layout="compact"
        locales={locales}
        activeLocale={progress.activeLocale}
        fields={progressFields}
        valuesByLocale={flattenRuleValues(progress.values, [
          "tierText",
          "tierSubtext",
        ])}
        onActiveLocaleChange={progress.onActiveLocaleChange}
        onSave={(values) =>
          progress.onApply(
            expandRuleValues<TierCopy>(values, ["tierText", "tierSubtext"])
          )
        }
        onClose={progress.onClose}
      />
    </>
  );
}
