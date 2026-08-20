import { usePpbConfigureContext } from "./PpbConfigureContext";

const TARGETS = [
  { value: "all_products", label: "All products in bundle" },
  { value: "specific_products", label: "Specific products" },
  { value: "specific_collections", label: "Specific collections" },
] as const;

export function PpbBundleEmbedSection() {
  const flow = usePpbConfigureContext();
  if (flow.activeSection !== "bundle_embed") return null;

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
      <s-section>
        <s-stack direction="block" gap="base">
          <div className={flow.productPageBundleStyles.visibilityTitleSwitchRow}>
            <s-stack direction="block" gap="small-100">
              <s-heading>Embed Bundle Builder on Product Pages</s-heading>
              <s-text color="subdued">
                Directly embed the Bundle Builder block on product pages to let
                customers curate their bundles right there.
              </s-text>
            </s-stack>
            <s-switch
              accessibilityLabel="Embed Bundle Builder on Product Pages"
              checked={flow.bundleEmbedEnabled || undefined}
              onChange={(event: Event) => {
                flow.setBundleEmbedEnabled(
                  (event.target as HTMLInputElement).checked,
                );
                flow.markAsDirty();
              }}
            />
          </div>

          {flow.bundleEmbedEnabled && !flow.appEmbedEnabled && (
            <s-banner tone="critical" heading="Enable the store App Embed">
              <s-stack direction="block" gap="small">
                <s-text>
                  Bundle Embed cannot be saved until the Wolfpack Bundle app
                  embed is active on the store theme.
                </s-text>
                <s-button
                  variant="primary"
                  onClick={flow.openThemeEditorForAppEmbed}
                >
                  Enable app embed
                </s-button>
              </s-stack>
            </s-banner>
          )}

          <s-stack direction="block" gap="base">
            <s-stack direction="inline" gap="small" justifyContent="end">
              <s-button
                variant="tertiary"
                icon="globe"
                disabled={!flow.bundleEmbedEnabled || undefined}
                onClick={() =>
                  flow.openMultiLanguageModal(
                    "Bundle Embed",
                    [
                      { key: "title", label: "Title", fallback: flow.bundleEmbedTitle },
                      { key: "subTitle", label: "Sub Title", fallback: flow.bundleEmbedSubTitle, multiline: true },
                    ],
                    "embed",
                  )
                }
              >
                Multi Language
              </s-button>
            </s-stack>
            <s-text-field
              id="configure-embed-title"
              label="Title"
              value={flow.bundleEmbedTitle}
              required
              disabled={!flow.bundleEmbedEnabled || undefined}
              error={flow.validationErrors["embed.title"]}
              onInput={(event: Event) => {
                flow.setBundleEmbedTitle(
                  (event.target as HTMLInputElement).value,
                );
                flow.clearValidationError("embed.title");
                flow.markAsDirty();
              }}
            />
            <s-text-field
              label="Sub Title"
              value={flow.bundleEmbedSubTitle}
              disabled={!flow.bundleEmbedEnabled || undefined}
              onInput={(event: Event) => {
                flow.setBundleEmbedSubTitle(
                  (event.target as HTMLInputElement).value,
                );
                flow.markAsDirty();
              }}
            />
            <s-choice-list
              label="Display Bundle on"
              name="ppbEmbedDisplayOn"
              values={[flow.bundleEmbedDisplayOn]}
              disabled={!flow.bundleEmbedEnabled || undefined}
              onChange={(event: Event) => {
                const value = (event.target as HTMLElement & { values?: string[] })
                  .values?.[0];
                if (value && TARGETS.some((target) => target.value === value)) {
                  changeTarget(value);
                }
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
                  disabled={!flow.bundleEmbedEnabled || undefined}
                  onClick={async () => {
                    await flow.openVisibilityProductPicker("embed");
                    flow.clearValidationError("embed.products");
                  }}
                >
                  Select products
                </s-button>
                {flow.bundleEmbedSelectedProducts.map(
                  (product: any, index: number) => (
                    <s-stack
                      key={flow.getVisibilityResourceId(product) ?? index}
                      direction="inline"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <s-text>{product.title ?? "Untitled product"}</s-text>
                      <s-button
                        variant="tertiary"
                        icon="delete"
                        disabled={!flow.bundleEmbedEnabled || undefined}
                        accessibilityLabel={`Remove ${product.title ?? "product"}`}
                        onClick={() =>
                          flow.removeVisibilityProductTarget("embed", index)
                        }
                      />
                    </s-stack>
                  ),
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
                  disabled={!flow.bundleEmbedEnabled || undefined}
                  onClick={async () => {
                    await flow.openVisibilityCollectionPicker("embed");
                    flow.clearValidationError("embed.collections");
                  }}
                >
                  Select collections
                </s-button>
                {flow.bundleEmbedCollectionsSelectedData.map(
                  (collection: any, index: number) => (
                    <s-stack
                      key={flow.getVisibilityResourceId(collection) ?? index}
                      direction="inline"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <s-text>{collection.title ?? "Untitled collection"}</s-text>
                      <s-button
                        variant="tertiary"
                        icon="delete"
                        disabled={!flow.bundleEmbedEnabled || undefined}
                        accessibilityLabel={`Remove ${collection.title ?? "collection"}`}
                        onClick={() =>
                          flow.removeVisibilityCollectionTarget("embed", index)
                        }
                      />
                    </s-stack>
                  ),
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
              disabled={!flow.bundleEmbedEnabled || undefined}
              onChange={(event: Event) => {
                flow.setBundleEmbedAddBrowsedProduct(
                  (event.target as HTMLInputElement).checked,
                );
                flow.markAsDirty();
              }}
            />
          </s-stack>
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="inline" alignItems="center" justifyContent="space-between" gap="base">
          <s-stack direction="block" gap="small-100">
            <s-heading>Place app block on the theme</s-heading>
          </s-stack>
          <s-button variant="primary" onClick={flow.handlePlaceWidget}>
            Place Block
          </s-button>
        </s-stack>
      </s-section>
    </div>
  );
}
