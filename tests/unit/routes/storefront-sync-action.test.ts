import {
  handlePrepareStorefrontPreview,
  handleSyncStorefrontNow,
} from "../../../app/routes/app/shared/storefront-sync-action.server";
import { syncBundleStorefrontNow } from "../../../app/services/bundles/storefront-sync.server";
import { verifyBundlePreviewToken } from "../../../app/lib/bundle-preview-token.server";
import db from "../../../app/db.server";
import { recordFirstBundlePreviewEvent } from "../../../app/services/bundles/bundle-preview-event.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: { bundle: { findUnique: jest.fn() } },
}));

jest.mock("../../../app/services/bundles/bundle-preview-event.server", () => ({
  recordFirstBundlePreviewEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../../app/services/bundles/storefront-sync.server", () => ({
  syncBundleStorefrontNow: jest.fn().mockResolvedValue({
    skipped: false,
    synced: true,
    stats: { bundleType: "full_page" },
  }),
}));

const mockSyncBundleStorefrontNow =
  syncBundleStorefrontNow as jest.MockedFunction<typeof syncBundleStorefrontNow>;
const mockDb = db as jest.Mocked<typeof db>;
const mockRecordFirstBundlePreviewEvent =
  recordFirstBundlePreviewEvent as jest.MockedFunction<typeof recordFirstBundlePreviewEvent>;

const admin = { graphql: jest.fn() } as any;
const session = { shop: "test.myshopify.com" } as any;

describe("storefront sync action handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSyncBundleStorefrontNow.mockResolvedValue({
      skipped: false,
      synced: true,
      stats: { bundleType: "full_page" },
    } as any);
    (mockDb.bundle.findUnique as jest.Mock).mockResolvedValue({
      id: "bundle-1",
      bundleType: "full_page",
      status: "draft",
    });
  });

  it("prepares FPB preview with one sync and returns the signed proxy URL", async () => {
    const response = await handlePrepareStorefrontPreview(
      admin,
      session,
      "bundle-1",
      "full_page",
    );
    const body = await response.json();
    const previewUrl = new URL(body.shareablePreviewUrl);

    expect(mockSyncBundleStorefrontNow).toHaveBeenCalledTimes(1);
    expect(previewUrl.pathname).toBe("/apps/product-bundles/wpb/bundle-1");
    expect(verifyBundlePreviewToken({
      token: previewUrl.searchParams.get("wpb_preview"),
      shop: session.shop,
      bundleId: "bundle-1",
    })).toBe(true);
    expect(mockRecordFirstBundlePreviewEvent).toHaveBeenCalledWith({
      admin,
      shopDomain: session.shop,
      bundle: expect.objectContaining({ id: "bundle-1", bundleType: "full_page" }),
      bundleLink: body.shareablePreviewUrl,
      routeFamily: "fpb_configure",
    });
  });

  it("syncs immediately and returns a compact EB-style response", async () => {
    const response = await handleSyncStorefrontNow(
      admin,
      session,
      "bundle-1",
      "full_page",
      "sync_bundle",
    );
    const body = await response.json();

    expect(mockSyncBundleStorefrontNow).toHaveBeenCalledWith({
      admin,
      shopDomain: "test.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      reason: "sync_bundle",
    });
    expect(body).toEqual({
      success: true,
      statusCode: 200,
      synced: true,
      message: "Updated Successfully!",
    });
    expect(body).not.toHaveProperty("storefrontSync");
    expect(body).not.toHaveProperty("attemptId");
    expect(body).not.toHaveProperty("stats");
  });

  it("prepares PPB preview with one direct sync and a bound authorization token", async () => {
    const response = await handlePrepareStorefrontPreview(
      admin,
      session,
      "bundle-1",
      "product_page",
    );
    const body = await response.json();

    expect(mockSyncBundleStorefrontNow).toHaveBeenCalledWith({
      admin,
      shopDomain: "test.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "product_page",
      reason: "preview",
    });
    expect(body).toEqual({
      success: true,
      statusCode: 200,
      ready: true,
      message: "success",
      previewToken: expect.any(String),
    });
    expect(verifyBundlePreviewToken({
      token: body.previewToken,
      shop: "test.myshopify.com",
      bundleId: "bundle-1",
    })).toBe(true);
    expect(body).not.toHaveProperty("storefrontSync");
    expect(body).not.toHaveProperty("queued");
    expect(body).not.toHaveProperty("stats");
  });

  it("returns a compact error when direct sync fails", async () => {
    mockSyncBundleStorefrontNow.mockRejectedValueOnce(new Error("publish failed"));

    const response = await handlePrepareStorefrontPreview(
      admin,
      session,
      "bundle-1",
      "full_page",
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      statusCode: 500,
      error: "publish failed",
    });
    expect(body).not.toHaveProperty("storefrontSync");
    expect(body).not.toHaveProperty("attemptId");
  });
});
