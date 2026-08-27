import { localizeBundleConfig } from "../../../app/assets/widgets/shared/localized-bundle-config";

describe("localizeBundleConfig", () => {
  const baseConfig = {
    textOverrides: { addToCartButton: "Add bundle" },
    textOverridesByLocale: {
      fr: { addToCartButton: "Ajouter" },
      "fr-CA": { addToCartButton: "Ajouter le lot" },
    },
    bundleUpsellConfig: {
      widgetConfiguration: {
        title: "Build a bundle",
        description: "Choose products",
        buttonText: "Start",
      },
      multiLangText: {
        fr: {
          widgetTitle: "Créer un lot",
          widgetDescription: "Choisissez des produits",
          widgetButtonText: "Commencer",
          upsellConfiguration: { title: "Offre", subTitle: "Choisissez" },
        },
      },
      upsellConfiguration: { title: "Offer", subTitle: "Choose" },
    },
    steps: [
      {
        id: "step-1",
        name: "Choose products",
        pageTitle: "Choose two",
        addonLabel: "Add-ons",
        addonTitle: "Complete your bundle",
        addonAddText: "Add",
        addonReplaceText: "Replace",
        freeGiftName: "Extras",
        multiLangData: {
          fr: {
            productPageStepText: "Choisir des produits",
            productPageSubtext: "Choisissez-en deux",
            addonLabel: "Suppléments",
            addonTitle: "Complétez votre lot",
            addonAddText: "Ajouter",
            addonReplaceText: "Remplacer",
            addonSectionTitle: "Extras traduits",
          },
        },
        StepCategory: [
          {
            name: "Featured",
            title: "Featured products",
            multiLangData: {
              fr: { name: "En vedette", title: "Produits en vedette" },
            },
          },
        ],
      },
    ],
    pricing: {
      messages: {
        successMessage: "Bundle discount unlocked",
        successMessageByLocale: {
          fr: "Remise du lot débloquée",
        },
        ruleMessages: {
          "addons-step-1": { discountText: "Add more", successMessage: "Unlocked" },
        },
        ruleMessagesByLocale: {
          fr: {
            "addons-step-1": {
              discountText: "Ajoutez-en plus",
              successMessage: "Débloqué",
            },
          },
        },
        tierTextByRuleId: {
          "rule-1": { tierText: "Buy two", tierSubtext: "Save now" },
        },
        tierTextByLocaleByRuleId: {
          fr: {
            "rule-1": { tierText: "Achetez-en deux", tierSubtext: "Économisez" },
          },
        },
      },
      displayOptions: {
        bundleQuantityOptions: {
          optionsByRuleId: {
            "rule-1": { label: "Two items", subtext: "Best value" },
          },
          optionsByLocaleByRuleId: {
            fr: {
              "rule-1": { label: "Deux articles", subtext: "Meilleure offre" },
            },
          },
        },
      },
    },
  };

  it("uses an exact locale before the base language and preserves the input", () => {
    const localized = localizeBundleConfig(baseConfig, "FR-ca");

    expect(localized.textOverrides.addToCartButton).toBe("Ajouter le lot");
    expect(localized.bundleUpsellConfig.widgetConfiguration.title).toBe("Créer un lot");
    expect(baseConfig.textOverrides.addToCartButton).toBe("Add bundle");
  });

  it("projects base-language step, category, add-on, pricing, and embed copy", () => {
    const localized = localizeBundleConfig(baseConfig, "fr-BE");
    const step = localized.steps[0];

    expect(step.name).toBe("Choisir des produits");
    expect(step.pageTitle).toBe("Choisissez-en deux");
    expect(step.addonLabel).toBe("Suppléments");
    expect(step.addonTitle).toBe("Complétez votre lot");
    expect(step.addonAddText).toBe("Ajouter");
    expect(step.addonReplaceText).toBe("Remplacer");
    expect(step.freeGiftName).toBe("Extras traduits");
    expect(step.StepCategory[0]).toEqual(expect.objectContaining({
      name: "En vedette",
      title: "Produits en vedette",
    }));
    expect(localized.bundleUpsellConfig).toEqual(expect.objectContaining({
      widgetConfiguration: {
        title: "Créer un lot",
        description: "Choisissez des produits",
        buttonText: "Commencer",
      },
      upsellConfiguration: { title: "Offre", subTitle: "Choisissez" },
    }));
    expect(localized.pricing.messages.ruleMessages["addons-step-1"]).toEqual({
      discountText: "Ajoutez-en plus",
      successMessage: "Débloqué",
    });
    expect(localized.pricing.messages.successMessage).toBe(
      "Remise du lot débloquée",
    );
    expect(localized.pricing.messages.tierTextByRuleId["rule-1"]).toEqual({
      tierText: "Achetez-en deux",
      tierSubtext: "Économisez",
    });
    expect(
      localized.pricing.displayOptions.bundleQuantityOptions.optionsByRuleId["rule-1"],
    ).toEqual({ label: "Deux articles", subtext: "Meilleure offre" });
  });

  it("retains base configuration when no locale override exists", () => {
    const localized = localizeBundleConfig(baseConfig, "ja");

    expect(localized.textOverrides.addToCartButton).toBe("Add bundle");
    expect(localized.steps[0].name).toBe("Choose products");
    expect(localized.pricing.messages.tierTextByRuleId["rule-1"].tierText).toBe("Buy two");
  });

  it("leaves subscription translations for the dedicated runtime resolver", () => {
    const subscription = {
      copy: { title: "Purchase options" },
      planCopy: { "plan-1": { displayName: "Monthly", description: "Base" } },
      translations: {
        fr: {
          title: "Options d'achat",
          planCopy: { "plan-1": { displayName: "Mensuel" } },
        },
      },
    };

    expect(localizeBundleConfig({ subscription }, "fr").subscription).toEqual(
      subscription,
    );
  });

  it("projects FPB personalization add-on translations onto the existing runtime contract", () => {
    const localized = localizeBundleConfig({
      personalizationData: {
        personalizeStepText: "Extras",
        personalizePageSubtext: "Complete your bundle",
        addonProducts: {
          title: "Optional products",
          tiers: [{ title: "Tier 1" }],
          addonsMessaging: {
            tier1: { ineligibleState: "Add more", eligibleState: "Unlocked" },
          },
          multiLangData: {
            fr: {
              personalizeStepText: "Suppléments",
              personalizePageSubtext: "Complétez votre lot",
              addonProductsTitle: "Produits facultatifs",
              tier1Title: "Niveau 1",
              tier1MessageWhenRuleNotMet: "Ajoutez-en plus",
              tier1SuccessMessage: "Débloqué",
            },
          },
        },
      },
    }, "fr");

    expect(localized.personalizationData).toEqual(expect.objectContaining({
      personalizeStepText: "Suppléments",
      personalizePageSubtext: "Complétez votre lot",
    }));
    expect(localized.personalizationData.addonProducts).toEqual(expect.objectContaining({
      title: "Produits facultatifs",
      tiers: [{ title: "Niveau 1" }],
      addonsMessaging: {
        tier1: { ineligibleState: "Ajoutez-en plus", eligibleState: "Débloqué" },
      },
    }));
  });
});
