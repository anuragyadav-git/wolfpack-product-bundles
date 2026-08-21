import { prisma } from "../../../app/db.server";
import { AppLogger } from "../../../app/lib/logger";
import { buildSettingsLanguageRuntime } from "../../../app/lib/settings-language-runtime";
import { loader } from "../../../app/routes/api/api.language-settings.$shopDomain";

jest.mock("../../../app/db.server", () => ({
  prisma: { designSettings: { findUnique: jest.fn() } },
}));
jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { error: jest.fn() },
}));

const findUnique = prisma.designSettings.findUnique as jest.Mock;
const logError = AppLogger.error as jest.Mock;

describe("language settings storefront route", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requires a shop domain", async () => {
    const response = await loader({
      request: new Request("https://app.test/api/language-settings"),
      params: {},
      context: {},
    } as never);
    expect(response.status).toBe(400);
  });

  it("returns the requested configured locale", async () => {
    const settingsLanguage = buildSettingsLanguageRuntime({
      languageMode: "MULTIPLE",
      localeFieldValues: {
        en: {},
        fr: { "ppb.general.addBundleSuccessText": "Lot ajouté" },
      },
    }).settingsLanguage;
    findUnique.mockResolvedValue({ generalSettings: { settingsLanguage } });

    const response = await loader({
      request: new Request("https://app.test/api/language-settings/shop.test?bundleType=product_page&locale=fr"),
      params: { shopDomain: "shop.test" },
      context: {},
    } as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      activeLocale: "fr",
      textOverrides: { addBundleSuccess: "Lot ajouté" },
    });
  });

  it("returns deterministic English defaults when persistence fails", async () => {
    findUnique.mockRejectedValue(new Error("database unavailable"));
    const response = await loader({
      request: new Request("https://app.test/api/language-settings/shop.test?bundleType=full_page&locale=fr"),
      params: { shopDomain: "shop.test" },
      context: {},
    } as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ activeLocale: "en" });
    expect(logError).toHaveBeenCalled();
  });
});
