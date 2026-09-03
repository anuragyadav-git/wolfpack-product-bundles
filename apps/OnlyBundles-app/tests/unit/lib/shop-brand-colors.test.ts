import {
  parseShopBrandColorsResponse,
  resolveDesignColor,
  type ShopBrandColors,
} from "../../../app/lib/shop-brand-colors";
import { createSettingsDesignState } from "../../../app/lib/settings-design-contract";
import { buildSettingsDesignRuntime } from "../../../app/lib/settings-design-runtime";

const BRAND_COLORS: ShopBrandColors = {
  primary: { background: "#123456", foreground: "#ffffff" },
  secondary: { background: "#e8eef5", foreground: "#17202a" },
};

describe("Shop Brand colors", () => {
  it("selects the first primary and secondary background/foreground pairs", () => {
    expect(parseShopBrandColorsResponse({
      data: {
        shop: {
          brand: {
            colors: {
              primary: [
                { background: "#123456", foreground: "#ffffff" },
                { background: "#654321", foreground: "#000000" },
              ],
              secondary: [
                { background: "#e8eef5", foreground: "#17202a" },
                { background: "#cccccc", foreground: "#222222" },
              ],
            },
          },
        },
      },
    })).toEqual(BRAND_COLORS);
  });

  it.each([
    undefined,
    {},
    { data: { shop: { brand: { colors: { primary: [], secondary: [] } } } } },
    { data: { shop: { brand: { colors: { primary: [{ background: "red", foreground: "#fff" }], secondary: [{ background: "#fff", foreground: "#000" }] } } } } },
    { data: { shop: { brand: { colors: { primary: [{ background: "#000", foreground: null }], secondary: [{ background: "#fff", foreground: "#000" }] } } } } },
  ])("rejects an empty or malformed response", (response) => {
    expect(parseShopBrandColorsResponse(response)).toBeNull();
  });

  it("resolves explicit override, then semantic Brand pair, then template default", () => {
    expect(resolveDesignColor({
      fieldKey: "expert.productCard.productCardButtonColor",
      explicitValue: "#abcdef",
      inheritedColorFieldKeys: [],
      shopBrandColors: BRAND_COLORS,
      templateDefault: "#000000",
    })).toBe("#abcdef");
    expect(resolveDesignColor({
      fieldKey: "expert.productCard.productCardButtonColor",
      explicitValue: "#abcdef",
      inheritedColorFieldKeys: ["expert.productCard.productCardButtonColor"],
      shopBrandColors: BRAND_COLORS,
      templateDefault: "#000000",
    })).toBe("#123456");
    expect(resolveDesignColor({
      fieldKey: "expert.productCard.productCardButtonColor",
      explicitValue: "#abcdef",
      inheritedColorFieldKeys: ["expert.productCard.productCardButtonColor"],
      shopBrandColors: null,
      templateDefault: "#000000",
    })).toBe("#000000");
  });

  it("maps primary and secondary foregrounds with their semantic backgrounds", () => {
    expect(resolveDesignColor({
      fieldKey: "expert.productCard.productCardButtonTextColor",
      explicitValue: "#000000",
      inheritedColorFieldKeys: ["expert.productCard.productCardButtonTextColor"],
      shopBrandColors: BRAND_COLORS,
      templateDefault: "#ffffff",
    })).toBe("#ffffff");
    expect(resolveDesignColor({
      fieldKey: "expert.productCard.productCardBgColor",
      explicitValue: "#ffffff",
      inheritedColorFieldKeys: ["expert.productCard.productCardBgColor"],
      shopBrandColors: BRAND_COLORS,
      templateDefault: "#ffffff",
    })).toBe("#e8eef5");
    expect(resolveDesignColor({
      fieldKey: "expert.productCard.productCardTextColor",
      explicitValue: "#000000",
      inheritedColorFieldKeys: ["expert.productCard.productCardTextColor"],
      shopBrandColors: BRAND_COLORS,
      templateDefault: "#000000",
    })).toBe("#17202a");
  });

  it("fans the semantic pairs into FPB and PPB runtime roles", () => {
    const runtime = buildSettingsDesignRuntime(
      createSettingsDesignState(),
      {},
      BRAND_COLORS,
    );
    const page = runtime.pageCustomization as any;

    expect(page.productCard.productCardButtonColor).toBe("#123456");
    expect(page.productCard.productCardButtonTextColor).toBe("#ffffff");
    expect(page.navigationBanner.tabsInactiveBgColor).toBe("#e8eef5");
    expect(page.navigationBanner.tabsInactiveTextColor).toBe("#17202a");
    expect(page.mixAndMatchConfig.productCard.productCardButtonBgColor).toBe("#123456");
    expect(page.mixAndMatchConfig.productCard.productCardBgColor).toBe("#e8eef5");
    expect(page.mixAndMatchConfig.emptyStateCard.emptyStateCardBorderColor).toBe("#e8eef5");
    expect(page.mixAndMatchConfig.emptyStateCard.emptyStateCardTextColor).toBe("#17202a");
  });

  it("keeps existing saved colors explicit when inheritance metadata is absent", () => {
    const state = createSettingsDesignState({
      fieldValues: {
        "expert.productCard.productCardButtonColor": "#abcdef",
      },
    });

    expect(state.inheritedColorFieldKeys).toEqual([]);
    expect(buildSettingsDesignRuntime(state, {}, BRAND_COLORS).pageCustomization)
      .toEqual(expect.objectContaining({
        productCard: expect.objectContaining({ productCardButtonColor: "#abcdef" }),
      }));
  });
});
