import { DESIGN_CONFIGURATION } from "../../../app/lib/admin-configuration-surfaces";
import { generateCSSFromSettings } from "../../../app/lib/css-generators";
import {
  buildSettingsDesignRuntime,
  getSlotIconRecommendation,
} from "../../../app/lib/settings-design-runtime";
import {
  buildDesignPreviewTheme,
  getDesignFieldsForPreviewContext,
} from "../../../app/routes/app/app.settings/design-preview-model";

function makePayload(overrides: Record<string, string> = {}) {
  return {
    inheritedColorFieldKeys: [],
    fieldValues: {
      "Primary Color": "#111111",
      "Button Text Color": "#ffffff",
      "Primary Text Color": "#000000",
      "Secondary Color": "#eeeeee",
      "Product Background Color": "#ffffff",
      "Primary Font Size": "16",
      "Primary Font Weight": "Bold",
      "Secondary Font Size": "14",
      "Secondary Font Weight": "Bold",
      "Body Font Size": "14",
      "Body Font Weight": "Regular",
      "Bundle Buttons Base": "5px",
      "Bundle Buttons Corner Style": "Base",
      "Product Card & Cart Base": "10px",
      "Product Card & Cart Corner Style": "Base",
      "Image Fit": "Cover",
      "generalSettings.loadingGifUrl": "",
      "generalSettings.loadingBgColor": "#ffffff",
      ...overrides,
    },
  };
}

describe("Settings Design Slot Icon & Presentation Customization", () => {
  it("exposes Slot Icon and Slot Icon Presentation in DESIGN_CONFIGURATION under Images & GIFs tab", () => {
    const imagesTab = DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs");
    expect(imagesTab).toBeDefined();

    const slotIconField = imagesTab?.fields.find(
      (f) => f.key === "stylePresets.images.slotIconUrl" || f.label === "Slot Icon",
    );
    expect(slotIconField).toBeDefined();
    expect(slotIconField?.kind).toBe("image");

    const slotIconFitField = imagesTab?.fields.find(
      (f) => f.key === "stylePresets.images.slotIconFit" || f.label === "Slot Icon Presentation",
    );
    expect(slotIconFitField).toBeDefined();
    expect(slotIconFitField?.kind).toBe("select");
    expect(slotIconFitField?.options).toEqual(["Centered badge", "Cover", "Fit"]);
  });

  it("extracts slotIconUrl and slotIconFit across centered badge, cover, and fit formats", () => {
    const formats = [
      { input: "Centered badge", expected: "badge" },
      { input: "Cover", expected: "cover" },
      { input: "Fit", expected: "fit" },
    ];

    for (const { input, expected } of formats) {
      const runtime = buildSettingsDesignRuntime(
        makePayload({
          "stylePresets.images.slotIconUrl": "https://cdn.example.com/custom-slot-icon.png",
          "stylePresets.images.slotIconFit": input,
        }),
      );
      const pageCustomization = runtime.pageCustomization as any;
      const designSettings = runtime.designSettings as any;

      expect(pageCustomization.stylePresets.images.slotIconUrl).toBe("https://cdn.example.com/custom-slot-icon.png");
      expect(pageCustomization.stylePresets.images.slotIconFit).toBe(expected);
      expect(pageCustomization.mixAndMatchConfig.emptyStateCard.slotIconUrl).toBe("https://cdn.example.com/custom-slot-icon.png");
      expect(pageCustomization.mixAndMatchConfig.emptyStateCard.slotIconFit).toBe(expected);
      expect(designSettings.slotIconUrl).toBeUndefined();
      expect(designSettings.slotIconFit).toBeUndefined();
      expect(designSettings.generalSettings.slotIconUrl).toBe("https://cdn.example.com/custom-slot-icon.png");
      expect(designSettings.generalSettings.slotIconFit).toBe(expected);
    }
  });

  it("defaults slotIconFit to 'badge' when omitted", () => {
    const runtime = buildSettingsDesignRuntime(
      makePayload({
        "stylePresets.images.slotIconUrl": "https://cdn.example.com/slot.png",
      }),
    );
    const pageCustomization = runtime.pageCustomization as any;
    expect(pageCustomization.stylePresets.images.slotIconFit).toBe("badge");
  });

  it("returns presentation-specific image guidance", () => {
    expect(getSlotIconRecommendation("Centered badge")).toContain("96 × 96 px");
    expect(getSlotIconRecommendation("Centered badge")).toContain("transparent");
    expect(getSlotIconRecommendation("Fit")).toContain("800 × 800 px");
    expect(getSlotIconRecommendation("Cover")).toBeNull();
  });

  it("includes slot icon fields and Product slots for every FPB and PPB template", () => {
    const imagesTab = DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs")!;
    const templates = [
      "standard", "classic", "compact", "horizontal",
      "product-list", "product-grid", "horizontal-slots", "vertical-slots",
    ] as const;
    for (const template of templates) {
      const fields = getDesignFieldsForPreviewContext(imagesTab.fields, template, "product-slots");
      expect(fields.map((field) => field.key)).toEqual(expect.arrayContaining([
        "stylePresets.images.slotIconUrl",
        "stylePresets.images.slotIconFit",
      ]));
    }
  });

  it("builds live preview theme with --preview-slot-icon-url and --preview-slot-icon-fit", () => {
    const theme = buildDesignPreviewTheme(
      {
        "stylePresets.images.slotIconUrl": "https://cdn.example.com/preview-icon.svg",
        "stylePresets.images.slotIconFit": "Centered badge",
      },
      [],
      null,
      "horizontal-slots",
    );

    expect(theme["--preview-slot-icon-url"]).toBe("https://cdn.example.com/preview-icon.svg");
    expect(theme["--preview-slot-icon-fit"]).toBe("badge");
  });

  it("generates CSS variables --bundle-slot-icon-url and --bundle-slot-icon-fit", () => {
    const css = generateCSSFromSettings(
      {
        slotIconUrl: "https://cdn.example.com/slot.svg",
        slotIconFit: "badge",
      } as any,
      "product_page",
    );

    expect(css).toContain('--bundle-slot-icon-badge-image: url("https://cdn.example.com/slot.svg")');
    expect(css).toContain("--bundle-slot-icon-card-image: none");
    expect(css).toContain("--bundle-slot-icon-native-visibility: hidden");
    expect(css).toContain("--bundle-slot-icon-badge-overlay-display: block");

    const coverCss = generateCSSFromSettings(
      {
        slotIconUrl: "https://cdn.example.com/slot.svg",
        slotIconFit: "cover",
      } as any,
      "product_page",
    );

    expect(coverCss).toContain('--bundle-slot-icon-card-image: url("https://cdn.example.com/slot.svg")');
    expect(coverCss).toContain("--bundle-slot-icon-card-size: cover");
    expect(coverCss).toContain("--bundle-slot-icon-native-visibility: hidden");
    expect(coverCss).toContain("--bundle-slot-icon-badge-overlay-display: none");
  });
});
