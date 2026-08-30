import {
  parseVariantSelectorConfiguration,
  VARIANT_SELECTOR_DEFAULTS,
} from "../../../app/lib/bundle-config/variant-selector-config";

describe("PPB variant selector configuration", () => {
  it("uses the canonical defaults when configuration is absent", () => {
    expect(parseVariantSelectorConfiguration({})).toEqual(VARIANT_SELECTOR_DEFAULTS);
  });

  it("preserves a valid color swatch configuration", () => {
    expect(parseVariantSelectorConfiguration({
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
      variantColorMap: {
        Navy: "#001F3F",
        "Soft pink": "#F8BBD0",
      },
    })).toEqual({
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
      variantColorMap: {
        Navy: "#001F3F",
        "Soft pink": "#F8BBD0",
      },
    });
  });

  it("disables the tooltip outside color swatch mode", () => {
    expect(parseVariantSelectorConfiguration({
      variantSelectorMode: "pill",
      swatchTooltipEnabled: true,
      variantColorMap: { Navy: "#001F3F" },
    })).toEqual({
      variantSelectorMode: "pill",
      swatchTooltipEnabled: false,
      variantColorMap: { Navy: "#001F3F" },
    });
  });

  it("rejects an unsupported selector mode", () => {
    expect(() => parseVariantSelectorConfiguration({
      variantSelectorMode: "tiles",
    })).toThrow("variant selector mode");
  });

  it("rejects unsafe or unrecognized color values", () => {
    expect(() => parseVariantSelectorConfiguration({
      variantSelectorMode: "color_swatch",
      variantColorMap: { Navy: "red;display:none" },
    })).toThrow("hex color");
  });
});
