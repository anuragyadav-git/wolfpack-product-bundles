import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { CountdownSettingsSection } from "../../_shared/bundle-configure/CountdownSettingsSection";

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
            title="Variant Selector"
            description="Enable variant selection within the product cards instead of the quick look"
            tooltipKey="variantSelector"
          >
            <s-switch
              accessibilityLabel="Variant selector"
              checked={variantSelectorEnabled || undefined}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setVariantSelectorEnabled(checked);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <SettingsRow
            title="Low-stock alert"
            description="Show Shopify's sellable component-variant quantity when it reaches the configured threshold."
          >
            <s-switch
              accessibilityLabel="Low-stock alert"
              checked={lowStockAlertEnabled || undefined}
              onChange={(e) => {
                setLowStockAlertEnabled(
                  (e.target as HTMLInputElement).checked,
                );
                markAsDirty();
              }}
            />
          </SettingsRow>
          <DisabledConfigurationRegion disabled={!lowStockAlertEnabled}>
            <s-stack direction="block" gap="small">
              <s-number-field
                id="configure-settings-lowStockThreshold"
                label="Low-stock threshold"
                min={1}
                max={1000}
                value={lowStockAlertThreshold}
                disabled={!lowStockAlertEnabled}
                error={validationErrors["settings.lowStockThreshold"]}
                onInput={(e) => {
                  setLowStockAlertThreshold(
                    (e.target as HTMLInputElement).value,
                  );
                  clearValidationError("settings.lowStockThreshold");
                  markAsDirty();
                }}
                autocomplete="off"
              />
              <s-text-field
                id="configure-settings-lowStockMessage"
                label="Low-stock message"
                value={lowStockAlertMessage}
                disabled={!lowStockAlertEnabled}
                error={validationErrors["settings.lowStockMessage"]}
                details="Include {{stock}} where the sellable quantity should appear."
                onInput={(e) => {
                  setLowStockAlertMessage(
                    (e.target as HTMLInputElement).value,
                  );
                  clearValidationError("settings.lowStockMessage");
                  markAsDirty();
                }}
                autocomplete="off"
              />
            </s-stack>
          </DisabledConfigurationRegion>
          <SettingsRow
            title="Show Text on + Button"
            description="Replaces the + icon with a text button and moves it below the price."
            tooltipKey="showTextOnAddButton"
          >
            <s-switch
              accessibilityLabel="Show text on plus button"
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
                label="Button text"
                value={textOverrides.addToCartButton ?? ""}
                disabled={
                  !showTextOnAddButton || shopLocales.length === 0 || undefined
                }
                placeholder="Add to Cart"
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
                Multi Language
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
