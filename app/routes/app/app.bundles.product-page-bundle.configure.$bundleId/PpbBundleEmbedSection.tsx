import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { usePpbConfigureContext } from "./PpbConfigureContext";

const TARGETS = [
  { value: "all_products", label: "All products in bundle" },
  { value: "specific_products", label: "Specific products" },
  { value: "specific_collections", label: "Specific collections" },
] as const;

export function PpbBundleEmbedSection() {
  const flow = usePpbConfigureContext();
  if (flow.activeSection !== "bundle_embed") return null;

  const disabled = !flow.bundleEmbedEnabled;
  const clearTargets = () => {
    flow.setBundleEmbedSelectedProducts([]);
    flow.setBundleEmbedSpecificProductPages([]);
    flow.setBundleEmbedCollectionsSelectedData([]);
    flow.setBundleEmbedSpecificCollectionPages([]);
  };
  const changeTarget = (value: string) => {
    if (value === flow.bundleEmbedDisplayOn) return;
    clearTargets();
    flow.setBundleEmbedDisplayOn(value);
    flow.clearValidationError("embed.products");
    flow.clearValidationError("embed.collections");
    flow.markAsDirty();
  };

  return (
    <div data-tour-target="ppb-bundle-embed">
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
                <s-heading>Embed Bundle Builder on Product Pages</s-heading>
                <s-text color="subdued">
                  Directly embed the Bundle Builder block on product pages to
                  let customers curate their bundles there.
                </s-text>
              </s-stack>
            </s-stack>
            <s-switch
              accessibilityLabel="Embed Bundle Builder on Product Pages"
              checked={flow.bundleEmbedEnabled || undefined}
              onChange={(event: Event) => {
                flow.setBundleEmbedEnabled(
                  (event.target as HTMLInputElement).checked
                );
                flow.markAsDirty();
              }}
            />
          </s-stack>
        </s-section>

        {flow.bundleEmbedEnabled && !flow.appEmbedEnabled && (
          <s-banner tone="critical" heading="Enable the store App Embed">
            <s-stack direction="block" gap="small">
              <s-text>
                Bundle Embed cannot be saved until the Wolfpack Bundle app embed
                is active on the store theme.
              </s-text>
              <s-button
                variant="primary"
                icon="globe"
                onClick={flow.openThemeEditorForAppEmbed}
              >
                Enable app embed
              </s-button>
            </s-stack>
          </s-banner>
        )}

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
                  <s-heading>Storefront content</s-heading>
                  <s-stack direction="inline" alignItems="center" gap="small">
                    {disabled && <s-badge tone="neutral">Disabled</s-badge>}
                    <s-button
                      variant="secondary"
                      icon="globe"
                      disabled={
                        disabled || (flow.shopLocales?.length ?? 0) === 0 || undefined
                      }
                      onClick={() =>
                        flow.openMultiLanguageModal(
                          "Bundle Embed",
                          [
                            {
                              key: "title",
                              label: "Title",
                              fallback: flow.bundleEmbedTitle,
                            },
                            {
                              key: "subTitle",
                              label: "Sub Title",
                              fallback: flow.bundleEmbedSubTitle,
                              multiline: true,
                            },
                          ],
                          "embed"
                        )
                      }
                    >
                      Multi Language
                    </s-button>
                  </s-stack>
                </s-stack>
                <s-grid
                  gridTemplateColumns="@container ppb-embed-copy (inline-size > 680px) minmax(0, 1fr) minmax(0, 1fr), 1fr"
                  gap="base"
                >
                  <s-text-field
                    id="configure-embed-title"
                    label="Title"
                    value={flow.bundleEmbedTitle}
                    required
                    disabled={disabled || undefined}
                    error={flow.validationErrors["embed.title"]}
                    onInput={(event: Event) => {
                      flow.setBundleEmbedTitle(
                        (event.target as HTMLInputElement).value
                      );
                      flow.clearValidationError("embed.title");
                      flow.markAsDirty();
                    }}
                  />
                  <s-text-field
                    label="Sub Title"
                    value={flow.bundleEmbedSubTitle}
                    disabled={disabled || undefined}
                    onInput={(event: Event) => {
                      flow.setBundleEmbedSubTitle(
                        (event.target as HTMLInputElement).value
                      );
                      flow.markAsDirty();
                    }}
                  />
                </s-grid>
              </s-stack>
            </s-section>

            <s-section>
              <s-stack direction="block" gap="base">
                <s-heading>Display Bundle on</s-heading>
                <s-choice-list
                  label="Product-page targeting"
                  labelAccessibilityVisibility="exclusive"
                  name="ppbEmbedDisplayOn"
                  values={[flow.bundleEmbedDisplayOn]}
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

                {flow.bundleEmbedDisplayOn === "specific_products" && (
                  <s-stack direction="block" gap="small">
                    <s-button
                      variant="secondary"
                      icon="product"
                      disabled={disabled || undefined}
                      onClick={async () => {
                        await flow.openVisibilityProductPicker("embed");
                        flow.clearValidationError("embed.products");
                      }}
                    >
                      Select products
                    </s-button>
                    {flow.bundleEmbedSelectedProducts.map(
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
                                  "embed",
                                  index
                                )
                              }
                            />
                          </s-stack>
                        </s-box>
                      )
                    )}
                    {flow.validationErrors["embed.products"] && (
                      <s-text id="configure-embed-products" tone="critical">
                        {flow.validationErrors["embed.products"]}
                      </s-text>
                    )}
                  </s-stack>
                )}

                {flow.bundleEmbedDisplayOn === "specific_collections" && (
                  <s-stack direction="block" gap="small">
                    <s-button
                      variant="secondary"
                      icon="product"
                      disabled={disabled || undefined}
                      onClick={async () => {
                        await flow.openVisibilityCollectionPicker("embed");
                        flow.clearValidationError("embed.collections");
                      }}
                    >
                      Select collections
                    </s-button>
                    {flow.bundleEmbedCollectionsSelectedData.map(
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
                                  "embed",
                                  index
                                )
                              }
                            />
                          </s-stack>
                        </s-box>
                      )
                    )}
                    {flow.validationErrors["embed.collections"] && (
                      <s-text id="configure-embed-collections" tone="critical">
                        {flow.validationErrors["embed.collections"]}
                      </s-text>
                    )}
                  </s-stack>
                )}

                <s-checkbox
                  label="Add browsed product to bundle"
                  checked={flow.bundleEmbedAddBrowsedProduct || undefined}
                  disabled={disabled || undefined}
                  onChange={(event: Event) => {
                    flow.setBundleEmbedAddBrowsedProduct(
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
                    <s-heading>Place app block on the theme</s-heading>
                    <s-text color="subdued">
                      Put the Bundle Builder at a custom product-page location.
                    </s-text>
                  </s-stack>
                </s-stack>
                <s-button
                  variant="primary"
                  disabled={disabled || undefined}
                  onClick={flow.handlePlaceWidget}
                >
                  Place Block
                </s-button>
              </s-stack>
            </s-section>
          </s-stack>
        </DisabledConfigurationRegion>
      </s-stack>
    </div>
  );
}
