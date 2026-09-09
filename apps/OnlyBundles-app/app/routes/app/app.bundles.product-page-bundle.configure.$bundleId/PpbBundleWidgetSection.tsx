import { CommonBundleWidgetSection } from "../_shared/bundle-configure/CommonBundleWidgetSection";
import { FilePicker } from "../../../components/shared/FilePicker";
import { getVisibilityResourceId } from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbBundleWidgetSectionProps = Pick<
  PpbConfigureFlow,
  | "activeSection"
  | "autoSelectBrowsedProduct"
  | "clearValidationError"
  | "handlePlaceWidget"
  | "markAsDirty"
  | "openMultiLanguageModal"
  | "openVisibilityCollectionPicker"
  | "openVisibilityProductPicker"
  | "removeVisibilityCollectionTarget"
  | "removeVisibilityProductTarget"
  | "setAutoSelectBrowsedProduct"
  | "setUpsellWidgetButtonText"
  | "setUpsellWidgetDescription"
  | "setUpsellWidgetDisplayMode"
  | "setUpsellWidgetDisplayOn"
  | "setUpsellWidgetEnabled"
  | "setUpsellWidgetImageUrl"
  | "setUpsellWidgetTitle"
  | "shopLocales"
  | "upsellWidgetButtonText"
  | "upsellWidgetCollectionsSelectedData"
  | "upsellWidgetDescription"
  | "upsellWidgetDisplayMode"
  | "upsellWidgetDisplayOn"
  | "upsellWidgetEnabled"
  | "upsellWidgetImageUrl"
  | "upsellWidgetSelectedProducts"
  | "upsellWidgetTitle"
  | "validationErrors"
>;

export function PpbBundleWidgetSection({
  activeSection,
  autoSelectBrowsedProduct,
  clearValidationError,
  handlePlaceWidget,
  markAsDirty,
  openMultiLanguageModal,
  openVisibilityCollectionPicker,
  openVisibilityProductPicker,
  removeVisibilityCollectionTarget,
  removeVisibilityProductTarget,
  setAutoSelectBrowsedProduct,
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
  validationErrors,
}: PpbBundleWidgetSectionProps) {
  if (activeSection !== "bundle_widget") return null;

  return (
    <div data-tour-target="ppb-bundle-widget">
      <CommonBundleWidgetSection
        addBrowsedProduct={autoSelectBrowsedProduct}
        buttonText={upsellWidgetButtonText}
        collections={upsellWidgetCollectionsSelectedData}
        description={upsellWidgetDescription}
        disabled={!upsellWidgetEnabled}
        displayMode={upsellWidgetDisplayMode}
        displayOn={upsellWidgetDisplayOn}
        enabled={upsellWidgetEnabled}
        FilePicker={FilePicker}
        getResourceId={getVisibilityResourceId}
        imageUrl={upsellWidgetImageUrl}
        multiLanguageDisabled={
          !upsellWidgetEnabled || (shopLocales?.length ?? 0) === 0
        }
        onAddBrowsedProductChange={(checked) => {
          setAutoSelectBrowsedProduct(checked);
          markAsDirty();
        }}
        onButtonTextChange={(value) => {
          setUpsellWidgetButtonText(value);
          clearValidationError("widget.buttonText");
          markAsDirty();
        }}
        onDescriptionChange={(value) => {
          setUpsellWidgetDescription(value);
          markAsDirty();
        }}
        onDisplayModeChange={(value) => {
          setUpsellWidgetDisplayMode(value);
          markAsDirty();
        }}
        onDisplayOnChange={(value) => {
          setUpsellWidgetDisplayOn(value);
          markAsDirty();
        }}
        onEnabledChange={(checked) => {
          setUpsellWidgetEnabled(checked);
          markAsDirty();
        }}
        onImageUrlChange={(value) => {
          setUpsellWidgetImageUrl(value);
          markAsDirty();
        }}
        onOpenCollectionPicker={async () => {
          await openVisibilityCollectionPicker("widget");
          clearValidationError("widget.collections");
        }}
        onOpenMultiLanguage={() =>
          openMultiLanguageModal(
            "Bundle Widget",
            [
              {
                key: "widgetTitle",
                label: "Widget Title",
                fallback: upsellWidgetTitle,
              },
              {
                key: "widgetDescription",
                label: "Widget Description",
                fallback: upsellWidgetDescription,
                multiline: true,
              },
              {
                key: "widgetButtonText",
                label: "Widget Button Text",
                fallback: upsellWidgetButtonText,
              },
            ],
            "widget"
          )
        }
        onOpenProductPicker={async () => {
          await openVisibilityProductPicker("widget");
          clearValidationError("widget.products");
        }}
        onPlaceWidget={handlePlaceWidget}
        onRemoveCollection={(index) =>
          removeVisibilityCollectionTarget("widget", index)
        }
        onRemoveProduct={(index) =>
          removeVisibilityProductTarget("widget", index)
        }
        onTitleChange={(value) => {
          setUpsellWidgetTitle(value);
          clearValidationError("widget.title");
          markAsDirty();
        }}
        products={upsellWidgetSelectedProducts}
        title={upsellWidgetTitle}
        validationErrors={validationErrors}
      />
    </div>
  );
}
