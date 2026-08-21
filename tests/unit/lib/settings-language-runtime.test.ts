import {
  SETTINGS_LANGUAGE_LOCALES,
  buildSettingsLanguageFormState,
  buildSettingsLanguageResponse,
  buildSettingsLanguageRuntime,
  removeSettingsLanguageLocale,
} from "../../../app/lib/settings-language-runtime";

describe("settings language runtime", () => {
  const payload = {
    languageMode: "MULTIPLE",
    localeFieldValues: { en: {
      "shared.cartCheckout.bundleContainsLabel": "Bundle Items",
      "shared.cartCheckout.bundleOriginalPriceLabel": "Original Total",
      "shared.cartCheckout.bundleDiscountDisplayLabel": "Saved",
      "fpb.general.addToBoxButtonText": "Add To Gift Box",
      "fpb.general.addToCartButtonText": "Checkout Bundle",
      "fpb.general.nextButtonText": "Continue",
      "fpb.general.noProductsAvailableText": "Nothing available",
      "fpb.conditions.amount.greaterThanOrEqualTo": "Spend at least {{conditionAmount}}",
      "fpb.conditions.weight.lessThanOrEqualTo": "Keep weight below {{conditionWeight}}",
      "ppb.productCard.productCardAddBtnText": "Pick Product",
      "ppb.productCard.productVariantLabelText": "Choose Variant",
      "ppb.productCard.productAddedBtnText": "Picked x{{allowedQuantity}}",
      "ppb.productCard.productCardAddBtnText_inPage": "Quick Pick +",
      "ppb.general.bundleCartDrawerBtnText_inPage": "Open Picks",
      "ppb.general.bundleCartSelectedProductsText_inPage": "Picked Products",
      "ppb.general.addBundleToCartBtnText": "Add Pack",
      "ppb.general.addToCartBundleBtnLoadingText": "Adding Pack...",
      "ppb.conditions.quantity.greaterThanOrEqualTo": "Choose at least {{conditionQuantity}} items",
      "ppb.conditions.quantity.equalTo": "Choose exactly {{conditionQuantity}} items",
      "ppb.conditions.amount.greaterThanOrEqualTo": "Choose products worth {{conditionAmount}}",
      "ppb.conditions.weight.lessThanOrEqualTo": "Choose products weighing no more than {{conditionWeight}}",
      "ppb.footer.footerNextBtnText": "Next Slot",
      "ppb.footer.footerFinishBtnText": "Finish Pack",
    } },
  };

  it("builds an EB-shaped language document and direct storefront runtime", () => {
    const runtime = buildSettingsLanguageRuntime(payload);
    const englishGeneral = runtime.settingsLanguage.en.general as Record<string, { value: string }>;

    expect(runtime.buttonAddToCartText).toBe("Add To Gift Box");
    expect(runtime.settingsLanguage.languageMode).toBe("MULTIPLE");
    expect(englishGeneral.addToBoxButtonText.value).toBe("Add To Gift Box");
    expect(englishGeneral.addToCartButtonText.value).toBe("Checkout Bundle");
    expect(runtime.settingsLanguage.sharedComponents.en.cartAndCheckout.bundleContainsLabel.value).toBe("Bundle Items");
    expect(buildSettingsLanguageResponse(runtime.settingsLanguage, "product_page").ppbCustomTextSettings.productCardAddBtnText).toBe("Pick Product");
    expect(buildSettingsLanguageResponse(runtime.settingsLanguage, "product_page").ppbCustomTextSettings.addToCartBundleBtnText).toBe("Add Pack");
  });

  it("returns FPB storefront text overrides from active locale fields", () => {
    const runtime = buildSettingsLanguageRuntime(payload);
    const response = buildSettingsLanguageResponse(runtime.settingsLanguage, "full_page");

    expect(response.bundleType).toBe("full_page");
    expect(response.textOverrides).toMatchObject({
      productAddButton: "Add To Gift Box",
      addToCartButton: "Checkout Bundle",
      nextButton: "Continue",
      noProductsAvailable: "Nothing available",
      conditionAmountGreaterThanOrEqualTo: "Spend at least {{conditionAmount}}",
      conditionWeightLessThanOrEqualTo: "Keep weight below {{conditionWeight}}",
    });
    expect(response.sharedCartLabels).toEqual({
      bundleContainsLabel: "Bundle Items",
      bundleOriginalPriceLabel: "Original Total",
      bundleDiscountDisplayLabel: "Saved",
    });
  });

  it("returns PPB storefront custom text settings with separate product and bundle CTA keys", () => {
    const runtime = buildSettingsLanguageRuntime(payload);
    const response = buildSettingsLanguageResponse(runtime.settingsLanguage, "product_page");

    expect(response.bundleType).toBe("product_page");
    expect(response.ppbCustomTextSettings).toMatchObject({
      productCardAddBtnText: "Pick Product",
      productVariantLabelText: "Choose Variant",
      productAddedBtnText: "Picked x{{allowedQuantity}}",
      productCardAddBtnText_inPage: "Quick Pick +",
      bundleCartDrawerBtnText_inPage: "Open Picks",
      bundleCartSelectedProductsText_inPage: "Picked Products",
      conditions: {
        quantity: {
          greaterThanOrEqualTo: expect.objectContaining({ value: "Choose at least {{conditionQuantity}} items" }),
          equalTo: expect.objectContaining({ value: "Choose exactly {{conditionQuantity}} items" }),
        },
        amount: {
          greaterThanOrEqualTo: expect.objectContaining({ value: "Choose products worth {{conditionAmount}}" }),
        },
        weight: {
          lessThanOrEqualTo: expect.objectContaining({ value: "Choose products weighing no more than {{conditionWeight}}" }),
        },
      },
      addToCartBundleBtnText: "Add Pack",
      addToCartBundleBtnLoadingText: "Adding Pack...",
      footerNextBtnText: "Next Slot",
      footerFinishBtnText: "Finish Pack",
    });
    expect(response.textOverrides).toMatchObject({
      productCardAddButton: "Pick Product",
      productCardInlineAddButton: "Quick Pick +",
      productDetailsUpdateButton: "Update",
      productVariantLabel: "Choose Variant",
      addToCartButton: "Add Pack",
      addingToCart: "Adding Pack...",
      nextButton: "Next Slot",
      doneButton: "Finish Pack",
      includedBadge: "Picked x{{allowedQuantity}}",
      viewBundleItems: "Open Picks",
      bundleCartSelectedProductsText: "Picked Products",
      conditionQuantityGreaterThanOrEqualTo: "Choose at least {{conditionQuantity}} items",
      conditionQuantityEqualTo: "Choose exactly {{conditionQuantity}} items",
      conditionAmountGreaterThanOrEqualTo: "Choose products worth {{conditionAmount}}",
      conditionWeightLessThanOrEqualTo: "Choose products weighing no more than {{conditionWeight}}",
    });
  });

  it("resolves exact, case-insensitive, and base locales in MULTIPLE mode", () => {
    const runtime = buildSettingsLanguageRuntime({
      languageMode: "MULTIPLE",
      localeFieldValues: {
        en: payload.localeFieldValues.en,
        fr: {
          ...payload.localeFieldValues.en,
          "shared.cartCheckout.bundleContainsLabel": "Articles",
          "fpb.general.addToBoxButtonText": "Ajouter au coffret",
          "ppb.general.addBundleToCartBtnText": "Ajouter le lot",
        },
      },
    });

    expect(buildSettingsLanguageResponse(runtime.settingsLanguage, "full_page", "FR")).toMatchObject({
      activeLocale: "fr",
      textOverrides: { productAddButton: "Ajouter au coffret" },
      sharedCartLabels: { bundleContainsLabel: "Articles" },
    });
    expect(buildSettingsLanguageResponse(runtime.settingsLanguage, "product_page", "fr-CA")).toMatchObject({
      activeLocale: "fr",
      textOverrides: { addToCartButton: "Ajouter le lot" },
    });
  });

  it("forces English in SINGLE mode and falls back to English for unsupported locales", () => {
    const single = buildSettingsLanguageRuntime({
      languageMode: "SINGLE",
      localeFieldValues: {
        en: payload.localeFieldValues.en,
        fr: { ...payload.localeFieldValues.en, "fpb.general.addToBoxButtonText": "Ajouter" },
      },
    });
    expect(buildSettingsLanguageResponse(single.settingsLanguage, "full_page", "fr").activeLocale).toBe("en");

    const multiple = buildSettingsLanguageRuntime({
      languageMode: "MULTIPLE",
      localeFieldValues: { en: payload.localeFieldValues.en },
    });
    expect(buildSettingsLanguageResponse(multiple.settingsLanguage, "full_page", "xx-ZZ").activeLocale).toBe("en");
  });

  it("removes non-English locales from every root and never removes English", () => {
    const runtime = buildSettingsLanguageRuntime({
      languageMode: "MULTIPLE",
      localeFieldValues: { en: payload.localeFieldValues.en, fr: payload.localeFieldValues.en },
    });
    const removed = removeSettingsLanguageLocale(runtime.settingsLanguage, "fr");
    expect(removed.fr).toBeUndefined();
    expect(removed.mixAndMatchTextData.fr).toBeUndefined();
    expect(removed.sharedComponents.fr).toBeUndefined();
    expect(removeSettingsLanguageLocale(removed, "en").en).toBeDefined();
  });

  it("excludes unsupported customer-message and personalization configuration", () => {
    const document = buildSettingsLanguageRuntime({}).settingsLanguage;
    expect(document.en).not.toHaveProperty("personalizePage");
    expect(document.en).not.toHaveProperty("videoMessage");
    expect(document.en).not.toHaveProperty("giftBoxPage");
    expect(JSON.stringify(document)).not.toContain("Personalization");
    expect(JSON.stringify(document)).not.toContain("personalizationCost");
  });

  it("exposes Add Bundle Success copy to the Product Page runtime", () => {
    const runtime = buildSettingsLanguageRuntime({
      localeFieldValues: {
        en: {
          ...payload.localeFieldValues.en,
          "ppb.general.addBundleSuccessText": "Bundle ready",
        },
      },
    });
    const response = buildSettingsLanguageResponse(runtime.settingsLanguage, "product_page", "en");
    expect(response.ppbCustomTextSettings.addBundleSuccessText).toBe("Bundle ready");
    expect((response.textOverrides as Record<string, string>).addBundleSuccess).toBe("Bundle ready");
  });

  it("lists all 39 current language options including Serbian", () => {
    expect(SETTINGS_LANGUAGE_LOCALES).toHaveLength(39);
    expect(SETTINGS_LANGUAGE_LOCALES).toContainEqual({ code: "sr", label: "Serbian" });
  });

  it("rebuilds locale-isolated Admin form values from the canonical document", () => {
    const runtime = buildSettingsLanguageRuntime({
      languageMode: "MULTIPLE",
      localeFieldValues: {
        en: payload.localeFieldValues.en,
        fr: {
          ...payload.localeFieldValues.en,
          "fpb.modals.clearCartModalTitle": "Vider le panier ?",
          "shared.cartCheckout.bundleContainsLabel": "Articles",
        },
      },
    });

    expect(buildSettingsLanguageFormState(runtime.settingsLanguage)).toMatchObject({
      languageMode: "MULTIPLE",
      localeFieldValues: {
        fr: {
          "fpb.modals.clearCartModalTitle": "Vider le panier ?",
          "shared.cartCheckout.bundleContainsLabel": "Articles",
        },
      },
    });
  });

  it("uses current English defaults when persisted data is not canonical", () => {
    const malformed = { languageMode: "MULTIPLE", languageData: { en: {} } };

    expect(buildSettingsLanguageFormState(malformed)).toMatchObject({
      languageMode: "MULTIPLE",
      localeFieldValues: {
        en: {
          "fpb.general.addToBoxButtonText": "Add To Box",
          "ppb.general.addBundleToCartBtnText": "Add Bundle to Cart",
        },
      },
    });
    expect(buildSettingsLanguageResponse(malformed, "full_page", "fr")).toMatchObject({
      activeLocale: "en",
      textOverrides: { productAddButton: "Add To Box" },
    });
  });
});
