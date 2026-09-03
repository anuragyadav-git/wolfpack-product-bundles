import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbUtilityModals() {
  const {
    ADDON_TEMPLATE_VARIABLES,
    DISCOUNT_TEMPLATE_VARIABLES,
    discountVariablesModalRef,
    fetcher,
    handleSyncBundleConfirm,
    hidePolarisModal,
    productPageBundleStyles,
    setIsSyncModalOpen,
    syncModalRef,
    templateVariablesModalRef,
  } = usePpbConfigureContext();

  return (
    <>
      {/* Sync Bundle Confirmation Modal */}
      <s-modal
        ref={syncModalRef}
        heading={translateAdmin("adminAttributes.syncBundle")}
      >
        <s-stack direction="block" gap="small">
          <p style={{ margin: 0, fontSize: 14 }}>
            {translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbutilitymodals.thisWillDeleteAndReCreateAllShopifyDataForThisBundle"
            )}
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              {translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbutilitymodals.theShopifyProductWillBeArchivedAndDeletedThenReCreated"
              )}
            </li>
            <li>
              {translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbutilitymodals.allBundleAndComponentMetafieldsWillBeRewritten"
              )}
            </li>
          </ul>
          <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuresyncandlanguagemodals.bundleAnalyticsArePreservedThisActionCannotBeUndone"
            )}
          </p>
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="refresh"
          loading={fetcher.state === "submitting" || undefined}
          onClick={handleSyncBundleConfirm}
        >
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbutilitymodals.syncBundle"
          )}
        </s-button>
        <s-button
          slot="secondary-actions"
          onClick={() => setIsSyncModalOpen(false)}
        >
          {translateAdmin("dashboard.deleteModal.cancel")}
        </s-button>
      </s-modal>
      <s-modal
        id="ppb-template-variables-modal"
        ref={templateVariablesModalRef}
        heading={translateAdmin("adminAttributes.messageVariables")}
        size="small"
      >
        <s-stack direction="block" gap="small">
          <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.useTheseVariablesInOnlyBundlesMessagesTheWidgetReplacesThemWithL"
            )}
          </p>
          <div className={productPageBundleStyles.templateVariableGrid}>
            {ADDON_TEMPLATE_VARIABLES.map(([variable, description]: any) => (
              <div
                key={variable}
                className={productPageBundleStyles.templateVariableItem}
              >
                <s-badge>{variable}</s-badge>
                <s-text color="subdued">{description}</s-text>
              </div>
            ))}
          </div>
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="check"
          commandFor="ppb-template-variables-modal"
          command="--hide"
          onClick={() => hidePolarisModal(templateVariablesModalRef)}
        >
          {translateAdmin("dashboard.storefrontSetup.enableModal.done")}
        </s-button>
      </s-modal>
      <s-modal
        id="discount-variables-modal"
        ref={discountVariablesModalRef}
        heading={translateAdmin("adminAttributes.variables")}
        size="base"
      >
        <div>
          {DISCOUNT_TEMPLATE_VARIABLES.map(
            ([variable, description]: any, index) => (
              <div key={variable}>
                {index > 0 && <s-divider />}
                <div className={productPageBundleStyles.discountVariableRow}>
                  <s-text color="subdued">{description}</s-text>
                  <span
                    className={productPageBundleStyles.discountVariableCode}
                  >
                    {variable}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </s-modal>
    </>
  );
}
