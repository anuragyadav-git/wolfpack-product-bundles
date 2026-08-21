import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DefaultProductDiscountTipBanner,
  DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY,
} from "../../../app/routes/app/_shared/bundle-configure/DefaultProductDiscountTipBanner";
import { FpbDefaultProductsSettings } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsDefaultProducts";
import { PpbDefaultProductsSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.defaultProducts";
import {
  dismissBannerInSession,
  isBannerDismissedInSession,
} from "../../../app/lib/banner-session-state";

const mockUsePpbConfigureContext = jest.fn();

class MockSessionStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({
    usePpbConfigureContext: () => mockUsePpbConfigureContext(),
  })
);

const baseFlow = {
  buildDefaultProductEntryFromPicker: jest.fn(),
  clearValidationError: jest.fn(),
  defaultProductsData: {},
  markAsDirty: jest.fn(),
  setDefaultProductsData: jest.fn(),
  shopify: {},
};

const ppbContext = {
  ...baseFlow,
  productPageBundleStyles: {
    defaultProductsPickerActions: "",
    defaultProductsPickerGroup: "",
    settingInlineSwitch: "",
    settingTitle: "",
    settingTitleRow: "",
  },
};

describe("Pre Selected Product discount tip with session state", () => {
  let mockStorage: MockSessionStorage;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePpbConfigureContext.mockReturnValue(ppbContext);
    mockStorage = new MockSessionStorage();
    (globalThis as any).window = {
      sessionStorage: mockStorage,
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it("renders the shared banner when not dismissed in session", () => {
    const view = renderToStaticMarkup(
      React.createElement(DefaultProductDiscountTipBanner)
    );
    expect(view).toContain("s-banner");
    expect(view).toContain("Discount tip");
    expect(
      isBannerDismissedInSession(DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY)
    ).toBe(false);
  });

  it.each([
    ["FPB", () => FpbDefaultProductsSettings({ flow: baseFlow as any })],
    ["PPB", () => PpbDefaultProductsSettings()],
  ])(
    "renders in %s parent section when not dismissed in session",
    (_, render) => {
      const view = renderToStaticMarkup(render());
      expect(view).toContain("Discount tip");
    }
  );

  it.each([
    ["FPB", () => FpbDefaultProductsSettings({ flow: baseFlow as any })],
    ["PPB", () => PpbDefaultProductsSettings()],
  ])(
    "keeps configured controls visible and inert in disabled %s state",
    (_, render) => {
      const view = renderToStaticMarkup(render());

      expect(view).toContain("Default products title");
      expect(view).toContain('aria-disabled="true"');
      expect(view).toContain('disabled="true"');
    }
  );

  it("persists dismissal in session storage and hides on reload", () => {
    dismissBannerInSession(DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY);
    expect(
      isBannerDismissedInSession(DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY)
    ).toBe(true);

    const view = renderToStaticMarkup(
      React.createElement(DefaultProductDiscountTipBanner)
    );
    expect(view).toBe("");
  });
});
