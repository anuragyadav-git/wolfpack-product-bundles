import {
  SETTINGS_DESIGN_DEFAULT_FIELD_VALUES,
  SETTINGS_DESIGN_COLOR_FIELD_KEYS,
} from "../../../app/lib/settings-design-contract";
import {
  designRequiresGrowth,
  getAdvancedDesignFieldKeys,
  savedSettingsUseAdvancedDesign,
} from "../../../app/lib/subscriptions/design-entitlements";

function defaultState() {
  return {
    fieldValues: { ...SETTINGS_DESIGN_DEFAULT_FIELD_VALUES },
    inheritedColorFieldKeys: [...SETTINGS_DESIGN_COLOR_FIELD_KEYS],
  };
}

describe("designRequiresGrowth", () => {
  it("keeps the default Design state on Free", () => {
    expect(designRequiresGrowth(defaultState())).toBe(false);
  });

  it.each([
    ["Primary Color", "#123456"],
    ["Button Text Color", "#123456"],
    ["Primary Text Color", "#123456"],
    ["Secondary Color", "#123456"],
    ["Product Background Color", "#123456"],
    ["Primary Font Size", "18"],
    ["Body Font Weight", "Bold"],
  ])("keeps %s available on Free", (key, value) => {
    const state = defaultState();
    state.fieldValues[key] = value;
    expect(designRequiresGrowth(state)).toBe(false);
  });

  it.each([
    ["stylePresets.colors.discountTierBackgroundColor", "#123456"],
    ["Bundle Buttons Base", "9px"],
    ["Image Fit", "Contain"],
    ["generalSettings.loadingGifUrl", "https://cdn.example.com/loading.gif"],
    ["expert.navigationBanner.navigationBannerStepCompletionColor", "#123456"],
  ])("requires Growth when %s is customized", (key, value) => {
    const state = defaultState();
    state.fieldValues[key] = value;
    expect(designRequiresGrowth(state)).toBe(true);
  });

  it("requires Growth when an expert color stops inheriting", () => {
    const state = defaultState();
    state.inheritedColorFieldKeys = state.inheritedColorFieldKeys.filter(
      (key) => key !== "expert.navigationBanner.navigationBannerStepCompletionColor",
    );
    expect(designRequiresGrowth(state)).toBe(true);
  });

  it("classifies only the approved Free fields outside advanced Design", () => {
    expect(getAdvancedDesignFieldKeys()).not.toContain("Primary Color");
    expect(getAdvancedDesignFieldKeys()).not.toContain("Primary Font Size");
    expect(getAdvancedDesignFieldKeys()).toContain("Bundle Buttons Base");
  });

  it("reads the persisted Settings page Design snapshot", () => {
    const state = defaultState();
    state.fieldValues["Bundle Buttons Base"] = "9px";
    expect(savedSettingsUseAdvancedDesign({
      settingsPage: { design: state },
    })).toBe(true);
  });

  it("fails closed for a malformed persisted Design snapshot", () => {
    expect(savedSettingsUseAdvancedDesign({ settingsPage: { design: "invalid" } })).toBe(true);
  });
});
