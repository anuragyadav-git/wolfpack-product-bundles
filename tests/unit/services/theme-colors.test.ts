import { fetchShopBrandColors, syncThemeColors } from "../../../app/services/theme-colors.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: { designSettings: { upsert: jest.fn(), updateMany: jest.fn() } },
}));

const { upsert: mockUpsert, updateMany: mockUpdateMany } =
  jest.requireMock("../../../app/db.server").default.designSettings;

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { info: jest.fn(), warn: jest.fn() },
}));

describe("Shop Brand colors via native Storefront context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsert.mockResolvedValue({});
    mockUpdateMany.mockResolvedValue({ count: 2 });
  });

  it("parses and persists Shopify Brand color pairs", async () => {
    const storefront = { graphql: jest.fn().mockResolvedValue({ json: async () => ({
      data: { shop: { brand: { colors: {
        primary: [{ background: "#000000", foreground: "#ffffff" }],
        secondary: [{ background: "#eeeeee", foreground: "#111111" }],
      } } } },
    }) }) } as any;

    const colors = await fetchShopBrandColors(storefront, "test.myshopify.com");
    expect(colors).not.toBeNull();

    await syncThemeColors("test.myshopify.com", storefront);
    expect(storefront.graphql).toHaveBeenCalledWith(expect.stringContaining("ShopBrandColors"));
    expect(mockUpsert).toHaveBeenCalledTimes(2);
  });

  it("clears stale cached colors when Shopify data is unavailable", async () => {
    const storefront = { graphql: jest.fn().mockRejectedValue(new Error("unavailable")) } as any;

    await expect(syncThemeColors("test.myshopify.com", storefront)).resolves.toBeNull();
    expect(mockUpdateMany).toHaveBeenCalledTimes(1);
  });
});
