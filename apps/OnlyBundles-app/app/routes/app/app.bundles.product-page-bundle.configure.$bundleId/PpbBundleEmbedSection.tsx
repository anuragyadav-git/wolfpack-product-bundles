import type { ComponentProps } from "react";

import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { getConfigureActionIcon } from "../../../lib/bundle-config/configure-action-icons";
import { ConfigureHelpPopover } from "../_shared/bundle-configure/ConfigureHelpPopover";
import { translateAdmin } from "~/i18n/config";
import { getVisibilityResourceId } from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

const TARGETS = [
  { value: "all_products", label: "All products in bundle" },
  { value: "specific_products", label: "Specific products" },
  { value: "specific_collections", label: "Specific collections" },
] as const;

export type PpbBundleEmbedSectionProps = Pick<
  PpbConfigureFlow,
  | "activeSection"
  | "bundleEmbedAddBrowsedProduct"
  | "bundleEmbedCollectionsSelectedData"
  | "bundleEmbedDisplayOn"
  | "bundleEmbedEnabled"
  | "bundleEmbedSelectedProducts"
  | "bundleEmbedSubTitle"
  | "bundleEmbedTitle"
  | "clearValidationError"
  | "handlePlaceWidget"
  | "markAsDirty"
  | "openMultiLanguageModal"
  | "openVisibilityCollectionPicker"
  | "openVisibilityProductPicker"
  | "removeVisibilityCollectionTarget"
  | "removeVisibilityProductTarget"
  | "setBundleEmbedAddBrowsedProduct"
  | "setBundleEmbedCollectionsSelectedData"
  | "setBundleEmbedDisplayOn"
  | "setBundleEmbedEnabled"
  | "setBundleEmbedSelectedProducts"
  | "setBundleEmbedSpecificCollectionPages"
  | "setBundleEmbedSpecificProductPages"
  | "setBundleEmbedSubTitle"
  | "setBundleEmbedTitle"
  | "shopLocales"
  | "validationErrors"
>;

export function PpbBundleEmbedSection({
  activeSection,
  bundleEmbedAddBrowsedProduct,
  bundleEmbedCollectionsSelectedData,
  bundleEmbedDisplayOn,
  bundleEmbedEnabled,
  bundleEmbedSelectedProducts,
  bundleEmbedSubTitle,
  bundleEmbedTitle,
  clearValidationError,
  handlePlaceWidget,
  markAsDirty,
  openMultiLanguageModal,
  openVisibilityCollectionPicker,
  openVisibilityProductPicker,
  removeVisibilityCollectionTarget,
  removeVisibilityProductTarget,
  setBundleEmbedAddBrowsedProduct,
  setBundleEmbedCollectionsSelectedData,
  setBundleEmbedDisplayOn,
  setBundleEmbedEnabled,
  setBundleEmbedSelectedProducts,
  setBundleEmbedSpecificCollectionPages,
  setBundleEmbedSpecificProductPages,
  setBundleEmbedSubTitle,
  setBundleEmbedTitle,
  shopLocales,
  validationErrors,
}: PpbBundleEmbedSectionProps) {
  if (activeSection !== "bundle_embed") return null;

  const disabled = !bundleEmbedEnabled;
  const changeTarget = (value: string) => {
    if (value === bundleEmbedDisplayOn) return;
    setBundleEmbedSelectedProducts([]);
    setBundleEmbedSpecificProductPages([]);
    setBundleEmbedCollectionsSelectedData([]);
    setBundleEmbedSpecificCollectionPages([]);
    setBundleEmbedDisplayOn(value);
    clearValidationError("embed.products");
    clearValidationError("embed.collections");
    markAsDirty();
  };

  return (
    <div data-tour-target="ppb-bundle-embed">
      <s-stack direction="block" gap="base">
        <s-section>
          <s-stack direction="block" gap="base">
            <s-stack
              direction="inline"
              justifyContent="space-between"
              alignItems="center"
              gap="base"
            >
              <s-stack direction="inline" alignItems="center" gap="small">
                <s-heading>
                  {translateAdmin(
                    "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundleembedsection.embedBundleBuilderOnProductPages"
                  )}
                </s-heading>
                <ConfigureHelpPopover tooltipKey="bundleEmbed" />
                <s-switch
                  accessibilityLabel={translateAdmin(
                    "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundleembedsection.embedBundleBuilderOnProductPages"
                  )}
                  checked={bundleEmbedEnabled || undefined}
                  onChange={(event: Event) => {
                    setBundleEmbedEnabled(
                      (event.target as HTMLInputElement).checked
                    );
                    markAsDirty();
                  }}
                />
              </s-stack>
              <s-button
                variant="secondary"
                icon="language-translate"
                disabled={
                  disabled || (shopLocales?.length ?? 0) === 0 || undefined
                }
                onClick={() =>
                  openMultiLanguageModal(
                    "Bundle Embed",
                    [
                      {
                        key: "title",
                        label: "Title",
                        fallback: bundleEmbedTitle,
                      },
                      {
                        key: "subTitle",
                        label: "Sub Title",
                        fallback: bundleEmbedSubTitle,
                        multiline: true,
                      },
                    ],
                    "embed"
                  )
                }
              >
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                )}
              </s-button>
            </s-stack>

            <s-text color="subdued">
              {translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundleembedsection.directlyEmbedTheBundleBuilderBlockOnProductPagesToLetCustomersCu"
              )}
            </s-text>

            <DisabledConfigurationRegion disabled={disabled}>
              <s-stack direction="block" gap="base">
                <s-text-field
                  id="configure-embed-title"
                  label={translateAdmin("adminAttributes.title")}
                  value={bundleEmbedTitle}
                  required
                  disabled={disabled || undefined}
                  error={validationErrors["embed.title"]}
                  onInput={(event: Event) => {
                    setBundleEmbedTitle(
                      (event.target as HTMLInputElement).value
                    );
                    clearValidationError("embed.title");
                    markAsDirty();
                  }}
                />
                <s-text-field
                  label={translateAdmin("adminAttributes.subTitle")}
                  value={bundleEmbedSubTitle}
                  disabled={disabled || undefined}
                  onInput={(event: Event) => {
                    setBundleEmbedSubTitle(
                      (event.target as HTMLInputElement).value
                    );
                    markAsDirty();
                  }}
                />

                <s-heading>
                  {translateAdmin(
                    "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundleembedsection.displayBundleOn"
                  )}
                </s-heading>
                <s-choice-list
                  label={translateAdmin("adminAttributes.productPageTargeting")}
                  labelAccessibilityVisibility="exclusive"
                  name="ppbEmbedDisplayOn"
                  values={[bundleEmbedDisplayOn]}
                  disabled={disabled || undefined}
                  onChange={(event: Event) => {
                    const value = (
                      event.target as HTMLElement & { values?: string[] }
                    ).values?.[0];
                    if (
                      value &&
                      TARGETS.some((target) => target.value === value)
                    )
                      changeTarget(value);
                  }}
                >
                  {TARGETS.map((target) => (
                    <s-choice key={target.value} value={target.value}>
                      {target.label}
                    </s-choice>
                  ))}
                </s-choice-list>

                {bundleEmbedDisplayOn === "specific_products" && (
                  <EmbedResourcePicker
                    buttonLabel="Select products"
                    icon={getConfigureActionIcon("add-product")}
                    disabled={disabled}
                    onOpen={async () => {
                      await openVisibilityProductPicker("embed");
                      clearValidationError("embed.products");
                    }}
                    onRemove={(index) =>
                      removeVisibilityProductTarget("embed", index)
                    }
                    resources={bundleEmbedSelectedProducts}
                    resourceId={getVisibilityResourceId}
                    validationError={validationErrors["embed.products"]}
                    validationId="configure-embed-products"
                  />
                )}

                {bundleEmbedDisplayOn === "specific_collections" && (
                  <EmbedResourcePicker
                    buttonLabel="Select collections"
                    icon={getConfigureActionIcon("add-collection")}
                    disabled={disabled}
                    onOpen={async () => {
                      await openVisibilityCollectionPicker("embed");
                      clearValidationError("embed.collections");
                    }}
                    onRemove={(index) =>
                      removeVisibilityCollectionTarget("embed", index)
                    }
                    resources={bundleEmbedCollectionsSelectedData}
                    resourceId={getVisibilityResourceId}
                    validationError={validationErrors["embed.collections"]}
                    validationId="configure-embed-collections"
                  />
                )}

                <s-divider />
                <s-checkbox
                  label={translateAdmin(
                    "adminAttributes.addBrowsedProductToBundle"
                  )}
                  checked={bundleEmbedAddBrowsedProduct || undefined}
                  disabled={disabled || undefined}
                  onChange={(event: Event) => {
                    setBundleEmbedAddBrowsedProduct(
                      (event.target as HTMLInputElement).checked
                    );
                    markAsDirty();
                  }}
                />
              </s-stack>
            </DisabledConfigurationRegion>
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="block" gap="base">
            <s-heading>
              {translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundleembedsection.putTheBundleBuilderAtACustomLocation"
              )}
            </s-heading>
            <s-box padding="base" background="subdued" borderRadius="base">
              <s-stack
                direction="inline"
                alignItems="center"
                justifyContent="space-between"
                gap="base"
              >
                <s-text>
                  {translateAdmin(
                    "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundleembedsection.placeAppBlockOnTheTheme"
                  )}
                </s-text>
                <s-button
                  variant="primary"
                  icon="theme-edit"
                  onClick={handlePlaceWidget}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundleembedsection.placeBlock"
                  )}
                </s-button>
              </s-stack>
            </s-box>
          </s-stack>
        </s-section>
      </s-stack>
    </div>
  );
}

function EmbedResourcePicker({
  buttonLabel,
  disabled,
  icon,
  onOpen,
  onRemove,
  resources,
  resourceId,
  validationError,
  validationId,
}: {
  buttonLabel: string;
  disabled: boolean;
  icon: ComponentProps<"s-button">["icon"];
  onOpen: () => void | Promise<void>;
  onRemove: (index: number) => void;
  resources: Array<{ id?: string; title?: string; [key: string]: unknown }>;
  resourceId: (resource: any) => string | null;
  validationError?: string;
  validationId: string;
}) {
  return (
    <s-stack direction="block" gap="small">
      <s-button
        variant="secondary"
        icon={icon}
        disabled={disabled || undefined}
        onClick={onOpen}
      >
        {buttonLabel}
      </s-button>
      {resources.map((resource, index) => (
        <s-box
          key={resourceId(resource) ?? resource.id ?? index}
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
              icon="delete"
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
