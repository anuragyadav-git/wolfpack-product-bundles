import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DESIGN_PREVIEW_TEMPLATES,
  DesignLivePreview,
  createDesignPreviewState,
  setDesignPreviewSurface,
  setDesignPreviewTemplate,
  setDesignPreviewViewport,
} from "../../../app/routes/app/app.settings/DesignLivePreview";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("Settings Design Preview Surfaces Redesign", () => {
  const sampleFieldValues = {
    "Primary Color": "#1e3a8a",
    "Button Text Color": "#ffffff",
    "Primary Text Color": "#111827",
    "Secondary Color": "#93c5fd",
    "Product Background Color": "#ffffff",
    "Primary Font Size": "16",
    "Primary Font Weight": "Bold",
    "Secondary Font Size": "14",
    "Secondary Font Weight": "Bold",
    "Body Font Size": "14",
    "Body Font Weight": "Regular",
    "Bundle Buttons Base": "6px",
    "Bundle Buttons Corner Style": "Base",
    "Product Card & Cart Base": "8px",
    "Product Card & Cart Corner Style": "Base",
    "Image Fit": "Cover",
    "stylePresets.images.slotIconUrl": "https://cdn.example.com/icon.svg",
    "stylePresets.images.slotIconFit": "Fit",
    "generalSettings.loadingGifUrl": "https://cdn.example.com/loader.gif",
    "generalSettings.loadingBgColor": "#fafafa",
  };

  it("renders all 8 templates across all their supported surfaces without crashing", () => {
    for (const template of DESIGN_PREVIEW_TEMPLATES) {
      for (const surface of template.supportedSurfaces) {
        for (const viewport of ["desktop", "mobile"] as const) {
          const state = setDesignPreviewViewport(
            setDesignPreviewSurface(
              setDesignPreviewTemplate(
                createDesignPreviewState(template.bundleType),
                template.key,
              ),
              surface,
            ),
            viewport,
          );

          const html = renderToStaticMarkup(
            React.createElement(DesignLivePreview, {
              fieldValues: sampleFieldValues,
              initialState: state,
            }),
          );

          expect(html).toContain(`data-template-key="${template.key}"`);
          expect(html).toContain(`data-preview-surface="${surface}"`);
          expect(html).toContain(`data-preview-viewport="${viewport}"`);
          expect(html).toContain('aria-hidden="true"');
          expect(html).toContain(`data-preview-context=`);
        }
      }
    }
  });

  describe("Full-Page Bundle (FPB) Surface Redesigns", () => {
    it("renders Standard template navigation (timeline), categories (accordion), and product cards", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("full_page"), "standard"),
        "navigation",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-navigation="timeline"');

      const catState = setDesignPreviewSurface(state, "categories");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: catState }),
      );
      expect(html).toContain("data-preview-region=\"category-accordion\"");

      const cardState = setDesignPreviewSurface(state, "product-card");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: cardState }),
      );
      expect(html).toContain('data-product-mode="grid"');
      expect(html).toContain('data-columns-desktop="3"');
    });

    it("renders Classic template pill categories and 4-column product grid", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("full_page"), "classic"),
        "categories",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-category-mode="pills"');

      const cardState = setDesignPreviewSurface(state, "product-card");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: cardState }),
      );
      expect(html).toContain('data-columns-desktop="4"');
    });

    it("renders Compact template compact timeline and compact product cards", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("full_page"), "compact"),
        "navigation",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-navigation="compact-timeline"');

      const cardState = setDesignPreviewSurface(state, "product-card");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: cardState }),
      );
      expect(html).toContain('data-product-mode="compact"');
    });

    it("renders Horizontal template horizontal timeline, underline categories, and horizontal row cards", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("full_page"), "horizontal"),
        "navigation",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-navigation="horizontal-timeline"');

      const catState = setDesignPreviewSurface(state, "categories");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: catState }),
      );
      expect(html).toContain('data-category-mode="underline"');

      const cardState = setDesignPreviewSurface(state, "product-card");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: cardState }),
      );
      expect(html).toContain('data-product-mode="row"');
    });
  });

  describe("Product-Page Bundle (PPB) Surface Redesigns", () => {
    it("renders Product List template bundle header, step headers, cascade rows, and PDP footer", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("product_page"), "product-list"),
        "bundle-header",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-preview-region="bundle-header"');

      const navState = setDesignPreviewSurface(state, "navigation");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: navState }),
      );
      expect(html).toContain('data-preview-region="product-list-step-flow"');

      const cardState = setDesignPreviewSurface(state, "product-card");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: cardState }),
      );
      expect(html).toContain('data-product-mode="row"');

      const summaryState = setDesignPreviewSurface(state, "cart-summary");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: summaryState }),
      );
      expect(html).toContain('data-preview-region="pdp-footer"');
    });

    it("renders Product Grid template bundle header, step headers, category tabs, and grid cards", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("product_page"), "product-grid"),
        "navigation",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-preview-region="product-grid-step-headers"');

      const catState = setDesignPreviewSurface(state, "categories");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: catState }),
      );
      expect(html).toContain('data-category-mode="tabs"');

      const cardState = setDesignPreviewSurface(state, "product-card");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: cardState }),
      );
      expect(html).toContain('data-product-mode="grid"');
      expect(html).toContain('data-columns-desktop="4"');
    });

    it("renders Horizontal Slots template slot strip and bottom-sheet product picker modal", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("product_page"), "horizontal-slots"),
        "product-slots",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-slot-direction="horizontal"');
      expect(html).toContain('data-preview-region="horizontal-slots"');

      const pickerState = setDesignPreviewSurface(state, "product-picker");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: pickerState }),
      );
      expect(html).toContain('data-preview-region="product-picker-modal"');
    });

    it("renders Vertical Slots template vertical slot stack and product picker", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("product_page"), "vertical-slots"),
        "product-slots",
      );
      let html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-slot-direction="vertical"');
      expect(html).toContain('data-preview-region="vertical-slots"');

      const pickerState = setDesignPreviewSurface(state, "product-picker");
      html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: pickerState }),
      );
      expect(html).toContain('data-preview-region="product-picker-modal"');
    });
  });

  describe("Overlay Surfaces Redesign", () => {
    it("renders Loading surface with custom GIF when configured", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("full_page"), "standard"),
        "loading",
      );
      const html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-preview-region="loading-screen"');
      expect(html).toContain('src="https://cdn.example.com/loader.gif"');
    });

    it("renders Validation surface condition toast", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("full_page"), "standard"),
        "validation",
      );
      const html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-preview-region="validation-overlay"');
      expect(html).toContain("settingsDcp.preview.surface.validationMessage");
    });

    it("renders Upsell surface offer card", () => {
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState("full_page"), "standard"),
        "upsell",
      );
      const html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );
      expect(html).toContain('data-preview-region="upsell-overlay"');
      expect(html).toContain("settingsDcp.preview.surface.upsellTitle");
    });
  });
});
