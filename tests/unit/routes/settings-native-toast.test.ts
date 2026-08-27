import {
  createLanguageSettingsSnapshot,
  showSettingsSaveFeedback,
} from "../../../app/routes/app/app.settings/settings-feedback";

describe("Settings native save feedback", () => {
  it("shows a native success toast", () => {
    const show = jest.fn();

    showSettingsSaveFeedback({ toast: { show } }, {
      success: true,
      message: "Settings saved successfully",
    });

    expect(show).toHaveBeenCalledWith("Settings saved successfully");
  });

  it("shows a longer native error toast with the server message", () => {
    const show = jest.fn();

    showSettingsSaveFeedback({ toast: { show } }, {
      success: false,
      message: "Runtime sync failed",
    });

    expect(show).toHaveBeenCalledWith("Runtime sync failed", {
      duration: 5000,
      isError: true,
    });
  });

  it("does nothing without a completed response", () => {
    const show = jest.fn();

    showSettingsSaveFeedback({ toast: { show } }, null);

    expect(show).not.toHaveBeenCalled();
  });

  it("does not fabricate fallback copy when the server omits a message", () => {
    const show = jest.fn();

    showSettingsSaveFeedback({ toast: { show } }, { success: false });

    expect(show).not.toHaveBeenCalled();
  });

  it("creates a detached Language submission snapshot", () => {
    const localeFieldValues = { en: { "shared.cartCheckout.items": "Items" } };
    const snapshot = createLanguageSettingsSnapshot("SINGLE", localeFieldValues);

    localeFieldValues.en["shared.cartCheckout.items"] = "Changed";

    expect(snapshot).toEqual({
      languageMode: "SINGLE",
      localeFieldValues: { en: { "shared.cartCheckout.items": "Items" } },
    });
  });
});
