import { resolvePageBuilderEmbed } from "../../../app/services/page-builder-embed.server";

describe("page builder embed service", () => {
  function database() {
    return {
      bundle: { findFirst: jest.fn() },
      designSettings: { findUnique: jest.fn() },
    };
  }

  it("resolves a shop-scoped public PPB by generated parent-product handle", async () => {
    const db = database();
    db.bundle.findFirst.mockResolvedValue({ id: "ppb-1", bundleType: "product_page" });

    await expect(resolvePageBuilderEmbed(db as any, "shop.myshopify.com", {
      bundleType: "product_page",
      parentProductHandle: "summer-bundle",
      locale: "en",
    })).resolves.toEqual({
      bundle: { id: "ppb-1", bundleType: "product_page" },
      loadingScreen: null,
    });
    expect(db.bundle.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        shopId: "shop.myshopify.com",
        bundleType: "product_page",
        shopifyProductHandle: "summer-bundle",
        status: { in: ["active", "unlisted"] },
        OR: [
          { offerPolicy: { is: null } },
          { offerPolicy: { is: { specificLinkRequired: false } } },
        ],
      },
    }));
    expect(db.designSettings.findUnique).not.toHaveBeenCalled();
  });

  it("resolves a shop-scoped FPB and its loading-screen settings", async () => {
    const db = database();
    db.bundle.findFirst.mockResolvedValue({ id: "fpb-1", bundleType: "full_page" });
    db.designSettings.findUnique.mockResolvedValue({
      generalSettings: { loadingScreen: { backgroundColor: "#123456" } },
    });

    await expect(resolvePageBuilderEmbed(db as any, "shop.myshopify.com", {
      bundleType: "full_page",
      publicNumber: 7,
      locale: "en",
    })).resolves.toEqual({
      bundle: { id: "fpb-1", bundleType: "full_page" },
      loadingScreen: { gifUrl: null, backgroundColor: "#123456" },
    });
    expect(db.bundle.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        shopId: "shop.myshopify.com",
        bundleType: "full_page",
        publicNumber: 7,
        status: { in: ["active", "unlisted"] },
        OR: [
          { offerPolicy: { is: null } },
          { offerPolicy: { is: { specificLinkRequired: false } } },
        ],
      },
    }));
  });

  it("returns null when no public bundle matches", async () => {
    const db = database();
    db.bundle.findFirst.mockResolvedValue(null);
    await expect(resolvePageBuilderEmbed(db as any, "shop.myshopify.com", {
      bundleType: "full_page",
      publicNumber: 99,
      locale: "en",
    })).resolves.toBeNull();
  });

  it("returns null while the selected bundle schedule is not effective", async () => {
    const db = database();
    db.bundle.findFirst.mockResolvedValue({
      id: "scheduled",
      bundleType: "product_page",
      offerPolicy: { startsAt: "2026-09-01T00:00:00.000Z", endsAt: null },
    });
    await expect(resolvePageBuilderEmbed(db as any, "shop.myshopify.com", {
      bundleType: "product_page",
      parentProductHandle: "scheduled",
      locale: "en",
    }, new Date("2026-08-31T12:00:00.000Z"))).resolves.toBeNull();
  });
});
