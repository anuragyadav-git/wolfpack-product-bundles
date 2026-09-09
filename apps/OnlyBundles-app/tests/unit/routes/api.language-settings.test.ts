/* eslint-disable import/first */
var mockAuthenticateAppProxy = jest.fn();
jest.mock("../../../app/shopify.server", () => ({
  authenticate: {
    admin: jest.fn(),
    public: { appProxy: mockAuthenticateAppProxy },
    webhook: jest.fn(),
  },
}));

jest.mock("../../../app/db.server", () => ({
  prisma: { designSettings: { findUnique: jest.fn() } },
}));
jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { error: jest.fn() },
}));

import { prisma } from "../../../app/db.server";
import { AppLogger } from "../../../app/lib/logger";
import { buildSettingsLanguageRuntime } from "../../../app/lib/settings-language-runtime";
import { loader } from "../../../app/routes/api/api.language-settings";

const findUnique = prisma.designSettings.findUnique as jest.Mock;
const logError = AppLogger.error as jest.Mock;

describe("language settings storefront route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticateAppProxy.mockResolvedValue({ session: { shop: "verified.myshopify.com" } });
  });

  it("requires an authenticated app-proxy session", async () => {
    mockAuthenticateAppProxy.mockResolvedValue({ session: undefined });
    const response = await loader({
      request: new Request("https://app.test/api/language-settings"),
      params: {},
      context: {},
    } as never);
    expect(response.status).toBe(401);
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
      request: new Request("https://app.test/api/language-settings?bundleType=product_page&locale=fr"),
      params: {},
      context: {},
    } as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      activeLocale: "fr",
      textOverrides: { addBundleSuccess: "Lot ajouté" },
    });
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { shopId_bundleType: expect.objectContaining({ shopId: "verified.myshopify.com" }) },
    }));
  });

  it("returns a retryable error instead of fabricating defaults when persistence fails", async () => {
    findUnique.mockRejectedValue(new Error("database unavailable"));
    const response = await loader({
      request: new Request("https://app.test/api/language-settings?bundleType=full_page&locale=fr"),
      params: {},
      context: {},
    } as never);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Language settings are temporarily unavailable",
    });
    expect(logError).toHaveBeenCalled();
  });
});
