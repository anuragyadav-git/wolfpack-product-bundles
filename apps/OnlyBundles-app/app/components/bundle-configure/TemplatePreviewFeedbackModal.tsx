import { useEffect, useRef } from "react";
import { openSupportChatWithMessage } from "../../lib/support-chat.client";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../../routes/app/_shared/bundle-configure/modal-utils";
import { translateAdmin } from "~/i18n/config";

export function buildTemplatePreviewSupportMessage(previewUrl: string): string {
  return `Having issues seeing the bundle on storefront: ${previewUrl}`;
}

export function TemplatePreviewFeedbackModal({
  previewUrl,
  onClose,
}: {
  previewUrl: string;
  onClose: () => void;
}) {
  const modalRef = useRef<any>(null);

  useModalHideListener(modalRef, onClose);

  useEffect(() => {
    showPolarisModal(modalRef);
    return () => hidePolarisModal(modalRef);
  }, []);

  const handleSupport = () => {
    onClose();
    openSupportChatWithMessage(buildTemplatePreviewSupportMessage(previewUrl));
  };

  return (
    <s-modal
      ref={modalRef}
      id="template-preview-feedback-modal"
      heading={translateAdmin("adminAttributes.wereYouAbleToPreviewTheBundle")}
      size="base"
    >
      <s-grid gridTemplateColumns="1fr 1fr" gap="base">
        <s-clickable
          accessibilityLabel={translateAdmin(
            "adminExtracted.components.bundleConfigure.templatepreviewfeedbackmodal.bundleIsVisibleOnStore"
          )}
          background="base"
          border="base"
          borderRadius="large"
          padding="large"
          onClick={onClose}
        >
          <s-stack direction="block" gap="small" alignItems="center">
            <s-icon type="check" />
            <s-text>
              {translateAdmin(
                "adminExtracted.components.bundleConfigure.templatepreviewfeedbackmodal.bundleIsVisibleOnStore"
              )}
            </s-text>
          </s-stack>
        </s-clickable>
        <s-clickable
          accessibilityLabel={translateAdmin(
            "adminExtracted.components.bundleConfigure.templatepreviewfeedbackmodal.havingIssuesWithTheBundleContactUs"
          )}
          background="base"
          border="base"
          borderRadius="large"
          padding="large"
          onClick={handleSupport}
        >
          <s-stack direction="block" gap="small" alignItems="center">
            <s-icon type="info" />
            <s-text>
              {translateAdmin(
                "adminExtracted.components.bundleConfigure.templatepreviewfeedbackmodal.havingIssuesWithTheBundleContactUs"
              )}
            </s-text>
          </s-stack>
        </s-clickable>
      </s-grid>
    </s-modal>
  );
}
