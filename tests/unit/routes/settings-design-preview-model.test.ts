import {
  DESIGN_CONFIGURATION,
  EXPERT_COLOR_CONTROLS,
} from "../../../app/lib/admin-configuration-surfaces";
import {
  DESIGN_PREVIEW_FIXTURE,
  DESIGN_PREVIEW_TEMPLATES,
  DESIGN_PREVIEW_VIEWPORTS,
  buildDesignPreviewTheme,
  calculateDesignPreviewFitScale,
  getDesignPreviewFieldTarget,
  getDesignPreviewScene,
  getDesignPreviewSurfaceFidelity,
  getSupportedDesignPreviewSurfaces,
  getDesignFieldsForPreviewContext,
  isDesignPreviewFieldApplicable,
} from "../../../app/routes/app/app.settings/design-preview-model";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("Settings Design preview model", () => {
  it("uses the storefront parity viewports and fits them without changing their logical width", () => {
    expect(DESIGN_PREVIEW_VIEWPORTS).toEqual({
      desktop: { width: 1280, height: 1136 },
      mobile: { width: 390, height: 844 },
    });
    expect(calculateDesignPreviewFitScale(1280, "desktop")).toBe(1);
    expect(calculateDesignPreviewFitScale(960, "desktop")).toBe(0.75);
    expect(calculateDesignPreviewFitScale(780, "mobile")).toBe(1);
    expect(calculateDesignPreviewFitScale(312, "mobile")).toBe(0.8);
    expect(calculateDesignPreviewFitScale(0, "desktop")).toBe(1);
  });

  it("does not expose or claim fidelity for a synthetic Builder surface", () => {
    for (const template of DESIGN_PREVIEW_TEMPLATES) {
      expect(template.supportedSurfaces).not.toContain("builder");
      expect(getDesignPreviewSurfaceFidelity(template.key, "cart-summary")).toBe("storefront");
      expect(getDesignPreviewSurfaceFidelity(template.key, "loading")).toBe("representative");
      expect(getDesignPreviewSurfaceFidelity(template.key, "validation")).toBe("representative");
      expect(getDesignPreviewSurfaceFidelity(template.key, "upsell")).toBe("representative");
    }
    expect(getDesignPreviewSurfaceFidelity("horizontal-slots", "product-picker")).toBe("representative");
  });

  it("derives all eight descriptors from canonical storefront contracts", () => {
    expect(DESIGN_PREVIEW_TEMPLATES.map((template) => ({
      key: template.key,
      preset: template.selection.bundleDesignPresetId,
      productCard: template.productCard,
      navigation: template.navigation,
      categories: template.categories,
      summary: template.summary,
      surfaces: template.supportedSurfaces,
    }))).toEqual([
      {
        key: "standard",
        preset: "STANDARD",
        productCard: { mode: "grid", columns: { desktop: 3, mobile: 2 } },
        navigation: "timeline",
        categories: "accordion",
        summary: "rows",
        surfaces: ["navigation", "categories", "product-card", "cart-summary", "loading", "validation", "upsell"],
      },
      {
        key: "classic",
        preset: "CLASSIC",
        productCard: { mode: "grid", columns: { desktop: 4, mobile: 2 } },
        navigation: "timeline",
        categories: "pills",
        summary: "slot-grid",
        surfaces: ["navigation", "categories", "product-card", "cart-summary", "loading", "validation", "upsell"],
      },
      {
        key: "compact",
        preset: "COMPACT",
        productCard: { mode: "compact", columns: { desktop: 3, mobile: 2 } },
        navigation: "compact-timeline",
        categories: "pills",
        summary: "compact-slots",
        surfaces: ["navigation", "categories", "product-card", "cart-summary", "loading", "validation", "upsell"],
      },
      {
        key: "horizontal",
        preset: "HORIZONTAL",
        productCard: { mode: "row", columns: { desktop: 2, mobile: 1 } },
        navigation: "horizontal-timeline",
        categories: "underline",
        summary: "rows",
        surfaces: ["navigation", "categories", "product-card", "cart-summary", "loading", "validation", "upsell"],
      },
      {
        key: "product-list",
        preset: "LIST",
        productCard: { mode: "row", columns: { desktop: 1, mobile: 1 } },
        navigation: "list-steps",
        categories: "tabs",
        summary: "list-selected-drawer",
        surfaces: ["bundle-header", "navigation", "categories", "product-card", "cart-summary", "loading", "validation", "upsell"],
      },
      {
        key: "product-grid",
        preset: "GRID",
        productCard: { mode: "grid", columns: { desktop: 4, mobile: 2 } },
        navigation: "grid-steps",
        categories: "tabs",
        summary: "pdp-footer",
        surfaces: ["bundle-header", "navigation", "categories", "product-card", "cart-summary", "loading", "validation", "upsell"],
      },
      {
        key: "horizontal-slots",
        preset: "HORIZONTAL_SLOTS",
        productCard: { mode: "grid", columns: { desktop: 3, mobile: 2 } },
        navigation: "none",
        categories: "none",
        summary: "modal-footer",
        surfaces: ["bundle-header", "product-slots", "product-picker", "cart-summary", "loading", "validation", "upsell"],
      },
      {
        key: "vertical-slots",
        preset: "VERTICAL_SLOTS",
        productCard: { mode: "grid", columns: { desktop: 3, mobile: 2 } },
        navigation: "none",
        categories: "none",
        summary: "modal-footer",
        surfaces: ["bundle-header", "product-slots", "product-picker", "cart-summary", "loading", "validation", "upsell"],
      },
    ]);
  });

  it("assigns every editable preview field to a semantic surface", () => {
    const fields = [
      ...DESIGN_CONFIGURATION.flatMap((section) => section.fields),
      ...Object.values(EXPERT_COLOR_CONTROLS).flat(),
    ].filter((field) => field.kind !== "loadingSpinner");

    for (const field of fields) {
      const fieldKey = field.key ?? field.label;
      expect(getDesignPreviewFieldTarget(fieldKey)).toBeDefined();
      for (const template of DESIGN_PREVIEW_TEMPLATES) {
        const target = getDesignPreviewFieldTarget(fieldKey, template.key);
        const isMappedToSupportedSurface = !isDesignPreviewFieldApplicable(fieldKey, template.key)
          || Boolean(target && getSupportedDesignPreviewSurfaces(template.key).includes(target.surface));
        expect(isMappedToSupportedSurface).toBe(true);
      }
    }
  });

  it("reveals secondary storefront surfaces for the fields that own them", () => {
    expect(getDesignPreviewFieldTarget(
      "expert.productCard.productCardButtonColor",
      "horizontal-slots",
    )?.surface).toBe("product-picker");
    expect(getDesignPreviewFieldTarget(
      "expert.cartFooter.cartFooterBgColor",
      "product-list",
    )?.surface).toBe("cart-summary");
    expect(getDesignPreviewFieldTarget(
      "generalSettings.loadingBgColor",
      "standard",
    )?.surface).toBe("loading");
    expect(getDesignPreviewFieldTarget(
      "expert.generalSettings.conditionToastBgColor",
      "product-grid",
    )?.surface).toBe("validation");
    expect(getDesignPreviewFieldTarget(
      "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonBg",
      "vertical-slots",
    )?.surface).toBe("upsell");
  });

  it("reports template-specific applicability without fabricating an effect", () => {
    expect(isDesignPreviewFieldApplicable("expert.generalSettings.productPageTitleColor", "product-grid")).toBe(true);
    expect(isDesignPreviewFieldApplicable("expert.generalSettings.productPageTitleColor", "standard")).toBe(false);
    expect(isDesignPreviewFieldApplicable("expert.emptyStateCard.emptyStateCardBorderColor", "horizontal-slots")).toBe(true);
    expect(isDesignPreviewFieldApplicable("expert.emptyStateCard.emptyStateCardBorderColor", "product-list")).toBe(false);
  });

  it("filters merchant controls to the selected template and component surface", () => {
    const fields = DESIGN_CONFIGURATION.flatMap((section) => section.fields);

    expect(getDesignFieldsForPreviewContext(fields, "standard", "product-card").map((field) => field.label))
      .toEqual(expect.arrayContaining(["Primary Color", "Image Fit"]));
    expect(getDesignFieldsForPreviewContext(fields, "standard", "loading").map((field) => field.label))
      .toEqual(["FPB Loading GIF", "Loading Screen Background Color"]);
    expect(getDesignFieldsForPreviewContext(fields, "product-list", "loading").map((field) => field.label))
      .toEqual([]);
  });

  it("builds family-specific themes from normalized storefront runtime values", () => {
    const fieldValues = {
      "Primary Color": "#112233",
      "Button Text Color": "#fafafa",
      "Primary Text Color": "#223344",
      "Secondary Color": "#ddeeff",
      "Product Background Color": "#ffffff",
      "Primary Font Size": "18",
      "Primary Font Weight": "Bold",
      "Secondary Font Size": "12",
      "Secondary Font Weight": "Regular",
      "Body Font Size": "15",
      "Body Font Weight": "Bold",
      "Bundle Buttons Corner Style": "Round",
      "Bundle Buttons Base": "7px",
      "Product Card & Cart Corner Style": "Sharp",
      "Product Card & Cart Base": "11px",
      "Image Fit": "Contain",
      "expert.navigationBanner.navigationCheckColor": "#010101",
      "generalSettings.loadingBgColor": "#020202",
      "expert.generalSettings.conditionToastBgColor": "#070707",
      "expert.productCard.productCardButtonColor": "#112233",
      "expert.emptyStateCard.emptyStateCardBorderColor": "#080808",
      "expert.emptyStateCard.emptyStateCardTextColor": "#030303",
      "expert.cartFooter.cartFooterBgColor": "#090909",
      "expert.cartFooter.cartFooterBackButtonColor": "#040404",
      "expert.cartFooter.cartFooterDiscountProgressBarFilledColor": "#050505",
      "expert.mixAndMatchConfig.generalSettings.bundleUpsellFontColor": "#060606",
    };

    const fpbTheme = buildDesignPreviewTheme(fieldValues, true, "standard");
    const ppbTheme = buildDesignPreviewTheme(fieldValues, true, "product-list");

    expect(fpbTheme["--preview-primary-font-size"]).toBe("18px");
    expect(fpbTheme["--preview-primary-font-weight"]).toBe("700");
    expect(fpbTheme["--preview-body-font-weight"]).toBe("700");
    expect(fpbTheme["--preview-button-radius"]).toBe("40px");
    expect(fpbTheme["--preview-card-radius"]).toBe("0px");
    expect(fpbTheme["--preview-image-fit"]).toBe("contain");
    expect(fpbTheme["--preview-step-check"]).toBe("#010101");
    expect(fpbTheme["--preview-loading-bg"]).toBe("#020202");
    expect(fpbTheme["--preview-cart-back-bg"]).toBe("#040404");
    expect(fpbTheme["--preview-discount-progress-filled"]).toBe("#050505");
    expect(ppbTheme["--preview-empty-text"]).toBe("#030303");
    expect(ppbTheme["--preview-empty-border"]).toBe("#080808");
    expect(ppbTheme["--preview-empty-icon"]).toBe("#080808");
    expect(ppbTheme["--preview-quantity-text"]).toBe("#223344");
    expect(ppbTheme["--preview-toast-bg"]).toBe("#070707");
    expect(ppbTheme["--preview-cart-bg"]).toBe("#090909");
    expect(ppbTheme["--preview-add-bundle-bg"]).toBe("#112233");
    expect(ppbTheme["--preview-upsell-text"]).toBe("#060606");
    expect(ppbTheme["--preview-product-button-bg"]).toBe("#112233");
  });

  it("provides deterministic multi-surface fixture data with local media", () => {
    expect(DESIGN_PREVIEW_FIXTURE.steps).toHaveLength(2);
    expect(DESIGN_PREVIEW_FIXTURE.categories.length).toBeGreaterThan(1);
    expect(DESIGN_PREVIEW_FIXTURE.products.length).toBeGreaterThan(3);
    expect(DESIGN_PREVIEW_FIXTURE.discountTiers.length).toBeGreaterThan(1);
    expect(DESIGN_PREVIEW_FIXTURE.products.every((product) => (
      product.imageUrl.startsWith("/design-preview-product-")
      && product.imageUrl.endsWith(".png")
    ))).toBe(true);
    expect(DESIGN_PREVIEW_FIXTURE.products.every((product) => (
      // Fixture paths are constrained by the assertion above to public root PNGs.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      existsSync(join(process.cwd(), "public", product.imageUrl.slice(1)))
    ))).toBe(true);
    expect(DESIGN_PREVIEW_FIXTURE.validationMessage).toBeTruthy();
    expect(DESIGN_PREVIEW_FIXTURE.upsell).toBeTruthy();
  });

  it("resolves required storefront-owned regions for representative scenes", () => {
    expect(getDesignPreviewScene("standard", "navigation", "desktop").regions).toEqual(["timeline"]);
    expect(getDesignPreviewScene("classic", "categories", "mobile").regions).toEqual(["pill-categories"]);
    expect(getDesignPreviewScene("horizontal", "product-card", "desktop").regions).toEqual(["product-rows"]);
    expect(getDesignPreviewScene("product-list", "cart-summary", "desktop").regions).toEqual(
      expect.arrayContaining(["product-list-selected-drawer", "pdp-footer"]),
    );
    expect(getDesignPreviewScene("product-grid", "navigation", "mobile").regions).toEqual(["product-grid-step-headers"]);
    expect(getDesignPreviewScene("horizontal-slots", "product-slots", "desktop").regions).toEqual(["horizontal-slots"]);
    expect(getDesignPreviewScene("horizontal-slots", "product-picker", "desktop").regions).toEqual(
      ["product-picker-modal"],
    );
    expect(getDesignPreviewScene("vertical-slots", "product-picker", "mobile").regions).toEqual(
      ["product-picker-bottom-sheet"],
    );
  });

  it("keeps the local preview available while a field has an incomplete value", () => {
    expect(() => buildDesignPreviewTheme({ "Primary Font Size": "" })).not.toThrow();
    expect(buildDesignPreviewTheme({ "Primary Font Size": "" })["--preview-primary-font-size"]).toBe("16px");
  });
});
