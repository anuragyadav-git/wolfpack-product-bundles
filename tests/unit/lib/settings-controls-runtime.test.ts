import { BundleType } from "../../../app/constants/bundle";
import {
  SETTINGS_CONTROLS_SCHEMA_VERSION,
  buildSettingsControlsResponse,
  buildSettingsControlsFormValues,
  buildSettingsControlsRuntime,
} from "../../../app/lib/settings-controls-runtime";

const values = {
  "landingPage.showCompareAtPrice": "Checked",
  "landingPage.hideIrrelevantVariantImages": "Checked",
  "landingPage.trackInventoryOnAddToCart": "Checked",
  "landingPage.redirectCollectionQuickAddToBundle": "Checked",
  "shared.cartMessaging.isEnabled": "Checked",
  "shared.cartMessaging.showBundleContains": "",
  "shared.cartMessaging.showOriginalPrice": "Checked",
  "shared.cartMessaging.discountDisplay.isEnabled": "Checked",
  "shared.cartMessaging.discountDisplay.format": "Percentage only (Eg: \"You save 19%\")",
  "landingPage.checkout.action": "Redirect to Checkout",
  "landingPage.checkout.providerId": "Monster Cart",
  "landingPage.checkout.executeScript": "window.__fpbPostAddRuns = true;",
  "landingPage.font.customFont": "Inter",
  "landingPage.css.bundleBuilderPages": ".builder { color: red; }",
  "landingPage.css.bundleDummyProductPage": ".dummy { color: blue; }",
  "landingPage.css.themePages": ".theme { color: green; }",
  "landingPage.scripts.bundlePage": "window.__bundlePage = true;",
  "landingPage.selectors.addToCartButtons": ".add-button",
  "landingPage.selectors.buyNowButton": ".buy-button",
  "landingPage.integrations.customThemeScriptEnabled": "Checked",
  "landingPage.integrations.customThemeIntegrationScript": "window.__themeIntegrated = true;",
  "landingPage.integrations.cartIntegrationEnabled": "Checked",
  "landingPage.integrations.cartItemSelectors": ".cart-item",
  "landingPage.integrations.cartItemRemoveParentSelectors": ".cart-row",
  "landingPage.integrations.cartItemRemoveSelectors": ".cart-remove",
  "landingPage.integrations.cartItemQuantityButtonSelectors": ".qty-btn",
  "landingPage.integrations.customCartIntegrationScript": "window.__cartIntegrated = true;",
  "landingPage.integrations.judgeMeEnabled": "Checked",
  "landingPage.integrations.judgeMePublicToken": "judge-token",
  "productPage.hideOutOfStockProducts": "Checked",
  "productPage.trackInventoryOnAddToCart": "Checked",
  "productPage.addBundleToCartAfterLastStepCompleted": "Checked",
  "productPage.displayEmptyStateBoxesBasedOnBundleCondition": "",
  "productPage.hideStepTitlesInCompletedState": "Checked",
  "productPage.addToCartWhenProductCardClicked": "Checked",
  "productPage.redirectCollectionQuickAddToBundle": "Checked",
  "productPage.redirect.action": "Redirect to Cart",
  "productPage.redirect.executeScript": "window.__ppbPostAddRuns = true;",
  "productPage.css.mixAndMatchBundles": ".mix { color: purple; }",
  "productPage.scripts.executeCustomScript": "window.__ppbCustom = true;",
  "productPage.selectors.sideCart": ".side-cart",
  "productPage.selectors.sideCartSectionId": "cart-drawer",
  "productPage.selectors.cartPageItems": ".cart-items",
  "productPage.selectors.cartPageItemsSectionId": "main-cart-items",
  "productPage.selectors.sideCartOpenButton": ".open-cart",
  "productPage.selectors.productPagePrice": ".price",
};

describe("Settings Controls runtime mapping", () => {
  it("maps stable Admin keys into the versioned canonical contract", () => {
    const result = buildSettingsControlsRuntime(values);

    expect(SETTINGS_CONTROLS_SCHEMA_VERSION).toBe(1);
    expect(result.settingsControls).toMatchObject({
      schemaVersion: 1,
      shared: {
        cartMessaging: {
          isEnabled: true,
          showBundleContains: false,
          showOriginalPrice: true,
          discountDisplay: { isEnabled: true, format: "percentage_only" },
        },
      },
      landingPage: {
        showCompareAtPrice: true,
        checkout: { action: "checkout", providerId: "monster_cart" },
        scripts: { bundlePage: "window.__bundlePage = true;" },
        selectors: {
          addToCartButtons: ".add-button",
          buyNowButton: ".buy-button",
        },
      },
      productPage: {
        addBundleToCartAfterLastStepCompleted: true,
        addToCartWhenProductCardClicked: true,
        redirect: { action: "cart", executeScript: "window.__ppbPostAddRuns = true;" },
      },
    });
    expect(result.bundleCartLineMessaging).toEqual(result.settingsControls.shared.cartMessaging);
  });

  it("never interprets presentation labels as persisted keys", () => {
    const result = buildSettingsControlsRuntime({
      "Show Compare At Price": "Checked",
      "Cart Messaging": "Checked",
      "landingPage.showCompareAtPrice": "",
      "shared.cartMessaging.isEnabled": "",
    });

    expect(result.settingsControls.landingPage.showCompareAtPrice).toBe(false);
    expect(result.settingsControls.shared.cartMessaging.isEnabled).toBe(false);
  });

  it("keeps theme CSS global instead of projecting it into either widget CSS column", () => {
    const result = buildSettingsControlsRuntime(values);

    expect(result.fullPageCustomCss).toBeNull();
    expect(result.productPageCustomCss).toContain(".mix");
    expect(result.productPageCustomCss).not.toContain(".theme");
  });

  it("processes every Settings Controls CSS field on save and public response", () => {
    const hostileCss = '.safe { color: red; } .bad { background: url(javascript:alert(1)); }';
    const saved = buildSettingsControlsRuntime({
      "landingPage.css.bundleBuilderPages": hostileCss,
      "landingPage.css.bundleDummyProductPage": hostileCss,
      "landingPage.css.themePages": hostileCss,
      "productPage.css.mixAndMatchBundles": hostileCss,
    }).settingsControls;

    expect(JSON.stringify(saved)).toContain('.safe');
    expect(JSON.stringify(saved)).not.toContain('javascript:');

    const stored = structuredClone(saved);
    stored.landingPage.css.themePages = hostileCss;
    stored.productPage.css.mixAndMatchBundles = hostileCss;
    const response = buildSettingsControlsResponse(stored, BundleType.PRODUCT_PAGE);

    expect(response.settingsControls.landingPage.css.themePages).not.toContain('javascript:');
    expect(response.settingsControls.productPage.css.mixAndMatchBundles).not.toContain('javascript:');
  });

  it("returns schema metadata and the requested active layout", () => {
    const runtime = buildSettingsControlsRuntime(values).settingsControls;
    const response = buildSettingsControlsResponse(runtime, BundleType.PRODUCT_PAGE);

    expect(response.schemaVersion).toBe(1);
    expect(response.activeControls).toEqual(runtime.productPage);
    expect(response.settingsControls).toEqual(runtime);
  });

  it("hydrates the Admin form from the canonical contract using stable keys", () => {
    const runtime = buildSettingsControlsRuntime(values).settingsControls;

    expect(buildSettingsControlsFormValues(runtime)).toMatchObject({
      "landingPage.checkout.providerId": "Monster Cart",
      "productPage.addBundleToCartAfterLastStepCompleted": "Checked",
      "productPage.redirect.action": "Redirect to Cart",
    });
  });

  it("uses safe defaults for an absent canonical contract", () => {
    const response = buildSettingsControlsResponse(null, BundleType.FULL_PAGE);

    expect(response.settingsControls.schemaVersion).toBe(1);
    expect(response.activeControls).toBe(response.settingsControls.landingPage);
    expect(response.settingsControls.shared.cartMessaging).toMatchObject({
      isEnabled: true,
      showBundleContains: true,
      showOriginalPrice: true,
      discountDisplay: { isEnabled: true },
    });
    expect(response.settingsControls.landingPage.showCompareAtPrice).toBe(true);
    expect(response.settingsControls.productPage.hideOutOfStockProducts).toBe(true);
    expect(response.settingsControls.productPage.validateConditionsBeforeAddToCart).toBe(true);
  });
});
