/**
 * Unit tests -- Automatic select template modal closing and transition to regular upgrade modal
 */

import React from "react";
import { usePpbModalAndTemplateController } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbModalAndTemplateController";
import { usePpbFetcherEffects } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbFetcherEffects";
import { useConfigureTemplatePricingController } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureTemplatePricingController";

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({
    toast: { show: jest.fn() },
    saveBar: { leaveConfirmation: jest.fn() },
  }),
}));

// Mock React hooks to execute hook logic synchronously in unit tests
let effectCallbacks: (() => void)[] = [];
jest.spyOn(React, "useCallback").mockImplementation(((fn: any) => fn) as any);
jest.spyOn(React, "useRef").mockImplementation(((init: any) => ({ current: init })) as any);
jest.spyOn(React, "useState").mockImplementation(((init: any) => [init, jest.fn()]) as any);
jest.spyOn(React, "useMemo").mockImplementation(((fn: any) => fn()) as any);
jest.spyOn(React, "useEffect").mockImplementation(((fn: any) => {
  effectCallbacks.push(fn);
}) as any);

describe("Template Modal Entitlement Redirection", () => {
  beforeEach(() => {
    effectCallbacks = [];
    jest.clearAllMocks();
  });

  describe("PPB handleTemplateNext Client Guard", () => {
    it("closes select template modal and opens upgrade modal when next is clicked on a gated template on Free plan", () => {
      const setIsSelectTemplateModalOpen = jest.fn();
      const setTemplateSaveError = jest.fn();
      const setEntitlementFailure = jest.fn();
      const submit = jest.fn();

      const controller = usePpbModalAndTemplateController({
        base: {
          isCollectionsModalOpen: false,
          isProductsModalOpen: false,
          navigate: jest.fn(),
          shopify: {} as any,
          setEntitlementFailure,
          isFreePlan: true,
        } as any,
        display: {
          discountVariablesModalRef: { current: null },
          isDiscountVariablesModalOpen: false,
          setIsDiscountVariablesModalOpen: jest.fn(),
        } as any,
        templateState: {
          bundleDesignPresetId: "LIST",
          bundleDesignTemplate: "PDP_INPAGE",
          pendingDesignPresetId: "GRID", // Gated template on Free plan
          pendingDesignTemplate: "PDP_INPAGE",
          isSyncModalOpen: false,
          lastTemplateRequestRef: { current: null },
          lastTemplateResponseRef: { current: null },
          selectTemplateOpenButtonRef: { current: null },
          setIsSelectTemplateModalOpen,
          setIsSyncModalOpen: jest.fn(),
          setPendingDesignPresetId: jest.fn(),
          setPendingDesignTemplate: jest.fn(),
          setTemplateModalStep: jest.fn(),
          setTemplateSaveError,
          templateFetcher: { submit } as any,
          templateSubmissionStartedRef: { current: false },
        } as any,
        placement: {
          handleCloseCollectionsModal: jest.fn(),
          handleCloseProductsModal: jest.fn(),
        } as any,
        previewReadiness: { handlePreviewBundle: jest.fn() } as any,
        saveHandlers: { handleDiscard: jest.fn() } as any,
      });

      controller.handleTemplateNext();

      expect(setIsSelectTemplateModalOpen).toHaveBeenCalledWith(false);
      expect(setEntitlementFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "bundle.template.premium",
          requiredPlan: "GROWTH",
        })
      );
      expect(setTemplateSaveError).toHaveBeenCalledWith(null);
      expect(submit).not.toHaveBeenCalled();
    });

    it("submits template fetcher normally when next is clicked on the standard template on Free plan", () => {
      const setIsSelectTemplateModalOpen = jest.fn();
      const setEntitlementFailure = jest.fn();
      const submit = jest.fn();

      const controller = usePpbModalAndTemplateController({
        base: {
          isCollectionsModalOpen: false,
          isProductsModalOpen: false,
          navigate: jest.fn(),
          shopify: {} as any,
          setEntitlementFailure,
          isFreePlan: true,
        } as any,
        display: {
          discountVariablesModalRef: { current: null },
          isDiscountVariablesModalOpen: false,
          setIsDiscountVariablesModalOpen: jest.fn(),
        } as any,
        templateState: {
          bundleDesignPresetId: "LIST",
          bundleDesignTemplate: "PDP_INPAGE",
          pendingDesignPresetId: "LIST", // Standard template allowed on Free plan
          pendingDesignTemplate: "PDP_INPAGE",
          isSyncModalOpen: false,
          lastTemplateRequestRef: { current: null },
          lastTemplateResponseRef: { current: null },
          selectTemplateOpenButtonRef: { current: null },
          setIsSelectTemplateModalOpen,
          setIsSyncModalOpen: jest.fn(),
          setPendingDesignPresetId: jest.fn(),
          setPendingDesignTemplate: jest.fn(),
          setTemplateModalStep: jest.fn(),
          setTemplateSaveError: jest.fn(),
          templateFetcher: { submit } as any,
          templateSubmissionStartedRef: { current: false },
        } as any,
        placement: {
          handleCloseCollectionsModal: jest.fn(),
          handleCloseProductsModal: jest.fn(),
        } as any,
        previewReadiness: { handlePreviewBundle: jest.fn() } as any,
        saveHandlers: { handleDiscard: jest.fn() } as any,
      });

      controller.handleTemplateNext();

      expect(setIsSelectTemplateModalOpen).not.toHaveBeenCalledWith(false);
      expect(setEntitlementFailure).not.toHaveBeenCalled();
      expect(submit).toHaveBeenCalled();
    });
  });

  describe("PPB usePpbFetcherEffects Server Response Guard", () => {
    it("closes template modal and opens upgrade modal when server responds with 403 entitlement failure", () => {
      const setIsSelectTemplateModalOpen = jest.fn();
      const setTemplateSaveError = jest.fn();
      const setEntitlementFailure = jest.fn();

      const failurePayload = {
        code: "ENTITLEMENT_REQUIRED",
        entitlement: "bundle.template.premium",
        requiredPlan: "GROWTH",
        remediation: "UPGRADE",
      };

      const templateState = {
        lastTemplateRequestRef: { current: { template: "PDP_INPAGE", presetId: "GRID" } },
        lastTemplateResponseRef: { current: null },
        pendingPlacementModalRef: { current: false },
        setBundleDesignPresetId: jest.fn(),
        setBundleDesignTemplate: jest.fn(),
        setIsPreparingPlacementTemplates: jest.fn(),
        setTemplateModalStep: jest.fn(),
        setTemplateSaveError,
        setIsSelectTemplateModalOpen,
        templateFetcher: {
          state: "idle",
          data: {
            success: false,
            error: "The selected template requires the Growth plan.",
            entitlementFailure: failurePayload,
          },
        } as any,
        templateSubmissionStartedRef: { current: true },
      };

      usePpbFetcherEffects({
        base: {
          fetcher: { data: null, state: "idle" } as any,
          lastProcessedFetcherDataRef: { current: null },
          setEntitlementFailure,
          setOperationAlert: jest.fn(),
          shopify: { toast: { show: jest.fn() } } as any,
        } as any,
        templateState,
        visibility: {} as any,
        settings: {} as any,
        sharedHandlers: {} as any,
        saveHandlers: {} as any,
      });

      // Execute registered effects
      for (const cb of effectCallbacks) {
        cb();
      }

      expect(setIsSelectTemplateModalOpen).toHaveBeenCalledWith(false);
      expect(setEntitlementFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "bundle.template.premium",
        })
      );
      expect(setTemplateSaveError).toHaveBeenCalledWith(null);
    });
  });

  describe("FPB handleTemplateNext Client Guard & Server Response Guard", () => {
    it("closes template modal and opens upgrade modal when Next is clicked on a gated template in FPB on Free plan", () => {
      const setIsSelectTemplateModalOpen = jest.fn();
      const setTemplateSaveError = jest.fn();
      const setEntitlementFailure = jest.fn();
      const submit = jest.fn();

      const controller = useConfigureTemplatePricingController({
        appEmbedEnabled: true,
        bundle: { id: "bundle-1" } as any,
        bundleDesignPresetId: "STANDARD",
        bundleDesignTemplate: "FBP_SIDE_FOOTER",
        conditionsState: {} as any,
        formState: {} as any,
        hasPreview: true,
        lastTemplateRequestRef: { current: null },
        lastTemplateResponseRef: { current: null },
        loadedBundleProduct: null,
        navigate: jest.fn(),
        pendingDesignPresetId: "CLASSIC", // Gated template in FPB
        pendingDesignTemplate: "FBP_SIDE_FOOTER",
        pricingState: {
          discountRules: [],
          pricingDisplayOptions: { bundleQuantityOptions: { enabled: false } },
        } as any,
        productStatus: "active",
        ruleMessages: {} as any,
        savedBundleUpsellConfig: null,
        selectTemplateOpenButtonRef: { current: null },
        setBundleDesignPresetId: jest.fn(),
        setBundleDesignTemplate: jest.fn(),
        setIsSelectTemplateModalOpen,
        setPendingDesignPresetId: jest.fn(),
        setPendingDesignTemplate: jest.fn(),
        setTemplateModalStep: jest.fn(),
        setTemplateSaveError,
        setEntitlementFailure,
        isFreePlan: true,
        stepsState: { steps: [] } as any,
        templateFetcher: { submit, state: "idle" } as any,
        templateSubmissionStartedRef: { current: false },
        textOverridesByLocale: {},
      } as any);

      controller.handleTemplateNext();

      expect(setIsSelectTemplateModalOpen).toHaveBeenCalledWith(false);
      expect(setEntitlementFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "bundle.template.premium",
          requiredPlan: "GROWTH",
        })
      );
      expect(setTemplateSaveError).toHaveBeenCalledWith(null);
      expect(submit).not.toHaveBeenCalled();
    });

    it("closes template modal and opens upgrade modal when FPB template fetcher responds with entitlement failure", () => {
      const setIsSelectTemplateModalOpen = jest.fn();
      const setTemplateSaveError = jest.fn();
      const setEntitlementFailure = jest.fn();

      const failurePayload = {
        code: "ENTITLEMENT_REQUIRED",
        entitlement: "bundle.template.premium",
        requiredPlan: "GROWTH",
        remediation: "UPGRADE",
      };

      useConfigureTemplatePricingController({
        appEmbedEnabled: true,
        bundle: { id: "bundle-1" } as any,
        bundleDesignPresetId: "STANDARD",
        bundleDesignTemplate: "FBP_SIDE_FOOTER",
        conditionsState: {} as any,
        formState: {} as any,
        hasPreview: true,
        lastTemplateRequestRef: { current: { template: "FBP_SIDE_FOOTER", presetId: "CLASSIC" } },
        lastTemplateResponseRef: { current: null },
        loadedBundleProduct: null,
        navigate: jest.fn(),
        pendingDesignPresetId: "CLASSIC",
        pendingDesignTemplate: "FBP_SIDE_FOOTER",
        pricingState: {
          discountRules: [],
          pricingDisplayOptions: { bundleQuantityOptions: { enabled: false } },
        } as any,
        productStatus: "active",
        ruleMessages: {} as any,
        savedBundleUpsellConfig: null,
        selectTemplateOpenButtonRef: { current: null },
        setBundleDesignPresetId: jest.fn(),
        setBundleDesignTemplate: jest.fn(),
        setIsSelectTemplateModalOpen,
        setPendingDesignPresetId: jest.fn(),
        setPendingDesignTemplate: jest.fn(),
        setTemplateModalStep: jest.fn(),
        setTemplateSaveError,
        setEntitlementFailure,
        isFreePlan: true,
        stepsState: { steps: [] } as any,
        templateFetcher: {
          state: "idle",
          data: {
            success: false,
            error: "The selected template requires the Growth plan.",
            entitlementFailure: failurePayload,
          },
        } as any,
        templateSubmissionStartedRef: { current: true },
        textOverridesByLocale: {},
      } as any);

      // Execute registered effects
      for (const cb of effectCallbacks) {
        cb();
      }

      expect(setIsSelectTemplateModalOpen).toHaveBeenCalledWith(false);
      expect(setEntitlementFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "ENTITLEMENT_REQUIRED",
          entitlement: "bundle.template.premium",
        })
      );
      expect(setTemplateSaveError).toHaveBeenCalledWith(null);
    });
  });
});
