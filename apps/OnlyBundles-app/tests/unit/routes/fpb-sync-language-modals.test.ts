import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FpbSyncAndLanguageModals } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureSyncAndLanguageModals";

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/PricingTranslationModals",
  () => ({
    PricingTranslationModals: () =>
      React.createElement("div", null, "pricing translations"),
  })
);
jest.mock("../../../app/components/EnablePreviewModal", () => ({
  EnablePreviewModal: () => React.createElement("div", null, "preview gate"),
}));

describe("FpbSyncAndLanguageModals", () => {
  it("composes sync, translation, and preview features from narrow props", () => {
    const markup = renderToStaticMarkup(
      React.createElement(FpbSyncAndLanguageModals, {
        sync: {
          modalRef: { current: null },
          submitting: false,
          onConfirm: jest.fn(),
          onCancel: jest.fn(),
        },
        pricingTranslations: {
          locales: [],
          rules: [],
          quantity: {
            open: false,
            activeLocale: "",
            values: {},
            onActiveLocaleChange: jest.fn(),
            onApply: jest.fn(),
            onClose: jest.fn(),
          },
          progress: {
            open: false,
            activeLocale: "",
            values: {},
            onActiveLocaleChange: jest.fn(),
            onApply: jest.fn(),
            onClose: jest.fn(),
          },
        },
        preview: { open: false, onClose: jest.fn(), onEnable: jest.fn() },
      } as never)
    );

    expect(markup).toContain("Sync bundle");
    expect(markup).toContain("pricing translations");
    expect(markup).toContain("preview gate");
  });
});
