import { usePpbConfigureContext } from "./PpbConfigureContext";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";

export function PpbQuantitySettings() {
  const {
    markAsDirty,
    lowStockAlertEnabled,
    lowStockAlertMessage,
    lowStockAlertThreshold,
    maxQtyPerProduct,
    productPageBundleStyles,
    quantityValidationEnabled,
    QuestionHelpTooltip,
    setMaxQtyPerProduct,
    setLowStockAlertEnabled,
    setLowStockAlertMessage,
    setLowStockAlertThreshold,
    setQuantityValidationEnabled,
    setVariantSelectorEnabled,
    variantSelectorEnabled,
    validationErrors = {},
    clearValidationError,
  } = usePpbConfigureContext();

  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <div className={productPageBundleStyles.settingTitleRow}>
          <h3 className={productPageBundleStyles.settingTitle}>
            Enable Quantity Validation
          </h3>
          <span className={productPageBundleStyles.settingInlineSwitch}>
            <s-switch
              accessibilityLabel="Enable quantity validation"
              checked={quantityValidationEnabled || undefined}
              onChange={(e) => {
                setQuantityValidationEnabled(
                  (e.target as HTMLInputElement).checked
                );
                markAsDirty();
              }}
            />
          </span>
        </div>
        <DisabledConfigurationRegion disabled={!quantityValidationEnabled}>
          <s-number-field
            id="configure-settings-maxQuantity"
            label="Maximum allowed quantity per product"
            required={quantityValidationEnabled || undefined}
            error={validationErrors["settings.maxQuantity"]}
            min={1}
            value={maxQtyPerProduct || "1"}
            disabled={!quantityValidationEnabled}
            onInput={(e) => {
              setMaxQtyPerProduct((e.target as HTMLInputElement).value);
              markAsDirty();
              clearValidationError("settings.maxQuantity");
            }}
            autocomplete="off"
          />
        </DisabledConfigurationRegion>
        <div className={productPageBundleStyles.settingTitleRow}>
          <div>
            <h3 className={productPageBundleStyles.settingTitle}>
              Variant Selector
              <QuestionHelpTooltip tooltipKey="variantSelector" />
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              Enable variant selection within the product cards instead of the
              quick look
            </p>
          </div>
          <span className={productPageBundleStyles.settingInlineSwitch}>
            <s-switch
              accessibilityLabel="Variant selector"
              checked={variantSelectorEnabled || undefined}
              onChange={(e) => {
                setVariantSelectorEnabled(
                  (e.target as HTMLInputElement).checked
                );
                markAsDirty();
              }}
            />
          </span>
        </div>
        <div className={productPageBundleStyles.settingTitleRow}>
          <div>
            <h3 className={productPageBundleStyles.settingTitle}>
              Low-stock alert
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              Show Shopify's sellable component-variant quantity at or below a threshold.
            </p>
          </div>
          <span className={productPageBundleStyles.settingInlineSwitch}>
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
          </span>
        </div>
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
      </s-stack>
    </s-section>
  );
}
