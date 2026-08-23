import db from "../../../app/db.server";
import { getStorefrontAccessToken } from "../../../app/services/storefront-token.server";
import {
  fetchShopBrandColors,
  syncThemeColors,
} from "../../../app/services/theme-colors.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    designSettings: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));
jest.mock("../../../app/services/storefront-token.server", () => ({
  getStorefrontAccessToken: jest.fn(),
}));

const BRAND_RESPONSE = {
  data: {
    shop: {
      brand: {
        colors: {
          primary: [{ background: "#123456", foreground: "#ffffff" }],
          secondary: [{ background: "#e8eef5", foreground: "#17202a" }],
        },
      },
    },
  },
};

describe("Shop Brand color service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getStorefrontAccessToken as jest.Mock).mockResolvedValue("storefront-token");
    (global.fetch as jest.Mock | undefined) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => BRAND_RESPONSE,
    });
  });

  it("queries shop.brand.colors through the existing Storefront token", async () => {
    const colors = await fetchShopBrandColors({} as any, "shop.test");

    expect(getStorefrontAccessToken).toHaveBeenCalledWith({}, "shop.test");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://shop.test/api/"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Shopify-Storefront-Access-Token": "storefront-token",
        }),
        body: expect.stringContaining("ShopBrandColors"),
      }),
    );
    expect(colors).toEqual({
      primary: { background: "#123456", foreground: "#ffffff" },
      secondary: { background: "#e8eef5", foreground: "#17202a" },
    });
  });

  it("updates both DesignSettings cache rows with the new pair shape", async () => {
    const result = await syncThemeColors({} as any, "shop.test");

    expect(db.designSettings.upsert).toHaveBeenCalledTimes(2);
    expect((db.designSettings.upsert as jest.Mock).mock.calls[0][0].create.themeColors).toEqual(
      expect.objectContaining({
        primary: { background: "#123456", foreground: "#ffffff" },
        secondary: { background: "#e8eef5", foreground: "#17202a" },
        syncedAt: expect.any(String),
      }),
    );
    expect(result).toEqual(expect.objectContaining({ syncedAt: expect.any(String) }));
  });

  it.each([
    { ok: false, status: 500, json: async () => ({}) },
    { ok: true, status: 200, json: async () => ({ data: { shop: { brand: { colors: { primary: [], secondary: [] } } } } }) },
  ])("clears stale cached colors when Brand colors are unavailable", async (response) => {
    (global.fetch as jest.Mock).mockResolvedValue(response);

    await expect(syncThemeColors({} as any, "shop.test")).resolves.toBeNull();

    expect(db.designSettings.upsert).not.toHaveBeenCalled();
    expect(db.designSettings.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ shopId: "shop.test" }),
      data: expect.objectContaining({ themeColors: expect.anything() }),
    }));
  });
});
