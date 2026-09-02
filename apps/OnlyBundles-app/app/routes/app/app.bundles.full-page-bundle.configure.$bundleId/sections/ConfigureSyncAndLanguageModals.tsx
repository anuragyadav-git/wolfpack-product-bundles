import { EnablePreviewModal } from "../../../../components/EnablePreviewModal";
import { PricingTranslationModals } from "../../_shared/bundle-configure/PricingTranslationModals";
import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { translateAdmin } from "~/i18n/config";

export function FpbSyncAndLanguageModals({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const rules = flow.pricingState.discountRules.map(
    (rule: any, index: number) => {
      const quantityOption =
        flow.normalizedPricingDisplayOptions.bundleQuantityOptions.options.find(
          (option: any) => option.ruleId === rule.id
        );
      return {
        id: rule.id,
        heading: `Rule #${index + 1}`,
        quantityFallback: {
          label: quantityOption?.label ?? "",
          subtext: quantityOption?.subtext ?? "",
        },
        tierFallback: flow.tierTextByRuleId[rule.id] ?? {},
      };
    }
  );
  const quantityValues =
    flow.pricingState.pricingDisplayOptions.bundleQuantityOptions
      .optionsByLocaleByRuleId ?? {};

  return (
    <>
      <s-modal
        ref={flow.syncModalRef}
        heading={translateAdmin("adminAttributes.syncBundleWithOnlyBundles")}
      >
        <s-stack direction="block" gap="small">
          <s-paragraph>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuresyncandlanguagemodals.syncingRefreshesTheShopifyDataUsedByThisBundleInOnlyBundles"
            )}
          </s-paragraph>
          <s-paragraph>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuresyncandlanguagemodals.theShopifyPageWillBeDeletedAndReCreated"
            )}
          </s-paragraph>
          <s-paragraph>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuresyncandlanguagemodals.allBundleAndComponentMetafieldsWillBeRewritten"
            )}
          </s-paragraph>
          <s-paragraph>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuresyncandlanguagemodals.bundleAnalyticsArePreservedThisActionCannotBeUndone"
            )}
          </s-paragraph>
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="refresh"
          loading={flow.fetcher.state === "submitting" || undefined}
          onClick={flow.handleSyncBundleConfirm}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuresyncandlanguagemodals.syncBundle"
          )}
        </s-button>
        <s-button
          slot="secondary-actions"
          onClick={() => flow.setIsSyncModalOpen(false)}
        >
          {translateAdmin("dashboard.deleteModal.cancel")}
        </s-button>
      </s-modal>
      <PricingTranslationModals
        locales={flow.shopLocales}
        rules={rules}
        quantity={{
          open: flow.isBundleQuantityMultiLangModalOpen,
          activeLocale: flow.activeBundleQuantityLocale,
          values: quantityValues,
          onActiveLocaleChange: flow.setActiveBundleQuantityLocale,
          onApply: (values) => {
            flow.pricingState.setPricingDisplayOptions((current: any) => ({
              ...current,
              bundleQuantityOptions: {
                ...current.bundleQuantityOptions,
                optionsByLocaleByRuleId: values,
              },
            }));
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
      <EnablePreviewModal {...flow.enablePreviewGate.modalProps} />
    </>
  );
}
