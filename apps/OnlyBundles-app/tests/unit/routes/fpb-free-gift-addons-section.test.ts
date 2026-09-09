import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FreeGiftAddonsSection } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonsSection";

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonReferenceStepCard",
  () => ({
    FpbAddonReferenceStepCard: ({ label }: { label: string }) =>
      React.createElement("span", null, label),
  })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonProductsCard",
  () => ({
    FpbAddonProductsCard: ({ label }: { label: string }) =>
      React.createElement("span", null, label),
  })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonFooterMessaging",
  () => ({
    FpbAddonFooterMessaging: ({ label }: { label: string }) =>
      React.createElement("span", null, label),
  })
);

describe("FreeGiftAddonsSection", () => {
  it("renders nothing when another configure section is active", () => {
    const view = renderToStaticMarkup(
      React.createElement(FreeGiftAddonsSection, {
        activeSection: "step_setup",
        referenceStep: { label: "reference" } as never,
        products: { label: "products" } as never,
        footerMessaging: { label: "footer" } as never,
      })
    );

    expect(view).toBe("");
  });

  it("composes each add-on feature from its narrow props", () => {
    const view = renderToStaticMarkup(
      React.createElement(FreeGiftAddonsSection, {
        activeSection: "free_gift_addons",
        referenceStep: { label: "reference" } as never,
        products: { label: "products" } as never,
        footerMessaging: { label: "footer" } as never,
      })
    );

    expect(view).toContain("reference");
    expect(view).toContain("products");
    expect(view).toContain("footer");
  });
});
