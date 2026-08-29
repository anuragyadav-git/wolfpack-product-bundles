import { createSharedProductCardElement } from "../../../app/assets/widgets/shared/components/product-card.js";
import { JSDOM } from "jsdom";
import { getGridStepRenderSequence } from "../../../app/assets/widgets/product-page/methods/layout-shell-methods.js";
import { shouldDisableIntermediateProductPageCta } from "../../../app/assets/widgets/product-page/methods/footer-modal-state-methods.js";
import { resolveInpageProductSelection } from "../../../app/assets/widgets/product-page/methods/inpage-render-methods.js";

describe("PPB Product Grid interaction parity", () => {
  it("renders a selected Grid card as a quantity-aware Added action", () => {
    const document = new JSDOM('<!doctype html>').window.document;
    const view = createSharedProductCardElement(
      { id: "variant-1", title: "Grid product", price: 1299 },
      2,
      { display: { format: ["$", "{{amount}}"].join("") } },
      {
        mode: "grid",
        selectedAction: "button",
        selectedButtonText: "Added x2",
        document,
      },
    );

    expect(view.textContent).toMatch(/Added x2/);
    expect(view.textContent).not.toMatch(/Decrease quantity/);
    expect(view.textContent).not.toMatch(/Increase quantity/);
  });

  it("omits the product description when Grid disables description rendering", () => {
    const document = new JSDOM('<!doctype html>').window.document;
    const view = createSharedProductCardElement(
      {
        id: "variant-1",
        title: "Grid product",
        description: "Description that must not render",
        price: 1299,
      },
      0,
      { display: { format: ["$", "{{amount}}"].join("") } },
      { mode: "grid", description: "", document },
    );

    expect(view.textContent).not.toMatch(/Description that must not render/);
    expect(view.querySelector('[data-bw-card-description]')).toBeNull();
  });

  it("places the active Grid body directly after its step header", () => {
    expect(getGridStepRenderSequence({ stepCount: 3, currentStepIndex: 1 })).toEqual([
      { type: "header", stepIndex: 0 },
      { type: "header", stepIndex: 1 },
      { type: "body", stepIndex: 1 },
      { type: "header", stepIndex: 2 },
    ]);
  });

  it("keeps an incomplete intermediate Grid CTA activatable for validation feedback", () => {
    expect(shouldDisableIntermediateProductPageCta({
      isGrid: true,
      currentStepValid: false,
    })).toBe(false);
  });

  it("retains native disabled behavior for an incomplete non-Grid step CTA", () => {
    expect(shouldDisableIntermediateProductPageCta({
      isGrid: false,
      currentStepValid: false,
    })).toBe(true);
  });

  it("restores a grouped Grid card against the saved variant instead of its default variant", () => {
    expect(resolveInpageProductSelection(
      {
        id: "product-1",
        variantId: "variant-6",
        variants: [
          { id: "variant-6", title: "6" },
          { id: "variant-10", title: "10" },
        ],
      },
      { "variant-10": 1 },
      (value) => String(value || ""),
    )).toEqual({ selectionKey: "variant-10", quantity: 1 });
  });

  it("does not mark the same variant selected in a different category", () => {
    expect(resolveInpageProductSelection(
      {
        id: "product-1",
        variantId: "variant-10",
        variants: [{ id: "variant-10", title: "10" }],
      },
      { "variant-10": 1 },
      (value) => String(value || ""),
      { "variant-10": 0 },
      1,
    )).toEqual({ selectionKey: "variant-10", quantity: 0 });
  });
});
