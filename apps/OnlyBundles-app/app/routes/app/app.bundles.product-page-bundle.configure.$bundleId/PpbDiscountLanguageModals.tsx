import { PricingTranslationModals } from "../_shared/bundle-configure/PricingTranslationModals";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbDiscountLanguageModalsProps = Pick<
  PpbConfigureFlow,
  | "activeBundleQuantityLocale"
  | "activeProgressBarLocale"
  | "isBundleQuantityMultiLangModalOpen"
  | "isProgressBarMultiLangModalOpen"
  | "markAsDirty"
  | "pricingState"
  | "qtyRuleLabels"
  | "qtyRuleSubtexts"
  | "qtyRuleTextsByLocaleByRuleId"
  | "setActiveBundleQuantityLocale"
  | "setActiveProgressBarLocale"
  | "setIsBundleQuantityMultiLangModalOpen"
  | "setIsProgressBarMultiLangModalOpen"
  | "setQtyRuleTextsByLocaleByRuleId"
  | "setTierTextByLocaleByRuleId"
  | "shopLocales"
  | "tierTextByLocaleByRuleId"
  | "tierTextByRuleId"
>;

export function PpbDiscountLanguageModals({
  activeBundleQuantityLocale,
  activeProgressBarLocale,
  isBundleQuantityMultiLangModalOpen,
  isProgressBarMultiLangModalOpen,
  markAsDirty,
  pricingState,
  qtyRuleLabels,
  qtyRuleSubtexts,
  qtyRuleTextsByLocaleByRuleId,
  setActiveBundleQuantityLocale,
  setActiveProgressBarLocale,
  setIsBundleQuantityMultiLangModalOpen,
  setIsProgressBarMultiLangModalOpen,
  setQtyRuleTextsByLocaleByRuleId,
  setTierTextByLocaleByRuleId,
  shopLocales,
  tierTextByLocaleByRuleId,
  tierTextByRuleId,
}: PpbDiscountLanguageModalsProps) {
  const rules = pricingState.discountRules.map(
    (rule, index) => ({
      id: rule.id,
      heading: `Rule #${index + 1}`,
      quantityFallback: {
        label: qtyRuleLabels[rule.id] ?? `Box of ${rule.conditionValue ?? ""}`,
        subtext: qtyRuleSubtexts[rule.id] ?? "",
      },
      tierFallback: tierTextByRuleId[rule.id] ?? {},
    })
  );

  return (
    <PricingTranslationModals
      locales={shopLocales}
      rules={rules}
      quantity={{
        open: isBundleQuantityMultiLangModalOpen,
        activeLocale: activeBundleQuantityLocale,
        values: qtyRuleTextsByLocaleByRuleId,
        onActiveLocaleChange: setActiveBundleQuantityLocale,
        onApply: (values) => {
          setQtyRuleTextsByLocaleByRuleId(
            Object.fromEntries(
              Object.entries(values).map(([locale, valuesByRuleId]) => [
                locale,
                Object.fromEntries(
                  Object.entries(valuesByRuleId).map(([ruleId, value]) => [
                    ruleId,
                    { label: value.label ?? "", subtext: value.subtext ?? "" },
                  ]),
                ),
              ]),
            ),
          );
          markAsDirty();
        },
        onClose: () => setIsBundleQuantityMultiLangModalOpen(false),
      }}
      progress={{
        open: isProgressBarMultiLangModalOpen,
        activeLocale: activeProgressBarLocale,
        values: tierTextByLocaleByRuleId,
        onActiveLocaleChange: setActiveProgressBarLocale,
        onApply: (values) => {
          setTierTextByLocaleByRuleId(
            Object.fromEntries(
              Object.entries(values).map(([locale, valuesByRuleId]) => [
                locale,
                Object.fromEntries(
                  Object.entries(valuesByRuleId).map(([ruleId, value]) => [
                    ruleId,
                    {
                      tierText: value.tierText ?? "",
                      tierSubtext: value.tierSubtext ?? "",
                    },
                  ]),
                ),
              ]),
            ),
          );
          markAsDirty();
        },
        onClose: () => setIsProgressBarMultiLangModalOpen(false),
      }}
    />
  );
}
