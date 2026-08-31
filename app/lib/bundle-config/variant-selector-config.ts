export const VARIANT_SELECTOR_MODES = [
  "dropdown",
  "pill",
  "color_swatch",
  "image_swatch",
] as const;

export type VariantSelectorMode = (typeof VARIANT_SELECTOR_MODES)[number];

export interface VariantSelectorConfiguration {
  variantSelectorMode: VariantSelectorMode;
  swatchTooltipEnabled: boolean;
}

export interface VariantSelectorConfigurationInput {
  variantSelectorMode?: unknown;
  swatchTooltipEnabled?: unknown;
}

export const VARIANT_SELECTOR_DEFAULTS: VariantSelectorConfiguration = {
  variantSelectorMode: "dropdown",
  swatchTooltipEnabled: false,
};

function parseMode(value: unknown): VariantSelectorMode {
  if (value === undefined || value === null || value === "") return "dropdown";
  if (typeof value === "string" && VARIANT_SELECTOR_MODES.includes(value as VariantSelectorMode)) {
    return value as VariantSelectorMode;
  }
  throw new Error("Unsupported variant selector mode");
}

export function parseVariantSelectorConfiguration(
  value: VariantSelectorConfigurationInput,
): VariantSelectorConfiguration {
  const variantSelectorMode = parseMode(value.variantSelectorMode);
  return {
    variantSelectorMode,
    swatchTooltipEnabled:
      variantSelectorMode === "color_swatch" && value.swatchTooltipEnabled === true,
  };
}
