const mockDb = {
  bundle: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockSyncBundleStorefrontNow = jest.fn();

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: mockDb,
}));

jest.mock("../../../app/services/bundles/storefront-sync.server", () => ({
  syncBundleStorefrontNow: mockSyncBundleStorefrontNow,
}));

jest.mock("../../../app/services/bundles/bundle-parent-product.server", () => ({
  ensureBundleParentProduct: jest.fn(),
}));

jest.mock("../../../app/services/metafield-cleanup.server", () => ({
  MetafieldCleanupService: {
    updateShopMetafieldsAfterDeletion: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import { handleRenameBundle } from "../../../app/routes/app/app.dashboard/handlers/handlers.server";

function createFormData(fields: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("handleRenameBundle", () => {
  const mockAdmin = {} as any;
  const session = { shop: "test-shop.myshopify.com" };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSyncBundleStorefrontNow.mockResolvedValue({ skipped: false, synced: true });
  });

  it("returns 400 if bundleId is missing", async () => {
    const response = await handleRenameBundle(
      mockAdmin,
      session,
      createFormData({ bundleName: "New Bundle" })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "Missing bundleId" });
  });

  it("returns 400 if bundleName is empty or whitespace", async () => {
    const response = await handleRenameBundle(
      mockAdmin,
      session,
      createFormData({ bundleId: "b-1", bundleName: "   " })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "Bundle name cannot be empty" });
  });

  it("returns 400 if bundleName exceeds 255 characters", async () => {
    const response = await handleRenameBundle(
      mockAdmin,
      session,
      createFormData({ bundleId: "b-1", bundleName: "a".repeat(256) })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: "Bundle name cannot exceed 255 characters",
    });
  });

  it("returns 404 if bundle is not found for the shop", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(null);

    const response = await handleRenameBundle(
      mockAdmin,
      session,
      createFormData({ bundleId: "nonexistent", bundleName: "New Name" })
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(mockDb.bundle.update).not.toHaveBeenCalled();
  });

  it("successfully updates bundle name and syncs storefront", async () => {
    mockDb.bundle.findUnique.mockResolvedValue({
      id: "b-1",
      name: "Old Name",
      shopId: session.shop,
      bundleType: "full_page",
      status: "ACTIVE",
    });
    mockDb.bundle.update.mockResolvedValue({
      id: "b-1",
      name: "New Name",
      shopId: session.shop,
      bundleType: "full_page",
      status: "ACTIVE",
    });

    const response = await handleRenameBundle(
      mockAdmin,
      session,
      createFormData({ bundleId: "b-1", bundleName: "  New Name  " })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      bundleId: "b-1",
      bundleName: "New Name",
    });

    expect(mockDb.bundle.update).toHaveBeenCalledWith({
      where: { id: "b-1", shopId: session.shop },
      data: { name: "New Name" },
    });

    expect(mockSyncBundleStorefrontNow).toHaveBeenCalledWith({
      admin: mockAdmin,
      shopDomain: session.shop,
      bundleId: "b-1",
      bundleType: "full_page",
      reason: "save",
    });
  });

  it("does not fail the rename response if storefront sync throws a non-critical error", async () => {
    mockDb.bundle.findUnique.mockResolvedValue({
      id: "b-1",
      name: "Old Name",
      shopId: session.shop,
      bundleType: "full_page",
      status: "DRAFT",
    });
    mockDb.bundle.update.mockResolvedValue({
      id: "b-1",
      name: "New Name",
    });
    mockSyncBundleStorefrontNow.mockRejectedValue(new Error("Sync warning"));

    const response = await handleRenameBundle(
      mockAdmin,
      session,
      createFormData({ bundleId: "b-1", bundleName: "New Name" })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.bundleName).toBe("New Name");
  });
});
