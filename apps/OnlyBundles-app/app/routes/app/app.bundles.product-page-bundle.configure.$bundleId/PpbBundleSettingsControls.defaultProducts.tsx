import { DefaultProductDiscountTipBanner } from "../_shared/bundle-configure/DefaultProductDiscountTipBanner";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { useAppBridge } from "@shopify/app-bridge-react";
import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import { QuestionHelpTooltip } from "./ConfigureBundleFlow.helpers";
import { buildDefaultProductEntryFromPicker } from "../../../lib/bundle-config/default-products";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type DefaultProductSelection = {
  graphqlId?: string;
  productId?: string;
  id?: string;
};

function isString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

export type PpbDefaultProductsSettingsProps = Pick<
  PpbConfigureFlow,
  | "clearValidationError"
  | "defaultProductsData"
  | "markAsDirty"
  | "setDefaultProductsData"
  | "validationErrors"
>;

export function PpbDefaultProductsSettings({
  clearValidationError,
  defaultProductsData,
  markAsDirty,
  setDefaultProductsData,
  validationErrors,
}: PpbDefaultProductsSettingsProps) {
  const shopify = useAppBridge();

  const selectedDefaultProducts = defaultProductsData.products ?? [];
  const defaultProductsEnabled =
    defaultProductsData.isDefaultProductsEnabled === true;
  const defaultProductCount = selectedDefaultProducts.length;
  const defaultProductSelectionIds = selectedDefaultProducts
    .map(
      (product: DefaultProductSelection) =>
        product.graphqlId || product.productId || product.id
    )
    .filter((value) => isString(value))
    .map((id: string) => ({ id }));

  const handleDefaultProductPicker = async () => {
    const picked = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      action: "select",
      selectionIds: defaultProductSelectionIds,
    });
    if (!picked) return;
    const defaultProducts = picked
      .map((value: Parameters<typeof buildDefaultProductEntryFromPicker>[0]) =>
        buildDefaultProductEntryFromPicker(value)
      )
      .filter(
        (
          product: ReturnType<typeof buildDefaultProductEntryFromPicker>
        ): product is NonNullable<
          ReturnType<typeof buildDefaultProductEntryFromPicker>
        > => Boolean(product)
      );
    setDefaultProductsData((prev) => ({
      isDefaultProductsEnabled: true,
      defaultProductsTitle: prev.defaultProductsTitle ?? "",
      products: defaultProducts,
    }));
    markAsDirty();
    clearValidationError("settings.defaultProducts");
  };

  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <div className={productPageBundleStyles.settingTitleRow}>
          <h3 className={productPageBundleStyles.settingTitle}>
            {translateAdmin("tooltips.preselectedProducts.title")}
            <QuestionHelpTooltip tooltipKey="preselectedProducts" />
          </h3>
          <s-switch
            accessibilityLabel={translateAdmin(
              "adminAttributes.enablePreSelectedProduct"
            )}
            checked={defaultProductsEnabled || undefined}
            onChange={(e) => {
              const checked = (e.target as HTMLInputElement).checked;
              setDefaultProductsData((prev) => ({
                ...prev,
                isDefaultProductsEnabled: checked,
                defaultProductsTitle: prev.defaultProductsTitle ?? "",
                products: prev.products ?? [],
              }));
              markAsDirty();
            }}
          />
        </div>
        <DisabledConfigurationRegion disabled={!defaultProductsEnabled}>
          <s-stack direction="block" gap="small">
            <DefaultProductDiscountTipBanner />
            <s-text-field
              label={translateAdmin("adminAttributes.defaultProductsTitle")}
              value={defaultProductsData.defaultProductsTitle ?? ""}
              disabled={!defaultProductsEnabled || undefined}
              onInput={(e) => {
                const value = (e.target as HTMLInputElement).value;
                setDefaultProductsData((prev) => ({
                  ...prev,
                  defaultProductsTitle: value,
                }));
                markAsDirty();
              }}
              autocomplete="off"
            />
            <div className={productPageBundleStyles.defaultProductsPickerGroup}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsdefaultproducts.chooseDefaultProducts"
                )}
              </p>
              <div
                className={productPageBundleStyles.defaultProductsPickerActions}
              >
                <s-button
                  icon="product"
                  variant={defaultProductsEnabled ? "primary" : "secondary"}
                  disabled={!defaultProductsEnabled || undefined}
                  onClick={handleDefaultProductPicker}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsdefaultproducts.browseProducts"
                  )}
                </s-button>
                {defaultProductCount > 0 && (
                  <s-badge tone="success">
                    {translateAdmin("adminDynamic.selectedCount", {
                      count: defaultProductCount,
                    })}
                  </s-badge>
                )}
              </div>
              {validationErrors["settings.defaultProducts"] && (
                <s-text id="configure-settings-defaultProducts" tone="critical">
                  {validationErrors["settings.defaultProducts"]}
                </s-text>
              )}
            </div>
          </s-stack>
        </DisabledConfigurationRegion>
      </s-stack>
    </s-section>
  );
}
