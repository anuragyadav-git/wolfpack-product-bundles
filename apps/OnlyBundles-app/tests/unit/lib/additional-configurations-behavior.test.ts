import {
  createDeferredSettingsNavigation,
  getDisabledAdditionalConfigurationFields,
  isAdditionalConfigurationActionDisabled,
} from "../../../app/lib/additional-configurations-behavior";

describe("Additional Configurations behavior", () => {
  it("disables all Cart Messaging children when the master is off", () => {
    const disabled = getDisabledAdditionalConfigurationFields({
      "shared.cartMessaging.isEnabled": "",
      "shared.cartMessaging.discountDisplay.isEnabled": "Checked",
    });

    expect(disabled).toEqual(new Set([
      "shared.cartMessaging.showBundleContains",
      "shared.cartMessaging.showOriginalPrice",
      "shared.cartMessaging.discountDisplay.isEnabled",
      "shared.cartMessaging.discountDisplay.format",
    ]));
    expect(isAdditionalConfigurationActionDisabled("shared.cartMessaging.isEnabled", {
      "shared.cartMessaging.isEnabled": "",
    })).toBe(true);
  });

  it("disables only the discount format when discount display is off", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "shared.cartMessaging.isEnabled": "Checked",
      "shared.cartMessaging.discountDisplay.isEnabled": "",
    })).toEqual(new Set(["shared.cartMessaging.discountDisplay.format"]));
  });

  it("keeps Cart Messaging children enabled when both masters are on", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "shared.cartMessaging.isEnabled": "Checked",
      "shared.cartMessaging.discountDisplay.isEnabled": "Checked",
    })).toEqual(new Set());
    expect(isAdditionalConfigurationActionDisabled("shared.cartMessaging.isEnabled", {
      "shared.cartMessaging.isEnabled": "Checked",
    })).toBe(false);
  });

  it("gates integration detail fields behind their enable controls", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "landingPage.integrations.customThemeScriptEnabled": "",
      "landingPage.integrations.cartIntegrationEnabled": "",
      "landingPage.integrations.judgeMeEnabled": "",
    })).toEqual(new Set([
      "landingPage.integrations.customThemeIntegrationScript",
      "landingPage.integrations.cartItemSelectors",
      "landingPage.integrations.cartItemRemoveParentSelectors",
      "landingPage.integrations.cartItemRemoveSelectors",
      "landingPage.integrations.cartItemQuantityButtonSelectors",
      "landingPage.integrations.customCartIntegrationScript",
      "landingPage.integrations.judgeMePublicToken",
    ]));
  });

  it("enables each integration group independently", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "landingPage.integrations.customThemeScriptEnabled": "Checked",
      "landingPage.integrations.cartIntegrationEnabled": "Checked",
      "landingPage.integrations.judgeMeEnabled": "",
    })).toEqual(new Set(["landingPage.integrations.judgeMePublicToken"]));
  });

  it("runs clean navigation immediately", () => {
    const calls: string[] = [];
    const navigation = createDeferredSettingsNavigation();

    expect(navigation.request(false, () => calls.push("navigated"))).toBe(true);
    expect(calls).toEqual(["navigated"]);
    expect(navigation.hasPending()).toBe(false);
  });

  it("defers dirty navigation until discard or a successful save", () => {
    const calls: string[] = [];
    const navigation = createDeferredSettingsNavigation();

    expect(navigation.request(true, () => calls.push("navigated"))).toBe(false);
    expect(calls).toEqual([]);
    expect(navigation.hasPending()).toBe(true);

    navigation.complete();

    expect(calls).toEqual(["navigated"]);
    expect(navigation.hasPending()).toBe(false);
  });

  it("replaces an older pending destination with the latest merchant intent", () => {
    const calls: string[] = [];
    const navigation = createDeferredSettingsNavigation();

    navigation.request(true, () => calls.push("configuration"));
    navigation.request(true, () => calls.push("advanced"));
    navigation.complete();

    expect(calls).toEqual(["advanced"]);
  });

});
