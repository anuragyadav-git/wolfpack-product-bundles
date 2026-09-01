import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { getConfigureActionIcon } from "../../../lib/bundle-config/configure-action-icons";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { ConfigureHelpPopover } from "../_shared/bundle-configure/ConfigureHelpPopover";

const TARGETS = [
  { value: "all_products", label: "All products in bundle" },
  { value: "specific_products", label: "Specific products" },
  { value: "specific_collections", label: "Specific collections" },
] as const;

export function PpbBundleEmbedSection() {
  const flow = usePpbConfigureContext();
  if (flow.activeSection !== "bundle_embed") return null;

  const disabled = !flow.bundleEmbedEnabled;
  const changeTarget = (value: string) => {
    if (value === flow.bundleEmbedDisplayOn) return;
    flow.setBundleEmbedSelectedProducts([]);
    flow.setBundleEmbedSpecificProductPages([]);
    flow.setBundleEmbedCollectionsSelectedData([]);
    flow.setBundleEmbedSpecificCollectionPages([]);
    flow.setBundleEmbedDisplayOn(value);
    flow.clearValidationError("embed.products");
    flow.clearValidationError("embed.collections");
    flow.markAsDirty();
  };

  return (
    <div data-tour-target="ppb-bundle-embed">
      <s-stack direction="block" gap="base">
        <s-section>
          <s-stack direction="block" gap="base">
            <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
              <s-stack direction="inline" alignItems="center" gap="small">
                <s-heading>Embed Bundle Builder on Product Pages</s-heading>
                <ConfigureHelpPopover tooltipKey="bundleEmbed" />
                <s-switch
                  accessibilityLabel="Embed Bundle Builder on Product Pages"
                  checked={flow.bundleEmbedEnabled || undefined}
                  onChange={(event: Event) => {
                    flow.setBundleEmbedEnabled((event.target as HTMLInputElement).checked);
                    flow.markAsDirty();
                  }}
                />
              </s-stack>
              <s-button
                variant="secondary"
                icon="language-translate"
                disabled={disabled || (flow.shopLocales?.length ?? 0) === 0 || undefined}
                onClick={() => flow.openMultiLanguageModal(
                  "Bundle Embed",
                  [
                    { key: "title", label: "Title", fallback: flow.bundleEmbedTitle },
                    { key: "subTitle", label: "Sub Title", fallback: flow.bundleEmbedSubTitle, multiline: true },
                  ],
                  "embed",
                )}
              >
                Multi Language
              </s-button>
            </s-stack>

            <s-text color="subdued">
              Directly embed the Bundle Builder block on product pages to let customers curate their bundles right there.
            </s-text>

            <DisabledConfigurationRegion disabled={disabled}>
              <s-stack direction="block" gap="base">
                <s-text-field
                  id="configure-embed-title"
                  label="Title"
                  value={flow.bundleEmbedTitle}
                  required
                  disabled={disabled || undefined}
                  error={flow.validationErrors["embed.title"]}
                  onInput={(event: Event) => {
                    flow.setBundleEmbedTitle((event.target as HTMLInputElement).value);
                    flow.clearValidationError("embed.title");
                    flow.markAsDirty();
                  }}
                />
                <s-text-field
                  label="Sub Title"
                  value={flow.bundleEmbedSubTitle}
                  disabled={disabled || undefined}
                  onInput={(event: Event) => {
                    flow.setBundleEmbedSubTitle((event.target as HTMLInputElement).value);
                    flow.markAsDirty();
                  }}
                />

                <s-heading>Display Bundle on</s-heading>
                <s-choice-list
                  label="Product-page targeting"
                  labelAccessibilityVisibility="exclusive"
                  name="ppbEmbedDisplayOn"
                  values={[flow.bundleEmbedDisplayOn]}
                  disabled={disabled || undefined}
                  onChange={(event: Event) => {
                    const value = (event.target as HTMLElement & { values?: string[] }).values?.[0];
                    if (value && TARGETS.some((target) => target.value === value)) changeTarget(value);
                  }}
                >
                  {TARGETS.map((target) => (
                    <s-choice key={target.value} value={target.value}>{target.label}</s-choice>
                  ))}
                </s-choice-list>

                {flow.bundleEmbedDisplayOn === "specific_products" && (
                  <EmbedResourcePicker
                    buttonLabel="Select products"
                    icon={getConfigureActionIcon("add-product")}
                    disabled={disabled}
                    onOpen={async () => {
                      await flow.openVisibilityProductPicker("embed");
                      flow.clearValidationError("embed.products");
                    }}
                    onRemove={(index) => flow.removeVisibilityProductTarget("embed", index)}
                    resources={flow.bundleEmbedSelectedProducts}
                    resourceId={flow.getVisibilityResourceId}
                    validationError={flow.validationErrors["embed.products"]}
                    validationId="configure-embed-products"
                  />
                )}

                {flow.bundleEmbedDisplayOn === "specific_collections" && (
                  <EmbedResourcePicker
                    buttonLabel="Select collections"
                    icon={getConfigureActionIcon("add-collection")}
                    disabled={disabled}
                    onOpen={async () => {
                      await flow.openVisibilityCollectionPicker("embed");
                      flow.clearValidationError("embed.collections");
                    }}
                    onRemove={(index) => flow.removeVisibilityCollectionTarget("embed", index)}
                    resources={flow.bundleEmbedCollectionsSelectedData}
                    resourceId={flow.getVisibilityResourceId}
                    validationError={flow.validationErrors["embed.collections"]}
                    validationId="configure-embed-collections"
                  />
                )}

                <s-divider />
                <s-checkbox
                  label="Add browsed product to bundle"
                  checked={flow.bundleEmbedAddBrowsedProduct || undefined}
                  disabled={disabled || undefined}
                  onChange={(event: Event) => {
                    flow.setBundleEmbedAddBrowsedProduct((event.target as HTMLInputElement).checked);
                    flow.markAsDirty();
                  }}
                />
              </s-stack>
            </DisabledConfigurationRegion>
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="block" gap="base">
            <s-heading>Put the Bundle Builder at a custom location</s-heading>
            <s-box padding="base" background="subdued" borderRadius="base">
              <s-stack direction="inline" alignItems="center" justifyContent="space-between" gap="base">
                <s-text>Place app block on the theme</s-text>
                <s-button variant="primary" icon="theme-edit" onClick={flow.handlePlaceWidget}>Place Block</s-button>
              </s-stack>
            </s-box>
          </s-stack>
        </s-section>
      </s-stack>
    </div>
  );
}

function EmbedResourcePicker({ buttonLabel, disabled, icon, onOpen, onRemove, resources, resourceId, validationError, validationId }: {
  buttonLabel: string;
  disabled: boolean;
  icon: string;
  onOpen: () => void | Promise<void>;
  onRemove: (index: number) => void;
  resources: Array<{ id?: string; title?: string; [key: string]: unknown }>;
  resourceId: (resource: any) => string | null;
  validationError?: string;
  validationId: string;
}) {
  return (
    <s-stack direction="block" gap="small">
      <s-button variant="secondary" icon={icon as any} disabled={disabled || undefined} onClick={onOpen}>{buttonLabel}</s-button>
      {resources.map((resource, index) => (
        <s-box key={resourceId(resource) ?? resource.id ?? index} padding="small" background="subdued" borderRadius="base">
          <s-stack direction="inline" alignItems="center" justifyContent="space-between" gap="small">
            <s-text>{resource.title ?? resource.id ?? ""}</s-text>
            <s-button
              variant="tertiary"
              icon="delete"
              disabled={disabled || undefined}
              accessibilityLabel="Remove selected resource"
              onClick={() => onRemove(index)}
            />
          </s-stack>
        </s-box>
      ))}
      {validationError && <s-text id={validationId} tone="critical">{validationError}</s-text>}
    </s-stack>
  );
}
