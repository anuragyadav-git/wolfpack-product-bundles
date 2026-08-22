import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductSlotsSurface } from "../../../app/routes/app/app.settings/preview-surfaces/ProductSlotsSurface";
import { DESIGN_PREVIEW_TEMPLATES } from "../../../app/routes/app/app.settings/design-preview-model";

describe("PPB Vertical Slot UI Correction & Preview Surfaces", () => {
  const verticalTemplate = DESIGN_PREVIEW_TEMPLATES.find((t) => t.key === "vertical-slots")!;
  const horizontalTemplate = DESIGN_PREVIEW_TEMPLATES.find((t) => t.key === "horizontal-slots")!;

  it("renders vertical slots surface with uniform slot cards, top-right clear button, and slot direction", () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProductSlotsSurface, {
        descriptor: verticalTemplate,
        t: (k: string) => k,
      }),
    );

    expect(markup).toContain('data-preview-component="product-slots"');
    expect(markup).toContain('data-slot-direction="vertical"');
    expect(markup).toContain('data-preview-region="vertical-slots"');
    expect(markup).toContain('data-filled="true"');
    expect(markup).toContain("aria-label=\"Remove item\"");
  });

  it("renders horizontal slots surface with uniform slot cards", () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProductSlotsSurface, {
        descriptor: horizontalTemplate,
        t: (k: string) => k,
      }),
    );

    expect(markup).toContain('data-preview-component="product-slots"');
    expect(markup).toContain('data-slot-direction="horizontal"');
    expect(markup).toContain('data-preview-region="horizontal-slots"');
    expect(markup).toContain('data-filled="true"');
  });
});
