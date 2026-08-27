import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DESIGN_PREVIEW_TEMPLATES,
  DesignLivePreview,
  createDesignPreviewState,
  getDefaultTemplateKey,
  isDesignPreviewAreaSupported,
  isDesignPreviewScenarioSupported,
  isTemplateValidForBundleType,
  setDesignPreviewBundleType,
  setDesignPreviewArea,
  setDesignPreviewScenario,
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
      area: "product-card",
      scenario: "default",
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

  it("preserves viewport and resets the context when bundle type changes", () => {
    const state: DesignPreviewState = {
      bundleType: "product_page",
      templateKey: "horizontal-slots",
      viewport: "mobile",
      area: "product-slots",
      scenario: "product-picker",
    };

    expect(setDesignPreviewBundleType(state, "full_page")).toEqual({
      bundleType: "full_page",
      templateKey: "standard",
      viewport: "mobile",
      area: "product-card",
      scenario: "default",
    });
  });

  it("preserves a supported area and resets transient state when templates change", () => {
    const slotState = setDesignPreviewArea(
      createDesignPreviewState("product_page"),
      "product-slots",
    );
    expect(slotState.area).toBe("product-slots");

    const horizontalSlots = setDesignPreviewTemplate(
      createDesignPreviewState("product_page"),
      "horizontal-slots",
    );
    const pickerState = setDesignPreviewScenario(horizontalSlots, "product-picker");
    expect(pickerState.scenario).toBe("product-picker");
    expect(setDesignPreviewTemplate(pickerState, "vertical-slots")).toMatchObject({ area: "product-slots", scenario: "default" });
    expect(setDesignPreviewTemplate(pickerState, "product-list")).toMatchObject({ area: "product-slots", scenario: "default" });
  });

  it("switches viewport, area, and state without changing the selected template", () => {
    const state = setDesignPreviewTemplate(
      createDesignPreviewState("product_page"),
      "vertical-slots",
    );
    const mobile = setDesignPreviewViewport(state, "mobile");
    const picker = setDesignPreviewScenario(mobile, "product-picker");

    expect(picker).toEqual({
      bundleType: "product_page",
      templateKey: "vertical-slots",
      viewport: "mobile",
      area: "product-slots",
      scenario: "product-picker",
    });
    expect(isDesignPreviewAreaSupported("vertical-slots", "product-slots")).toBe(true);
    expect(isDesignPreviewScenarioSupported("vertical-slots", "product-picker")).toBe(true);
    expect(isDesignPreviewScenarioSupported("product-list", "product-picker")).toBe(false);
  });
});

describe("DesignLivePreview", () => {
  it("renders template-aware area, state, and viewport controls", () => {
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
          area: "product-slots",
          scenario: "default",
        },
      }),
    );

    expect(view).toContain('label="settingsDcp.preview.areaSelector.label"');
    expect(view).toContain('label="settingsDcp.preview.stateSelector.label"');
    expect(view).not.toContain('value="product-picker"');
    expect(utils).toContain('value="product-picker"');
    expect(utils).toContain("settingsDcp.preview.stateSelector.product-picker");
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
          area: "cart-summary",
          scenario: "default",
        },
      }),
    );
    expect(cartView).toContain('data-preview-area="cart-summary"');
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
              area: template.slotOrientation ? "product-slots" : "product-card",
              scenario: "default",
            },
          }),
        );

        expect(view).toContain(`data-template-key="${template.key}"`);
        expect(view).toContain(`data-preview-viewport="${viewport}"`);
        expect(view).toContain(`data-preview-area="${template.slotOrientation ? "product-slots" : "product-card"}"`);
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
    ["product-list", "cart-summary"],
  ] as const)("renders the %s %s deterministic edit area", (templateKey, area) => {
    const template = DESIGN_PREVIEW_TEMPLATES.find((item) => item.key === templateKey);
    const view = renderToStaticMarkup(
      React.createElement(DesignLivePreview, {
        fieldValues: {},
        initialState: {
          bundleType: template?.bundleType ?? "full_page",
          templateKey,
          viewport: "desktop",
          area,
          scenario: "default",
        },
      }),
    );

    expect(view).toContain(`data-preview-area="${area}"`);
    expect(view).toContain(`settingsDcp.preview.areaSelector.${area}`);
  });

  it.each([
    ["horizontal-slots", "product-picker"],
    ["standard", "loading"],
    ["product-grid", "validation"],
    ["vertical-slots", "upsell"],
  ] as const)("renders the %s %s deterministic preview state", (templateKey, scenario) => {
    const template = DESIGN_PREVIEW_TEMPLATES.find((item) => item.key === templateKey);
    const view = renderToStaticMarkup(
      React.createElement(DesignLivePreview, {
        fieldValues: {},
        initialState: {
          bundleType: template?.bundleType ?? "full_page",
          templateKey,
          viewport: "desktop",
          area: template?.slotOrientation ? "product-slots" : "product-card",
          scenario,
        },
      }),
    );

    expect(view).toContain(`data-preview-scenario="${scenario}"`);
    expect(view).toContain(`settingsDcp.preview.stateSelector.${scenario}`);
  });

  it("delegates the selected component to the production renderer frame", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignLivePreview, {
        fieldValues: {},
        initialState: {
          bundleType: "full_page",
          templateKey: "standard",
          viewport: "desktop",
          area: "product-card",
          scenario: "default",
        },
      }),
    );

    expect(view).toContain('data-preview-area="product-card"');
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
