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

  it("returns a contextual error message without showing an error toast", () => {
    const show = jest.fn();

    const error = showSettingsSaveFeedback({ toast: { show } }, {
      success: false,
      message: "Runtime sync failed",
    });

    expect(show).not.toHaveBeenCalled();
    expect(error).toBe("Runtime sync failed");
  });

  it("does nothing without a completed response", () => {
    const show = jest.fn();

    const error = showSettingsSaveFeedback({ toast: { show } }, null);

    expect(show).not.toHaveBeenCalled();
    expect(error).toBeNull();
  });

  it("does not fabricate fallback copy when the server omits a message", () => {
    const show = jest.fn();

    const error = showSettingsSaveFeedback({ toast: { show } }, { success: false });

    expect(show).not.toHaveBeenCalled();
    expect(error).toBeNull();
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
