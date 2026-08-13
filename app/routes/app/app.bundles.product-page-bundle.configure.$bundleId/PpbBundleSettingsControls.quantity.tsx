import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbQuantitySettings() {
  const {
    markAsDirty,
    maxQtyPerProduct,
    productPageBundleStyles,
    quantityValidationEnabled,
    QuestionHelpTooltip,
    setMaxQtyPerProduct,
    setQuantityValidationEnabled,
    setVariantSelectorEnabled,
    variantSelectorEnabled,
  } = usePpbConfigureContext();

  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <div className={productPageBundleStyles.settingTitleRow}>
          <h3 className={productPageBundleStyles.settingTitle}>
            Enable Quantity Validation
          </h3>
          <span className={productPageBundleStyles.settingInlineSwitch}>
            <s-switch
              accessibilityLabel="Enable quantity validation"
              checked={quantityValidationEnabled || undefined}
              onChange={(e) => {
                setQuantityValidationEnabled(
                  (e.target as HTMLInputElement).checked,
                );
                markAsDirty();
              }}
            />
          </span>
        </div>
        <s-number-field
          label="Maximum allowed quantity per product"
          min={1}
          value={maxQtyPerProduct || "1"}
          disabled={!quantityValidationEnabled}
          onInput={(e) => {
            setMaxQtyPerProduct((e.target as HTMLInputElement).value);
            markAsDirty();
          }}
          autocomplete="off"
        />
        <s-banner
          tone="info"
          heading="Search filters"
          dismissible={false}
          hidden={false}
        >
          Bundles with 3+ products see 24% higher conversion rates when search
          filters are enabled.
        </s-banner>
        <div className={productPageBundleStyles.settingTitleRow}>
          <div>
            <h3 className={productPageBundleStyles.settingTitle}>
              Variant Selector
              <QuestionHelpTooltip tooltipKey="variantSelector" />
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              Enable variant selection within the product cards instead of the
              quick look
            </p>
          </div>
          <span className={productPageBundleStyles.settingInlineSwitch}>
            <s-switch
              accessibilityLabel="Variant selector"
              checked={variantSelectorEnabled || undefined}
              onChange={(e) => {
                setVariantSelectorEnabled(
                  (e.target as HTMLInputElement).checked,
                );
                markAsDirty();
              }}
            />
          </span>
        </div>
      </s-stack>
    </s-section>
  );
}
