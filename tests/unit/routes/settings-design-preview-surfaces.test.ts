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
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));

describe("Settings Design production renderer surfaces", () => {
  const sampleFieldValues = {
    "Primary Color": "#1e3a8a",
    "Button Text Color": "#ffffff",
    "Product Background Color": "#ffffff",
  };

  it("routes every supported template, surface, and viewport through the isolated renderer frame", () => {
    for (const template of DESIGN_PREVIEW_TEMPLATES) {
      for (const surface of template.supportedSurfaces) {
        for (const viewport of ["desktop", "mobile"] as const) {
          const state = setDesignPreviewViewport(
            setDesignPreviewSurface(
              setDesignPreviewTemplate(createDesignPreviewState(template.bundleType), template.key),
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
          expect(html).toContain('src="/settings-design-preview-frame"');
          expect(html).toContain('sandbox="allow-scripts allow-same-origin"');
        }
      }
    }
  });

  it("keeps transient states in the same production renderer frame", () => {
    for (const surface of ["product-picker", "loading", "validation", "upsell"] as const) {
      const templateKey = surface === "product-picker" ? "vertical-slots" : "standard";
      const bundleType = surface === "product-picker" ? "product_page" : "full_page";
      const state = setDesignPreviewSurface(
        setDesignPreviewTemplate(createDesignPreviewState(bundleType), templateKey),
        surface,
      );
      const html = renderToStaticMarkup(
        React.createElement(DesignLivePreview, { fieldValues: sampleFieldValues, initialState: state }),
      );

      expect(html).toContain(`data-preview-surface="${surface}"`);
      expect(html).toContain('src="/settings-design-preview-frame"');
      expect(html).not.toContain("data-preview-region");
    }
  });
});
