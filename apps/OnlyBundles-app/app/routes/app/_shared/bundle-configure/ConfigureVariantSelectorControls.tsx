import { translateAdmin } from "~/i18n/config";
import type { VariantSelectorMode } from "../../../../lib/bundle-config/variant-selector-config";
import { ConfigureHelpPopover } from "./ConfigureHelpPopover";

export function ConfigureVariantSelectorControls({
  disabled = false,
  error,
  mode,
  swatchTooltipEnabled,
  onChange,
  onClearError,
}: {
  disabled?: boolean;
  error?: string;
  mode: VariantSelectorMode;
  swatchTooltipEnabled: boolean;
  onChange: (patch: {
    variantSelectorMode?: VariantSelectorMode;
    swatchTooltipEnabled?: boolean;
  }) => void;
  onClearError?: () => void;
}) {
  return (
    <s-stack gap="base">
      <s-select
        label={translateAdmin("adminAttributes.variantSelectorStyle")}
        value={mode}
        disabled={disabled || undefined}
        error={error}
        onChange={(event) => {
          const variantSelectorMode = event.currentTarget
            .value as VariantSelectorMode;
          onChange({
            variantSelectorMode,
            ...(variantSelectorMode === "color_swatch"
              ? {}
              : { swatchTooltipEnabled: false }),
          });
          onClearError?.();
        }}
      >
        <s-option value="dropdown">
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbcategoryaccordion.dropdown"
          )}
        </s-option>
        <s-option value="pill">
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbcategoryaccordion.pills"
          )}
        </s-option>
        <s-option value="color_swatch">
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbcategoryaccordion.colorSwatches"
          )}
        </s-option>
        <s-option value="image_swatch">
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbcategoryaccordion.imageSwatches"
          )}
        </s-option>
      </s-select>
      {mode === "color_swatch" ? (
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-switch
            label={translateAdmin(
              "adminAttributes.showColorNameOnHoverAndFocus"
            )}
            checked={swatchTooltipEnabled || undefined}
            disabled={disabled || undefined}
            onChange={(event) =>
              onChange({
                swatchTooltipEnabled: event.currentTarget.checked,
              })
            }
          />
          <ConfigureHelpPopover tooltipKey="swatchTooltip" />
        </s-stack>
      ) : null}
      {mode === "color_swatch" || mode === "image_swatch" ? (
        <s-paragraph>
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbcategoryaccordion.colorAndImageValuesComeFromShopifyProductOptionSwatches"
          )}
        </s-paragraph>
      ) : null}
    </s-stack>
  );
}
