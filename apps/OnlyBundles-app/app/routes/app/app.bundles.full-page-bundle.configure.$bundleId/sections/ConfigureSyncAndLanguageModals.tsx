import { EnablePreviewModal } from "../../../../components/EnablePreviewModal";
import { PricingTranslationModals } from "../../_shared/bundle-configure/PricingTranslationModals";
import { translateAdmin } from "~/i18n/config";
import type { ComponentProps, ComponentPropsWithRef } from "react";

export interface FpbSyncAndLanguageModalsProps {
  sync: {
    modalRef: ComponentPropsWithRef<"s-modal">["ref"];
    submitting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
  pricingTranslations: ComponentProps<typeof PricingTranslationModals>;
  preview: ComponentProps<typeof EnablePreviewModal>;
}

export function FpbSyncAndLanguageModals({
  sync,
  pricingTranslations,
  preview,
}: FpbSyncAndLanguageModalsProps) {

  return (
    <>
      <s-modal
        ref={sync.modalRef}
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
          loading={sync.submitting || undefined}
          onClick={sync.onConfirm}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuresyncandlanguagemodals.syncBundle"
          )}
        </s-button>
        <s-button
          slot="secondary-actions"
          onClick={sync.onCancel}
        >
          {translateAdmin("dashboard.deleteModal.cancel")}
        </s-button>
      </s-modal>
      <PricingTranslationModals {...pricingTranslations} />
      <EnablePreviewModal {...preview} />
    </>
  );
}
