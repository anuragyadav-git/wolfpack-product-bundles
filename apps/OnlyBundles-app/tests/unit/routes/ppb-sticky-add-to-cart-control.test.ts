import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PpbStickyAddToCartSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.stickyAddToCart";

const mockUsePpbConfigureContext = jest.fn();

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({
    usePpbConfigureContext: () => mockUsePpbConfigureContext(),
  }),
);

describe("PPB sticky add-to-cart setting control", () => {
  it("renders the persisted enabled, device, and action values", () => {
    mockUsePpbConfigureContext.mockReturnValue({
      markAsDirty: jest.fn(),
      stickyAddToCartEnabled: true,
      stickyAddToCartShowDesktop: false,
      stickyAddToCartShowMobile: true,
      stickyAddToCartAction: "add_selected_offer",
      setStickyAddToCartEnabled: jest.fn(),
      setStickyAddToCartShowDesktop: jest.fn(),
      setStickyAddToCartShowMobile: jest.fn(),
      setStickyAddToCartAction: jest.fn(),
    });

    const markup = renderToStaticMarkup(
      createElement(PpbStickyAddToCartSettings),
    );

    expect(markup).toContain("Sticky add to cart");
    expect(markup).toContain("Show on desktop");
    expect(markup).toContain("Show on mobile");
    expect(markup).toContain('value="add_selected_offer"');
  });

  it("disables dependent controls when the feature is off", () => {
    mockUsePpbConfigureContext.mockReturnValue({
      markAsDirty: jest.fn(),
      stickyAddToCartEnabled: false,
      stickyAddToCartShowDesktop: true,
      stickyAddToCartShowMobile: true,
      stickyAddToCartAction: "scroll_to_offers",
      setStickyAddToCartEnabled: jest.fn(),
      setStickyAddToCartShowDesktop: jest.fn(),
      setStickyAddToCartShowMobile: jest.fn(),
      setStickyAddToCartAction: jest.fn(),
    });

    const markup = renderToStaticMarkup(
      createElement(PpbStickyAddToCartSettings),
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain('value="scroll_to_offers"');
  });
});
