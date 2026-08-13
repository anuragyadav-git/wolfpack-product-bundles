import { isMultiLanguageActionDisabled } from "../../../../lib/bundle-config/common-configure-page-model";
import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { getVisibilityResourceId } from "../visibility-helpers";

export function BundleWidgetSection({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    activeSection,
    autoSelectBrowsedProduct,
    FilePicker,
    fullPageBundleStyles,
    handlePlaceWidget,
    markAsDirty,
    openMultiLanguageModal,
    openVisibilityCollectionPicker,
    openVisibilityProductPicker,
    removeVisibilityCollectionTarget,
    removeVisibilityProductTarget,
    setAutoSelectBrowsedProduct,
    setTextOverrides,
    setUpsellWidgetButtonText,
    setUpsellWidgetDescription,
    setUpsellWidgetDisplayMode,
    setUpsellWidgetDisplayOn,
    setUpsellWidgetEnabled,
    setUpsellWidgetImageUrl,
    setUpsellWidgetTitle,
    shopLocales,
    upsellWidgetButtonText,
    upsellWidgetCollectionsSelectedData,
    upsellWidgetDescription,
    upsellWidgetDisplayMode,
    upsellWidgetDisplayOn,
    upsellWidgetEnabled,
    upsellWidgetImageUrl,
    upsellWidgetSelectedProducts,
    upsellWidgetTitle,
  } = flow;

  const handleWidgetTypeChange = (event: any) => {
    const value = event.target.values?.[0];
    if (value === "button" || value === "block") {
      setUpsellWidgetDisplayMode(value);
      markAsDirty();
    }
  };

  return (
    <>
      {activeSection === "bundle_widget" && (
        <div data-tour-target="fpb-bundle-widget">
          <div className={fullPageBundleStyles.visibilityPanel}>
            <div className={fullPageBundleStyles.visibilityTitleSwitchRow}>
              <div>
                <h3 className={fullPageBundleStyles.visibilityPanelTitle}>
                  Product Page Bundle Upsell Widgets
                </h3>
                <p className={fullPageBundleStyles.visibilityCardText}>
                  This will display an upsell block or button on the product
                  pages of your choice.
                </p>
              </div>
              <s-switch
                checked={upsellWidgetEnabled || undefined}
                onChange={(e: any) => {
                  setUpsellWidgetEnabled(e.target.checked);
                  markAsDirty();
                }}
              />
            </div>
            <div className={fullPageBundleStyles.upsellWidgetContent}>
              <div className={fullPageBundleStyles.visibilityPreviewFrame}>
                <s-image
                  aspectRatio="16/9"
                  src={
                    upsellWidgetDisplayMode === "button"
                      ? "/Upsell-Button.png"
                      : "/Upsell-Block.png"
                  }
                  alt={
                    upsellWidgetDisplayMode === "button"
                      ? "Product page with a bundle upsell button"
                      : "Product page with a bundle upsell block"
                  }
                />
                <div className={fullPageBundleStyles.visibilityRadioBar}>
                  <s-stack
                    direction="inline"
                    justifyContent="center"
                    alignItems="center"
                    gap="base"
                  >
                    <s-choice-list
                      label="Widget type"
                      labelAccessibilityVisibility="exclusive"
                      name="fpbUpsellWidgetTypeBlock"
                      values={upsellWidgetDisplayMode === "block" ? ["block"] : []}
                      disabled={!upsellWidgetEnabled || undefined}
                      onChange={handleWidgetTypeChange}
                    >
                      <s-choice value="block">Offer Upsell Block</s-choice>
                    </s-choice-list>
                    <s-choice-list
                      label="Widget type"
                      labelAccessibilityVisibility="exclusive"
                      name="fpbUpsellWidgetTypeButton"
                      values={upsellWidgetDisplayMode === "button" ? ["button"] : []}
                      disabled={!upsellWidgetEnabled || undefined}
                      onChange={handleWidgetTypeChange}
                    >
                      <s-choice value="button">Offer Upsell Button</s-choice>
                    </s-choice-list>
                  </s-stack>
                </div>
              </div>
              <s-banner
                tone="info"
                dismissible={false}
                hidden={false}
              >
                <s-text>
                  Select if you want the upsell block or button to appear on product pages.
                </s-text>
              </s-banner>
              <div className={fullPageBundleStyles.visibilityPanelSection}>
                <div className={fullPageBundleStyles.visibilitySectionHeader}>
                  <h4 className={fullPageBundleStyles.visibilitySectionTitle}>
                    Widget Settings
                  </h4>
                  <s-button
                    variant="secondary"
                    icon="language-translate"
                    disabled={
                      !upsellWidgetEnabled || isMultiLanguageActionDisabled(shopLocales) || undefined
                    }
                    onClick={() =>
                      openMultiLanguageModal("Bundle Widget", [
                        {
                          key: "widgetTitle",
                          label: "Widget Title",
                          fallback: upsellWidgetTitle,
                        },
                        {
                          key: "widgetDescription",
                          label: "Widget Description",
                          fallback: upsellWidgetDescription,
                        },
                        {
                          key: "widgetButtonText",
                          label: "Widget Button Text",
                          fallback: upsellWidgetButtonText,
                        },
                      ])
                    }
                  >
                    Multi Language
                  </s-button>
                </div>
                <div className={fullPageBundleStyles.visibilityFieldStack}>
                  {upsellWidgetDisplayMode !== "button" && (
                    <div className={fullPageBundleStyles.upsellBlockFieldsRow}>
                      <div className={fullPageBundleStyles.upsellBlockImageField}>
                        {upsellWidgetEnabled && (
                          <FilePicker
                            label="Widget image"
                            value={upsellWidgetImageUrl || null}
                            fitPreviewToTrigger
                            onChange={(url: string | null) => {
                              setUpsellWidgetImageUrl(url ?? "");
                              markAsDirty();
                            }}
                          />
                        )}
                      </div>
                      <div className={fullPageBundleStyles.upsellBlockCopyFields}>
                        <s-text-field
                          label="Widget title"
                          value={upsellWidgetTitle}
                          required
                          disabled={!upsellWidgetEnabled || undefined}
                          onInput={(event: any) => {
                            setUpsellWidgetTitle(event.target.value);
                            markAsDirty();
                          }}
                        />
                        <s-text-area
                          label="Widget description"
                          value={upsellWidgetDescription}
                          rows={3}
                          disabled={!upsellWidgetEnabled || undefined}
                          onInput={(event: any) => {
                            setUpsellWidgetDescription(event.target.value);
                            markAsDirty();
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <s-text-field
                    label="Widget button text"
                    value={upsellWidgetButtonText}
                    required
                    disabled={!upsellWidgetEnabled || undefined}
                    onInput={(event: any) => {
                      const value = event.target.value;
                      setUpsellWidgetButtonText(value);
                      setTextOverrides((prev) => ({ ...prev, widgetButtonText: value }));
                      markAsDirty();
                    }}
                  />
                </div>
              </div>
              <div className={fullPageBundleStyles.visibilityPanelSection}>
                <h4 className={fullPageBundleStyles.visibilitySectionTitle}>
                  Display Widget on
                </h4>
                <s-choice-list
                  label="Product-page targeting"
                  labelAccessibilityVisibility="exclusive"
                  name="fpbWidgetDisplayOn"
                  values={[upsellWidgetDisplayOn]}
                  disabled={!upsellWidgetEnabled || undefined}
                  onChange={(event: any) => {
                    const value = event.target.values?.[0];
                    if (["all", "specific_products", "specific_collections"].includes(value)) {
                      setUpsellWidgetDisplayOn(value);
                      markAsDirty();
                    }
                  }}
                >
                  <s-choice value="all">All products in bundle</s-choice>
                  <s-choice value="specific_products">Specific products</s-choice>
                  <s-choice value="specific_collections">Specific collections</s-choice>
                </s-choice-list>
                {upsellWidgetDisplayOn === "specific_products" && (
                  <div className={fullPageBundleStyles.visibilityTargetPicker}>
                    <s-button
                      variant="secondary"
                      disabled={!upsellWidgetEnabled || undefined}
                      onClick={() => openVisibilityProductPicker("widget")}
                    >
                      Select products
                    </s-button>
                    <div
                      className={fullPageBundleStyles.visibilitySelectionList}
                    >
                      {upsellWidgetSelectedProducts.map(
                        (product: any, index: number) => (
                          <div
                            key={getVisibilityResourceId(product) ?? index}
                            className={
                              fullPageBundleStyles.visibilitySelectionItem
                            }
                          >
                            <span>{product.title ?? "Untitled product"}</span>
                            <s-button
                              variant="tertiary"
                              disabled={!upsellWidgetEnabled || undefined}
                              onClick={() =>
                                removeVisibilityProductTarget("widget", index)
                              }
                            >
                              Remove
                            </s-button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {upsellWidgetDisplayOn === "specific_collections" && (
                  <div className={fullPageBundleStyles.visibilityTargetPicker}>
                    <s-button
                      variant="secondary"
                      disabled={!upsellWidgetEnabled || undefined}
                      onClick={() => openVisibilityCollectionPicker("widget")}
                    >
                      Select collections
                    </s-button>
                    <div
                      className={fullPageBundleStyles.visibilitySelectionList}
                    >
                      {upsellWidgetCollectionsSelectedData.map(
                        (collection: any, index: number) => (
                          <div
                            key={getVisibilityResourceId(collection) ?? index}
                            className={
                              fullPageBundleStyles.visibilitySelectionItem
                            }
                          >
                            <span>
                              {collection.title ?? "Untitled collection"}
                            </span>
                            <s-button
                              variant="tertiary"
                              disabled={!upsellWidgetEnabled || undefined}
                              onClick={() =>
                                removeVisibilityCollectionTarget(
                                  "widget",
                                  index,
                                )
                              }
                            >
                              Remove
                            </s-button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
              <s-checkbox
                label="Add browsed product to bundle"
                checked={autoSelectBrowsedProduct || undefined}
                disabled={!upsellWidgetEnabled || undefined}
                onChange={(event: any) => {
                  setAutoSelectBrowsedProduct(event.target.checked);
                  markAsDirty();
                }}
              />
            </div>
          </div>
          <div className={fullPageBundleStyles.visibilityPlacementCard}>
            <div>
              <h4 className={fullPageBundleStyles.visibilitySectionTitle}>
                Embed Upsell at a custom location
              </h4>
              <p className={fullPageBundleStyles.visibilityCardText}>
                By default, the upsell is added below the Buy Button. You can move it to a custom spot on
                the product page if you prefer.
              </p>
            </div>
            <s-button
              variant="secondary"
              onClick={handlePlaceWidget}
            >
              <s-icon type="external" />
              Embed Upsell
            </s-button>
          </div>
        </div>
      )}
    </>
  );
}
