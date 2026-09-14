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

const LIVE_HELP_KEYS: HelpTooltipKey[] = [
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
  "swatchTooltip",
  "tierBadge",
  "freeGiftAddons",
  "bundleWidget",
  "bundleEmbed",
  "preselectedProducts",
  "quantityValidation",
  "lowStockAlert",
  "stickyAddToCart",
  "countdownTimer",
  "bundleSubscriptions",
  "floatingPromoBadge",
];

const TEXT_ONLY_HELP_KEYS: HelpTooltipKey[] = [
  "cartLineItemDiscountDisplay",
  "specificLinkAccess",
  "offerOperations",
  "countryTargeting",
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

  it("renders localized text without an image for text-only help", () => {
    const view = renderToStaticMarkup(
      React.createElement(ConfigureHelpPopover, {
        tooltipKey: "cartLineItemDiscountDisplay",
      }),
    );

    expect(view).toContain("<s-popover");
    expect(view).not.toContain("<s-image");
    expect(view).toContain("Cart Line Item Discount Display");
  });
});

describe("configure help catalog", () => {
  it("contains only help entries rendered by Configure surfaces", () => {
    expect(Object.keys(HELP_TOOLTIPS).sort()).toEqual(
      [...LIVE_HELP_KEYS, ...CURATED_RICH_HELP_KEYS, ...TEXT_ONLY_HELP_KEYS]
        .filter((key, index, keys) => keys.indexOf(key) === index)
        .sort(),
    );
  });

  it("provides localized copy, evidence, and durable sources for visual help", () => {
    for (const key of CURATED_RICH_HELP_KEYS) {
      const tooltip = HELP_TOOLTIPS[key];
      const imageSrc = tooltip.imageSrc as string;
      const copy = en.tooltips[key as keyof typeof en.tooltips] as
        | { title?: string; description?: string; imageAlt?: string }
        | undefined;

      expect(tooltip).toBeDefined();
      expect(imageSrc).toMatch(/^\/tooltip-[a-z0-9-]+\.avif$/);
      expect(tooltip.visualEvidence).toMatch(
        /^(settings-design-production-renderer|agent-storefront)$/,
      );
      expect(copy?.title).toBeTruthy();
      expect(copy?.description).toBeTruthy();
      expect(copy?.imageAlt).toBeTruthy();
      expect("fallbackTitle" in tooltip).toBe(false);
      expect("fallbackDescription" in tooltip).toBe(false);

      const pngPath = path.join(
        __dirname,
        "../../../public",
        path.basename(imageSrc, ".avif") + ".png",
      );
      expect(fs.existsSync(pngPath)).toBe(true);
    }
  });

  it("keeps theme-variable and non-visual settings text-only", () => {
    for (const key of TEXT_ONLY_HELP_KEYS) {
      const tooltip = HELP_TOOLTIPS[key];
      const copy = en.tooltips[key as keyof typeof en.tooltips] as
        | { title?: string; description?: string }
        | undefined;

      expect(tooltip).toEqual({});
      expect(copy?.title).toBeTruthy();
      expect(copy?.description).toBeTruthy();
    }
  });
});
