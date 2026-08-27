import { useEffect, useRef } from "react";
import { openSupportChatWithMessage } from "../../lib/support-chat.client";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../../routes/app/_shared/bundle-configure/modal-utils";

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
      heading="Were you able to preview the bundle?"
      size="base"
    >
      <s-grid gridTemplateColumns="1fr 1fr" gap="base">
        <s-clickable
          accessibilityLabel="Bundle is visible on store"
          background="base"
          border="base"
          borderRadius="large"
          padding="large"
          onClick={onClose}
        >
          <s-stack direction="block" gap="small" alignItems="center">
            <s-icon type="check" />
            <s-text>Bundle is visible on store</s-text>
          </s-stack>
        </s-clickable>
        <s-clickable
          accessibilityLabel="Having issues with the bundle? Contact us"
          background="base"
          border="base"
          borderRadius="large"
          padding="large"
          onClick={handleSupport}
        >
          <s-stack direction="block" gap="small" alignItems="center">
            <s-icon type="info" />
            <s-text>Having issues with the bundle? Contact us</s-text>
          </s-stack>
        </s-clickable>
      </s-grid>
    </s-modal>
  );
}
