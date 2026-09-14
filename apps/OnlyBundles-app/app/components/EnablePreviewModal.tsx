import { useTranslation } from "react-i18next";
import { openThemeEditorInNewTab } from "../lib/theme-editor-navigation.client";
import { LocalAppModal } from "./bundle-configure/LocalAppModal";

interface EnablePreviewModalProps {
  open: boolean;
  onClose: () => void;
  themeEditorUrl: string | null;
  onSetupVisibility?: () => void;
}

export function EnablePreviewModal({
  open,
  onClose,
  themeEditorUrl,
  onSetupVisibility,
}: EnablePreviewModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <LocalAppModal
      title={t("common.previewGate.title")}
      onClose={onClose}
      secondaryAction={
        <s-button variant="secondary" onClick={onClose}>
          {t("common.actions.maybeLater")}
        </s-button>
      }
      primaryAction={
        <s-button
          variant="primary"
          onClick={() => {
            if (onSetupVisibility) {
              onSetupVisibility();
            } else if (themeEditorUrl) {
              openThemeEditorInNewTab(themeEditorUrl);
            }
            onClose();
          }}
        >
          {t("common.actions.setUpVisibility")}
        </s-button>
      }
    >
      <s-stack direction="block" gap="base" alignItems="center">
        <s-icon type="view" />
        <s-paragraph>{t("common.previewGate.body")}</s-paragraph>
      </s-stack>
    </LocalAppModal>
  );
}
