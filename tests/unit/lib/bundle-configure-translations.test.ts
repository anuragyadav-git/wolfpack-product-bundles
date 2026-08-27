import {
  buildPpbAddonTranslationFields,
  expandSubscriptionTranslationValues,
  flattenSubscriptionTranslations,
  getPpbAddonFooterTranslationValues,
  mergePpbAddonFooterTranslationValues,
  normalizeTranslationValues,
  selectDefaultTranslationLocale,
} from "../../../app/lib/bundle-configure-translations";

describe("bundle configure translation helpers", () => {
  it("selects the published primary locale before the first available locale", () => {
    expect(
      selectDefaultTranslationLocale([
        { locale: "de", name: "German", primary: false },
        { locale: "fr", name: "French", primary: true },
      ]),
    ).toBe("fr");

    expect(
      selectDefaultTranslationLocale([
        { locale: "de", name: "German", primary: false },
      ]),
    ).toBe("de");
    expect(selectDefaultTranslationLocale([])).toBe("");
  });

  it("prunes blank values and empty locales without mutating the input", () => {
    const input = {
      fr: { title: "  Titre  ", description: "  " },
      de: { title: "" },
    };

    expect(normalizeTranslationValues(input)).toEqual({
      fr: { title: "  Titre  " },
    });
    expect(input).toEqual({
      fr: { title: "  Titre  ", description: "  " },
      de: { title: "" },
    });
  });

  it("builds the PPB add-on step and section translation fields", () => {
    const step = {
      addonLabel: "Add-ons",
      addonTitle: "Complete your bundle",
      addonAddText: "Add",
      addonReplaceText: "Replace",
      freeGiftName: "Extras",
    };

    expect(buildPpbAddonTranslationFields("step", step)).toEqual([
      { key: "addonLabel", label: "Step Name", fallback: "Add-ons" },
      { key: "addonAddText", label: "Add On", fallback: "Add" },
      { key: "addonTitle", label: "Step Title", fallback: "Complete your bundle" },
      { key: "addonReplaceText", label: "Replace", fallback: "Replace" },
    ]);
    expect(buildPpbAddonTranslationFields("section", step)).toEqual([
      { key: "addonSectionTitle", label: "Add on Section title", fallback: "Extras" },
    ]);
  });

  it("adapts PPB add-on footer translations to and from pricing rule messages", () => {
    const stored = {
      fr: {
        "addons-step-1": {
          discountText: "Ajoutez-en plus",
          successMessage: "Débloqué",
        },
      },
      de: { "rule-1": { discountText: "Mehr" } },
    };

    expect(getPpbAddonFooterTranslationValues(stored, "step-1")).toEqual({
      fr: {
        addonDiscountText: "Ajoutez-en plus",
        addonSuccessMessage: "Débloqué",
      },
    });
    expect(
      mergePpbAddonFooterTranslationValues(stored, "step-1", {
        fr: { addonDiscountText: "Encore", addonSuccessMessage: "" },
      }),
    ).toEqual({
      fr: { "addons-step-1": { discountText: "Encore" } },
      de: { "rule-1": { discountText: "Mehr" } },
    });
  });

  it("flattens and restores staged subscription translations", () => {
    const translations = {
      fr: {
        title: "Options d'achat",
        oneTimePurchaseTitle: "Achat unique",
        planCopy: {
          "plan-1": {
            displayName: "Chaque mois",
            discountPill: "Économisez 10 %",
            description: "Livré chaque mois",
          },
        },
      },
      de: { subtitle: "  " },
    };

    const flattened = flattenSubscriptionTranslations(translations);
    expect(flattened).toEqual({
      fr: {
        title: "Options d'achat",
        oneTimePurchaseTitle: "Achat unique",
        "plan:plan-1:displayName": "Chaque mois",
        "plan:plan-1:discountPill": "Économisez 10 %",
        "plan:plan-1:description": "Livré chaque mois",
      },
    });
    expect(expandSubscriptionTranslationValues(flattened)).toEqual({
      fr: translations.fr,
    });
  });
});
