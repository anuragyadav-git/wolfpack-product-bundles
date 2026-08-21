import { useEffect, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";
import dashboardStyles from "./dashboard.module.css";
import {
  APP_EMBED_GUIDE_SOURCES,
  getAppEmbedGuideMediaProps,
  getAppEmbedModalView,
  type AppEmbedEnablePhase,
} from "./dashboard-app-embed-enable-flow";

type AppEmbedEnableModalProps = {
  modalRef: RefObject<any>;
  phase: AppEmbedEnablePhase;
  onOpenThemeEditor: () => void;
  onCancel: () => void;
  onDone: () => void;
  onSupport: () => void;
};

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function AppEmbedEnableModal({
  modalRef,
  phase,
  onOpenThemeEditor,
  onCancel,
  onDone,
  onSupport,
}: AppEmbedEnableModalProps) {
  const { t } = useTranslation();
  const view = getAppEmbedModalView(phase);
  const mediaProps = getAppEmbedGuideMediaProps(usePrefersReducedMotion());

  useModalHideListener(modalRef, onCancel);

  useEffect(() => {
    showPolarisModal(modalRef);
    return () => hidePolarisModal(modalRef);
  }, [modalRef]);

  return (
    <s-modal
      ref={modalRef}
      id="dashboard-app-embed-enable-modal"
      heading={t("dashboard.storefrontSetup.enableModal.heading")}
      size="large"
    >
      {view.primaryAction === "open" && (
        <s-button slot="primary-action" variant="primary" onClick={onOpenThemeEditor}>
          {t("dashboard.storefrontSetup.enableModal.openThemeEditor")}
        </s-button>
      )}
      {view.primaryAction === "retry" && (
        <s-button slot="primary-action" variant="primary" onClick={onOpenThemeEditor}>
          {t("dashboard.storefrontSetup.enableModal.openThemeEditorAgain")}
        </s-button>
      )}
      {view.primaryAction === "done" && (
        <s-button slot="primary-action" variant="primary" onClick={onDone}>
          {t("dashboard.storefrontSetup.enableModal.done")}
        </s-button>
      )}
      {view.secondaryAction === "cancel" && (
        <s-button slot="secondary-actions" onClick={onCancel}>
          {t("dashboard.storefrontSetup.enableModal.cancel")}
        </s-button>
      )}
      {view.secondaryAction === "support" && (
        <s-button slot="secondary-actions" onClick={onSupport}>
          {t("dashboard.storefrontSetup.enableModal.chatWithSupport")}
        </s-button>
      )}

      <s-stack gap="base">
        {phase === "idle" && (
          <s-text>{t("dashboard.storefrontSetup.enableModal.description")}</s-text>
        )}

        {view.showGuide && (
          <div className={dashboardStyles.appEmbedGuideFrame}>
            <video
              aria-label={t(mediaProps.accessibilityLabelKey)}
              autoPlay={mediaProps.autoPlay}
              controls={mediaProps.controls}
              muted={mediaProps.muted}
              loop={mediaProps.loop}
              playsInline={mediaProps.playsInline}
              preload={mediaProps.preload}
            >
              {APP_EMBED_GUIDE_SOURCES.map((source) => (
                <source key={source.type} src={source.src} type={source.type} />
              ))}
            </video>
          </div>
        )}

        {view.showSpinner && (
          <s-stack alignItems="center" gap="base">
            <s-spinner accessibilityLabel={t("dashboard.storefrontSetup.enableModal.checking")} />
            <s-text>{t("dashboard.storefrontSetup.enableModal.checking")}</s-text>
          </s-stack>
        )}

        {phase === "success" && (
          <s-banner tone="success" heading={t("dashboard.storefrontSetup.enableModal.enabled")} />
        )}

        {phase === "failure" && (
          <s-banner tone="warning" heading={t("dashboard.storefrontSetup.enableModal.notDetected")}>
            <s-text>{t("dashboard.storefrontSetup.enableModal.description")}</s-text>
          </s-banner>
        )}
      </s-stack>
    </s-modal>
  );
}
