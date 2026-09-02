import { useEffect, useRef } from "react";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

const PPB_PAGE_SELECTION_MODAL_ID = "ppb-page-selection-modal";

export function dismissPpbPageSelectionModal(
  modalRef: { current: { hideOverlay?: () => void } | null },
  closePageSelectionModal: () => void
): void {
  hidePolarisModal(modalRef);
  closePageSelectionModal();
}

export function PpbPageSelectionModal() {
  const {
    availablePages,
    closePageSelectionModal,
    handlePageSelection,
    isPageSelectionModalOpen,
  } = usePpbConfigureContext();
  const modalRef = useRef<any>(null);

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
                inlineSize="fill"
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
