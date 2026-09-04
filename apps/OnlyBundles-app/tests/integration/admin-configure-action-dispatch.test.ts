import type { ActionFunctionArgs } from "@remix-run/node";
import { action as fpbAction } from "../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route";
import { action as ppbAction } from "../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/route";
import { authenticate } from "../../app/shopify.server";
import * as fpbHandlers from "../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers";
import * as ppbHandlers from "../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers";
import * as storefrontSyncAction from "../../app/routes/app/shared/storefront-sync-action.server";
import * as subscriptionDiscovery from "../../app/services/bundle-subscription-discovery.server";

jest.mock("../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../app/db.server", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers", () => ({
  handleSaveBundle: jest.fn(),
  handleUpdateBundleStatus: jest.fn(),
  handleSyncProduct: jest.fn(),
  handleUpdateBundleProduct: jest.fn(),
  handleUpdateBundleDesignTemplate: jest.fn(),
}));

jest.mock("../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers", () => ({
  handleSaveBundle: jest.fn(),
  handleUpdateBundleStatus: jest.fn(),
  handleSyncProduct: jest.fn(),
  handleUpdateBundleProduct: jest.fn(),
  handleGetThemeTemplates: jest.fn(),
  handleGetCurrentTheme: jest.fn(),
  handleEnsureBundleTemplates: jest.fn(),
  handleValidateWidgetPlacement: jest.fn(),
  handleAssignProductTemplate: jest.fn(),
  handleUpdateBundleDesignTemplate: jest.fn(),
}));

jest.mock("../../app/services/bundle-subscription-discovery.server", () => ({
  handleValidateSellingPlanGroups: jest.fn(),
}));

jest.mock("../../app/routes/app/shared/storefront-sync-action.server", () => ({
  handlePrepareStorefrontPreview: jest.fn(),
  handleSyncStorefrontNow: jest.fn(),
}));

jest.mock("../../app/routes/app/shared/bundle-preview-action.server", () => ({
  handleCreateFpbPreview: jest.fn(),
  handleRecordBundlePreview: jest.fn(),
}));

jest.mock("../../app/components/shared/FilePicker", () => ({
  FilePicker: () => null,
}));

jest.mock("../../app/components/bundle-configure/BundleGuidedTour", () => ({
  BundleGuidedTour: () => null,
}));

jest.mock("../../app/components/bundle-configure/BundleReadinessOverlay", () => ({
  BundleReadinessOverlay: () => null,
}));

jest.mock("@shopify/app-bridge-react", () => ({
  SaveBar: () => null,
  useAppBridge: () => ({}),
}));

const mockRequireAdminSession = authenticate.admin as jest.MockedFunction<typeof authenticate.admin>;
const mockSession = { shop: "test-shop.myshopify.com", accessToken: "token" } as any;
const mockAdmin = { graphql: jest.fn() } as any;

function makeActionArgs(intent: string, extras: Record<string, string> = {}): ActionFunctionArgs {
  const formData = new FormData();
  formData.set("intent", intent);
  Object.entries(extras).forEach(([key, value]: any) => formData.set(key, value));

  return {
    request: new Request("https://test.example.com/app/configure/bundle-1", {
      method: "POST",
      body: formData,
    }),
    params: { bundleId: "bundle-1" },
    context: {},
  };
}

function responseFor(intent: string): Response {
  return Response.json({ success: true, intent });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireAdminSession.mockResolvedValue({ session: mockSession, admin: mockAdmin } as any);
});

describe("FPB configure action dispatch", () => {
  it("propagates Shopify authentication responses before action handling", async () => {
    const authResponse = new Response(null, {
      status: 302,
      headers: { Location: "https://admin.shopify.com" },
    });
    mockRequireAdminSession.mockRejectedValue(authResponse);

    await expect(fpbAction(makeActionArgs("saveBundle"))).rejects.toBe(
      authResponse,
    );
    expect(fpbHandlers.handleSaveBundle).not.toHaveBeenCalled();
  });

  it.each([
    ["saveBundle", "handleSaveBundle"],
    ["updateBundleStatus", "handleUpdateBundleStatus"],
    ["syncProduct", "handleSyncProduct"],
    ["updateBundleProduct", "handleUpdateBundleProduct"],
    ["updateBundleDesignTemplate", "handleUpdateBundleDesignTemplate"],
  ] as const)("routes %s to %s", async (intent, handlerName) => {
    const handler = fpbHandlers[handlerName] as jest.Mock;
    handler.mockResolvedValue(responseFor(intent));

    const response = await fpbAction(makeActionArgs(intent, {
      desiredSlug: "bundle-page",
      newSlug: "renamed-page",
    }));
    const body = await response.json();

    expect(body).toEqual({ success: true, intent });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("routes syncBundle to the proxy-hosted FPB sync", async () => {
    const handler = storefrontSyncAction.handleSyncStorefrontNow as jest.Mock;
    handler.mockResolvedValue(responseFor("syncBundle"));

    const response = await fpbAction(makeActionArgs("syncBundle"));
    const body = await response.json();

    expect(body).toEqual({ success: true, intent: "syncBundle" });
    expect(handler).toHaveBeenCalledWith(
      mockAdmin,
      mockSession,
      "bundle-1",
      "full_page",
      "sync_bundle",
    );
  });

  it("routes preparePreviewBundle to proxy preview preparation", async () => {
    const handler = storefrontSyncAction.handlePrepareStorefrontPreview as jest.Mock;
    handler.mockResolvedValue(responseFor("preparePreviewBundle"));

    const response = await fpbAction(makeActionArgs("preparePreviewBundle"));
    expect(await response.json()).toEqual({ success: true, intent: "preparePreviewBundle" });
    expect(handler).toHaveBeenCalledWith(
      mockAdmin,
      mockSession,
      "bundle-1",
      "full_page",
    );
  });

  it("routes validateSellingPlanGroups to shared full-page discovery", async () => {
    const handler = subscriptionDiscovery.handleValidateSellingPlanGroups as jest.Mock;
    handler.mockResolvedValue(responseFor("validateSellingPlanGroups"));

    const response = await fpbAction(makeActionArgs("validateSellingPlanGroups"));

    expect(await response.json()).toEqual({ success: true, intent: "validateSellingPlanGroups" });
    expect(handler).toHaveBeenCalledWith(mockAdmin, mockSession, "bundle-1", "full_page");
  });

  it("returns a 400 response for unknown FPB intents", async () => {
    const response = await fpbAction(makeActionArgs("not-real"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });
});

describe("PPB configure action dispatch", () => {
  it("propagates Shopify authentication responses before action handling", async () => {
    const authResponse = new Response(null, {
      status: 302,
      headers: { Location: "https://admin.shopify.com" },
    });
    mockRequireAdminSession.mockRejectedValue(authResponse);

    await expect(ppbAction(makeActionArgs("saveBundle"))).rejects.toBe(
      authResponse,
    );
    expect(ppbHandlers.handleSaveBundle).not.toHaveBeenCalled();
  });

  it.each([
    ["saveBundle", "handleSaveBundle"],
    ["updateBundleStatus", "handleUpdateBundleStatus"],
    ["syncProduct", "handleSyncProduct"],
    ["updateBundleProduct", "handleUpdateBundleProduct"],
    ["getThemeTemplates", "handleGetThemeTemplates"],
    ["getCurrentTheme", "handleGetCurrentTheme"],
    ["ensureBundleTemplates", "handleEnsureBundleTemplates"],
    ["validateWidgetPlacement", "handleValidateWidgetPlacement"],
    ["updateBundleDesignTemplate", "handleUpdateBundleDesignTemplate"],
    ["assignProductTemplate", "handleAssignProductTemplate"],
  ] as const)("routes %s to %s", async (intent, handlerName) => {
    const handler = ppbHandlers[handlerName] as jest.Mock;
    handler.mockResolvedValue(responseFor(intent));

    const response = await ppbAction(makeActionArgs(intent));
    const body = await response.json();

    expect(body).toEqual({ success: true, intent });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("routes validateSellingPlanGroups to shared product-page discovery", async () => {
    const handler = subscriptionDiscovery.handleValidateSellingPlanGroups as jest.Mock;
    handler.mockResolvedValue(responseFor("validateSellingPlanGroups"));

    const response = await ppbAction(makeActionArgs("validateSellingPlanGroups"));

    expect(await response.json()).toEqual({ success: true, intent: "validateSellingPlanGroups" });
    expect(handler).toHaveBeenCalledWith(mockAdmin, mockSession, "bundle-1", "product_page");
  });

  it("routes syncBundle to shared storefront sync with product_page type", async () => {
    const handler = storefrontSyncAction.handleSyncStorefrontNow as jest.Mock;
    handler.mockResolvedValue(responseFor("syncBundle"));

    const response = await ppbAction(makeActionArgs("syncBundle"));
    const body = await response.json();

    expect(body).toEqual({ success: true, intent: "syncBundle" });
    expect(handler).toHaveBeenCalledWith(
      mockAdmin,
      mockSession,
      "bundle-1",
      "product_page",
      "sync_bundle",
    );
  });

  it("returns a 400 response for unknown PPB intents", async () => {
    const response = await ppbAction(makeActionArgs("not-real"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });
});
