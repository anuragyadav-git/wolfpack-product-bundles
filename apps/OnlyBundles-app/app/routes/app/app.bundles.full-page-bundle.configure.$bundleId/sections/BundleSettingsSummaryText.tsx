import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { CountdownSettingsSection } from "../../_shared/bundle-configure/CountdownSettingsSection";
import { translateAdmin } from "~/i18n/config";

export function FpbSummaryTextSettings({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    markAsDirty,
    lowStockAlertEnabled,
    lowStockAlertMessage,
    lowStockAlertThreshold,
    openMultiLanguageModal,
    setShowTextOnAddButton,
    setLowStockAlertEnabled,
    setLowStockAlertMessage,
    setLowStockAlertThreshold,
    setTextOverrides,
    SettingsRow,
    setVariantSelectorEnabled,
    showTextOnAddButton,
    shopLocales,
    textOverrides,
    variantSelectorEnabled,
    validationErrors = {},
    clearValidationError,
  } = flow;

  return (
    <>
      <s-section>
        <s-stack direction="block" gap="small">
          <SettingsRow
            title={translateAdmin("tooltips.variantSelector.title")}
            description={translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsQuantity.enableVariantSelectionWithinTheProductCardsInsteadOfTheQuickLook"
            )}
            tooltipKey="variantSelector"
          >
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.variantSelector"
              )}
              checked={variantSelectorEnabled || undefined}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setVariantSelectorEnabled(checked);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <SettingsRow
            title={translateAdmin("tooltips.lowStockAlert.title")}
            description={translateAdmin(
              "adminAttributes.showShopifySSellableComponentVariantQuantityWhenIt"
            )}
            tooltipKey="lowStockAlert"
          >
            <s-switch
              accessibilityLabel={translateAdmin(
                "tooltips.lowStockAlert.title"
              )}
              checked={lowStockAlertEnabled || undefined}
              onChange={(e) => {
                setLowStockAlertEnabled((e.target as HTMLInputElement).checked);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <DisabledConfigurationRegion disabled={!lowStockAlertEnabled}>
            <s-stack direction="block" gap="small">
              <s-number-field
                id="configure-settings-lowStockThreshold"
                label={translateAdmin("adminAttributes.lowStockThreshold")}
                min={1}
                max={1000}
                value={lowStockAlertThreshold}
                disabled={!lowStockAlertEnabled}
                error={validationErrors["settings.lowStockThreshold"]}
                onInput={(e) => {
                  setLowStockAlertThreshold(
                    (e.target as HTMLInputElement).value
                  );
                  clearValidationError("settings.lowStockThreshold");
                  markAsDirty();
                }}
                autocomplete="off"
              />
              <s-text-field
                id="configure-settings-lowStockMessage"
                label={translateAdmin("adminAttributes.lowStockMessage")}
                value={lowStockAlertMessage}
                disabled={!lowStockAlertEnabled}
                error={validationErrors["settings.lowStockMessage"]}
                details="Include {{stock}} where the sellable quantity should appear."
                onInput={(e) => {
                  setLowStockAlertMessage((e.target as HTMLInputElement).value);
                  clearValidationError("settings.lowStockMessage");
                  markAsDirty();
                }}
                autocomplete="off"
              />
            </s-stack>
          </DisabledConfigurationRegion>
          <SettingsRow
            title={translateAdmin("tooltips.showTextOnAddButton.title")}
            description={translateAdmin(
              "adminAttributes.replacesTheIconWithATextButtonAndMoves"
            )}
            tooltipKey="showTextOnAddButton"
          >
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.showTextOnPlusButton"
              )}
              checked={showTextOnAddButton || undefined}
              onChange={(e) => {
                const enabled = (e.target as HTMLInputElement).checked;
                setShowTextOnAddButton(enabled);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <DisabledConfigurationRegion disabled={!showTextOnAddButton}>
            <s-stack direction="inline" gap="small" alignItems="end">
              <s-text-field
                label={translateAdmin("adminAttributes.buttonText")}
                value={textOverrides.addToCartButton ?? ""}
                disabled={
                  !showTextOnAddButton || shopLocales.length === 0 || undefined
                }
                placeholder={translateAdmin("adminAttributes.addToCart")}
                autocomplete="off"
                onInput={(e) => {
                  setTextOverrides((prev) => ({
                    ...prev,
                    addToCartButton: (e.target as HTMLInputElement).value,
                  }));
                  markAsDirty();
                }}
              />
              <s-button
                variant="secondary"
                icon="language-translate"
                disabled={!showTextOnAddButton || undefined}
                onClick={() =>
                  openMultiLanguageModal("Add Button Text", [
                    {
                      key: "addToCartButton",
                      label: "Button text",
                      fallback: textOverrides.addToCartButton ?? "Add to Cart",
                    },
                  ])
                }
              >
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                )}
              </s-button>
            </s-stack>
          </DisabledConfigurationRegion>
        </s-stack>
      </s-section>
      <CountdownSettingsSection
        enabled={flow.countdownEnabled}
        layout={flow.countdownLayout}
        position={flow.countdownPosition}
        title={flow.countdownTitle}
        expiryAction={flow.countdownExpiryAction}
        expiredMessage={flow.countdownExpiredMessage}
        scheduledEndsAt={flow.offerDeliveryState.endsAt}
        markAsDirty={flow.markAsDirty}
        setEnabled={flow.setCountdownEnabled}
        setLayout={flow.setCountdownLayout}
        setPosition={flow.setCountdownPosition}
        setTitle={flow.setCountdownTitle}
        setExpiryAction={flow.setCountdownExpiryAction}
        setExpiredMessage={flow.setCountdownExpiredMessage}
      />
      {/* Bundle Cart */}
    </>
  );
}
