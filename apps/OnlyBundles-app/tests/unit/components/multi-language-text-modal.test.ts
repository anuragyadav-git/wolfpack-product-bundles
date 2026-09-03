import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MultiLanguageTextModal } from "../../../app/components/bundle-configure/MultiLanguageTextModal";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("MultiLanguageTextModal", () => {
  it("shows only supplied Shopify locales and keeps base copy as a fallback", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MultiLanguageTextModal, {
        open: true,
        title: "Translate bundle widget",
        locales: [{ locale: "fr", name: "French", primary: true }],
        activeLocale: "fr",
        fields: [{ key: "title", label: "Title", fallback: "Base title" }],
        valuesByLocale: {},
        onActiveLocaleChange: jest.fn(),
        onSave: jest.fn(),
        onClose: jest.fn(),
      }),
    );

    expect(markup).toContain("Translate bundle widget");
    expect(markup).toContain("French");
    expect(markup).toContain('placeholder="Base title"');
    expect(markup).not.toContain("Arabic");
  });
});
