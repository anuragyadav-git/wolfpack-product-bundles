/**
 * Unit tests -- Template selection entitlement validation for PPB and FPB
 */

import { handleUpdateBundleDesignTemplate as handlePpbUpdateTemplate } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/design-template.server";
import { handleUpdateBundleDesignTemplate as handleFpbUpdateTemplate } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/page-handlers.server";
import { resolveShopEntitlements } from "../../../app/services/subscriptions/subscription-service.server";
import db from "../../../app/db.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../../app/services/subscriptions/subscription-service.server", () => ({
  resolveShopEntitlements: jest.fn(),
}));

jest.mock("../../../app/services/subscriptions/design-entitlement-state.server", () => ({
  shopUsesAdvancedDesign: jest.fn().mockResolvedValue(false),
}));

jest.mock("../../../app/services/subscriptions/bundle-entitlement-gate.server", () => {
  const actual = jest.requireActual(
    "../../../app/services/subscriptions/bundle-entitlement-gate.server"
  );
  return {
    ...actual,
    updateBundleWithPublicationGate: jest.fn((input) =>
      input.database.bundle.update({
        where: { id: input.bundleId, shopId: input.shopDomain },
        data: input.data,
      })
    ),
  };
});

jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server", () => ({
  updateSyncMetafields: jest.fn().mockResolvedValue(undefined),
}));

const mockResolveShopEntitlements = resolveShopEntitlements as jest.MockedFunction<
  typeof resolveShopEntitlements
>;

const mockAdmin = {} as any;
const mockSession = { shop: "test-shop.myshopify.com" } as any;

describe("handleUpdateBundleDesignTemplate - Entitlement Gating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const freeEntitlements = {
    planCode: "FREE" as const,
    billingInterval: "NONE" as const,
    limits: { publicBundles: 1, enabledSteps: 2 },
    capabilities: {
      premiumTemplates: false,
      advancedDesign: false,
      advancedAnalytics: false,
      prioritySupport: false,
      unlimitedDrafts: true as const,
    },
  };

  const growthEntitlements = {
    planCode: "GROWTH" as const,
    billingInterval: "MONTHLY" as const,
    limits: { publicBundles: null, enabledSteps: null },
    capabilities: {
      premiumTemplates: true,
      advancedDesign: true,
      advancedAnalytics: true,
      prioritySupport: true,
      unlimitedDrafts: true as const,
    },
  };

  function makeEntitlementContext(entitlements: typeof freeEntitlements | typeof growthEntitlements) {
    return {
      shopDomain: "test-shop.myshopify.com",
      shopId: "shop-1",
      planCode: entitlements.planCode,
      billingInterval: entitlements.billingInterval,
      status: "ACTIVE" as const,
      provider: "SHOPIFY_APP_PRICING" as const,
      verifiedAt: new Date(),
      isOutageGrace: false,
      entitlements,
    };
  }

  describe("PPB handleUpdateBundleDesignTemplate", () => {
    it("rejects non-standard PPB template (GRID) on Free plan with 403", async () => {
      mockResolveShopEntitlements.mockResolvedValueOnce(
        makeEntitlementContext(freeEntitlements)
      );

      const formData = new FormData();
      formData.append("bundleDesignPresetId", "GRID");
      formData.append("bundleDesignTemplate", "PDP_INPAGE");

      const response = await handlePpbUpdateTemplate(
        mockAdmin,
        mockSession,
        "bundle-1",
        formData
      );

      expect(response.status).toBe(403);
      const json = (await response.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toContain("Growth");
      expect(json.entitlementFailure).toEqual(
        expect.objectContaining({
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "bundle.template.premium",
        })
      );
      expect(db.bundle.update).not.toHaveBeenCalled();
    });

    it("allows standard PPB template (LIST) on Free plan", async () => {
      mockResolveShopEntitlements.mockResolvedValueOnce(
        makeEntitlementContext(freeEntitlements)
      );

      (db.bundle.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "bundle-1",
        shopId: "test-shop.myshopify.com",
        status: "draft",
        steps: [],
      });

      (db.bundle.update as jest.Mock).mockResolvedValueOnce({
        id: "bundle-1",
        shopifyProductId: null,
      });

      const formData = new FormData();
      formData.append("bundleDesignPresetId", "LIST");
      formData.append("bundleDesignTemplate", "PDP_INPAGE");

      const response = await handlePpbUpdateTemplate(
        mockAdmin,
        mockSession,
        "bundle-1",
        formData
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
    });

    it("allows non-standard PPB template (GRID) on Growth plan", async () => {
      mockResolveShopEntitlements.mockResolvedValueOnce(
        makeEntitlementContext(growthEntitlements)
      );

      (db.bundle.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "bundle-1",
        shopId: "test-shop.myshopify.com",
        status: "draft",
        steps: [],
      });

      (db.bundle.update as jest.Mock).mockResolvedValueOnce({
        id: "bundle-1",
        shopifyProductId: null,
      });

      const formData = new FormData();
      formData.append("bundleDesignPresetId", "GRID");
      formData.append("bundleDesignTemplate", "PDP_INPAGE");

      const response = await handlePpbUpdateTemplate(
        mockAdmin,
        mockSession,
        "bundle-1",
        formData
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
    });
  });

  describe("FPB handleUpdateBundleDesignTemplate", () => {
    it("rejects non-standard FPB template (CLASSIC) on Free plan with 403", async () => {
      mockResolveShopEntitlements.mockResolvedValueOnce(
        makeEntitlementContext(freeEntitlements)
      );

      const formData = new FormData();
      formData.append("bundleDesignPresetId", "CLASSIC");
      formData.append("bundleDesignTemplate", "FBP_SIDE_FOOTER");

      const response = await handleFpbUpdateTemplate(
        mockAdmin,
        mockSession,
        "bundle-1",
        formData
      );

      expect(response.status).toBe(403);
      const json = (await response.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toContain("Growth");
      expect(json.entitlementFailure).toEqual(
        expect.objectContaining({
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "bundle.template.premium",
        })
      );
      expect(db.bundle.update).not.toHaveBeenCalled();
    });

    it("allows standard FPB template (STANDARD) on Free plan", async () => {
      mockResolveShopEntitlements.mockResolvedValueOnce(
        makeEntitlementContext(freeEntitlements)
      );

      (db.bundle.update as jest.Mock).mockResolvedValueOnce({
        id: "bundle-1",
      });

      const formData = new FormData();
      formData.append("bundleDesignPresetId", "STANDARD");
      formData.append("bundleDesignTemplate", "FBP_SIDE_FOOTER");

      const response = await handleFpbUpdateTemplate(
        mockAdmin,
        mockSession,
        "bundle-1",
        formData
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(db.bundle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "bundle-1", shopId: "test-shop.myshopify.com" },
          data: {
            bundleDesignPresetId: "STANDARD",
            bundleDesignTemplate: "FBP_SIDE_FOOTER",
          },
        })
      );
    });

    it("allows non-standard FPB template (COMPACT) on Growth plan", async () => {
      mockResolveShopEntitlements.mockResolvedValueOnce(
        makeEntitlementContext(growthEntitlements)
      );

      (db.bundle.update as jest.Mock).mockResolvedValueOnce({
        id: "bundle-1",
      });

      const formData = new FormData();
      formData.append("bundleDesignPresetId", "COMPACT");
      formData.append("bundleDesignTemplate", "FBP_SIDE_FOOTER");

      const response = await handleFpbUpdateTemplate(
        mockAdmin,
        mockSession,
        "bundle-1",
        formData
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
    });
  });
});
