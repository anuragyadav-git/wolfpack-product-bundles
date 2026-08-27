import {
  DESIGN_CONFIGURATION,
  EXPERT_COLOR_CONTROLS,
} from "../../../app/lib/admin-configuration-surfaces";
import {
  DESIGN_PREVIEW_FIXTURE,
  DESIGN_PREVIEW_TEMPLATES,
  DESIGN_PREVIEW_VIEWPORTS,
  buildDesignPreviewTheme,
  buildDesignPreviewStorefrontCss,
  calculateDesignPreviewFitScale,
  getDesignPreviewCanvasSize,
  getDesignPreviewFitPresentation,
  getDesignPreviewContextKind,
  getDesignPreviewFieldTarget,
  getDesignPreviewScene,
  getDesignPreviewContextFidelity,
  getSupportedDesignPreviewAreas,
  getSupportedDesignPreviewScenarios,
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
    expect(calculateDesignPreviewFitScale({ width: 1280, height: 1136 }, "desktop")).toBe(1);
    expect(calculateDesignPreviewFitScale({ width: 1600, height: 1420 }, "desktop")).toBe(1.25);
    expect(calculateDesignPreviewFitScale({ width: 960, height: 640 }, "desktop")).toBeCloseTo(640 / 1136);
    expect(getDesignPreviewCanvasSize("desktop")).toEqual({ width: 1280, height: 1136 });
    expect(getDesignPreviewCanvasSize("mobile")).toEqual({ width: 428, height: 882 });
    expect(calculateDesignPreviewFitScale({ width: 780, height: 640 }, "mobile")).toBeCloseTo(640 / 882);
    expect(calculateDesignPreviewFitScale({ width: 342.4, height: 900 }, "mobile")).toBeCloseTo(0.8);
    expect(calculateDesignPreviewFitScale({ width: 0, height: 0 }, "desktop")).toBe(1);
    expect(calculateDesignPreviewFitScale({ width: Number.NaN, height: 568 }, "desktop")).toBe(0.5);
  });

  it("calculates an atomic fit presentation without shrinking the logical storefront viewport", () => {
    expect(getDesignPreviewFitPresentation({ width: 856, height: 882 }, "mobile")).toEqual({
      scale: 1,
      canvasWidth: 428,
      canvasHeight: 882,
    });
    const constrainedPresentation = getDesignPreviewFitPresentation(
      { width: 342.4, height: 705.6 },
      "mobile",
    );
    expect(constrainedPresentation.scale).toBeCloseTo(0.8);
    expect(constrainedPresentation.canvasWidth).toBeCloseTo(342.4);
    expect(constrainedPresentation.canvasHeight).toBeCloseTo(705.6);
    expect(DESIGN_PREVIEW_VIEWPORTS.mobile).toEqual({ width: 390, height: 844 });
  });

  it("resolves storefront context from canonical template families", () => {
    for (const key of ["standard", "classic", "compact", "horizontal"] as const) {
      expect(getDesignPreviewContextKind(key)).toBe("full-page");
    }
    for (const key of ["product-list", "product-grid"] as const) {
      expect(getDesignPreviewContextKind(key)).toBe("product-page-inpage");
    }
    for (const key of ["horizontal-slots", "vertical-slots"] as const) {
      expect(getDesignPreviewContextKind(key)).toBe("product-page-modal");
    }
  });

  it("marks every supported area and state as production storefront fidelity", () => {
    for (const template of DESIGN_PREVIEW_TEMPLATES) {
      expect(template.supportedAreas).not.toContain("builder");
      expect(getDesignPreviewContextFidelity(template.key, "cart-summary")).toBe("storefront");
      expect(getDesignPreviewContextFidelity(template.key, "loading")).toBe("storefront");
      expect(getDesignPreviewContextFidelity(template.key, "validation")).toBe("storefront");
      expect(getDesignPreviewContextFidelity(template.key, "upsell")).toBe("storefront");
    }
    expect(getDesignPreviewContextFidelity("horizontal-slots", "product-picker")).toBe("storefront");
  });

  it("derives all eight descriptors from canonical storefront contracts", () => {
    expect(DESIGN_PREVIEW_TEMPLATES.map((template) => ({
      key: template.key,
      preset: template.selection.bundleDesignPresetId,
      productCard: template.productCard,
      navigation: template.navigation,
      categories: template.categories,
      summary: template.summary,
      areas: template.supportedAreas,
      scenarios: template.supportedScenarios,
    }))).toEqual([
      {
        key: "standard",
        preset: "STANDARD",
        productCard: { mode: "grid", columns: { desktop: 3, mobile: 2 } },
        navigation: "timeline",
        categories: "accordion",
        summary: "rows",
        areas: ["navigation", "categories", "product-card", "product-slots", "cart-summary"],
        scenarios: ["default", "loading", "validation", "upsell"],
      },
      {
        key: "classic",
        preset: "CLASSIC",
        productCard: { mode: "grid", columns: { desktop: 4, mobile: 2 } },
        navigation: "timeline",
        categories: "pills",
        summary: "slot-grid",
        areas: ["navigation", "categories", "product-card", "product-slots", "cart-summary"],
        scenarios: ["default", "loading", "validation", "upsell"],
      },
      {
        key: "compact",
        preset: "COMPACT",
        productCard: { mode: "compact", columns: { desktop: 3, mobile: 2 } },
        navigation: "compact-timeline",
        categories: "pills",
        summary: "compact-slots",
        areas: ["navigation", "categories", "product-card", "product-slots", "cart-summary"],
        scenarios: ["default", "loading", "validation", "upsell"],
      },
      {
        key: "horizontal",
        preset: "HORIZONTAL",
        productCard: { mode: "row", columns: { desktop: 2, mobile: 1 } },
        navigation: "horizontal-timeline",
        categories: "underline",
        summary: "rows",
        areas: ["navigation", "categories", "product-card", "product-slots", "cart-summary"],
        scenarios: ["default", "loading", "validation", "upsell"],
      },
      {
        key: "product-list",
        preset: "LIST",
        productCard: { mode: "row", columns: { desktop: 1, mobile: 1 } },
        navigation: "list-steps",
        categories: "tabs",
        summary: "list-selected-drawer",
        areas: ["bundle-header", "navigation", "categories", "product-card", "product-slots", "cart-summary"],
        scenarios: ["default", "validation", "upsell"],
      },
      {
        key: "product-grid",
        preset: "GRID",
        productCard: { mode: "grid", columns: { desktop: 4, mobile: 2 } },
        navigation: "grid-steps",
        categories: "tabs",
        summary: "pdp-footer",
        areas: ["bundle-header", "navigation", "categories", "product-card", "product-slots", "cart-summary"],
        scenarios: ["default", "validation", "upsell"],
      },
      {
        key: "horizontal-slots",
        preset: "HORIZONTAL_SLOTS",
        productCard: { mode: "grid", columns: { desktop: 3, mobile: 2 } },
        navigation: "none",
        categories: "none",
        summary: "modal-footer",
        areas: ["bundle-header", "product-slots", "cart-summary"],
        scenarios: ["default", "product-picker", "validation", "upsell"],
      },
      {
        key: "vertical-slots",
        preset: "VERTICAL_SLOTS",
        productCard: { mode: "grid", columns: { desktop: 3, mobile: 2 } },
        navigation: "none",
        categories: "none",
        summary: "modal-footer",
        areas: ["bundle-header", "product-slots", "cart-summary"],
        scenarios: ["default", "product-picker", "validation", "upsell"],
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
        const isMappedToSupportedContext = !isDesignPreviewFieldApplicable(fieldKey, template.key)
          || Boolean(target && (
            target.target.kind === "area"
              ? getSupportedDesignPreviewAreas(template.key).includes(target.target.value)
              : getSupportedDesignPreviewScenarios(template.key).includes(target.target.value)
          ));
        expect(isMappedToSupportedContext).toBe(true);
      }
    }
  });

  it("reveals secondary storefront surfaces for the fields that own them", () => {
    expect(getDesignPreviewFieldTarget(
      "expert.productCard.productCardButtonColor",
      "horizontal-slots",
    )?.target).toEqual({ kind: "scenario", value: "product-picker" });
    expect(getDesignPreviewFieldTarget(
      "expert.cartFooter.cartFooterBgColor",
      "product-list",
    )?.target).toEqual({ kind: "area", value: "cart-summary" });
    expect(getDesignPreviewFieldTarget(
      "generalSettings.loadingBgColor",
      "standard",
    )?.target).toEqual({ kind: "scenario", value: "loading" });
    expect(getDesignPreviewFieldTarget(
      "expert.generalSettings.conditionToastBgColor",
      "product-grid",
    )?.target).toEqual({ kind: "scenario", value: "validation" });
    expect(getDesignPreviewFieldTarget(
      "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonBg",
      "vertical-slots",
    )?.target).toEqual({ kind: "scenario", value: "upsell" });
  });

  it("reports template-specific applicability without fabricating an effect", () => {
    expect(isDesignPreviewFieldApplicable("expert.generalSettings.productPageTitleColor", "product-grid")).toBe(true);
    expect(isDesignPreviewFieldApplicable("expert.generalSettings.productPageTitleColor", "standard")).toBe(false);
    expect(isDesignPreviewFieldApplicable("expert.emptyStateCard.emptyStateCardBorderColor", "horizontal-slots")).toBe(true);
    expect(isDesignPreviewFieldApplicable("expert.emptyStateCard.emptyStateCardBorderColor", "product-list")).toBe(true);
  });

  it("filters merchant controls to the selected template and component surface", () => {
    const fields = DESIGN_CONFIGURATION.flatMap((section) => section.fields);

    expect(getDesignFieldsForPreviewContext(fields, "standard", { kind: "area", value: "product-card" }).map((field) => field.label))
      .toEqual(expect.arrayContaining(["Primary Color", "Image Fit"]));
    expect(getDesignFieldsForPreviewContext(fields, "standard", { kind: "scenario", value: "loading" }).map((field) => field.label))
      .toEqual(["FPB Loading GIF", "Loading Screen Background Color"]);
    expect(getDesignFieldsForPreviewContext(fields, "product-list", { kind: "scenario", value: "loading" }).map((field) => field.label))
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

    const fpbTheme = buildDesignPreviewTheme(fieldValues, [], null, "standard");
    const ppbTheme = buildDesignPreviewTheme(fieldValues, [], null, "product-list");

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

  it("builds the production storefront design CSS for unsaved preview values", () => {
    const css = buildDesignPreviewStorefrontCss({
      fieldValues: { "Primary Color": "#123456", "Button Text Color": "#fedcba" },
      templateKey: "standard",
    });

    expect(css).toContain("--bundle-global-primary-button: #123456");
    expect(css).toContain("--bundle-global-button-text: #fedcba");
    expect(css).toContain("Bundle Type: full_page");
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
    expect(getDesignPreviewScene("standard", { kind: "area", value: "navigation" }, "desktop").regions).toEqual(["timeline"]);
    expect(getDesignPreviewScene("classic", { kind: "area", value: "categories" }, "mobile").regions).toEqual(["pill-categories"]);
    expect(getDesignPreviewScene("horizontal", { kind: "area", value: "product-card" }, "desktop").regions).toEqual(["product-rows"]);
    expect(getDesignPreviewScene("product-list", { kind: "area", value: "cart-summary" }, "desktop").regions).toEqual(
      expect.arrayContaining(["product-list-selected-drawer", "pdp-footer"]),
    );
    expect(getDesignPreviewScene("product-grid", { kind: "area", value: "navigation" }, "mobile").regions).toEqual(["product-grid-step-headers"]);
    expect(getDesignPreviewScene("horizontal-slots", { kind: "area", value: "product-slots" }, "desktop").regions).toEqual(["horizontal-slots"]);
    expect(getDesignPreviewScene("horizontal-slots", { kind: "scenario", value: "product-picker" }, "desktop").regions).toEqual(
      ["product-picker-modal"],
    );
    expect(getDesignPreviewScene("vertical-slots", { kind: "scenario", value: "product-picker" }, "mobile").regions).toEqual(
      ["product-picker-bottom-sheet"],
    );
  });

  it("keeps the local preview available while a field has an incomplete value", () => {
    expect(() => buildDesignPreviewTheme({ "Primary Font Size": "" })).not.toThrow();
    expect(buildDesignPreviewTheme({ "Primary Font Size": "" })["--preview-primary-font-size"]).toBe("16px");
  });
});
