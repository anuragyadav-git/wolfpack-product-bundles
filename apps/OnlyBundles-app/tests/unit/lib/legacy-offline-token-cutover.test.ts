import {
  runLegacyOfflineTokenCutover,
  selectLegacyOfflineSessions,
  type LegacyOfflineTokenCutoverError,
  type LegacyOfflineSessionRow,
} from "../../../app/lib/legacy-offline-token-cutover.server";

const legacy = (shop: string): LegacyOfflineSessionRow => ({
  id: `offline_${shop}`,
  shop,
  isOnline: false,
  accessToken: `token-${shop}`,
  expires: null,
  refreshToken: null,
  refreshTokenExpires: null,
});

describe("legacy offline-token cutover policy", () => {
  it("selects only non-expiring offline sessions", () => {
    const candidates = selectLegacyOfflineSessions([
      legacy("legacy.myshopify.com"),
      { ...legacy("online.myshopify.com"), isOnline: true },
      {
        ...legacy("expiring.myshopify.com"),
        expires: new Date("2026-08-24T10:00:00Z"),
        refreshToken: "refresh",
        refreshTokenExpires: new Date("2026-11-22T10:00:00Z"),
      },
    ]);

    expect(candidates.map(({ shop }) => shop)).toEqual(["legacy.myshopify.com"]);
  });

  it("fails closed on the first rejected native migration", async () => {
    const migrate = jest.fn()
      .mockResolvedValueOnce({ id: "migrated-a" })
      .mockRejectedValueOnce(new Error("Shopify rejected migration"));
    const store = jest.fn().mockResolvedValue(undefined);

    await expect(runLegacyOfflineTokenCutover([
      legacy("a.myshopify.com"),
      legacy("b.myshopify.com"),
      legacy("c.myshopify.com"),
    ], migrate, store)).rejects.toEqual(expect.objectContaining<Partial<LegacyOfflineTokenCutoverError>>({
      failedShop: "b.myshopify.com",
      migratedShops: ["a.myshopify.com"],
    }));
    expect(migrate).toHaveBeenCalledTimes(2);
    expect(store).toHaveBeenCalledTimes(1);
  });

  it("reports every shop after a successful cutover", async () => {
    const migrate = jest.fn(async ({ shop }) => ({ id: `migrated-${shop}` }));
    const store = jest.fn().mockResolvedValue(undefined);

    await expect(runLegacyOfflineTokenCutover([
      legacy("a.myshopify.com"),
      legacy("b.myshopify.com"),
    ], migrate, store)).resolves.toEqual({
      migratedShops: ["a.myshopify.com", "b.myshopify.com"],
    });
  });
});
