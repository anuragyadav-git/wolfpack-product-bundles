import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FpbAddonProductsCard } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonProductsCard";
import { ADDONS_HELP_ARTICLE_URL } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/configure-constants";

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonTierEditor",
  () => ({ FpbAddonTierEditor: () => null })
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { title?: string }) => {
      if (key === "tooltips.helpLabel") return `About ${options?.title}`;
      if (key === "tooltips.freeGiftAddons.title") {
        return "Free Gift and Add-Ons";
      }
      if (key === "tooltips.freeGiftAddons.description") {
        return "Configure gift and add-on products independently.";
      }
      if (key === "tooltips.freeGiftAddons.imageAlt") {
        return "A bundle unlocking a gift and optional add-on products";
      }
      return key;
    },
  }),
}));

describe("FPB Add-ons help actions", () => {
  it("separates the supporting info popover from the configured setup link", () => {
    const view = renderToStaticMarkup(
      React.createElement(FpbAddonProductsCard, {
        enabled: true,
        title: "Add-ons",
        translationsAvailable: true,
        styles: {},
        tierEditor: {} as never,
        onEnabledChange: jest.fn(),
        onOpenTranslations: jest.fn(),
        onTitleChange: jest.fn(),
      })
    );

    expect(view).toContain('icon="info"');
    expect(view).toContain("<s-popover");
    expect(view).toContain('src="/tooltip-free-gift-addons.avif"');
    expect(view).toContain(`<s-link href="${ADDONS_HELP_ARTICLE_URL}"`);
    expect(view).toContain('target="_blank"');

    const helpButton = view.match(
      /<s-button[^>]*icon="info"[^>]*>(.*?)<\/s-button>/
    )?.[1];
    expect(helpButton).not.toContain("How to setup?");
  });
});
