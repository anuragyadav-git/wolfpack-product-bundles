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
import { resolveTemplateReadyStep } from "../../../lib/template-ready-step";

export function usePpbModalAndTemplateController({
  base,
  display,
  templateState,
  placement,
  previewReadiness,
  saveHandlers,
}: {
  base: any;
  display: any;
  templateState: any;
  placement: any;
  previewReadiness: any;
  saveHandlers: any;
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
    display.isProgressBarMultiLangModalOpen
      ? showPolarisModal(display.progressBarMultiLangModalRef)
      : hidePolarisModal(display.progressBarMultiLangModalRef);
  }, [
    display.isProgressBarMultiLangModalOpen,
    display.progressBarMultiLangModalRef,
  ]);
  useEffect(() => {
    display.isBundleQuantityMultiLangModalOpen
      ? showPolarisModal(display.bundleQuantityMultiLangModalRef)
      : hidePolarisModal(display.bundleQuantityMultiLangModalRef);
  }, [
    display.bundleQuantityMultiLangModalRef,
    display.isBundleQuantityMultiLangModalOpen,
  ]);
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
  useModalHideListener(display.progressBarMultiLangModalRef, () =>
    display.setIsProgressBarMultiLangModalOpen(false)
  );
  useModalHideListener(display.bundleQuantityMultiLangModalRef, () =>
    display.setIsBundleQuantityMultiLangModalOpen(false)
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
    void base.shopify.saveBar.leaveConfirmation().then(() =>
      base.navigate(PPB_DESIGN_CONTROL_PANEL_URL)
    );
  }, [base]);
  const handleTemplateNext = useCallback(() => {
    if (
      !templateState.pendingDesignTemplate ||
      !templateState.pendingDesignPresetId
    ) {
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
    templateState.setTemplateModalStep(
      resolveTemplateReadyStep(base.appEmbedEnabled),
    );
  }, [base.appEmbedEnabled, templateState]);
  const handleTemplatePreview = useCallback(() => {
    const previewStarted = previewReadiness.handlePreviewBundle();
    if (previewStarted instanceof Promise) {
      void previewStarted.then((started: boolean) => {
        if (started) {
          window.setTimeout(closeSelectTemplateDialog, 500);
        }
      });
      return;
    }
    if (previewStarted) {
      window.setTimeout(closeSelectTemplateDialog, 500);
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
