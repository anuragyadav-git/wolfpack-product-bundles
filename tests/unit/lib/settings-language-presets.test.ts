import { SETTINGS_LANGUAGE_LOCALES } from "../../../app/lib/settings-language-runtime";
import { getInitialLanguageFieldValues } from "../../../app/routes/app/app.settings/settings-state";

describe("Settings Language locale presets", () => {
  it("seeds translated defaults for every non-English locale", () => {
    for (const { code } of SETTINGS_LANGUAGE_LOCALES) {
      const values = getInitialLanguageFieldValues(code);
      expect(Object.keys(values).length).toBeGreaterThan(60);
    }
    for (const { code } of SETTINGS_LANGUAGE_LOCALES.filter(({ code }) => code !== "en")) {
      expect(getInitialLanguageFieldValues(code)["fpb.general.addToBoxButtonText"]).not.toBe("Add To Box");
    }
  });

  it("preserves storefront variables in translated condition defaults", () => {
    const french = getInitialLanguageFieldValues("fr");
    expect(french["fpb.conditions.quantity.greaterThanOrEqualTo"]).toContain("{{conditionQuantity}}");
    expect(french["fpb.toasts.boxSelectionEligibilityToast"]).toContain("{{boxSelectionDifference}}");
  });
});
