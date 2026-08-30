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
  variantColorMap: Record<string, string>;
}

export interface VariantSelectorConfigurationInput {
  variantSelectorMode?: unknown;
  swatchTooltipEnabled?: unknown;
  variantColorMap?: unknown;
}

export const VARIANT_SELECTOR_DEFAULTS: VariantSelectorConfiguration = {
  variantSelectorMode: "dropdown",
  swatchTooltipEnabled: false,
  variantColorMap: {},
};

const STRICT_HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const MAX_COLOR_MAPPINGS = 100;

function parseMode(value: unknown): VariantSelectorMode {
  if (value === undefined || value === null || value === "") return "dropdown";
  if (typeof value === "string" && VARIANT_SELECTOR_MODES.includes(value as VariantSelectorMode)) {
    return value as VariantSelectorMode;
  }
  throw new Error("Unsupported variant selector mode");
}

function parseColorMap(value: unknown): Record<string, string> {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Variant color mapping must be an object");
  }

  const entries = Object.entries(value);
  if (entries.length > MAX_COLOR_MAPPINGS) {
    throw new Error(`Variant color mapping cannot exceed ${MAX_COLOR_MAPPINGS} entries`);
  }

  return Object.fromEntries(entries.map(([rawLabel, rawColor]) => {
    const label = rawLabel.trim();
    if (!label) throw new Error("Variant color mapping labels cannot be empty");
    if (typeof rawColor !== "string" || !STRICT_HEX_COLOR.test(rawColor)) {
      throw new Error(`Variant color mapping for ${label} must use a six-digit hex color`);
    }
    return [label, rawColor];
  }));
}

export function parseVariantSelectorConfiguration(
  value: VariantSelectorConfigurationInput,
): VariantSelectorConfiguration {
  const variantSelectorMode = parseMode(value.variantSelectorMode);
  return {
    variantSelectorMode,
    swatchTooltipEnabled:
      variantSelectorMode === "color_swatch" && value.swatchTooltipEnabled === true,
    variantColorMap: parseColorMap(value.variantColorMap),
  };
}
