import {
  buildSettingsBundlePreparePreviewUrl,
  openSettingsBundleStorefrontPreview,
  resolveSettingsBundlePreviewUrl,
  type SettingsPreviewBundle,
} from "../../../app/lib/settings-design-storefront-preview.client";

const fpb: SettingsPreviewBundle = {
  id: "fpb-1",
  name: "Landing bundle",
  type: "Landing Page",
  bundleType: "full_page",
  viewUrl: "https://shop.test/apps/product-bundles/wpb/7",
};
const ppb: SettingsPreviewBundle = {
  id: "ppb-1",
  name: "Product bundle",
  type: "Product Page",
  bundleType: "product_page",
  viewUrl: "https://shop.test/products/bundle-product",
};

describe("Settings Design prepared storefront preview", () => {
  it("builds the existing configure prepare route for both bundle types", () => {
    expect(buildSettingsBundlePreparePreviewUrl(fpb)).toBe(
      "/app/bundles/full-page-bundle/configure/fpb-1/prepare-preview",
    );
    expect(buildSettingsBundlePreparePreviewUrl(ppb)).toBe(
      "/app/bundles/product-page-bundle/configure/ppb-1/prepare-preview",
    );
  });

  it("resolves signed FPB and tokenized PPB storefront URLs", () => {
    expect(resolveSettingsBundlePreviewUrl(fpb, {
      success: true,
      ready: true,
      shareablePreviewUrl: "https://shop.test/apps/product-bundles/wpb/7?wpb_preview=signed",
    })).toContain("wpb_preview=signed");
    expect(resolveSettingsBundlePreviewUrl(ppb, {
      success: true,
      ready: true,
      previewToken: "token value",
    })).toBe("https://shop.test/products/bundle-product?wpb_preview=token+value");
  });

  it("reserves and navigates a popup only after preparation succeeds", async () => {
    const replace = jest.fn();
    const popup = { closed: false, opener: {}, location: { replace }, close: jest.fn() } as unknown as Window;
    const openWindow = jest.fn(() => popup);
    const fetchPreview = jest.fn(async () => new Response(JSON.stringify({
      success: true,
      ready: true,
      previewToken: "prepared",
    }), { status: 200, headers: { "content-type": "application/json" } }));

    await expect(openSettingsBundleStorefrontPreview(ppb, { openWindow, fetch: fetchPreview })).resolves.toBe(
      "https://shop.test/products/bundle-product?wpb_preview=prepared",
    );
    expect(openWindow).toHaveBeenCalledWith("about:blank", "_blank");
    expect(fetchPreview).toHaveBeenCalledWith(
      "/app/bundles/product-page-bundle/configure/ppb-1/prepare-preview",
      expect.objectContaining({ method: "POST" }),
    );
    expect(replace).toHaveBeenCalledWith("https://shop.test/products/bundle-product?wpb_preview=prepared");
  });

  it("closes the reserved popup and reports preparation failures", async () => {
    const close = jest.fn();
    const popup = { closed: false, opener: {}, location: { replace: jest.fn() }, close } as unknown as Window;
    const fetchPreview = jest.fn(async () => new Response(JSON.stringify({
      success: false,
      error: "Storefront sync failed",
    }), { status: 500, headers: { "content-type": "application/json" } }));

    await expect(openSettingsBundleStorefrontPreview(fpb, {
      openWindow: () => popup,
      fetch: fetchPreview,
    })).rejects.toThrow("Storefront sync failed");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("reports a blocked popup before making a prepare request", async () => {
    const fetchPreview = jest.fn();

    await expect(openSettingsBundleStorefrontPreview(fpb, {
      openWindow: () => null,
      fetch: fetchPreview,
    })).rejects.toMatchObject({ code: "popupBlocked" });
    expect(fetchPreview).not.toHaveBeenCalled();
  });

  it("rejects an incomplete successful preparation and closes the popup", async () => {
    const close = jest.fn();
    const popup = { closed: false, opener: {}, location: { replace: jest.fn() }, close } as unknown as Window;

    await expect(openSettingsBundleStorefrontPreview(ppb, {
      openWindow: () => popup,
      fetch: async () => new Response(JSON.stringify({ success: true, ready: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    })).rejects.toMatchObject({ code: "notReady" });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
