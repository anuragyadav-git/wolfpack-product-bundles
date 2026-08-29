import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import brandStyles from "../../styles/billing/subscription-brand.module.css";

export interface UpgradeConfirmationModalProps {
  open: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

type PolarisModalRef = {
  current: {
    showOverlay?: () => void;
    hideOverlay?: () => void;
  } | null;
};

export function syncUpgradeConfirmationModal(
  modalRef: PolarisModalRef,
  open: boolean,
): void {
  if (open) {
    modalRef.current?.showOverlay?.();
  } else {
    modalRef.current?.hideOverlay?.();
  }
}

export function UpgradeConfirmationModal({
  open,
  isLoading,
  onConfirm,
  onClose,
}: UpgradeConfirmationModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<any>(null);
  const benefits = [
    t("billing.upgradeModal.benefits.unlimitedPublicBundles"),
    t("billing.upgradeModal.benefits.allTemplatesDesign"),
    t("billing.upgradeModal.benefits.advancedAnalytics"),
    t("billing.upgradeModal.benefits.prioritySupport"),
  ];

  useEffect(() => {
    syncUpgradeConfirmationModal(modalRef, open);
  }, [open]);

  return (
    <s-modal
      ref={modalRef}
      id="upgrade-confirmation-modal"
      heading={t("billing.upgradeModal.heading")}
      onHide={onClose}
    >
      <s-button
        slot="primary-action"
        variant="primary"
        loading={isLoading || undefined}
        onClick={onConfirm}
      >
        {t("billing.upgradeModal.confirm")}
      </s-button>
      <s-button slot="secondary-actions" onClick={onClose}>
        {t("billing.actions.cancel")}
      </s-button>

      <s-stack direction="block" gap="base">
        <s-paragraph>
          {t("billing.upgradeModal.redirect")}
        </s-paragraph>

        <s-stack direction="block" gap="small">
          <h3 className={brandStyles.sectionTitle}>
            {t("billing.upgradeModal.benefitsHeading")}
          </h3>
          <s-stack direction="block" gap="small-100">
            {benefits.map((benefit, index) => (
              <s-stack key={index} direction="inline" alignItems="center" gap="small-100">
                <div className={brandStyles.check}>
                  <s-icon type="check" />
                </div>
                <span style={{ fontSize: 14 }}>{benefit}</span>
              </s-stack>
            ))}
          </s-stack>
        </s-stack>

        <s-divider />

        <s-stack direction="inline" justifyContent="space-between">
          <s-text tone="neutral" color="subdued">{t("billing.upgradeModal.managedByShopify")}</s-text>
        </s-stack>
      </s-stack>
    </s-modal>
  );
}
