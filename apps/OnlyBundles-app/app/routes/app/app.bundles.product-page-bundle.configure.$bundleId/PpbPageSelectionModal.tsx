import { useEffect, useRef, type ElementRef } from "react";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";
import { translateAdmin } from "~/i18n/config";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

const PPB_PAGE_SELECTION_MODAL_ID = "ppb-page-selection-modal";
type PolarisModalElement = ElementRef<"s-modal">;

export function dismissPpbPageSelectionModal(
  modalRef: { current: { hideOverlay?: () => void } | null },
  closePageSelectionModal: () => void
): void {
  hidePolarisModal(modalRef);
  closePageSelectionModal();
}

export type PpbPageSelectionModalProps = Pick<
  PpbConfigureFlow,
  | "availablePages"
  | "closePageSelectionModal"
  | "handlePageSelection"
  | "isPageSelectionModalOpen"
>;

export function PpbPageSelectionModal({
  availablePages,
  closePageSelectionModal,
  handlePageSelection,
  isPageSelectionModalOpen,
}: PpbPageSelectionModalProps) {
  const modalRef = useRef<PolarisModalElement | null>(null);

  useEffect(() => {
    isPageSelectionModalOpen
      ? showPolarisModal(modalRef)
      : hidePolarisModal(modalRef);
  }, [isPageSelectionModalOpen]);
  useModalHideListener(modalRef, closePageSelectionModal);

  return (
    <s-modal
      id={PPB_PAGE_SELECTION_MODAL_ID}
      ref={modalRef}
      heading={translateAdmin("adminAttributes.selectProductPageTemplate")}
      size="base"
    >
      <s-button
        slot="secondary-actions"
        commandFor={PPB_PAGE_SELECTION_MODAL_ID}
        command="--hide"
      >
        {translateAdmin("dashboard.deleteModal.cancel")}
      </s-button>
      {availablePages.length > 0 ? (
        <s-stack direction="block" gap="small">
          {availablePages.map(
            (template: { id?: string; handle?: string; title?: string }) => (
              <s-button
                key={template.id ?? template.handle ?? template.title}
                variant="secondary"
                icon="theme-template"
                onClick={() => {
                  dismissPpbPageSelectionModal(
                    modalRef,
                    closePageSelectionModal
                  );
                  void handlePageSelection(template);
                }}
              >
                {template.title}
              </s-button>
            )
          )}
        </s-stack>
      ) : (
        <s-stack direction="block" gap="base" alignItems="center">
          <s-text color="subdued">
            {translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbpageselectionmodal.noTemplatesAvailable"
            )}
          </s-text>
          <s-button
            icon="page-add"
            href="https://admin.shopify.com/admin/pages"
            target="_blank"
          >
            {translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbpageselectionmodal.createPage"
            )}
          </s-button>
        </s-stack>
      )}
    </s-modal>
  );
}
