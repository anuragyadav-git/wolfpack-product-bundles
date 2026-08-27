import { PricingTranslationModals } from "../_shared/bundle-configure/PricingTranslationModals";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbDiscountLanguageModals() {
  const flow = usePpbConfigureContext();
  const rules = flow.pricingState.discountRules.map((rule: any, index: number) => ({
    id: rule.id,
    heading: `Rule #${index + 1}`,
    quantityFallback: {
      label: flow.qtyRuleLabels[rule.id] ?? `Box of ${rule.conditionValue ?? ""}`,
      subtext: flow.qtyRuleSubtexts[rule.id] ?? "",
    },
    tierFallback: flow.tierTextByRuleId[rule.id] ?? {},
  }));

  return (
    <PricingTranslationModals
      locales={flow.shopLocales}
      rules={rules}
      quantity={{
        open: flow.isBundleQuantityMultiLangModalOpen,
        activeLocale: flow.activeBundleQuantityLocale,
        values: flow.qtyRuleTextsByLocaleByRuleId,
        onActiveLocaleChange: flow.setActiveBundleQuantityLocale,
        onApply: (values) => {
          flow.setQtyRuleTextsByLocaleByRuleId(values as any);
          flow.markAsDirty();
        },
        onClose: () => flow.setIsBundleQuantityMultiLangModalOpen(false),
      }}
      progress={{
        open: flow.isProgressBarMultiLangModalOpen,
        activeLocale: flow.activeProgressBarLocale,
        values: flow.tierTextByLocaleByRuleId,
        onActiveLocaleChange: flow.setActiveProgressBarLocale,
        onApply: (values) => {
          flow.setTierTextByLocaleByRuleId(values as any);
          flow.markAsDirty();
        },
        onClose: () => flow.setIsProgressBarMultiLangModalOpen(false),
      }}
    />
  );
}
