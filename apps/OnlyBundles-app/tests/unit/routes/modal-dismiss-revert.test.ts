/**
 * Unit tests -- Entitlement modal dismiss revert behavior for PPB and FPB
 */

import React from "react";
import { usePpbSaveHandlers } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbSaveHandlers";
import { useConfigureSaveController } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureSaveController";
import { BundleStatus } from "../../../app/constants/bundle";

// Mock React hooks so we can call the custom hooks directly
jest.spyOn(React, "useCallback").mockImplementation(((fn: any) => fn) as any);
jest.spyOn(React, "useRef").mockImplementation(((init: any) => ({ current: init })) as any);
jest.spyOn(React, "useState").mockImplementation(((init: any) => [init, jest.fn()]) as any);
jest.spyOn(React, "useMemo").mockImplementation(((fn: any) => fn()) as any);
jest.spyOn(React, "useEffect").mockImplementation((() => {}) as any);

describe("Modal Dismiss Revert Behavior", () => {
  describe("PPB handleDismissEntitlementModal", () => {
    it("reverts status to original draft when public bundle limit modal is dismissed", () => {
      const setBundleStatus = jest.fn();
      const clearEntitlementFailure = jest.fn();

      const base = {
        entitlementFailure: {
          code: "LIMIT_REACHED",
          entitlement: "bundle.public.limit",
          requiredPlan: "GROWTH",
          remediation: "EDIT_CONFIGURATION",
        },
        originalValuesRef: {
          current: {
            status: BundleStatus.DRAFT,
          },
        },
        formState: {
          bundleStatus: BundleStatus.ACTIVE,
          setBundleStatus,
        },
        clearEntitlementFailure,
        stepsState: { setSteps: jest.fn() },
      } as any;

      const handlers = usePpbSaveHandlers({
        base,
        visibility: {} as any,
        display: {} as any,
        settings: {} as any,
        templateState: {} as any,
        categoryHandlers: {} as any,
      });

      handlers.handleDismissEntitlementModal();

      expect(setBundleStatus).toHaveBeenCalledWith(BundleStatus.DRAFT);
      expect(clearEntitlementFailure).toHaveBeenCalled();
    });

    it("reverts status to DRAFT if original was ACTIVE but shop exceeds limit", () => {
      const setBundleStatus = jest.fn();
      const clearEntitlementFailure = jest.fn();

      const base = {
        entitlementFailure: {
          code: "LIMIT_REACHED",
          entitlement: "bundle.public.limit",
          requiredPlan: "GROWTH",
          remediation: "EDIT_CONFIGURATION",
        },
        originalValuesRef: {
          current: {
            status: BundleStatus.ACTIVE,
          },
        },
        formState: {
          bundleStatus: BundleStatus.ACTIVE,
          setBundleStatus,
        },
        clearEntitlementFailure,
        stepsState: { setSteps: jest.fn() },
      } as any;

      const handlers = usePpbSaveHandlers({
        base,
        visibility: {} as any,
        display: {} as any,
        settings: {} as any,
        templateState: {} as any,
        categoryHandlers: {} as any,
      });

      handlers.handleDismissEntitlementModal();

      expect(setBundleStatus).toHaveBeenCalledWith(BundleStatus.DRAFT);
      expect(clearEntitlementFailure).toHaveBeenCalled();
    });

    it("restores original steps when step limit modal is dismissed", () => {
      const setSteps = jest.fn();
      const clearEntitlementFailure = jest.fn();
      const originalSteps = [{ id: "step-1", name: "Step 1" }];

      const base = {
        entitlementFailure: {
          code: "LIMIT_REACHED",
          entitlement: "bundle.steps.limit",
          requiredPlan: "GROWTH",
          remediation: "EDIT_CONFIGURATION",
        },
        originalValuesRef: {
          current: {
            status: BundleStatus.DRAFT,
            steps: JSON.stringify(originalSteps),
          },
        },
        formState: {
          bundleStatus: BundleStatus.DRAFT,
          setBundleStatus: jest.fn(),
        },
        clearEntitlementFailure,
        stepsState: { setSteps },
      } as any;

      const handlers = usePpbSaveHandlers({
        base,
        visibility: {} as any,
        display: {} as any,
        settings: {} as any,
        templateState: {} as any,
        categoryHandlers: {} as any,
      });

      handlers.handleDismissEntitlementModal();

      expect(setSteps).toHaveBeenCalledWith(originalSteps);
      expect(clearEntitlementFailure).toHaveBeenCalled();
    });
  });

  describe("FPB handleDismissEntitlementModal", () => {
    it("reverts status to original draft when public bundle limit modal is dismissed in FPB", () => {
      const setBundleStatus = jest.fn();
      const clearEntitlementFailure = jest.fn();

      const flow = {
        entitlementFailure: {
          code: "LIMIT_REACHED",
          entitlement: "bundle.public.limit",
          requiredPlan: "GROWTH",
          remediation: "EDIT_CONFIGURATION",
        },
        originalValuesRef: {
          current: {
            status: BundleStatus.DRAFT,
          },
        },
        formState: {
          bundleStatus: BundleStatus.ACTIVE,
          setBundleStatus,
        },
        clearEntitlementFailure,
        stepsState: { setSteps: jest.fn() },
        hookHandleDiscard: jest.fn(),
        setPromoBannerBgImage: jest.fn(),
        originalPromoBannerBgImageRef: { current: null },
      } as any;

      const handlers = useConfigureSaveController(flow);

      handlers.handleDismissEntitlementModal();

      expect(setBundleStatus).toHaveBeenCalledWith(BundleStatus.DRAFT);
      expect(clearEntitlementFailure).toHaveBeenCalled();
    });

    it("restores original steps when step limit modal is dismissed in FPB", () => {
      const setSteps = jest.fn();
      const clearEntitlementFailure = jest.fn();
      const originalSteps = [{ id: "step-1", name: "Step 1" }];

      const flow = {
        entitlementFailure: {
          code: "LIMIT_REACHED",
          entitlement: "bundle.steps.limit",
          requiredPlan: "GROWTH",
          remediation: "EDIT_CONFIGURATION",
        },
        originalValuesRef: {
          current: {
            status: BundleStatus.DRAFT,
            steps: JSON.stringify(originalSteps),
          },
        },
        formState: {
          bundleStatus: BundleStatus.DRAFT,
          setBundleStatus: jest.fn(),
        },
        clearEntitlementFailure,
        stepsState: { setSteps },
        hookHandleDiscard: jest.fn(),
        setPromoBannerBgImage: jest.fn(),
        originalPromoBannerBgImageRef: { current: null },
      } as any;

      const handlers = useConfigureSaveController(flow);

      handlers.handleDismissEntitlementModal();

      expect(setSteps).toHaveBeenCalledWith(originalSteps);
      expect(clearEntitlementFailure).toHaveBeenCalled();
    });
  });
});
