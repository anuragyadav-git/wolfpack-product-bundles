import {
  resolvePpbWidgetPlacementAction,
  validatePpbWidgetPlacementFromAppBridge,
} from "../../../app/lib/ppb-widget-placement.client";

describe("resolvePpbWidgetPlacementAction", () => {
  it("continues to preview when the app block is present", () => {
    expect(
      resolvePpbWidgetPlacementAction({
        ready: true,
        installationLink: null,
        message: null,
      })
    ).toEqual({ type: "preview" });
  });

  it("opens Shopify Theme Editor setup when the app block is missing", () => {
    expect(
      resolvePpbWidgetPlacementAction({
        ready: false,
        installationLink: "https://theme-editor.test/place",
        message: "Place the bundle widget",
      })
    ).toEqual({
      type: "setup",
      installationLink: "https://theme-editor.test/place",
      message: "Place the bundle widget",
    });
  });

  it("blocks preview when placement cannot be verified", () => {
    expect(
      resolvePpbWidgetPlacementAction({
        ready: false,
        installationLink: null,
        message: "Unable to verify bundle widget placement",
      })
    ).toEqual({
      type: "blocked",
      message: "Unable to verify bundle widget placement",
    });
  });
});

describe("validatePpbWidgetPlacementFromAppBridge", () => {
  const installationLink = "https://theme-editor.test/place";

  it("allows preview when Shopify reports the block on the effective product template", async () => {
    const extensions = jest.fn().mockResolvedValue([
      {
        type: "theme_app_extension",
        activations: [
          {
            handle: "bundle-product-page",
            status: "active",
            activations: [
              {
                target: "template--product/main/wolfpack_bundle_product_page",
                themeId: "gid://shopify/OnlineStoreTheme/1",
              },
            ],
          },
        ],
      },
    ]);

    await expect(
      validatePpbWidgetPlacementFromAppBridge({
        shopify: { app: { extensions } },
        templateSuffix: null,
        installationLink,
      })
    ).resolves.toEqual({ ready: true, installationLink: null, message: null });
  });

  it("requires setup when the active block belongs to a different product template", async () => {
    const extensions = jest.fn().mockResolvedValue([
      {
        type: "theme_app_extension",
        activations: [
          {
            handle: "bundle-product-page",
            status: "active",
            activations: [
              {
                target:
                  "template--product.other/main/wolfpack_bundle_product_page",
                themeId: "gid://shopify/OnlineStoreTheme/1",
              },
            ],
          },
        ],
      },
    ]);

    await expect(
      validatePpbWidgetPlacementFromAppBridge({
        shopify: { app: { extensions } },
        templateSuffix: "custom",
        installationLink,
      })
    ).resolves.toEqual({
      ready: false,
      installationLink,
      message:
        "Place the Bundle Builder block on this product template before previewing the bundle.",
    });
  });

  it("fails closed when Shopify placement validation throws", async () => {
    const extensions = jest.fn().mockRejectedValue(new Error("unavailable"));

    await expect(
      validatePpbWidgetPlacementFromAppBridge({
        shopify: { app: { extensions } },
        templateSuffix: null,
        installationLink,
      })
    ).resolves.toEqual({
      ready: false,
      installationLink: null,
      message: "Unable to verify bundle widget placement",
    });
  });
});
