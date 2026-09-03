/**
 * Unit tests — parsePPBBundleSettings
 *
 * Spec: test-spec/ppb-bundle-settings.spec.md
 * Issue: [ppb-edit-bundle-flow-1]
 */

import { parsePPBBundleSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/parsers";

jest.mock("../../../app/lib/css-sanitizer", () => ({
  processCss: jest.fn((css: string) => ({
    sanitizedCss: css.replace(/<script/gi, ""),
    isValid: true,
    warnings: [],
    syntaxErrors: [],
  })),
}));

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

describe("parsePPBBundleSettings", () => {
  it("returns correct defaults when form has no bundle settings fields", () => {
    const result = parsePPBBundleSettings(makeForm({}));
    expect(result.preSelectedProductVariantId).toBeNull();
    expect(result.maxQtyPerProduct).toBeNull();
    expect(result).not.toHaveProperty("productSlotsEnabled");
    expect(result).not.toHaveProperty("productSlotIconUrl");
    expect(result.variantSelectorEnabled).toBe(true);
    expect(result.showTextOnAddButton).toBe(false);
    expect(result.bundleCartTitle).toBeNull();
    expect(result.bundleCartSubtitle).toBeNull();
    expect(result.bundleBannerDesktopUrl).toBeNull();
    expect(result.bundleBannerMobileUrl).toBeNull();
    expect(result.bundleLevelCss).toBeNull();
    expect(result.defaultProductsData).toEqual({});
    expect(result.validateQuantityPerProduct).toEqual({ isEnabled: false, allowedQuantity: 1 });
    expect(result.bundleTextConfig).toBeNull();
    expect(result.useSingleStepCategoriesAsBundleSteps).toBe(false);
    expect(result.lowStockAlertEnabled).toBe(false);
    expect(result.lowStockAlertThreshold).toBe(5);
    expect(result.lowStockAlertMessage).toBe("Only {{stock}} left");
    expect(result.stickyAddToCartEnabled).toBe(false);
    expect(result.stickyAddToCartShowDesktop).toBe(true);
    expect(result.stickyAddToCartShowMobile).toBe(true);
    expect(result.stickyAddToCartAction).toBe("scroll_to_offers");
    expect(result.countdownEnabled).toBe(false);
    expect(result.countdownLayout).toBe("compact");
    expect(result.countdownPosition).toBe("above");
    expect(result.countdownTitle).toBe("");
    expect(result.countdownExpiryAction).toBe("hide");
    expect(result.countdownExpiredMessage).toBe("");
  });

  it("parses direct countdown presentation settings", () => {
    const result = parsePPBBundleSettings(makeForm({
      countdownEnabled: "true",
      countdownLayout: "full",
      countdownPosition: "below",
      countdownTitle: "Ends soon",
      countdownExpiryAction: "show_message",
      countdownExpiredMessage: "This offer has ended",
    }));

    expect(result.countdownEnabled).toBe(true);
    expect(result.countdownLayout).toBe("full");
    expect(result.countdownPosition).toBe("below");
    expect(result.countdownTitle).toBe("Ends soon");
    expect(result.countdownExpiryAction).toBe("show_message");
    expect(result.countdownExpiredMessage).toBe("This offer has ended");
  });

  it("normalizes unsupported countdown options to canonical defaults", () => {
    const result = parsePPBBundleSettings(makeForm({
      countdownLayout: "banner",
      countdownPosition: "fixed",
      countdownExpiryAction: "restart",
    }));

    expect(result.countdownLayout).toBe("compact");
    expect(result.countdownPosition).toBe("above");
    expect(result.countdownExpiryAction).toBe("hide");
  });

  it("parses direct sticky add-to-cart settings", () => {
    const result = parsePPBBundleSettings(makeForm({
      stickyAddToCartEnabled: "true",
      stickyAddToCartShowDesktop: "false",
      stickyAddToCartShowMobile: "true",
      stickyAddToCartAction: "add_selected_offer",
    }));

    expect(result.stickyAddToCartEnabled).toBe(true);
    expect(result.stickyAddToCartShowDesktop).toBe(false);
    expect(result.stickyAddToCartShowMobile).toBe(true);
    expect(result.stickyAddToCartAction).toBe("add_selected_offer");
  });

  it("parses direct low-stock alert settings", () => {
    const result = parsePPBBundleSettings(makeForm({
      lowStockAlertEnabled: "true",
      lowStockAlertThreshold: "8",
      lowStockAlertMessage: "Hurry, {{stock}} remaining",
    }));

    expect(result.lowStockAlertEnabled).toBe(true);
    expect(result.lowStockAlertThreshold).toBe(8);
    expect(result.lowStockAlertMessage).toBe("Hurry, {{stock}} remaining");
  });

  it("parses variantSelectorEnabled defaults to true when missing", () => {
    const result = parsePPBBundleSettings(makeForm({}));
    expect(result.variantSelectorEnabled).toBe(true);
  });

  it("parses variantSelectorEnabled=false correctly", () => {
    const result = parsePPBBundleSettings(makeForm({ variantSelectorEnabled: "false" }));
    expect(result.variantSelectorEnabled).toBe(false);
  });

  it("parses preSelectedProductVariantId", () => {
    const result = parsePPBBundleSettings(makeForm({
      preSelectedProductVariantId: "gid://shopify/ProductVariant/456",
    }));
    expect(result.preSelectedProductVariantId).toBe("gid://shopify/ProductVariant/456");
  });

  it("returns null for preSelectedProductVariantId when empty", () => {
    const result = parsePPBBundleSettings(makeForm({ preSelectedProductVariantId: "" }));
    expect(result.preSelectedProductVariantId).toBeNull();
  });

  it("parses maxQtyPerProduct as integer", () => {
    const result = parsePPBBundleSettings(makeForm({ maxQtyPerProduct: "3" }));
    expect(result.maxQtyPerProduct).toBe(3);
  });

  it("returns null for maxQtyPerProduct when blank", () => {
    const result = parsePPBBundleSettings(makeForm({ maxQtyPerProduct: "" }));
    expect(result.maxQtyPerProduct).toBeNull();
  });

  it("ignores FPB-only productSlotsEnabled and productSlotIconUrl fields", () => {
    const result = parsePPBBundleSettings(makeForm({
      productSlotsEnabled: "true",
      productSlotIconUrl: "https://cdn.shopify.com/icon.png",
    }));
    expect(result).not.toHaveProperty("productSlotsEnabled");
    expect(result).not.toHaveProperty("productSlotIconUrl");
  });

  it("passes bundleLevelCss through processCss sanitizer", () => {
    const { processCss } = require("../../../app/lib/css-sanitizer");
    const result = parsePPBBundleSettings(makeForm({
      bundleLevelCss: ".bundle { color: red; }",
    }));
    expect(processCss).toHaveBeenCalledWith(".bundle { color: red; }");
    expect(result.bundleLevelCss).toBe(".bundle { color: red; }");
  });

  it("strips malicious CSS via sanitizer", () => {
    const result = parsePPBBundleSettings(makeForm({
      bundleLevelCss: "<script>alert(1)</script>.bundle{}",
    }));
    expect(result.bundleLevelCss).not.toContain("<script");
  });

  it("returns null for bundleLevelCss when empty", () => {
    const result = parsePPBBundleSettings(makeForm({ bundleLevelCss: "" }));
    expect(result.bundleLevelCss).toBeNull();
  });

  it("parses bundle cart title and subtitle", () => {
    const result = parsePPBBundleSettings(makeForm({
      bundleCartTitle: "My Bundle",
      bundleCartSubtitle: "Review items",
    }));
    expect(result.bundleCartTitle).toBe("My Bundle");
    expect(result.bundleCartSubtitle).toBe("Review items");
  });

  it("returns null for empty cart title and subtitle", () => {
    const result = parsePPBBundleSettings(makeForm({
      bundleCartTitle: "",
      bundleCartSubtitle: "",
    }));
    expect(result.bundleCartTitle).toBeNull();
    expect(result.bundleCartSubtitle).toBeNull();
  });

  it("parses bundle banner URLs", () => {
    const result = parsePPBBundleSettings(makeForm({
      bundleBannerDesktopUrl: "https://cdn.shopify.com/desktop.jpg",
      bundleBannerMobileUrl: "https://cdn.shopify.com/mobile.jpg",
    }));
    expect(result.bundleBannerDesktopUrl).toBe("https://cdn.shopify.com/desktop.jpg");
    expect(result.bundleBannerMobileUrl).toBe("https://cdn.shopify.com/mobile.jpg");
  });

  it("parses direct default products contract", () => {
    const defaultProductsData = {
      isDefaultProductsEnabled: true,
      defaultProductsTitle: "Preselected audit products",
      products: [
        {
          productId: "8322625700036",
          graphqlId: "gid://shopify/Product/8322625700036",
          handle: "18k-bloom-earrings",
          variants: [
            {
              variantId: "45038876459204",
              variantGraphqlId: "gid://shopify/ProductVariant/45038876459204",
              inventoryQuantity: 13,
              price: "579.00",
            },
          ],
          hasOnlyDefaultVariant: true,
          images: [
            {
              originalSrc: "https://cdn.shopify.com/s/files/1/0697/9574/1892/files/18k-rose-diamond-earrings.jpg",
            },
          ],
          title: "18k Bloom Earrings",
          requiredQuantity: 1,
        },
      ],
    };

    const result = parsePPBBundleSettings(makeForm({
      defaultProductsData: JSON.stringify(defaultProductsData),
    }));

    expect(result.defaultProductsData).toEqual(defaultProductsData);
  });

  it("parses the direct quantity validation contract", () => {
    const validateQuantityPerProduct = { isEnabled: true, allowedQuantity: 1 };

    const result = parsePPBBundleSettings(makeForm({
      validateQuantityPerProduct: JSON.stringify(validateQuantityPerProduct),
    }));

    expect(result.validateQuantityPerProduct).toEqual(validateQuantityPerProduct);
  });

  it("parses direct bundle summary text contract", () => {
    const bundleTextConfig = {
      bundleSummary: {
        title: "Your Bundle",
        subTitle: "Review your bundle",
      },
    };

    const result = parsePPBBundleSettings(makeForm({
      bundleTextConfig: JSON.stringify(bundleTextConfig),
    }));

    expect(result.bundleTextConfig).toEqual(bundleTextConfig);
  });

  it("parses categories-as-bundle-steps when enabled", () => {
    const result = parsePPBBundleSettings(makeForm({
      useSingleStepCategoriesAsBundleSteps: "true",
    }));

    expect(result.useSingleStepCategoriesAsBundleSteps).toBe(true);
  });
});
