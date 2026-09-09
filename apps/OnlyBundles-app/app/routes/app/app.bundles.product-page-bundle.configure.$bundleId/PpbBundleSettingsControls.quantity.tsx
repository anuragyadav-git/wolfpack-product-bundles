import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import { QuestionHelpTooltip } from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbQuantitySettingsProps = Pick<
  PpbConfigureFlow,
  | "clearValidationError"
  | "lowStockAlertEnabled"
  | "lowStockAlertMessage"
  | "lowStockAlertThreshold"
  | "markAsDirty"
  | "maxQtyPerProduct"
  | "quantityValidationEnabled"
  | "setLowStockAlertEnabled"
  | "setLowStockAlertMessage"
  | "setLowStockAlertThreshold"
  | "setMaxQtyPerProduct"
  | "setQuantityValidationEnabled"
  | "setVariantSelectorEnabled"
  | "validationErrors"
  | "variantSelectorEnabled"
>;

export function PpbQuantitySettings({
  clearValidationError,
  lowStockAlertEnabled,
  lowStockAlertMessage,
  lowStockAlertThreshold,
  markAsDirty,
  maxQtyPerProduct,
  quantityValidationEnabled,
  setLowStockAlertEnabled,
  setLowStockAlertMessage,
  setLowStockAlertThreshold,
  setMaxQtyPerProduct,
  setQuantityValidationEnabled,
  setVariantSelectorEnabled,
  validationErrors,
  variantSelectorEnabled,
}: PpbQuantitySettingsProps) {

  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <div className={productPageBundleStyles.settingTitleRow}>
          <h3 className={productPageBundleStyles.settingTitle}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.enableQuantityValidation"
            )}
            <QuestionHelpTooltip tooltipKey="quantityValidation" />
          </h3>
          <span className={productPageBundleStyles.settingInlineSwitch}>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.enableQuantityValidation"
              )}
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
            label={translateAdmin(
              "adminAttributes.maximumAllowedQuantityPerProduct"
            )}
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
              {translateAdmin("tooltips.variantSelector.title")}
              <QuestionHelpTooltip tooltipKey="variantSelector" />
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsQuantity.enableVariantSelectionWithinTheProductCardsInsteadOfTheQuickLook"
              )}
            </p>
          </div>
          <span className={productPageBundleStyles.settingInlineSwitch}>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.variantSelector"
              )}
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
              {translateAdmin("tooltips.lowStockAlert.title")}
              <QuestionHelpTooltip tooltipKey="lowStockAlert" />
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsQuantity.showShopifySSellableComponentVariantQuantityAtOrBelowAThreshold"
              )}
            </p>
          </div>
          <span className={productPageBundleStyles.settingInlineSwitch}>
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
          </span>
        </div>
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
                setLowStockAlertThreshold((e.target as HTMLInputElement).value);
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
      </s-stack>
    </s-section>
  );
}
