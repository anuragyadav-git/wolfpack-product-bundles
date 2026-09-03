import { resolveProductPageStepText } from "../../../app/assets/widgets/product-page/methods/step-text-methods.js";
import { buildStorefrontPreviewFixture } from "../../../app/routes/app/app.settings/storefront-preview-fixtures";

describe("Product Page Step Name and Step Title semantics", () => {
  it("keeps navigation identity separate from the content heading", () => {
    expect(resolveProductPageStepText({
      name: "Choose a base",
      pageTitle: "Choose products for your bundle",
    }, 0)).toEqual({
      navigationLabel: "Choose a base",
      contentTitle: "Choose products for your bundle",
    });
  });

  it("uses the generated step identity when the configured name is missing", () => {
    expect(resolveProductPageStepText({ name: "  ", pageTitle: "Pick products" }, 1))
      .toEqual({ navigationLabel: "Step 2", contentTitle: "Pick products" });
  });

  it("does not fall back to Step Name when Step Title is empty", () => {
    expect(resolveProductPageStepText({ name: "Step 1", pageTitle: "   " }, 0))
      .toEqual({ navigationLabel: "Step 1", contentTitle: "" });
  });

  it("trims merchant-configured navigation and content text", () => {
    expect(resolveProductPageStepText({
      name: "  Choose a base  ",
      pageTitle: "  Pick your favourites  ",
    }, 0)).toEqual({
      navigationLabel: "Choose a base",
      contentTitle: "Pick your favourites",
    });
  });

  it.each([
    "standard",
    "classic",
    "compact",
    "horizontal",
    "product-list",
    "product-grid",
    "horizontal-slots",
    "vertical-slots",
  ] as const)("provides distinct Step Name and Step Title values to the %s preview", (templateKey) => {
    const fixture = buildStorefrontPreviewFixture(templateKey);

    for (const step of fixture.bundle.steps) {
      expect(step.name.trim()).not.toBe("");
      expect(step.pageTitle.trim()).not.toBe("");
      expect(step.pageTitle).not.toBe(step.name);
    }
  });
});
