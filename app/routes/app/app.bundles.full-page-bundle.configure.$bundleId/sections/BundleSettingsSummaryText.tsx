import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";

export function FpbSummaryTextSettings({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    markAsDirty,
    openMultiLanguageModal,
    setShowTextOnAddButton,
    setTextOverrides,
    SettingsRow,
    setVariantSelectorEnabled,
    showTextOnAddButton,
    textOverrides,
    variantSelectorEnabled,
  } = flow;

  return (
    <>
      <s-section>
        <s-stack direction="block" gap="small">
          <SettingsRow
            title="Variant Selector"
            description="Enable variant selection within the product cards instead of the quick look"
            tooltipKey="variantSelector"
          >
            <s-switch
              accessibilityLabel="Variant selector"
              checked={variantSelectorEnabled || undefined}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setVariantSelectorEnabled(checked);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <SettingsRow
            title="Show Text on + Button"
            description="Replaces the + icon with a text button and moves it below the price."
            tooltipKey="showTextOnAddButton"
          >
            <s-switch
              accessibilityLabel="Show text on plus button"
              checked={showTextOnAddButton || undefined}
              onChange={(e) => {
                const enabled = (e.target as HTMLInputElement).checked;
                setShowTextOnAddButton(enabled);
                if (!enabled) {
                  setTextOverrides((prev) => ({
                    ...prev,
                    addToCartButton: "",
                  }));
                }
                markAsDirty();
              }}
            />
          </SettingsRow>
          {showTextOnAddButton && (
            <s-stack direction="inline" gap="small" alignItems="end">
              <s-text-field
                label="Button text"
                value={textOverrides.addToCartButton ?? ""}
                placeholder="Add to Cart"
                autocomplete="off"
                onInput={(e) => {
                  setTextOverrides((prev) => ({
                    ...prev,
                    addToCartButton: (e.target as HTMLInputElement).value,
                  }));
                  markAsDirty();
                }}
              />
              <s-button
                variant="secondary"
                icon="globe"
                onClick={() =>
                  openMultiLanguageModal("Add Button Text", [
                    {
                      key: "addToCartButton",
                      label: "Button text",
                      fallback: textOverrides.addToCartButton ?? "Add to Cart",
                    },
                  ])
                }
              >
                Multi Language
              </s-button>
            </s-stack>
          )}
        </s-stack>
      </s-section>
      {/* Bundle Cart */}
    </>
  );
}
