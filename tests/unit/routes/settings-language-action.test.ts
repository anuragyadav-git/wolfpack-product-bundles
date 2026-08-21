/* eslint-disable import/first */

const requireAdminSession = jest.fn();
const findUnique = jest.fn();
const upsert = jest.fn();
const findMany = jest.fn();
const transaction = jest.fn(async (writes: Promise<unknown>[]) => Promise.all(writes));

jest.mock("../../../app/lib/auth-guards.server", () => ({ requireAdminSession }));
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

import { action } from "../../../app/routes/app/app.settings";

describe("Settings Language action", () => {
  it("transactionally writes only the canonical language document to both layouts", async () => {
    requireAdminSession.mockResolvedValue({ admin: {}, session: { shop: "shop.test" } });
    findUnique.mockResolvedValue({ generalSettings: { settingsPage: { language: { legacy: true }, design: {} } } });
    findMany.mockResolvedValue([]);
    upsert.mockResolvedValue({});
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
});
