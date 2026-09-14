import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PpbStickyAddToCartSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.stickyAddToCart";

function makeStickyProps(
  overrides: Partial<Parameters<typeof PpbStickyAddToCartSettings>[0]> = {},
) {
  return {
    markAsDirty: jest.fn(),
    stickyAddToCartEnabled: true,
    stickyAddToCartShowDesktop: true,
    stickyAddToCartShowMobile: true,
    stickyAddToCartAction: "scroll_to_offers" as const,
    setStickyAddToCartEnabled: jest.fn(),
    setStickyAddToCartShowDesktop: jest.fn(),
    setStickyAddToCartShowMobile: jest.fn(),
    setStickyAddToCartAction: jest.fn(),
    ...overrides,
  };
}

describe("PPB sticky add-to-cart setting control", () => {
  it("renders the persisted enabled, device, and action values", () => {
    const props = makeStickyProps({
      stickyAddToCartEnabled: true,
      stickyAddToCartShowDesktop: false,
      stickyAddToCartShowMobile: true,
      stickyAddToCartAction: "add_selected_offer",
    });

    const view = renderToStaticMarkup(
      createElement(PpbStickyAddToCartSettings, props),
    );

    expect(view).toContain("Sticky add to cart");
    expect(view).toContain("Show on desktop");
    expect(view).toContain("Show on mobile");
    expect(view).toContain('value="add_selected_offer"');
  });

  it("disables dependent controls when the feature is off", () => {
    const props = makeStickyProps({
      stickyAddToCartEnabled: false,
      stickyAddToCartShowDesktop: true,
      stickyAddToCartShowMobile: true,
      stickyAddToCartAction: "scroll_to_offers",
    });

    const view = renderToStaticMarkup(
      createElement(PpbStickyAddToCartSettings, props),
    );

    expect(view).toContain("disabled");
    expect(view).toContain('value="scroll_to_offers"');
  });
});
