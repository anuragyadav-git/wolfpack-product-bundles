import {
  SUPPORTED_LOCALES,
  i18n,
  loadAdminLocaleResources,
  translateAdminCopy,
} from "../../../app/i18n/config";

describe("Admin i18n resource loading", () => {
  it("boots with only the English Admin catalog on the critical path", () => {
    expect(i18n.hasResourceBundle("en", "translation")).toBe(true);

    for (const locale of SUPPORTED_LOCALES.filter(
      (locale) => locale !== "en"
    )) {
      expect(i18n.hasResourceBundle(locale, "translation")).toBe(false);
    }
  });

  it("refreshes stale in-memory English copy before server rendering", async () => {
    const translation = i18n.getResourceBundle("en", "translation") as {
      common: { actions: Record<string, string> };
    };
    delete translation.common.actions.learnMore;
    expect(i18n.t("common.actions.learnMore", { lng: "en" })).toBe(
      "common.actions.learnMore"
    );

    await loadAdminLocaleResources("en");

    expect(i18n.t("common.actions.learnMore", { lng: "en" })).toBe(
      "Learn More"
    );
  });

  it("loads a non-English Admin catalog on demand", async () => {
    await loadAdminLocaleResources("fr");

    expect(i18n.hasResourceBundle("fr", "translation")).toBe(true);
    expect(i18n.t("nav.dashboard", { lng: "fr" })).toBe("Tableau de bord");
  });

  it("loads the Simplified Chinese Admin catalog on demand", async () => {
    await loadAdminLocaleResources("zh-CN");

    expect(i18n.hasResourceBundle("zh-CN", "translation")).toBe(true);
    expect(i18n.t("nav.dashboard", { lng: "zh-CN" })).toBe("控制面板");
  });

  it("provides the shared translation modal Cancel action in every Admin locale", async () => {
    for (const locale of SUPPORTED_LOCALES) {
      await loadAdminLocaleResources(locale);
      expect(i18n.t("common.actions.cancel", { lng: locale })).not.toBe(
        "common.actions.cancel"
      );
    }
  });

  it("localizes display-only labels from shared Admin configuration models", async () => {
    await loadAdminLocaleResources("zh-CN");
    await i18n.changeLanguage("zh-CN");

    expect(translateAdminCopy("Primary Color")).toBe("主颜色");
    expect(translateAdminCopy("unknown-runtime-value")).toBe(
      "unknown-runtime-value"
    );

    await i18n.changeLanguage("en");
  });
});
