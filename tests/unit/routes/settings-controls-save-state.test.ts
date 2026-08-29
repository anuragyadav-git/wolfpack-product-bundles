import { getConfirmedControlValues } from "../../../app/routes/app/app.settings/settings-state";

describe("Settings Controls save state", () => {
  it("confirms the submitted snapshot after success or persisted partial success", () => {
    const pending = { "productPage.hideOutOfStockProducts": "Checked" };

    expect(getConfirmedControlValues({ success: true, intent: "saveSettingsControls" }, pending)).toBe(pending);
    expect(getConfirmedControlValues({
      success: false,
      intent: "saveSettingsControls",
      persisted: true,
    }, pending)).toBe(pending);
    expect(getConfirmedControlValues({ success: false, intent: "saveSettingsControls" }, pending)).toBeNull();
    expect(getConfirmedControlValues({ success: true, intent: "saveSettingsDesign" }, pending)).toBeNull();
  });
});
