const requireAdminSession = jest.fn();
const findUnique = jest.fn();
const upsert = jest.fn();
const syncCartLineMessagingSettings = jest.fn();

jest.mock("../../../app/lib/auth-guards.server", () => ({ requireAdminSession }));
jest.mock("../../../app/db.server", () => ({
  prisma: {
    designSettings: { findUnique, upsert },
    bundle: { findMany: jest.fn() },
  },
}));
jest.mock("../../../app/services/cart-transform-service.server", () => ({
  CartTransformService: { syncCartLineMessagingSettings },
}));

// eslint-disable-next-line import/first
import { action } from "../../../app/routes/app/app.settings";

function requestFor(payload: Record<string, unknown>) {
  const formData = new FormData();
  formData.set("intent", "saveSettingsControls");
  formData.set("payload", JSON.stringify(payload));
  return new Request("https://app.test/app/settings", { method: "POST", body: formData });
}

describe("Settings Controls action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdminSession.mockResolvedValue({ admin: {}, session: { shop: "shop.test" } });
    findUnique
      .mockResolvedValueOnce({
        generalSettings: { settingsPage: { controls: { "Cart Messaging": "Checked" }, design: {} } },
      })
      .mockResolvedValue({ generalSettings: { settingsPage: { controls: {}, language: {} } } });
    upsert.mockResolvedValue({});
    syncCartLineMessagingSettings.mockResolvedValue({ success: true });
  });

  it("writes the canonical contract to both bundle types and removes label-keyed state", async () => {
    const response = await action({
      request: requestFor({
        "shared.cartMessaging.isEnabled": "Checked",
        "landingPage.checkout.providerId": "UpCart",
      }),
      params: {},
      context: {},
    } as never);

    expect(response.status).toBe(200);
    expect(upsert).toHaveBeenCalledTimes(2);
    for (const [write] of upsert.mock.calls) {
      expect(write.update.generalSettings.settingsControls).toMatchObject({
        schemaVersion: 1,
        shared: { cartMessaging: expect.any(Object) },
        landingPage: { checkout: { providerId: "upcart" } },
      });
      expect(write.update.generalSettings.settingsPage.controls).toBeUndefined();
    }
    expect(syncCartLineMessagingSettings).toHaveBeenCalledWith(
      {},
      "shop.test",
      expect.objectContaining({ isEnabled: true }),
    );
  });
});
