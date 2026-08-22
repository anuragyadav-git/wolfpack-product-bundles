import { DESIGN_CONFIGURATION } from "../../../app/lib/admin-configuration-surfaces";
import { generateCSSFromSettings } from "../../../app/lib/css-generators";
import { buildSettingsDesignRuntime } from "../../../app/lib/settings-design-runtime";
import {
  buildDesignPreviewTheme,
  getDesignFieldsForPreviewContext,
} from "../../../app/routes/app/app.settings/design-preview-model";

function makePayload(overrides: Record<string, string> = {}) {
  return {
    isExpertControlsEnabled: false,
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

describe("Settings Design Slot Icon & Size Customization", () => {
  it("exposes Slot Icon and Slot Icon Size in DESIGN_CONFIGURATION under Images & GIFs tab", () => {
    const imagesTab = DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs");
    expect(imagesTab).toBeDefined();

    const slotIconField = imagesTab?.fields.find(
      (f) => f.key === "stylePresets.images.slotIconUrl" || f.label === "Slot Icon",
    );
    expect(slotIconField).toBeDefined();
    expect(slotIconField?.kind).toBe("image");

    const slotIconFitField = imagesTab?.fields.find(
      (f) => f.key === "stylePresets.images.slotIconFit" || f.label === "Slot Icon Size",
    );
    expect(slotIconFitField).toBeDefined();
    expect(slotIconFitField?.kind).toBe("select");
    expect(slotIconFitField?.options).toEqual(["Fit", "Fill", "Cover"]);
  });

  it("extracts slotIconUrl and slotIconFit in buildSettingsDesignRuntime across fill, fit, cover formats", () => {
    const formats = [
      { input: "Cover", expected: "cover" },
      { input: "Fill", expected: "fill" },
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
      expect(designSettings.slotIconUrl).toBe("https://cdn.example.com/custom-slot-icon.png");
      expect(designSettings.slotIconFit).toBe(expected);
    }
  });

  it("defaults slotIconFit to 'fit' when omitted", () => {
    const runtime = buildSettingsDesignRuntime(
      makePayload({
        "stylePresets.images.slotIconUrl": "https://cdn.example.com/slot.png",
      }),
    );
    const pageCustomization = runtime.pageCustomization as any;
    expect(pageCustomization.stylePresets.images.slotIconFit).toBe("fit");
  });

  it("includes slot icon fields in preview context for PPB slot templates and excludes for non-slot templates", () => {
    const imagesTab = DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs")!;

    const horizontalFields = getDesignFieldsForPreviewContext(imagesTab.fields, "horizontal-slots", "product-slots");
    const hasHorizontalSlotIcon = horizontalFields.some(
      (f) => f.key === "stylePresets.images.slotIconUrl" || f.label === "Slot Icon",
    );
    expect(hasHorizontalSlotIcon).toBe(true);

    const verticalFields = getDesignFieldsForPreviewContext(imagesTab.fields, "vertical-slots", "product-slots");
    const hasVerticalSlotIcon = verticalFields.some(
      (f) => f.key === "stylePresets.images.slotIconUrl" || f.label === "Slot Icon",
    );
    expect(hasVerticalSlotIcon).toBe(true);

    const listFields = getDesignFieldsForPreviewContext(imagesTab.fields, "product-list", "product-card");
    const hasListSlotIcon = listFields.some(
      (f) => f.key === "stylePresets.images.slotIconUrl" || f.label === "Slot Icon",
    );
    expect(hasListSlotIcon).toBe(false);
  });

  it("builds live preview theme with --preview-slot-icon-url and --preview-slot-icon-fit", () => {
    const theme = buildDesignPreviewTheme(
      {
        "stylePresets.images.slotIconUrl": "https://cdn.example.com/preview-icon.svg",
        "stylePresets.images.slotIconFit": "Cover",
      },
      false,
      "horizontal-slots",
    );

    expect(theme["--preview-slot-icon-url"]).toBe("https://cdn.example.com/preview-icon.svg");
    expect(theme["--preview-slot-icon-fit"]).toBe("cover");
  });

  it("generates CSS variables --bundle-slot-icon-url and --bundle-slot-icon-fit", () => {
    const css = generateCSSFromSettings(
      {
        slotIconUrl: "https://cdn.example.com/slot.svg",
        slotIconFit: "cover",
      } as any,
      "product_page",
    );

    expect(css).toContain('--bundle-slot-icon-url: url("https://cdn.example.com/slot.svg")');
    expect(css).toContain("--bundle-slot-icon-fit: cover");
  });
});
