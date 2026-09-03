import {
  createDesignPreviewState,
  setDesignPreviewArea,
  setDesignPreviewScenario,
  setDesignPreviewTemplate,
} from "../../../app/routes/app/app.settings/DesignLivePreview";
import { getStorefrontPreviewRendererKey } from "../../../app/routes/app/app.settings/storefront-preview-interactions";
import {
  DESIGN_PREVIEW_TEMPLATES,
  getDesignFieldsForPreviewContext,
  getSupportedDesignPreviewAreas,
  getSupportedDesignPreviewScenarios,
} from "../../../app/routes/app/app.settings/design-preview-model";
import { DESIGN_CONFIGURATION } from "../../../app/lib/admin-configuration-surfaces";

describe("Settings Design contextual preview focus", () => {
  it("keeps a persistent edit area separate from a transient preview state", () => {
    const initial = createDesignPreviewState("full_page");
    expect(initial).toMatchObject({ area: "product-card", scenario: "default" });

    const cart = setDesignPreviewArea(initial, "cart-summary");
    const validation = setDesignPreviewScenario(cart, "validation");
    expect(validation).toMatchObject({ area: "cart-summary", scenario: "validation" });
    expect(setDesignPreviewScenario(validation, "default")).toMatchObject({
      area: "cart-summary",
      scenario: "default",
    });
  });

  it("keeps the production renderer mounted when only the preview state changes", () => {
    const initial = setDesignPreviewTemplate(
      createDesignPreviewState("product_page"),
      "vertical-slots",
    );
    const picker = setDesignPreviewScenario(initial, "product-picker");

    expect(getStorefrontPreviewRendererKey(initial, 0)).toBe(
      getStorefrontPreviewRendererKey(picker, 0),
    );
    expect(getStorefrontPreviewRendererKey(initial, 1)).not.toBe(
      getStorefrontPreviewRendererKey(initial, 0),
    );
    expect(getStorefrontPreviewRendererKey(
      setDesignPreviewTemplate(initial, "horizontal-slots"),
      0,
    )).not.toBe(getStorefrontPreviewRendererKey(initial, 0));
  });

  it("exposes only template-applicable areas and states", () => {
    expect(getSupportedDesignPreviewAreas("standard")).toEqual([
      "navigation",
      "categories",
      "product-card",
      "product-slots",
      "cart-summary",
    ]);
    expect(getSupportedDesignPreviewScenarios("standard")).toEqual([
      "default",
      "loading",
      "validation",
      "upsell",
    ]);
    expect(getSupportedDesignPreviewAreas("vertical-slots")).toEqual([
      "bundle-header",
      "product-slots",
      "cart-summary",
    ]);
    expect(getSupportedDesignPreviewScenarios("vertical-slots")).toEqual([
      "default",
      "product-picker",
      "validation",
    ]);
  });

  it("resets transient state and falls back only when an edit area is unsupported", () => {
    const slotState = setDesignPreviewScenario(
      setDesignPreviewArea(
        setDesignPreviewTemplate(createDesignPreviewState("product_page"), "vertical-slots"),
        "bundle-header",
      ),
      "product-picker",
    );

    expect(setDesignPreviewTemplate(slotState, "horizontal-slots")).toMatchObject({
      area: "bundle-header",
      scenario: "default",
    });
    expect(setDesignPreviewTemplate(slotState, "product-grid")).toMatchObject({
      area: "bundle-header",
      scenario: "default",
    });
  });

  it("filters controls against the active area or preview state", () => {
    const fields = DESIGN_CONFIGURATION.flatMap((section) => section.fields);

    expect(getDesignFieldsForPreviewContext(fields, "standard", {
      kind: "area",
      value: "product-card",
    }).map((field) => field.label)).toEqual(expect.arrayContaining(["Primary Color", "Image Fit"]));
    expect(getDesignFieldsForPreviewContext(fields, "standard", {
      kind: "scenario",
      value: "loading",
    }).map((field) => field.label)).toEqual(["FPB Loading GIF", "Loading Screen Background Color"]);
  });

  it("gives every template at least one editable area and Default state", () => {
    for (const template of DESIGN_PREVIEW_TEMPLATES) {
      expect(template.supportedAreas.length).toBeGreaterThan(0);
      expect(template.supportedScenarios[0]).toBe("default");
    }
  });
});
