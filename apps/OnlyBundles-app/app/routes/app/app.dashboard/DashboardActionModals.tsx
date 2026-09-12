import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { AppEmbedEnableModal } from "./AppEmbedEnableModal";
import type { AppEmbedEnablePhase } from "./dashboard-app-embed-enable-flow";

type ModalRef = RefObject<any>;

type DashboardActionModalsProps = {
  appEmbedOpen: boolean;
  appEmbedPhase: AppEmbedEnablePhase;
  appEmbedModalRef: ModalRef;
  onOpenThemeEditor: () => void;
  onCloseAppEmbed: () => void;
  onSupport: () => void;
  renderDeleteModal: boolean;
  deleteModalRef: ModalRef;
  isSubmitting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  renderRenameModal: boolean;
  renameModalRef: ModalRef;
  isRenaming: boolean;
  renameError: string | null;
  bundleName: string;
  onBundleNameChange: (value: string) => void;
  onConfirmRename: () => void;
  onCloseRename: () => void;
};

export function DashboardActionModals({
  appEmbedOpen,
  appEmbedPhase,
  appEmbedModalRef,
  onOpenThemeEditor,
  onCloseAppEmbed,
  onSupport,
  renderDeleteModal,
  deleteModalRef,
  isSubmitting,
  onConfirmDelete,
  onCancelDelete,
  renderRenameModal,
  renameModalRef,
  isRenaming,
  renameError,
  bundleName,
  onBundleNameChange,
  onConfirmRename,
  onCloseRename,
}: DashboardActionModalsProps) {
  const { t } = useTranslation();

  return (
    <>
      {appEmbedOpen && (
        <AppEmbedEnableModal
          modalRef={appEmbedModalRef}
          phase={appEmbedPhase}
          onOpenThemeEditor={onOpenThemeEditor}
          onCancel={onCloseAppEmbed}
          onDone={onCloseAppEmbed}
          onSupport={onSupport}
        />
      )}
      {renderDeleteModal && (
        <s-modal
          ref={deleteModalRef}
          id="delete-bundle-modal"
          heading={t("dashboard.deleteModal.heading")}
        >
          <s-button
            slot="primary-action"
            variant="primary"
            tone="critical"
            loading={isSubmitting || undefined}
            onClick={onConfirmDelete}
          >
            {t("dashboard.deleteModal.delete")}
          </s-button>
          <s-button slot="secondary-actions" onClick={onCancelDelete}>
            {t("dashboard.deleteModal.cancel")}
          </s-button>
          <s-text color="subdued">{t("dashboard.deleteModal.body")}</s-text>
        </s-modal>
      )}
      {renderRenameModal && (
        <s-modal
          ref={renameModalRef}
          id="rename-bundle-modal"
          heading={t("dashboard.renameModal.heading")}
          size="small"
        >
          <s-button
            slot="primary-action"
            variant="primary"
            loading={isRenaming || undefined}
            onClick={onConfirmRename}
          >
            {t("dashboard.renameModal.save")}
          </s-button>
          <s-button slot="secondary-actions" onClick={onCloseRename}>
            {t("dashboard.renameModal.cancel")}
          </s-button>
          <s-stack direction="block" gap="base">
            <s-text-field
              label={t("dashboard.renameModal.nameLabel")}
              value={bundleName}
              error={renameError || undefined}
              autocomplete="off"
              onInput={(event: Event) =>
                onBundleNameChange(
                  (event.target as HTMLInputElement).value ?? ""
                )
              }
            />
          </s-stack>
        </s-modal>
      )}
    </>
  );
}
