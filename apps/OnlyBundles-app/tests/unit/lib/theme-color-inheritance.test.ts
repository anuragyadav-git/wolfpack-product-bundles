/**
 * Unit Tests: Theme Color Inheritance in CSS Generator
 *
 * Verifies the three-level cascade in generateCSSFromSettings:
 *   Settings design value → theme color → hardcoded default
 */

import { generateCSSFromSettings } from "../../../app/lib/css-generators";
import type { ShopBrandColors } from "../../../app/services/theme-colors.server";

const THEME_COLORS: ShopBrandColors = {
  primary: { background: "#1A56DB", foreground: "#FFFFFF" },
  secondary: { background: "#F9FAFB", foreground: "#111827" },
  syncedAt: "2026-03-26T00:00:00.000Z",
};

describe("generateCSSFromSettings — theme color cascade", () => {
  describe("globalPrimaryButton", () => {
    it("uses Settings design value when set (Settings design wins over theme)", () => {
      const css = generateCSSFromSettings(
        { globalPrimaryButtonColor: "#FF0000" },
        "product_page",
        "",
        THEME_COLORS
      );
      expect(css.includes("--bundle-global-primary-button: #FF0000")).toBe(true);
    });

    it("uses theme color when Settings design value is absent", () => {
      const css = generateCSSFromSettings(
        {},
        "product_page",
        "",
        THEME_COLORS
      );
      expect(css.includes("--bundle-global-primary-button: #1A56DB")).toBe(true);
    });

    it("uses hardcoded default when both Settings design and theme are absent", () => {
      const css = generateCSSFromSettings(
        {},
        "product_page",
        "",
        null
      );
      expect(css.includes("--bundle-global-primary-button: #000000")).toBe(true);
    });
  });

  describe("globalButtonText", () => {
    it("uses Settings design value when set", () => {
      const css = generateCSSFromSettings(
        { globalButtonTextColor: "#333333" },
        "product_page",
        "",
        THEME_COLORS
      );
      expect(css.includes("--bundle-global-button-text: #333333")).toBe(true);
    });

    it("uses theme color when Settings design value is absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", THEME_COLORS);
      expect(css.includes("--bundle-global-button-text: #FFFFFF")).toBe(true);
    });

    it("uses hardcoded default when both absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", null);
      expect(css.includes("--bundle-global-button-text: #FFFFFF")).toBe(true);
    });
  });

  describe("globalPrimaryText", () => {
    it("uses Settings design value when set", () => {
      const css = generateCSSFromSettings(
        { globalPrimaryTextColor: "#222222" },
        "product_page",
        "",
        THEME_COLORS
      );
      expect(css.includes("--bundle-global-primary-text: #222222")).toBe(true);
    });

    it("uses theme color when Settings design value is absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", THEME_COLORS);
      expect(css.includes("--bundle-global-primary-text: #111827")).toBe(true);
    });

    it("uses hardcoded default when both absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", null);
      expect(css.includes("--bundle-global-primary-text: #000000")).toBe(true);
    });
  });

  describe("globalSecondaryText", () => {
    it("uses theme color when Settings design value is absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", THEME_COLORS);
      expect(css.includes("--bundle-global-secondary-text: #111827")).toBe(true);
    });

    it("uses hardcoded default when both absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", null);
      expect(css.includes("--bundle-global-secondary-text: #6B7280")).toBe(true); // same as hardcoded
    });
  });

  describe("globalFooterBg", () => {
    it("uses theme color when Settings design value is absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", THEME_COLORS);
      expect(css.includes("--bundle-global-footer-bg: #F9FAFB")).toBe(true);
    });

    it("uses hardcoded default when both absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", null);
      expect(css.includes("--bundle-global-footer-bg: #FFFFFF")).toBe(true);
    });
  });

  describe("globalFooterText", () => {
    it("uses theme color when Settings design value is absent", () => {
      const css = generateCSSFromSettings({}, "product_page", "", THEME_COLORS);
      expect(css.includes("--bundle-global-footer-text: #111827")).toBe(true);
    });
  });

  describe("backward compatibility — themeColors not passed", () => {
    it("works identically when themeColors param is omitted", () => {
      const withUndefined = generateCSSFromSettings({ globalPrimaryButtonColor: "#ABCDEF" }, "product_page");
      const withNull = generateCSSFromSettings({ globalPrimaryButtonColor: "#ABCDEF" }, "product_page", "", null);
      expect(withUndefined).toBe(withNull);
    });

    it("uses hardcoded defaults when Settings design color absent and themeColors omitted", () => {
      const css = generateCSSFromSettings({}, "product_page");
      expect(css.includes("--bundle-global-primary-button: #000000")).toBe(true);
      expect(css.includes("--bundle-global-button-text: #FFFFFF")).toBe(true);
    });
  });

  describe("downstream cascade — theme colors propagate to dependent vars", () => {
    it("button-add-to-cart uses globalPrimaryButton when no explicit setting", () => {
      const css = generateCSSFromSettings({}, "product_page", "", THEME_COLORS);
      // --bundle-add-to-cart-button-bg falls back to globalPrimaryButton
      expect(css.includes("--bundle-add-to-cart-button-bg: #1A56DB")).toBe(true);
    });

    it("tabs-active-bg uses globalPrimaryButton when no explicit setting", () => {
      const css = generateCSSFromSettings({}, "product_page", "", THEME_COLORS);
      expect(css.includes("--bundle-tabs-active-bg-color: #1A56DB")).toBe(true);
    });
  });
});
