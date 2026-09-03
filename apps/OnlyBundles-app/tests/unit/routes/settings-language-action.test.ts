/* eslint-disable import/first */

const requireAdminSession = jest.fn();
const findUnique = jest.fn();
const upsert = jest.fn();
const findMany = jest.fn();
const transaction = jest.fn(async (writes: Promise<unknown>[]) => Promise.all(writes));
const syncPpbStorefrontRuntime = jest.fn();

jest.mock("../../../app/shopify.server", () => ({ authenticate: { admin: requireAdminSession } }));
jest.mock("../../../app/db.server", () => ({
  prisma: {
    $transaction: transaction,
    designSettings: { findUnique, findMany, upsert },
    bundle: { findMany: jest.fn() },
  },
}));
jest.mock("../../../app/services/cart-transform-service.server", () => ({
  CartTransformService: { syncCartLineMessagingSettings: jest.fn() },
}));
jest.mock("../../../app/services/ppb-storefront-runtime.server", () => ({ syncPpbStorefrontRuntime }));

import { action } from "../../../app/routes/app/app.settings";

describe("Settings Language action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("transactionally writes only the canonical language document to both layouts", async () => {
    requireAdminSession.mockResolvedValue({ admin: {}, session: { shop: "shop.test" } });
    findUnique.mockResolvedValue({ generalSettings: { settingsPage: { language: { legacy: true }, design: {} } } });
    findMany.mockResolvedValue([]);
    upsert.mockResolvedValue({});
    syncPpbStorefrontRuntime.mockResolvedValue({});
    const form = new FormData();
    form.set("intent", "saveSettingsLanguage");
    form.set("payload", JSON.stringify({ languageMode: "SINGLE", localeFieldValues: { en: {} } }));

    const response = await action({
      request: new Request("https://app.test/app/settings", { method: "POST", body: form }),
      params: {},
      context: {},
    } as never);

    expect(response.status).toBe(200);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(syncPpbStorefrontRuntime).toHaveBeenCalledWith({}, "shop.test");
    expect(upsert).toHaveBeenCalledTimes(2);
    for (const [write] of upsert.mock.calls) {
      expect(write.update.generalSettings.settingsLanguage).toMatchObject({
        languageMode: "SINGLE",
        en: expect.any(Object),
        mixAndMatchTextData: { en: expect.any(Object) },
        sharedComponents: { en: expect.any(Object) },
      });
      expect(write.update.generalSettings.settingsPage.language).toBeUndefined();
    }
  });

  it("reports persisted language state when the PPB runtime sync fails", async () => {
    requireAdminSession.mockResolvedValue({ admin: {}, session: { shop: "shop.test" } });
    findUnique.mockResolvedValue({ generalSettings: {} });
    findMany.mockResolvedValue([]);
    upsert.mockResolvedValue({});
    syncPpbStorefrontRuntime.mockRejectedValue(new Error("metafield unavailable"));
    const payload = { languageMode: "SINGLE", localeFieldValues: { en: {} } };
    const form = new FormData();
    form.set("intent", "saveSettingsLanguage");
    form.set("payload", JSON.stringify(payload));

    const response = await action({
      request: new Request("https://app.test/app/settings", { method: "POST", body: form }),
      params: {},
      context: {},
    } as never);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({
      success: false,
      intent: "saveSettingsLanguage",
      persisted: true,
      runtimeSynced: false,
      savedState: payload,
    });
  });
});
