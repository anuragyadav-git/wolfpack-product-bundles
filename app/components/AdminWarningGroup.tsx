import { useRef, type ElementRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type AdminWarningItem = {
  id: string;
  heading: string;
  message: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

type PolarisModalElement = ElementRef<"s-modal">;

export function getAdminWarningPresentation(
  warnings: AdminWarningItem[],
): "none" | "single" | "multiple" {
  if (warnings.length === 0) return "none";
  return warnings.length === 1 ? "single" : "multiple";
}

export function runAdminWarningAction(
  modalRef: { current: { hideOverlay?: () => void } | null },
  onAction: () => void,
): void {
  modalRef.current?.hideOverlay?.();
  onAction();
}

export function AdminWarningGroup({ warnings }: { warnings: AdminWarningItem[] }) {
  const { t } = useTranslation();
  const modalRef = useRef<PolarisModalElement | null>(null);
  const presentation = getAdminWarningPresentation(warnings);

  if (presentation === "none") return null;

  if (presentation === "single") {
    const warning = warnings[0];
    return (
      <s-box paddingBlockEnd="small-200">
        <s-banner
          tone="warning"
          heading={warning.heading}
          dismissible={false}
          hidden={false}
        >
          {warning.actionLabel && warning.onAction ? (
            <s-button slot="primary-action" onClick={warning.onAction}>
              {warning.actionLabel}
            </s-button>
          ) : null}
          {warning.message}
        </s-banner>
      </s-box>
    );
  }

  return (
    <>
      <s-box paddingBlockEnd="small-200">
        <s-banner
          tone="warning"
          heading={t("common.warningGroup.heading")}
          dismissible={false}
          hidden={false}
        >
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
            gap="base"
          >
            <s-text>{t("common.warningGroup.summary")}</s-text>
            <s-button
              variant="secondary"
              onClick={() => modalRef.current?.showOverlay?.()}
            >
              {t("common.actions.view")}
            </s-button>
          </s-stack>
        </s-banner>
      </s-box>

      <s-modal
        ref={modalRef}
        heading={t("common.warningGroup.modalTitle")}
        size="base"
      >
        <s-stack direction="block" gap="base">
          {warnings.map((warning) => (
            <s-box
              key={warning.id}
              border="base"
              borderRadius="base"
              padding="base"
            >
              <s-stack direction="block" gap="small">
                <s-heading>{warning.heading}</s-heading>
                <s-text>{warning.message}</s-text>
                {warning.actionLabel && warning.onAction ? (
                  <s-button
                    variant="secondary"
                    onClick={() =>
                      runAdminWarningAction(modalRef, warning.onAction!)}
                  >
                    {warning.actionLabel}
                  </s-button>
                ) : null}
              </s-stack>
            </s-box>
          ))}
        </s-stack>
        <s-button
          slot="primary-action"
          onClick={() => modalRef.current?.hideOverlay?.()}
        >
          {t("common.actions.close")}
        </s-button>
      </s-modal>
    </>
  );
}
