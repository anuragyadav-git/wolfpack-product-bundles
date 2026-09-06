import db from "../../../app/db.server";
import {
  executeSidekickBundleOperation,
  SidekickBundleRequestError,
} from "../../../app/services/sidekick-bundles.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockFindMany = db.bundle.findMany as jest.Mock;
const mockFindFirst = db.bundle.findFirst as jest.Mock;

const bundle = {
  id: "bundle-1",
  name: "Build a Box",
  status: "draft",
  bundleType: "full_page",
  createdAt: new Date("2026-08-01T10:00:00.000Z"),
  updatedAt: new Date("2026-09-01T11:00:00.000Z"),
  shopifyProductId: "gid://shopify/Product/123",
  pricing: { enabled: true, method: "percentage_off" },
  _count: { steps: 3 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("executeSidekickBundleOperation", () => {
  it("searches current-shop bundles and excludes archived by default", async () => {
    mockFindMany.mockResolvedValue([bundle, { ...bundle, id: "bundle-2" }]);

    const result = await executeSidekickBundleOperation({
      shop: "shop-one.myshopify.com",
      body: {
        operation: "search_bundles",
        input: { query: " box ", bundle_type: "full_page", limit: 1 },
      },
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shopId: "shop-one.myshopify.com",
          name: { contains: "box", mode: "insensitive" },
          status: { in: ["active", "draft", "unlisted"] },
          bundleType: "full_page",
        },
        orderBy: { updatedAt: "desc" },
        take: 2,
      }),
    );
    expect(result).toEqual({
      results: [
        {
          id: "bundle-1",
          name: "Build a Box",
          status: "draft",
          bundle_type: "full_page",
          created_at: "2026-08-01T10:00:00.000Z",
          updated_at: "2026-09-01T11:00:00.000Z",
          step_count: 3,
          discount_enabled: true,
          discount_method: "percentage_off",
          shopify_product_id: "gid://shopify/Product/123",
          url: "app://app/bundles/full-page-bundle/configure/bundle-1",
        },
      ],
      has_more: true,
    });
  });

  it("searches archived bundles only when explicitly requested", async () => {
    mockFindMany.mockResolvedValue([]);

    await executeSidekickBundleOperation({
      shop: "shop-one.myshopify.com",
      body: {
        operation: "search_bundles",
        input: { status: "archived" },
      },
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "archived" }),
        take: 11,
      }),
    );
  });

  it("scopes a summary lookup by shop and bundle ID", async () => {
    mockFindFirst.mockResolvedValue(bundle);

    const result = await executeSidekickBundleOperation({
      shop: "shop-one.myshopify.com",
      body: {
        operation: "get_bundle_summary",
        input: { bundle_id: "bundle-1" },
      },
    });

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "bundle-1", shopId: "shop-one.myshopify.com" },
      }),
    );
    expect(result).toEqual({
      results: [
        expect.objectContaining({
          id: "bundle-1",
          url: "app://app/bundles/full-page-bundle/configure/bundle-1",
        }),
      ],
    });
  });

  it("returns not found without leaking a cross-shop bundle", async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(
      executeSidekickBundleOperation({
        shop: "shop-one.myshopify.com",
        body: {
          operation: "get_bundle_summary",
          input: { bundle_id: "other-shop-bundle" },
        },
      }),
    ).rejects.toMatchObject({ status: 404, code: "bundle_not_found" });
  });

  it.each([
    { operation: "unknown", input: {} },
    { operation: "search_bundles", input: { status: "deleted" } },
    { operation: "search_bundles", input: { limit: 21 } },
    { operation: "search_bundles", input: { query: "x".repeat(256) } },
    { operation: "get_bundle_summary", input: {} },
  ])("rejects invalid request %#", async (body) => {
    await expect(
      executeSidekickBundleOperation({
        shop: "shop-one.myshopify.com",
        body,
      }),
    ).rejects.toBeInstanceOf(SidekickBundleRequestError);
    expect(mockFindMany).not.toHaveBeenCalled();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});
