import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DiscountPricingTipBanner,
  DISCOUNT_PRICING_TIP_BANNER_KEY,
} from "../../../app/routes/app/_shared/bundle-configure/DiscountPricingTipBanner";
import {
  dismissBannerInSession,
  isBannerDismissedInSession,
} from "../../../app/lib/banner-session-state";

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

describe("DiscountPricingTipBanner with session state persistence", () => {
  let mockStorage: MockSessionStorage;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    mockStorage = new MockSessionStorage();
    (globalThis as any).window = {
      sessionStorage: mockStorage,
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it("renders when not yet dismissed in session", () => {
    const view = renderToStaticMarkup(React.createElement(DiscountPricingTipBanner));
    expect(view).toContain("s-banner");
    expect(view).toContain("Discount setup tip");
    expect(isBannerDismissedInSession(DISCOUNT_PRICING_TIP_BANNER_KEY)).toBe(false);
  });

  it("stores dismissed state in session storage on dismiss", () => {
    expect(isBannerDismissedInSession(DISCOUNT_PRICING_TIP_BANNER_KEY)).toBe(false);

    dismissBannerInSession(DISCOUNT_PRICING_TIP_BANNER_KEY);

    expect(isBannerDismissedInSession(DISCOUNT_PRICING_TIP_BANNER_KEY)).toBe(true);
  });

  it("returns nothing when already dismissed in session (e.g. on page reload)", () => {
    dismissBannerInSession(DISCOUNT_PRICING_TIP_BANNER_KEY);

    const view = renderToStaticMarkup(React.createElement(DiscountPricingTipBanner));
    expect(view).toBe("");
  });
});
