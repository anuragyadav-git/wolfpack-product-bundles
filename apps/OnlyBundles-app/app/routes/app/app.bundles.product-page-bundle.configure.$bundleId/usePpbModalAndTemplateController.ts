import { useCallback, useEffect, useRef, useState } from "react";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";
import {
  PPB_DESIGN_CONTROL_PANEL_URL,
  resolveProductPageTemplateSelection,
} from "./ConfigureBundleFlow.helpers";
import type { usePpbBaseConfigureState } from "./usePpbBaseConfigureState";
import type { usePpbDisplayOptionsState } from "./usePpbDisplayOptionsState";
import type { usePpbTemplateUiState } from "./usePpbTemplateUiState";
import type { usePpbPlacementHandlers } from "./usePpbPlacementHandlers";
import type { usePpbPreviewReadinessHandlers } from "./usePpbPreviewReadinessHandlers";
import type { usePpbSaveHandlers } from "./usePpbSaveHandlers";
import { navigateWithSaveBarConfirmation } from "../../../lib/admin-unsaved-navigation";
import { isFreeTemplate } from "../../../lib/subscriptions/entitlements";

export function usePpbModalAndTemplateController({
  base,
  display,
  templateState,
  placement,
  previewReadiness,
  saveHandlers,
}: {
  base: Pick<ReturnType<typeof usePpbBaseConfigureState>,
    "isCollectionsModalOpen" | "isProductsModalOpen" | "navigate" | "shopify" | "setEntitlementFailure"
  > & {
    isFreePlan?: boolean;
  };
  display: Pick<ReturnType<typeof usePpbDisplayOptionsState>,
    "discountVariablesModalRef" | "isDiscountVariablesModalOpen" | "setIsDiscountVariablesModalOpen"
  >;
  templateState: Pick<ReturnType<typeof usePpbTemplateUiState>,
    | "bundleDesignPresetId" | "bundleDesignTemplate" | "isSyncModalOpen"
    | "lastTemplateRequestRef" | "lastTemplateResponseRef" | "pendingDesignPresetId"
    | "pendingDesignTemplate" | "selectTemplateOpenButtonRef" | "setIsSelectTemplateModalOpen"
    | "setIsSyncModalOpen" | "setPendingDesignPresetId" | "setPendingDesignTemplate"
    | "setTemplateModalStep" | "setTemplateSaveError" | "templateFetcher"
    | "templateSubmissionStartedRef"
  >;
  placement: Pick<ReturnType<typeof usePpbPlacementHandlers>,
    "handleCloseCollectionsModal" | "handleCloseProductsModal"
  >;
  previewReadiness: Pick<ReturnType<typeof usePpbPreviewReadinessHandlers>, "handlePreviewBundle">;
  saveHandlers: Pick<ReturnType<typeof usePpbSaveHandlers>, "handleDiscard">;
}) {
  const syncModalRef = useRef<any>(null);
  const productsModalRef = useRef<any>(null);
  const collectionsModalRef = useRef<any>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    templateState.isSyncModalOpen
      ? showPolarisModal(syncModalRef)
      : hidePolarisModal(syncModalRef);
  }, [templateState.isSyncModalOpen]);
  useEffect(() => {
    base.isProductsModalOpen
      ? showPolarisModal(productsModalRef)
      : hidePolarisModal(productsModalRef);
  }, [base.isProductsModalOpen]);
  useEffect(() => {
    base.isCollectionsModalOpen
      ? showPolarisModal(collectionsModalRef)
      : hidePolarisModal(collectionsModalRef);
  }, [base.isCollectionsModalOpen]);
  useEffect(() => {
    display.isDiscountVariablesModalOpen
      ? showPolarisModal(display.discountVariablesModalRef)
      : hidePolarisModal(display.discountVariablesModalRef);
  }, [display.discountVariablesModalRef, display.isDiscountVariablesModalOpen]);
  useModalHideListener(syncModalRef, () =>
    templateState.setIsSyncModalOpen(false)
  );
  useModalHideListener(productsModalRef, placement.handleCloseProductsModal);
  useModalHideListener(
    collectionsModalRef,
    placement.handleCloseCollectionsModal
  );
  useModalHideListener(display.discountVariablesModalRef, () =>
    display.setIsDiscountVariablesModalOpen(false)
  );
  const closeDiscardModal = useCallback(() => {
    setShowDiscardModal(false);
  }, []);
  const resetSelectTemplateDialog = useCallback(() => {
    templateState.setIsSelectTemplateModalOpen(false);
    templateState.setTemplateModalStep("templates");
    templateState.setTemplateSaveError(null);
    templateState.lastTemplateRequestRef.current = null;
    templateState.lastTemplateResponseRef.current = null;
    templateState.templateSubmissionStartedRef.current = false;
    requestAnimationFrame(() => {
      templateState.selectTemplateOpenButtonRef.current?.focus();
    });
  }, [templateState]);
  const closeSelectTemplateDialog = useCallback(() => {
    resetSelectTemplateDialog();
  }, [resetSelectTemplateDialog]);
  const openSelectTemplateModal = useCallback(() => {
    const selectedTemplate = resolveProductPageTemplateSelection({
      bundleDesignTemplate: templateState.bundleDesignTemplate,
      bundleDesignPresetId: templateState.bundleDesignPresetId,
    });
    templateState.setPendingDesignTemplate(selectedTemplate.layoutTemplate);
    templateState.setPendingDesignPresetId(selectedTemplate.presetId);
    templateState.setTemplateModalStep("templates");
    templateState.setTemplateSaveError(null);
    templateState.lastTemplateRequestRef.current = null;
    templateState.lastTemplateResponseRef.current = null;
    templateState.templateSubmissionStartedRef.current = false;
    templateState.setIsSelectTemplateModalOpen(true);
  }, [templateState]);
  const openDesignControlPanel = useCallback(() => {
    void navigateWithSaveBarConfirmation(
      () => base.shopify.saveBar.leaveConfirmation(),
      () => base.navigate(PPB_DESIGN_CONTROL_PANEL_URL),
    );
  }, [base]);
  const handleTemplateNext = useCallback(() => {
    if (
      !templateState.pendingDesignTemplate ||
      !templateState.pendingDesignPresetId
    ) {
      return;
    }
    if (
      base.isFreePlan &&
      !isFreeTemplate({
        bundleType: "PRODUCT_PAGE",
        designTemplate: templateState.pendingDesignTemplate,
        designPresetId: templateState.pendingDesignPresetId,
      })
    ) {
      templateState.setTemplateSaveError(null);
      templateState.setIsSelectTemplateModalOpen(false);
      base.setEntitlementFailure({
        code: "ENTITLEMENT_REQUIRED",
        entitlement: "bundle.template.premium",
        requiredPlan: "GROWTH",
      });
      return;
    }
    templateState.setTemplateSaveError(null);
    templateState.lastTemplateRequestRef.current = {
      template: templateState.pendingDesignTemplate,
      presetId: templateState.pendingDesignPresetId,
    };
    templateState.lastTemplateResponseRef.current = null;
    templateState.templateSubmissionStartedRef.current = false;
    const fd = new FormData();
    fd.append("intent", "updateBundleDesignTemplate");
    fd.append(
      "bundleDesignTemplate",
      templateState.pendingDesignTemplate ?? ""
    );
    fd.append(
      "bundleDesignPresetId",
      templateState.pendingDesignPresetId ?? ""
    );
    templateState.templateFetcher.submit(fd, { method: "POST" });
  }, [base, templateState]);
  const handleTemplatePreview = useCallback((
    onPreviewOpened?: (previewUrl: string) => void,
  ) => {
    const previewStarted = previewReadiness.handlePreviewBundle();
    if (previewStarted instanceof Promise) {
      void previewStarted.then((previewUrl: string | false) => {
        if (previewUrl) {
          window.setTimeout(() => {
            closeSelectTemplateDialog();
            onPreviewOpened?.(previewUrl);
          }, 500);
        }
      });
      return;
    }
    if (previewStarted) {
      window.setTimeout(() => {
        closeSelectTemplateDialog();
        onPreviewOpened?.(previewStarted);
      }, 500);
    }
  }, [closeSelectTemplateDialog, previewReadiness]);
  const handleConfirmDiscard = useCallback(() => {
    closeDiscardModal();
    saveHandlers.handleDiscard();
  }, [closeDiscardModal, saveHandlers]);

  return {
    syncModalRef,
    productsModalRef,
    collectionsModalRef,
    showDiscardModal,
    setShowDiscardModal,
    closeDiscardModal,
    closeSelectTemplateDialog,
    openSelectTemplateModal,
    openDesignControlPanel,
    handleTemplateNext,
    handleTemplatePreview,
    handleConfirmDiscard,
  };
}
