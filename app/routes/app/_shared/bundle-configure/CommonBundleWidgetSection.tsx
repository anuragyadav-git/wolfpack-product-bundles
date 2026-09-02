import type { ComponentType } from "react";

import { getConfigureActionIcon } from "../../../../lib/bundle-config/configure-action-icons";
import { DisabledConfigurationRegion } from "./DisabledConfigurationRegion";
import { ConfigureHelpPopover } from "./ConfigureHelpPopover";
import styles from "./CommonBundleVisibilityOverview.module.css";
import { translateAdmin } from "~/i18n/config";

type WidgetDisplayMode = "block" | "button";
type WidgetDisplayOn = "all" | "specific_products" | "specific_collections";

interface WidgetResource {
  id?: string;
  title?: string;
  [key: string]: unknown;
}

interface CommonBundleWidgetSectionProps {
  addBrowsedProduct: boolean;
  buttonText: string;
  collections: WidgetResource[];
  description: string;
  disabled: boolean;
  displayMode: WidgetDisplayMode;
  displayOn: WidgetDisplayOn;
  enabled: boolean;
  FilePicker: ComponentType<any>;
  getResourceId?: (resource: WidgetResource) => string | null;
  imageUrl: string;
  multiLanguageDisabled: boolean;
  onAddBrowsedProductChange: (checked: boolean) => void;
  onButtonTextChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDisplayModeChange: (value: WidgetDisplayMode) => void;
  onDisplayOnChange: (value: WidgetDisplayOn) => void;
  onEnabledChange: (checked: boolean) => void;
  onImageUrlChange: (value: string) => void;
  onOpenCollectionPicker: () => void | Promise<void>;
  onOpenMultiLanguage: () => void;
  onOpenProductPicker: () => void | Promise<void>;
  onPlaceWidget: () => void;
  onRemoveCollection: (index: number) => void;
  onRemoveProduct: (index: number) => void;
  onTitleChange: (value: string) => void;
  products: WidgetResource[];
  title: string;
  validationErrors: Record<string, string | undefined>;
}

const TARGETS: Array<{ value: WidgetDisplayOn; label: string }> = [
  { value: "all", label: "All products in bundle" },
  { value: "specific_products", label: "Specific products" },
  { value: "specific_collections", label: "Specific collections" },
];

export function CommonBundleWidgetSection(
  props: CommonBundleWidgetSectionProps
) {
  const {
    addBrowsedProduct,
    buttonText,
    collections,
    description,
    disabled,
    displayMode,
    displayOn,
    enabled,
    FilePicker,
    getResourceId,
    imageUrl,
    multiLanguageDisabled,
    onAddBrowsedProductChange,
    onButtonTextChange,
    onDescriptionChange,
    onDisplayModeChange,
    onDisplayOnChange,
    onEnabledChange,
    onImageUrlChange,
    onOpenCollectionPicker,
    onOpenMultiLanguage,
    onOpenProductPicker,
    onPlaceWidget,
    onRemoveCollection,
    onRemoveProduct,
    onTitleChange,
    products,
    title,
    validationErrors,
  } = props;
  const placementNoun = displayMode === "button" ? "Button" : "Block";

  return (
    <s-stack direction="block" gap="base">
      <s-section>
        <s-stack direction="block" gap="base">
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="start"
            gap="base"
          >
            <s-stack direction="block" gap="small-100">
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-heading>
                  {translateAdmin(
                    "adminExtracted.shared.bundleConfigure.commonbundlewidgetsection.productPageBundleUpsellWidgets"
                  )}
                </s-heading>
                <ConfigureHelpPopover tooltipKey="bundleWidget" />
              </s-stack>
              <s-text color="subdued">
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonbundlewidgetsection.thisWillDisplayAnUpsellBlockOrButtonOnTheProductPagesOfYourChoic"
                )}
              </s-text>
            </s-stack>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.enableProductPageBundleUpsellWidgets"
              )}
              checked={enabled || undefined}
              onChange={(event: Event) =>
                onEnabledChange((event.target as HTMLInputElement).checked)
              }
            />
          </s-stack>

          <DisabledConfigurationRegion disabled={disabled}>
            <s-stack direction="block" gap="base">
              <div className={styles.widgetPreviewFrame}>
                <s-image
                  aspectRatio="16/9"
                  src={
                    displayMode === "button"
                      ? "/Upsell-Button.png"
                      : "/Upsell-Block.png"
                  }
                  alt={`Product page with a bundle upsell ${displayMode}`}
                />
                <s-box padding="base">
                  <div className={styles.widgetTypeChoices}>
                    <s-choice-list
                      label={translateAdmin("adminAttributes.widgetType")}
                      labelAccessibilityVisibility="exclusive"
                      name="sharedUpsellWidgetTypeBlock"
                      values={displayMode === "block" ? ["block"] : []}
                      disabled={disabled || undefined}
                      onChange={() => onDisplayModeChange("block")}
                    >
                      <s-choice value="block">
                        {translateAdmin(
                          "adminExtracted.shared.bundleConfigure.commonbundlewidgetsection.offerUpsellBlock"
                        )}
                      </s-choice>
                    </s-choice-list>
                    <s-choice-list
                      label={translateAdmin("adminAttributes.widgetType")}
                      labelAccessibilityVisibility="exclusive"
                      name="sharedUpsellWidgetTypeButton"
                      values={displayMode === "button" ? ["button"] : []}
                      disabled={disabled || undefined}
                      onChange={() => onDisplayModeChange("button")}
                    >
                      <s-choice value="button">
                        {translateAdmin(
                          "adminExtracted.shared.bundleConfigure.commonbundlewidgetsection.offerUpsellButton"
                        )}
                      </s-choice>
                    </s-choice-list>
                  </div>
                </s-box>
              </div>

              <s-paragraph>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonbundlewidgetsection.selectIfYouWantTheUpsellBlockOrButtonToAppearOnProductPages"
                )}
              </s-paragraph>

              <s-stack
                direction="inline"
                alignItems="center"
                justifyContent="space-between"
                gap="small"
              >
                <s-heading>
                  {translateAdmin(
                    "adminExtracted.shared.bundleConfigure.commonbundlewidgetsection.widgetSettings"
                  )}
                </s-heading>
                <s-button
                  variant="secondary"
                  icon={getConfigureActionIcon("translate")}
                  disabled={multiLanguageDisabled || undefined}
                  onClick={onOpenMultiLanguage}
                >
                  {translateAdmin(
                    "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                  )}
                </s-button>
              </s-stack>

              <div className={styles.widgetSettingsGrid}>
                {displayMode === "block" && (
                  <FilePicker
                    label={translateAdmin("adminAttributes.uploadImage")}
                    value={imageUrl || null}
                    disabled={disabled}
                    fitPreviewToTrigger
                    onChange={(url: string | null) =>
                      onImageUrlChange(url ?? "")
                    }
                  />
                )}
                <s-stack direction="block" gap="base">
                  {displayMode === "block" && (
                    <>
                      <s-text-field
                        id="configure-widget-title"
                        label={translateAdmin("adminAttributes.widgetTitle")}
                        value={title}
                        required
                        disabled={disabled || undefined}
                        error={validationErrors["widget.title"]}
                        onInput={(event: Event) =>
                          onTitleChange(
                            (event.target as HTMLInputElement).value
                          )
                        }
                      />
                      <s-text-area
                        label={translateAdmin(
                          "adminAttributes.widgetDescription"
                        )}
                        value={description}
                        rows={3}
                        disabled={disabled || undefined}
                        onInput={(event: Event) =>
                          onDescriptionChange(
                            (event.target as HTMLTextAreaElement).value
                          )
                        }
                      />
                    </>
                  )}
                  <s-text-field
                    id="configure-widget-buttonText"
                    label={translateAdmin("adminAttributes.widgetButtonText")}
                    value={buttonText}
                    required
                    disabled={disabled || undefined}
                    error={validationErrors["widget.buttonText"]}
                    onInput={(event: Event) =>
                      onButtonTextChange(
                        (event.target as HTMLInputElement).value
                      )
                    }
                  />
                </s-stack>
              </div>

              <s-heading>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonbundlewidgetsection.displayWidgetOn"
                )}
              </s-heading>
              <s-choice-list
                label={translateAdmin("adminAttributes.productPageTargeting")}
                labelAccessibilityVisibility="exclusive"
                name="sharedWidgetDisplayOn"
                values={[displayOn]}
                disabled={disabled || undefined}
                onChange={(event: Event) => {
                  const value = (
                    event.target as HTMLElement & { values?: string[] }
                  ).values?.[0] as WidgetDisplayOn | undefined;
                  if (value && TARGETS.some((target) => target.value === value))
                    onDisplayOnChange(value);
                }}
              >
                {TARGETS.map((target) => (
                  <s-choice key={target.value} value={target.value}>
                    {target.label}
                  </s-choice>
                ))}
              </s-choice-list>

              {displayOn === "specific_products" && (
                <ResourcePickerList
                  buttonLabel="Select products"
                  icon={getConfigureActionIcon("add-product")}
                  disabled={disabled}
                  getResourceId={getResourceId}
                  onOpen={onOpenProductPicker}
                  onRemove={onRemoveProduct}
                  resources={products}
                  validationError={validationErrors["widget.products"]}
                  validationId="configure-widget-products"
                />
              )}
              {displayOn === "specific_collections" && (
                <ResourcePickerList
                  buttonLabel="Select collections"
                  icon={getConfigureActionIcon("add-collection")}
                  disabled={disabled}
                  getResourceId={getResourceId}
                  onOpen={onOpenCollectionPicker}
                  onRemove={onRemoveCollection}
                  resources={collections}
                  validationError={validationErrors["widget.collections"]}
                  validationId="configure-widget-collections"
                />
              )}

              <s-divider />
              <s-checkbox
                label={translateAdmin(
                  "adminAttributes.addBrowsedProductToBundle"
                )}
                checked={addBrowsedProduct || undefined}
                disabled={disabled || undefined}
                onChange={(event: Event) =>
                  onAddBrowsedProductChange(
                    (event.target as HTMLInputElement).checked
                  )
                }
              />
            </s-stack>
          </DisabledConfigurationRegion>
        </s-stack>
      </s-section>

      <DisabledConfigurationRegion disabled={disabled}>
        <s-section>
          <s-stack
            direction="inline"
            alignItems="center"
            justifyContent="space-between"
            gap="base"
          >
            <s-stack direction="block" gap="small-100">
              <s-heading>
                {translateAdmin("adminDynamic.embedUpsellAtCustomLocation", {
                  placement: placementNoun,
                })}
              </s-heading>
              <s-text color="subdued">
                {translateAdmin("adminDynamic.upsellDefaultPlacement", {
                  displayMode,
                })}
              </s-text>
            </s-stack>
            <s-button
              variant="secondary"
              icon={getConfigureActionIcon("place")}
              disabled={disabled || undefined}
              onClick={onPlaceWidget}
            >
              {translateAdmin("adminDynamic.embedUpsell", {
                placement: placementNoun,
              })}
            </s-button>
          </s-stack>
        </s-section>
      </DisabledConfigurationRegion>
    </s-stack>
  );
}

function ResourcePickerList({
  buttonLabel,
  disabled,
  getResourceId,
  icon,
  onOpen,
  onRemove,
  resources,
  validationError,
  validationId,
}: {
  buttonLabel: string;
  disabled: boolean;
  getResourceId?: (resource: WidgetResource) => string | null;
  icon: string;
  onOpen: () => void | Promise<void>;
  onRemove: (index: number) => void;
  resources: WidgetResource[];
  validationError?: string;
  validationId: string;
}) {
  return (
    <s-stack direction="block" gap="small">
      <s-button
        variant="secondary"
        icon={icon as any}
        disabled={disabled || undefined}
        onClick={onOpen}
      >
        {buttonLabel}
      </s-button>
      {resources.map((resource, index) => (
        <s-box
          key={getResourceId?.(resource) ?? resource.id ?? index}
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
            <s-text>{resource.title ?? resource.id ?? ""}</s-text>
            <s-button
              variant="tertiary"
              icon={getConfigureActionIcon("remove")}
              disabled={disabled || undefined}
              accessibilityLabel={translateAdmin(
                "adminAttributes.removeSelectedResource"
              )}
              onClick={() => onRemove(index)}
            />
          </s-stack>
        </s-box>
      ))}
      {validationError && (
        <s-text id={validationId} tone="critical">
          {validationError}
        </s-text>
      )}
    </s-stack>
  );
}
