import {
  applyAdditionalConfigurationAction,
  createDeferredSettingsNavigation,
  getDisabledAdditionalConfigurationFields,
  isAdditionalConfigurationActionDisabled,
} from "../../../app/lib/additional-configurations-behavior";

describe("Additional Configurations behavior", () => {
  it("disables all Cart Messaging children when the master is off", () => {
    const disabled = getDisabledAdditionalConfigurationFields({
      "Cart Messaging": "",
      "Discount Display": "Checked",
    });

    expect(disabled).toEqual(new Set([
      "Bundle Items",
      "Original Bundle Price",
      "Discount Display",
      "Discount format",
    ]));
    expect(isAdditionalConfigurationActionDisabled("Cart Messaging", {
      "Cart Messaging": "",
    })).toBe(true);
  });

  it("disables only the discount format when discount display is off", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "Cart Messaging": "Checked",
      "Discount Display": "",
    })).toEqual(new Set(["Discount format"]));
  });

  it("keeps Cart Messaging children enabled when both masters are on", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "Cart Messaging": "Checked",
      "Discount Display": "Checked",
    })).toEqual(new Set());
    expect(isAdditionalConfigurationActionDisabled("Cart Messaging", {
      "Cart Messaging": "Checked",
    })).toBe(false);
  });

  it("gates integration detail fields behind their enable controls", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "Enable Custom Theme Integration Script": "",
      "Enable Cart Integration": "",
      "Enable Judge Me Integration": "",
    })).toEqual(new Set([
      "Custom Theme Integration Script",
      "Cart Item Selectors",
      "Cart Item Remove Parent Selectors",
      "Cart Item Remove Selectors",
      "Cart Item Quantity Button Selectors",
      "Custom Cart Integration Script",
      "Public token",
    ]));
  });

  it("enables each integration group independently", () => {
    expect(getDisabledAdditionalConfigurationFields({
      "Enable Custom Theme Integration Script": "Checked",
      "Enable Cart Integration": "Checked",
      "Enable Judge Me Integration": "",
    })).toEqual(new Set(["Public token"]));
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

  it("applies the uploaded Shopify Files URL to the video-player logo", () => {
    const values = {
      Logo: "https://cdn.example.test/old.png",
      "Upload file": "https://cdn.example.test/new.png",
    };

    expect(applyAdditionalConfigurationAction("Update Image", values)).toEqual({
      Logo: "https://cdn.example.test/new.png",
      "Upload file": "https://cdn.example.test/new.png",
    });
    expect(applyAdditionalConfigurationAction("Update Image", {
      Logo: values.Logo,
      "Upload file": "",
    })).toEqual({
      Logo: values.Logo,
      "Upload file": "",
    });
  });
});
