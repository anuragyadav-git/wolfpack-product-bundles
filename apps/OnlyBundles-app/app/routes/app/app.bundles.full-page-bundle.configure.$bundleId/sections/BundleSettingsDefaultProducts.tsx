import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DefaultProductDiscountTipBanner } from "../../_shared/bundle-configure/DefaultProductDiscountTipBanner";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { ConfigureHelpPopover } from "../../_shared/bundle-configure/ConfigureHelpPopover";
import { translateAdmin } from "~/i18n/config";

export function FpbDefaultProductsSettings({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    buildDefaultProductEntryFromPicker,
    defaultProductsData,
    markAsDirty,
    setDefaultProductsData,
    shopify,
    validationErrors = {},
    clearValidationError,
  } = flow;

  return (
    <>
      {/* Pre Selected Product */}
      <s-section>
        {(() => {
          const defaultProductsEnabled =
            defaultProductsData.isDefaultProductsEnabled === true;
          const selectedDefaultProducts = defaultProductsData.products ?? [];
          const defaultProductCount = selectedDefaultProducts.length;
          const defaultProductSelectionIds = selectedDefaultProducts
            .map(
              (product: any) =>
                product.graphqlId || product.productId || product.id
            )
            .filter(Boolean)
            .map((id: string) => ({ id }));
          const handleDefaultProductPicker = async () => {
            const picked = await (shopify as any).resourcePicker({
              type: "product",
              multiple: true,
              action: "select",
              selectionIds: defaultProductSelectionIds,
            });
            if (!picked) return;
            const defaultProducts = picked
              .map(
                (
                  value: Parameters<
                    typeof buildDefaultProductEntryFromPicker
                  >[0]
                ) => buildDefaultProductEntryFromPicker(value)
              )
              .filter(
                (
                  p: any
                ): p is NonNullable<
                  ReturnType<typeof buildDefaultProductEntryFromPicker>
                > => Boolean(p)
              );
            setDefaultProductsData((prev: any) => ({
              isDefaultProductsEnabled: true,
              defaultProductsTitle: prev.defaultProductsTitle ?? "",
              products: defaultProducts,
            }));
            markAsDirty();
            clearValidationError("settings.defaultProducts");
          };
          return (
            <s-stack direction="block" gap="small">
              <s-stack direction="inline" alignItems="center" gap="small">
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  {translateAdmin("tooltips.preselectedProducts.title")}
                  <ConfigureHelpPopover tooltipKey="preselectedProducts" />
                </h3>
                <s-switch
                  accessibilityLabel={translateAdmin(
                    "adminAttributes.enablePreSelectedProduct"
                  )}
                  checked={defaultProductsEnabled || undefined}
                  onChange={(e) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    setDefaultProductsData((prev: any) => ({
                      ...prev,
                      isDefaultProductsEnabled: checked,
                      defaultProductsTitle: prev.defaultProductsTitle ?? "",
                      products: prev.products ?? [],
                    }));
                    markAsDirty();
                  }}
                />
              </s-stack>
              <DisabledConfigurationRegion disabled={!defaultProductsEnabled}>
                <s-stack direction="block" gap="small">
                  <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsdefaultproducts.chooseProductsThatShouldBeAddedToBundleByDefault"
                    )}
                  </p>
                  <DefaultProductDiscountTipBanner />
                  <s-text-field
                    label={translateAdmin(
                      "adminAttributes.defaultProductsTitle"
                    )}
                    value={defaultProductsData.defaultProductsTitle ?? ""}
                    disabled={!defaultProductsEnabled || undefined}
                    onInput={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      setDefaultProductsData((prev: any) => ({
                        ...prev,
                        defaultProductsTitle: value,
                      }));
                      markAsDirty();
                    }}
                    autocomplete="off"
                  />
                  <div>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsdefaultproducts.chooseDefaultProducts"
                      )}
                    </p>
                    <s-stack direction="inline" alignItems="center" gap="small">
                      <s-button
                        icon="product"
                        variant={
                          defaultProductsEnabled ? "primary" : "secondary"
                        }
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
                    </s-stack>
                    {validationErrors["settings.defaultProducts"] && (
                      <s-text
                        id="configure-settings-defaultProducts"
                        tone="critical"
                      >
                        {validationErrors["settings.defaultProducts"]}
                      </s-text>
                    )}
                  </div>
                </s-stack>
              </DisabledConfigurationRegion>
            </s-stack>
          );
        })()}
      </s-section>
      {/* Enable Quantity Validation + Product Slots + Slot Icon */}
    </>
  );
}
