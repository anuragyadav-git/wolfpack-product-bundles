import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ConfigureHelpPopover } from "../../../app/routes/app/_shared/bundle-configure/ConfigureHelpPopover";
import {
  HELP_TOOLTIPS,
  type HelpTooltipKey,
} from "../../../app/constants/help-tooltips";
import en from "../../../app/i18n/locales/en.json";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { title?: string }) => {
      if (key === "tooltips.helpLabel") return `About ${options?.title}`;
      const [, tooltipKey, field] = key.split(".");
      const tooltip = en.tooltips[
        tooltipKey as keyof typeof en.tooltips
      ] as Record<string, string>;
      return tooltip?.[field] ?? key;
    },
  }),
}));

const PRESERVED_KEYS: HelpTooltipKey[] = [
  "stepFlow",
  "category",
  "rulesConfiguration",
  "bundleQuantityOptions",
  "productSlots",
  "discountProgressBar",
  "discountMessaging",
  "loadingAnimation",
  "bundleVisibilityPending",
  "variantSelector",
  "showTextOnAddButton",
  "cartLineItemDiscountDisplay",
];

const CURATED_RICH_HELP_KEYS: HelpTooltipKey[] = [
  "stepFlow",
  "category",
  "rulesConfiguration",
  "bundleQuantityOptions",
  "productSlots",
  "discountProgressBar",
  "discountMessaging",
  "variantSelector",
  "showTextOnAddButton",
  "cartLineItemDiscountDisplay",
  "swatchTooltip",
  "tierBadge",
  "freeGiftAddons",
  "specificLinkAccess",
  "offerOperations",
  "countryTargeting",
  "bundleWidget",
  "bundleEmbed",
  "loadingAnimation",
  "preselectedProducts",
  "quantityValidation",
  "lowStockAlert",
  "stickyAddToCart",
  "countdownTimer",
  "bundleSubscriptions",
];

describe("ConfigureHelpPopover", () => {
  it("renders a non-submitting Polaris trigger linked to localized rich content", () => {
    const view = renderToStaticMarkup(
      React.createElement(ConfigureHelpPopover, { tooltipKey: "category" }),
    );

    expect(view).toContain("<s-button");
    expect(view).toContain('type="button"');
    expect(view).toContain('icon="info"');
    expect(view).toContain('accessibilityLabel="About Category"');
    expect(view).toContain("<s-popover");
    expect(view).toContain("<s-image");
    expect(view).toContain("Categories will appear as tabs inside each step");

    const commandFor = view.match(/commandFor="([^"]+)"/)?.[1];
    expect(commandFor).toBeTruthy();
    expect(view).toContain(`id="${commandFor}"`);
  });

  it("assigns a distinct popover target to repeated help entries", () => {
    const view = renderToStaticMarkup(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(ConfigureHelpPopover, { tooltipKey: "tierBadge" }),
        React.createElement(ConfigureHelpPopover, { tooltipKey: "tierBadge" }),
      ),
    );
    const targets = [...view.matchAll(/commandFor="([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(targets).toHaveLength(2);
    expect(new Set(targets).size).toBe(2);
  });
});

describe("configure help catalog", () => {
  it("preserves every existing tooltip key", () => {
    expect(Object.keys(HELP_TOOLTIPS)).toEqual(
      expect.arrayContaining(PRESERVED_KEYS),
    );
  });

  it("provides localized copy and durable image sources for curated rich help", () => {
    for (const key of CURATED_RICH_HELP_KEYS) {
      const tooltip = HELP_TOOLTIPS[key];
      const imageSrc = tooltip.imageSrc as string;
      const copy = en.tooltips[key as keyof typeof en.tooltips] as
        | { title?: string; description?: string; imageAlt?: string }
        | undefined;

      expect(tooltip).toBeDefined();
      expect(imageSrc).toMatch(/^\/tooltip-[a-z0-9-]+\.avif$/);
      expect(copy?.title).toBeTruthy();
      expect(copy?.description).toBeTruthy();
      expect(copy?.imageAlt).toBeTruthy();
      expect("fallbackTitle" in tooltip).toBe(false);
      expect("fallbackDescription" in tooltip).toBe(false);

      const pngPath = path.join(
        process.cwd(),
        "public",
        path.basename(imageSrc, ".avif") + ".png",
      );
      expect(fs.existsSync(pngPath)).toBe(true);
    }
  });
});
