import { CommonBundleWidgetSection } from "../_shared/bundle-configure/CommonBundleWidgetSection";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbBundleWidgetSection() {
  const flow = usePpbConfigureContext();
  if (flow.activeSection !== "bundle_widget") return null;

  return (
    <div data-tour-target="ppb-bundle-widget">
      <CommonBundleWidgetSection
        addBrowsedProduct={flow.autoSelectBrowsedProduct}
        buttonText={flow.upsellWidgetButtonText}
        collections={flow.upsellWidgetCollectionsSelectedData}
        description={flow.upsellWidgetDescription}
        disabled={!flow.upsellWidgetEnabled}
        displayMode={flow.upsellWidgetDisplayMode}
        displayOn={flow.upsellWidgetDisplayOn}
        enabled={flow.upsellWidgetEnabled}
        FilePicker={flow.FilePicker}
        getResourceId={flow.getVisibilityResourceId}
        imageUrl={flow.upsellWidgetImageUrl}
        multiLanguageDisabled={
          !flow.upsellWidgetEnabled || (flow.shopLocales?.length ?? 0) === 0
        }
        onAddBrowsedProductChange={(checked) => {
          flow.setAutoSelectBrowsedProduct(checked);
          flow.markAsDirty();
        }}
        onButtonTextChange={(value) => {
          flow.setUpsellWidgetButtonText(value);
          flow.clearValidationError("widget.buttonText");
          flow.markAsDirty();
        }}
        onDescriptionChange={(value) => {
          flow.setUpsellWidgetDescription(value);
          flow.markAsDirty();
        }}
        onDisplayModeChange={(value) => {
          flow.setUpsellWidgetDisplayMode(value);
          flow.markAsDirty();
        }}
        onDisplayOnChange={(value) => {
          flow.setUpsellWidgetDisplayOn(value);
          flow.markAsDirty();
        }}
        onEnabledChange={(checked) => {
          flow.setUpsellWidgetEnabled(checked);
          flow.markAsDirty();
        }}
        onImageUrlChange={(value) => {
          flow.setUpsellWidgetImageUrl(value);
          flow.markAsDirty();
        }}
        onOpenCollectionPicker={async () => {
          await flow.openVisibilityCollectionPicker("widget");
          flow.clearValidationError("widget.collections");
        }}
        onOpenMultiLanguage={() =>
          flow.openMultiLanguageModal(
            "Bundle Widget",
            [
              {
                key: "widgetTitle",
                label: "Widget Title",
                fallback: flow.upsellWidgetTitle,
              },
              {
                key: "widgetDescription",
                label: "Widget Description",
                fallback: flow.upsellWidgetDescription,
                multiline: true,
              },
              {
                key: "widgetButtonText",
                label: "Widget Button Text",
                fallback: flow.upsellWidgetButtonText,
              },
            ],
            "widget"
          )
        }
        onOpenProductPicker={async () => {
          await flow.openVisibilityProductPicker("widget");
          flow.clearValidationError("widget.products");
        }}
        onPlaceWidget={flow.handlePlaceWidget}
        onRemoveCollection={(index) =>
          flow.removeVisibilityCollectionTarget("widget", index)
        }
        onRemoveProduct={(index) =>
          flow.removeVisibilityProductTarget("widget", index)
        }
        onTitleChange={(value) => {
          flow.setUpsellWidgetTitle(value);
          flow.clearValidationError("widget.title");
          flow.markAsDirty();
        }}
        products={flow.upsellWidgetSelectedProducts}
        title={flow.upsellWidgetTitle}
        validationErrors={flow.validationErrors}
      />
    </div>
  );
}
