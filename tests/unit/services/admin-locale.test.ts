import db from "../../../app/db.server";
import { loaderCache } from "../../../app/lib/loader-cache.server";
import {
  loadShopAdminLocale,
  saveShopAdminLocale,
} from "../../../app/services/admin-locale.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    shop: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

const findUnique = db.shop.findUnique as jest.MockedFunction<typeof db.shop.findUnique>;
const upsert = db.shop.upsert as jest.MockedFunction<typeof db.shop.upsert>;

describe("Admin locale cache", () => {
  beforeEach(() => {
    loaderCache.reset();
    findUnique.mockReset();
    upsert.mockReset();
  });

  it("reuses a normalized shop locale within the loader cache window", async () => {
    findUnique.mockResolvedValue({ adminLocale: "fr" } as never);

    await expect(loadShopAdminLocale("shop.myshopify.com")).resolves.toBe("fr");
    await expect(loadShopAdminLocale("shop.myshopify.com")).resolves.toBe("fr");

    expect(findUnique).toHaveBeenCalledTimes(1);
  });

  it("refreshes the cached locale immediately after a successful save", async () => {
    findUnique.mockResolvedValue({ adminLocale: "en" } as never);
    upsert.mockResolvedValue({ adminLocale: "de" } as never);

    await expect(loadShopAdminLocale("shop.myshopify.com")).resolves.toBe("en");
    await expect(saveShopAdminLocale("shop.myshopify.com", "de")).resolves.toBe("de");
    await expect(loadShopAdminLocale("shop.myshopify.com")).resolves.toBe("de");

    expect(findUnique).toHaveBeenCalledTimes(1);
  });

  it("rejects unsupported locales without writing or populating the cache", async () => {
    await expect(saveShopAdminLocale("shop.myshopify.com", "xx")).rejects.toThrow(
      "Unsupported Admin locale",
    );

    expect(upsert).not.toHaveBeenCalled();
    expect(loaderCache.size()).toBe(0);
  });
});
