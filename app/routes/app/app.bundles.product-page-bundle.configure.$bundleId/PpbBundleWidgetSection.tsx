import { LiveUpsellWidgetPreview } from "../../../components/bundle-configure/LiveUpsellWidgetPreview";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { usePpbConfigureContext } from "./PpbConfigureContext";

const WIDGET_TARGETS = [
  { value: "all", label: "All products in bundle" },
  { value: "specific_products", label: "Specific products" },
  { value: "specific_collections", label: "Specific collections" },
] as const;

export function PpbBundleWidgetSection() {
  const flow = usePpbConfigureContext();
  if (flow.activeSection !== "bundle_widget") return null;

  const disabled = !flow.upsellWidgetEnabled;
  const changeDisplayMode = (event: Event) => {
    const value = (event.target as HTMLElement & { values?: string[] })
      .values?.[0];
    if (value === "button" || value === "block") {
      flow.setUpsellWidgetDisplayMode(value);
      flow.markAsDirty();
    }
  };
  const changeTarget = (event: Event) => {
    const value = (event.target as HTMLElement & { values?: string[] })
      .values?.[0];
    if (value && WIDGET_TARGETS.some((target) => target.value === value)) {
      flow.setUpsellWidgetDisplayOn(value);
      flow.markAsDirty();
    }
  };

  return (
    <div data-tour-target="ppb-bundle-widget">
      <s-stack direction="block" gap="base">
        <s-section>
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="start"
            gap="base"
          >
            <s-stack direction="inline" alignItems="start" gap="small">
              <s-icon type="product" />
              <s-stack direction="block" gap="small-100">
                <s-heading>Product Page Bundle Upsell Widgets</s-heading>
                <s-text color="subdued">
                  Display an upsell block or button on the product pages of your
                  choice.
                </s-text>
              </s-stack>
            </s-stack>
            <s-switch
              accessibilityLabel="Enable product page bundle upsell widgets"
              checked={flow.upsellWidgetEnabled || undefined}
              onChange={(event: Event) => {
                flow.setUpsellWidgetEnabled(
                  (event.target as HTMLInputElement).checked
                );
                flow.markAsDirty();
              }}
            />
          </s-stack>
        </s-section>

        <DisabledConfigurationRegion disabled={disabled}>
          <s-stack direction="block" gap="base">
            <s-section>
              <s-stack direction="block" gap="base">
                <s-stack
                  direction="inline"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="small"
                >
                  <s-heading>Widget style</s-heading>
                  {disabled && <s-badge tone="neutral">Disabled</s-badge>}
                </s-stack>
                <s-box padding="base" background="subdued" borderRadius="base">
                  <LiveUpsellWidgetPreview
                    mode={
                      flow.upsellWidgetDisplayMode === "button"
                        ? "button"
                        : "block"
                    }
                    title={flow.upsellWidgetTitle}
                    description={flow.upsellWidgetDescription}
                    buttonText={flow.upsellWidgetButtonText}
                    imageUrl={flow.upsellWidgetImageUrl || undefined}
                  />
                </s-box>
                <s-choice-list
                  label="Widget type"
                  name="ppbUpsellWidgetType"
                  values={[
                    flow.upsellWidgetDisplayMode === "button"
                      ? "button"
                      : "block",
                  ]}
                  disabled={disabled || undefined}
                  onChange={changeDisplayMode}
                >
                  <s-choice value="block">Offer Upsell Block</s-choice>
                  <s-choice value="button">Offer Upsell Button</s-choice>
                </s-choice-list>
                <s-banner tone="info" dismissible={false} hidden={false}>
                  Select whether the upsell appears as a complete offer block or
                  a compact button.
                </s-banner>
              </s-stack>
            </s-section>

            <s-section>
              <s-stack direction="block" gap="base">
                <s-stack
                  direction="inline"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="small"
                >
                  <s-heading>Widget Settings</s-heading>
                  <s-button
                    variant="secondary"
                    icon="globe"
                    disabled={
                      disabled || (flow.shopLocales?.length ?? 0) === 0 || undefined
                    }
                    onClick={() =>
                      flow.openMultiLanguageModal("Bundle Widget", [
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
                      ], "widget")
                    }
                  >
                    Multi Language
                  </s-button>
                </s-stack>
                <s-grid
                  gridTemplateColumns="@container ppb-widget-settings (inline-size > 680px) minmax(220px, 0.8fr) minmax(0, 1.2fr), 1fr"
                  gap="base"
                >
                  <flow.FilePicker
                    label="Upload Image"
                    value={flow.upsellWidgetImageUrl || null}
                    disabled={disabled}
                    fitPreviewToTrigger
                    onChange={(url: string | null) => {
                      flow.setUpsellWidgetImageUrl(url ?? "");
                      flow.markAsDirty();
                    }}
                  />
                  <s-stack direction="block" gap="base">
                    <s-text-field
                      id="configure-widget-title"
                      label="Widget Title"
                      value={flow.upsellWidgetTitle}
                      required={
                        flow.upsellWidgetDisplayMode !== "button" || undefined
                      }
                      disabled={disabled || undefined}
                      error={flow.validationErrors["widget.title"]}
                      onInput={(event: Event) => {
                        flow.setUpsellWidgetTitle(
                          (event.target as HTMLInputElement).value
                        );
                        flow.markAsDirty();
                        flow.clearValidationError("widget.title");
                      }}
                    />
                    <s-text-area
                      label="Widget Description"
                      value={flow.upsellWidgetDescription}
                      rows={3}
                      disabled={disabled || undefined}
                      onInput={(event: Event) => {
                        flow.setUpsellWidgetDescription(
                          (event.target as HTMLTextAreaElement).value
                        );
                        flow.markAsDirty();
                      }}
                    />
                    <s-text-field
                      id="configure-widget-buttonText"
                      label="Widget Button Text"
                      value={flow.upsellWidgetButtonText}
                      required
                      disabled={disabled || undefined}
                      error={flow.validationErrors["widget.buttonText"]}
                      onInput={(event: Event) => {
                        flow.setUpsellWidgetButtonText(
                          (event.target as HTMLInputElement).value
                        );
                        flow.markAsDirty();
                        flow.clearValidationError("widget.buttonText");
                      }}
                    />
                  </s-stack>
                </s-grid>
              </s-stack>
            </s-section>

            <s-section>
              <s-stack direction="block" gap="base">
                <s-heading>Display Widget on</s-heading>
                <s-choice-list
                  label="Product-page targeting"
                  labelAccessibilityVisibility="exclusive"
                  name="ppbWidgetDisplayOn"
                  values={[flow.upsellWidgetDisplayOn]}
                  disabled={disabled || undefined}
                  onChange={changeTarget}
                >
                  {WIDGET_TARGETS.map((target) => (
                    <s-choice key={target.value} value={target.value}>
                      {target.label}
                    </s-choice>
                  ))}
                </s-choice-list>

                {flow.upsellWidgetDisplayOn === "specific_products" && (
                  <s-stack direction="block" gap="small">
                    <s-button
                      variant="secondary"
                      icon="product"
                      disabled={disabled || undefined}
                      onClick={async () => {
                        await flow.openVisibilityProductPicker("widget");
                        flow.clearValidationError("widget.products");
                      }}
                    >
                      Select products
                    </s-button>
                    {flow.upsellWidgetSelectedProducts.map(
                      (product: any, index: number) => (
                        <s-box
                          key={flow.getVisibilityResourceId(product) ?? index}
                          padding="small"
                          background="subdued"
                          borderRadius="base"
                        >
                          <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="space-between"
                            gap="small"
                          >
                            <s-text>
                              {product.title ?? "Untitled product"}
                            </s-text>
                            <s-button
                              variant="tertiary"
                              icon="delete"
                              disabled={disabled || undefined}
                              accessibilityLabel={`Remove ${
                                product.title ?? "product"
                              }`}
                              onClick={() =>
                                flow.removeVisibilityProductTarget(
                                  "widget",
                                  index
                                )
                              }
                            />
                          </s-stack>
                        </s-box>
                      )
                    )}
                    {flow.validationErrors["widget.products"] && (
                      <s-text id="configure-widget-products" tone="critical">
                        {flow.validationErrors["widget.products"]}
                      </s-text>
                    )}
                  </s-stack>
                )}

                {flow.upsellWidgetDisplayOn === "specific_collections" && (
                  <s-stack direction="block" gap="small">
                    <s-button
                      variant="secondary"
                      icon="product"
                      disabled={disabled || undefined}
                      onClick={async () => {
                        await flow.openVisibilityCollectionPicker("widget");
                        flow.clearValidationError("widget.collections");
                      }}
                    >
                      Select collections
                    </s-button>
                    {flow.upsellWidgetCollectionsSelectedData.map(
                      (collection: any, index: number) => (
                        <s-box
                          key={
                            flow.getVisibilityResourceId(collection) ?? index
                          }
                          padding="small"
                          background="subdued"
                          borderRadius="base"
                        >
                          <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="space-between"
                            gap="small"
                          >
                            <s-text>
                              {collection.title ?? "Untitled collection"}
                            </s-text>
                            <s-button
                              variant="tertiary"
                              icon="delete"
                              disabled={disabled || undefined}
                              accessibilityLabel={`Remove ${
                                collection.title ?? "collection"
                              }`}
                              onClick={() =>
                                flow.removeVisibilityCollectionTarget(
                                  "widget",
                                  index
                                )
                              }
                            />
                          </s-stack>
                        </s-box>
                      )
                    )}
                    {flow.validationErrors["widget.collections"] && (
                      <s-text id="configure-widget-collections" tone="critical">
                        {flow.validationErrors["widget.collections"]}
                      </s-text>
                    )}
                  </s-stack>
                )}

                <s-checkbox
                  label="Add browsed product to bundle"
                  checked={flow.autoSelectBrowsedProduct || undefined}
                  disabled={disabled || undefined}
                  onChange={(event: Event) => {
                    flow.setAutoSelectBrowsedProduct(
                      (event.target as HTMLInputElement).checked
                    );
                    flow.markAsDirty();
                  }}
                />
              </s-stack>
            </s-section>

            <s-section>
              <s-stack
                direction="inline"
                alignItems="center"
                justifyContent="space-between"
                gap="base"
              >
                <s-stack direction="inline" alignItems="start" gap="small">
                  <s-icon type="globe" />
                  <s-stack direction="block" gap="small-100">
                    <s-heading>Place the upsell at a custom location</s-heading>
                    <s-text color="subdued">
                      By default, the upsell is added below the Buy Button. Move
                      it to another product-page location if needed.
                    </s-text>
                  </s-stack>
                </s-stack>
                <s-button
                  variant="primary"
                  disabled={disabled || undefined}
                  onClick={flow.handlePlaceWidget}
                >
                  Place Widget
                </s-button>
              </s-stack>
            </s-section>
          </s-stack>
        </DisabledConfigurationRegion>
      </s-stack>
    </div>
  );
}
