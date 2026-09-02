/**
 * Embedded Admin UI i18n contract.
 *
 * Issue: admin-ui-i18n-1
 * Spec : test-spec/admin-ui-i18n.spec.md
 */
import fs from "node:fs";
import path from "node:path";
import {
  SUPPORTED_LOCALES,
  normalizeAdminLocale,
} from "../../../app/i18n/config";

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value)
    .flatMap(([key, child]: any) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key)
    )
    .sort();
}

function flattenStrings(
  value: unknown,
  prefix = "",
  output: Record<string, string> = {}
) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return output;
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") output[path] = child;
    else flattenStrings(child, path, output);
  }
  return output;
}

function interpolationTokens(value: string): string[] {
  return (value.match(/\{\{[^{}]+\}\}/g) ?? []).sort();
}

describe("embedded Admin locale configuration", () => {
  it("supports the Polaris-compatible Admin locales including Simplified Chinese", () => {
    expect(SUPPORTED_LOCALES).toEqual([
      "en",
      "fr",
      "de",
      "es",
      "ja",
      "pt-BR",
      "zh-CN",
    ]);
  });

  it("preserves supported locales and defaults unsupported locales to English", () => {
    expect(normalizeAdminLocale("fr-FR")).toBe("fr");
    expect(normalizeAdminLocale("de-DE")).toBe("de");
    expect(normalizeAdminLocale("zh")).toBe("zh-CN");
    expect(normalizeAdminLocale("zh-Hans")).toBe("zh-CN");
    expect(normalizeAdminLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeAdminLocale("zh-TW")).toBe("en");
    expect(normalizeAdminLocale("xx")).toBe("en");
    expect(normalizeAdminLocale(null)).toBe("en");
  });

  it("keeps every supported locale catalog key-compatible with English", () => {
    const localeDir = path.join(process.cwd(), "app/i18n/locales");
    const english = JSON.parse(
      fs.readFileSync(path.join(localeDir, "en.json"), "utf8")
    );
    const englishKeys = flattenKeys(english);

    for (const locale of SUPPORTED_LOCALES) {
      const file = path.join(localeDir, `${locale}.json`);
      expect(fs.existsSync(file)).toBe(true);
      const catalog = JSON.parse(fs.readFileSync(file, "utf8"));
      expect(flattenKeys(catalog)).toEqual(englishKeys);
    }
  });

  it("preserves every i18next interpolation token across locale catalogs", () => {
    const localeDir = path.join(process.cwd(), "app/i18n/locales");
    const english = flattenStrings(
      JSON.parse(fs.readFileSync(path.join(localeDir, "en.json"), "utf8"))
    );

    for (const locale of SUPPORTED_LOCALES) {
      const catalog = flattenStrings(
        JSON.parse(
          fs.readFileSync(path.join(localeDir, `${locale}.json`), "utf8")
        )
      );
      for (const [key, source] of Object.entries(english)) {
        expect(interpolationTokens(catalog[key])).toEqual(
          interpolationTokens(source)
        );
      }
    }
  });

  it("uses Only Bundles for every merchant-visible brand reference", () => {
    const localeDir = path.join(process.cwd(), "app/i18n/locales");

    for (const locale of SUPPORTED_LOCALES) {
      const catalog = JSON.parse(
        fs.readFileSync(path.join(localeDir, `${locale}.json`), "utf8")
      );
      const serialized = JSON.stringify(catalog);
      expect(serialized).toContain("Only Bundles");
      expect(serialized).not.toMatch(/Wolfpack/i);
    }
  });

  it("provides a localized Billing navigation label in every supported locale", () => {
    const localeDir = path.join(process.cwd(), "app/i18n/locales");

    for (const locale of SUPPORTED_LOCALES) {
      const catalog = JSON.parse(
        fs.readFileSync(path.join(localeDir, `${locale}.json`), "utf8")
      );
      expect(catalog.nav.billing).toEqual(expect.any(String));
      expect(catalog.nav.billing).not.toHaveLength(0);
    }
  });
});

describe("Shopify-native Admin locale wiring contract", () => {
  const schema = fs.readFileSync(
    path.join(process.cwd(), "prisma/schema.prisma"),
    "utf8"
  );
  const appShell = fs.readFileSync(
    path.join(process.cwd(), "app/routes/app/app.tsx"),
    "utf8"
  );
  const dashboard = fs.readFileSync(
    path.join(process.cwd(), "app/routes/app/app.dashboard/route.tsx"),
    "utf8"
  );
  const dashboardPage = fs.readFileSync(
    path.join(process.cwd(), "app/routes/app/app.dashboard/DashboardPage.tsx"),
    "utf8"
  );
  it("does not duplicate Shopify's Admin locale in the Shop model", () => {
    expect(schema).not.toContain("adminLocale");
  });

  it("loads the authoritative Shopify request locale in the app shell", () => {
    expect(appShell).toContain("resolveAdminLocaleFromRequest(request)");
    expect(appShell).toContain("shopify.config.locale");
    expect(appShell).not.toContain("loadShopAdminLocale");
  });

  it("translates the global embedded Admin navigation", () => {
    expect(appShell).toContain('t("nav.dashboard")');
    expect(appShell).toContain('t("nav.settings")');
    expect(appShell).toContain('t("nav.integrations")');
    expect(appShell).toContain('t("nav.analytics")');
    expect(appShell).toContain('t("nav.billing")');
    expect(appShell).not.toContain('t("nav.events")');
  });

  it("does not render or persist an app-owned dashboard locale preference", () => {
    expect(dashboard).not.toContain('intent === "saveAdminLocale"');
    expect(dashboardPage).not.toContain("languageOptions");
    expect(dashboardPage).not.toContain("wolfpack-locale");
  });
});
