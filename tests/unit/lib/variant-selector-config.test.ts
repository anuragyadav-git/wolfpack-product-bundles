import {
  parseVariantSelectorConfiguration,
  VARIANT_SELECTOR_DEFAULTS,
} from "../../../app/lib/bundle-config/variant-selector-config";

describe("PPB variant selector configuration", () => {
  it("uses the canonical defaults when configuration is absent", () => {
    expect(parseVariantSelectorConfiguration({})).toEqual(VARIANT_SELECTOR_DEFAULTS);
  });

  it("preserves only Wolfpack-owned swatch presentation settings", () => {
    expect(parseVariantSelectorConfiguration({
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
    })).toEqual({
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
    });
  });

  it("disables the tooltip outside color swatch mode", () => {
    expect(parseVariantSelectorConfiguration({
      variantSelectorMode: "pill",
      swatchTooltipEnabled: true,
    })).toEqual({
      variantSelectorMode: "pill",
      swatchTooltipEnabled: false,
    });
  });

  it("rejects an unsupported selector mode", () => {
    expect(() => parseVariantSelectorConfiguration({
      variantSelectorMode: "tiles",
    })).toThrow("variant selector mode");
  });
});
