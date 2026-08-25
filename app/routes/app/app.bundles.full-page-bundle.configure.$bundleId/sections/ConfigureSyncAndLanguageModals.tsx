import { PricingTranslationModals } from "../../_shared/bundle-configure/PricingTranslationModals";
import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";

export function FpbSyncAndLanguageModals({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const rules = flow.pricingState.discountRules.map((rule: any, index: number) => {
    const quantityOption =
      flow.normalizedPricingDisplayOptions.bundleQuantityOptions.options.find(
        (option: any) => option.ruleId === rule.id,
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
  });
  const quantityValues =
    flow.pricingState.pricingDisplayOptions.bundleQuantityOptions
      .optionsByLocaleByRuleId ?? {};

  return (
    <>
      <s-modal ref={flow.syncModalRef} heading="Sync Wolfpack bundle?">
        <s-stack direction="block" gap="small">
          <s-paragraph>
            Syncing refreshes the Shopify data used by this Wolfpack Bundles
            configuration.
          </s-paragraph>
          <s-paragraph>
            The Shopify page will be deleted and re-created.
          </s-paragraph>
          <s-paragraph>
            All bundle and component metafields will be rewritten.
          </s-paragraph>
          <s-paragraph>
            Bundle analytics are preserved. This action cannot be undone.
          </s-paragraph>
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          loading={flow.fetcher.state === "submitting" || undefined}
          onClick={flow.handleSyncBundleConfirm}
        >
          Sync bundle
        </s-button>
        <s-button
          slot="secondary-actions"
          onClick={() => flow.setIsSyncModalOpen(false)}
        >
          Cancel
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
      <flow.EnablePreviewModal {...flow.enablePreviewGate.modalProps} />
    </>
  );
}
