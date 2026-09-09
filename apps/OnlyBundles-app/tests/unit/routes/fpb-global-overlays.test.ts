import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FpbGlobalOverlays } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureGlobalOverlays";

jest.mock(
  "../../../app/components/bundle-configure/BundleGuidedTour",
  () => ({
    BundleGuidedTour: () => React.createElement("div", null, "tour"),
  })
);
jest.mock(
  "../../../app/components/bundle-configure/MultiLanguageTextModal",
  () => ({
    MultiLanguageTextModal: () => React.createElement("div", null, "language"),
  })
);
jest.mock(
  "../../../app/components/bundle-configure/DiscardChangesModal",
  () => ({
    DiscardChangesModal: () => React.createElement("div", null, "discard"),
  })
);

describe("FpbGlobalOverlays", () => {
  it("composes its three deferred overlays from narrow feature props", () => {
    const markup = renderToStaticMarkup(
      React.createElement(FpbGlobalOverlays, {
        guidedTour: { shop: "example.myshopify.com" },
        language: {
          open: false,
          title: "Translations",
          locales: [],
          activeLocale: "",
          fields: [],
          valuesByLocale: {},
          onActiveLocaleChange: jest.fn(),
          onSave: jest.fn(),
          onClose: jest.fn(),
        },
        discard: {
          open: false,
          onDiscard: jest.fn(),
          onContinue: jest.fn(),
        },
      } as never)
    );

    expect(markup).toContain("tour");
    expect(markup).toContain("language");
    expect(markup).toContain("discard");
  });
});
