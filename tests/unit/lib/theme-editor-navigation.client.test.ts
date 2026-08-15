import {
  buildFpbUpsellThemeEditorUrl,
  openThemeEditorInNewTab,
} from "../../../app/lib/theme-editor-navigation.client";

describe("buildFpbUpsellThemeEditorUrl", () => {
  it("builds the product-template deep link for the unified upsell block", () => {
    expect(buildFpbUpsellThemeEditorUrl({
      shop: "test-shop.myshopify.com",
      apiKey: "app-key",
    })).toBe(
      "https://test-shop.myshopify.com/admin/themes/current/editor?template=product&addAppBlockId=app-key%2Fbundle-upsell&target=newAppsSection",
    );
  });
});

describe("openThemeEditorInNewTab", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });

  it("opens the Theme Editor in a new tab", () => {
    const open = jest.fn();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { open },
    });

    openThemeEditorInNewTab("https://shop.myshopify.com/admin/themes/1/editor");

    expect(open).toHaveBeenCalledWith(
      "https://shop.myshopify.com/admin/themes/1/editor",
      "_blank",
      "noopener,noreferrer",
    );
  });
});
