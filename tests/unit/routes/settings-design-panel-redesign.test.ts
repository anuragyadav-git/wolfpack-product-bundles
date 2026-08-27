import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DESIGN_PREVIEW_TEMPLATES,
  DesignLivePreview,
  createDesignPreviewState,
  getDefaultTemplateKey,
  isDesignPreviewSurfaceSupported,
  isTemplateValidForBundleType,
  setDesignPreviewBundleType,
  setDesignPreviewSurface,
  setDesignPreviewTemplate,
  setDesignPreviewViewport,
  type DesignPreviewState,
  createPreviewInteractionState,
  updatePreviewProductQuantity,
  advancePreviewProgress,
  clearPreviewDiscountFeedback,
  triggerPreviewDiscountFeedback,
  togglePreviewMobileSummary,
} from "../../../app/routes/app/app.settings/DesignLivePreview";
import { buildDesignPreviewTheme } from "../../../app/routes/app/app.settings/design-preview-model";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("Settings Design preview state", () => {
  it("updates local product, progress, and mobile-summary preview interactions", () => {
    const initial = createPreviewInteractionState();
    const added = updatePreviewProductQuantity(initial, "third", 1);
    const incremented = updatePreviewProductQuantity(added, "third", 1);
    const progressed = advancePreviewProgress(incremented);
    const expanded = togglePreviewMobileSummary(progressed);

    expect(added.quantities.third).toBe(1);
    expect(incremented.quantities.third).toBe(2);
    expect(progressed.progressStep).toBe(1);
    expect(expanded.isMobileSummaryOpen).toBe(true);
    expect(togglePreviewMobileSummary(expanded).isMobileSummaryOpen).toBe(false);
  });

  it("replays tier and completion feedback in local preview state", () => {
    const initial = createPreviewInteractionState();
    const tier = triggerPreviewDiscountFeedback(initial, "tier");
    const repeatedTier = triggerPreviewDiscountFeedback(tier, "tier");
    const complete = triggerPreviewDiscountFeedback(repeatedTier, "complete");

    expect(tier.discountFeedback).toEqual({ state: "tier", replay: 1 });
    expect(repeatedTier.discountFeedback).toEqual({ state: "tier", replay: 2 });
    expect(complete.discountFeedback).toEqual({ state: "complete", replay: 3 });
    expect(clearPreviewDiscountFeedback(complete, 2)).toBe(complete);
    expect(clearPreviewDiscountFeedback(complete, 3).discountFeedback).toEqual({
      state: null,
      replay: 3,
    });
  });
  it("treats a component color override as authoritative without an Expert mode", () => {
    const fieldValues = {
      "Primary Color": "#123456",
      "expert.productCard.productCardButtonColor": "#abcdef",
    };

    expect(buildDesignPreviewTheme(fieldValues)["--preview-product-button-bg"]).toBe("#abcdef");
  });

  it("uses Landing Page Standard desktop Product card defaults", () => {
    expect(createDesignPreviewState()).toEqual({
      bundleType: "full_page",
      templateKey: "standard",
      viewport: "desktop",
      surface: "product-card",
    });
  });

  it("defines canonical combinations for all eight templates", () => {
    expect(getDefaultTemplateKey("full_page")).toBe("standard");
    expect(getDefaultTemplateKey("product_page")).toBe("product-list");
    expect(DESIGN_PREVIEW_TEMPLATES).toHaveLength(8);

    for (const template of DESIGN_PREVIEW_TEMPLATES) {
      expect(isTemplateValidForBundleType(template.bundleType, template.key)).toBe(true);
      const state = setDesignPreviewTemplate(
        createDesignPreviewState(template.bundleType),
        template.key,
      );
      expect(state.templateKey).toBe(template.key);
    }

    expect(isTemplateValidForBundleType("full_page", "product-grid")).toBe(false);
    expect(() => setDesignPreviewTemplate(
      createDesignPreviewState("full_page"),
      "product-grid",
    )).toThrow('Invalid Design preview template "product-grid" for full_page');
  });

  it("preserves viewport and resets the surface when bundle type changes", () => {
    const state: DesignPreviewState = {
      bundleType: "product_page",
      templateKey: "horizontal-slots",
      viewport: "mobile",
      surface: "product-picker",
    };

    expect(setDesignPreviewBundleType(state, "full_page")).toEqual({
      bundleType: "full_page",
      templateKey: "standard",
      viewport: "mobile",
      surface: "product-card",
    });
  });

  it("preserves a supported surface and falls back when a template does not support it", () => {
    const slotState = setDesignPreviewSurface(
      createDesignPreviewState("product_page"),
      "product-picker",
    );
    expect(slotState.surface).toBe("product-card");

    const horizontalSlots = setDesignPreviewTemplate(
      createDesignPreviewState("product_page"),
      "horizontal-slots",
    );
    const pickerState = setDesignPreviewSurface(horizontalSlots, "product-picker");
    expect(pickerState.surface).toBe("product-picker");
    expect(setDesignPreviewTemplate(pickerState, "vertical-slots").surface).toBe("product-picker");
    expect(setDesignPreviewTemplate(pickerState, "product-list").surface).toBe("product-card");
  });

  it("switches viewport and surface without changing the selected template", () => {
    const state = setDesignPreviewTemplate(
      createDesignPreviewState("product_page"),
      "vertical-slots",
    );
    const mobile = setDesignPreviewViewport(state, "mobile");
    const picker = setDesignPreviewSurface(mobile, "product-picker");

    expect(picker).toEqual({
      bundleType: "product_page",
      templateKey: "vertical-slots",
      viewport: "mobile",
      surface: "product-picker",
    });
    expect(isDesignPreviewSurfaceSupported("vertical-slots", "product-picker")).toBe(true);
    expect(isDesignPreviewSurfaceSupported("product-list", "product-picker")).toBe(false);
  });
});

describe("DesignLivePreview", () => {
  it("renders template-aware surface and viewport controls", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignLivePreview, { fieldValues: {} }),
    );
    const utils = renderToStaticMarkup(
      React.createElement(DesignLivePreview, {
        fieldValues: {},
        initialState: {
          bundleType: "product_page",
          templateKey: "horizontal-slots",
          viewport: "desktop",
          surface: "product-slots",
        },
      }),
    );

    expect(view).toContain('label="settingsDcp.preview.surfaceSelector.label"');
    expect(view).not.toContain('value="product-picker"');
    expect(utils).toContain('value="product-picker"');
    expect(utils).toContain("settingsDcp.preview.surfaceSelector.product-picker");
    expect(view).toContain('accessibilityLabel="settingsDcp.preview.viewport.desktop"');
    expect(view).toContain('accessibilityLabel="settingsDcp.preview.viewport.mobile"');
    expect(view).toContain('aria-pressed="true"');
  });

  it("uses the production renderer for Cart / summary without synthetic feedback actions", () => {
    const cartView = renderToStaticMarkup(
      React.createElement(DesignLivePreview, {
        fieldValues: {},
        initialState: {
          bundleType: "full_page",
          templateKey: "standard",
          viewport: "desktop",
          surface: "cart-summary",
        },
      }),
    );
    expect(cartView).toContain('data-preview-surface="cart-summary"');
    expect(cartView).toContain('src="/settings-design-preview-frame"');
    expect(cartView).not.toContain("settingsDcp.preview.feedback.tierHit");
    expect(cartView).not.toContain("settingsDcp.preview.feedback.complete");
  });

  it.each(DESIGN_PREVIEW_TEMPLATES)(
    "renders canonical $translationKey scenes in both viewport modes",
    (template) => {
      for (const viewport of ["desktop", "mobile"] as const) {
        const view = renderToStaticMarkup(
          React.createElement(DesignLivePreview, {
            fieldValues: { "Primary Color": "#123456" },
            initialState: {
              bundleType: template.bundleType,
              templateKey: template.key,
              viewport,
              surface: template.slotOrientation ? "product-slots" : "product-card",
            },
          }),
        );

        expect(view).toContain(`data-template-key="${template.key}"`);
        expect(view).toContain(`data-preview-viewport="${viewport}"`);
        expect(view).toContain(`data-preview-surface="${template.slotOrientation ? "product-slots" : "product-card"}"`);
        expect(view).toContain('src="/settings-design-preview-frame"');
        expect(view).toContain('sandbox="allow-scripts allow-same-origin"');
        expect(view).not.toContain("http://");
        expect(view).not.toContain("https://");
      }
    },
  );

  it.each([
    ["product-list", "bundle-header"],
    ["standard", "navigation"],
    ["classic", "categories"],
    ["product-grid", "product-card"],
    ["vertical-slots", "product-slots"],
    ["horizontal-slots", "product-picker"],
    ["product-list", "cart-summary"],
    ["standard", "loading"],
    ["product-grid", "validation"],
    ["vertical-slots", "upsell"],
  ] as const)("renders the %s %s deterministic surface", (templateKey, surface) => {
    const template = DESIGN_PREVIEW_TEMPLATES.find((item) => item.key === templateKey);
    const view = renderToStaticMarkup(
      React.createElement(DesignLivePreview, {
        fieldValues: {},
        initialState: {
          bundleType: template?.bundleType ?? "full_page",
          templateKey,
          viewport: "desktop",
          surface,
        },
      }),
    );

    expect(view).toContain(`data-preview-surface="${surface}"`);
    expect(view).toContain(`settingsDcp.preview.surfaceSelector.${surface}`);
  });

  it("delegates the selected component to the production renderer frame", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignLivePreview, {
        fieldValues: {},
        initialState: {
          bundleType: "full_page",
          templateKey: "standard",
          viewport: "desktop",
          surface: "product-card",
        },
      }),
    );

    expect(view).toContain('data-preview-surface="product-card"');
    expect(view).toContain('src="/settings-design-preview-frame"');
    expect(view).not.toContain("data-preview-region");
    expect(view).not.toContain('value="builder"');
  });

  it("loads only the same-origin renderer document from the Admin preview", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignLivePreview, { fieldValues: {} }),
    );

    expect(view).toContain('aria-label="Live bundle preview"');
    expect(view).toContain('src="/settings-design-preview-frame"');
    expect(view).not.toContain("fetch(");
    expect(view).not.toContain("https://");
  });
});
