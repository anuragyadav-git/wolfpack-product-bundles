import { useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  getEntitlementModalContentKeys,
} from "../../lib/subscriptions/alerts";
import type {
  EntitlementFailureCode,
  EntitlementKey,
} from "../../lib/subscriptions/entitlements";

export interface EntitlementFailureData {
  code: EntitlementFailureCode;
  entitlement?: EntitlementKey;
  requiredPlan?: "GROWTH";
  currentUsage?: number;
  limit?: number;
}

export interface EntitlementUpgradeModalProps {
  open: boolean;
  failure: EntitlementFailureData | null;
  isSavingDraft?: boolean;
  onClose: () => void;
  onSaveAsDraft?: () => void;
  onViewPlans?: () => void;
}

type PolarisModalRef = {
  current: {
    showOverlay?: () => void;
    hideOverlay?: () => void;
    addEventListener?: (event: string, handler: () => void) => void;
    removeEventListener?: (event: string, handler: () => void) => void;
  } | null;
};

export function syncEntitlementUpgradeModal(
  modalRef: PolarisModalRef,
  open: boolean,
): void {
  if (open) {
    modalRef.current?.showOverlay?.();
  } else {
    modalRef.current?.hideOverlay?.();
  }
}

export function EntitlementUpgradeModal({
  open,
  failure,
  isSavingDraft,
  onClose,
  onSaveAsDraft,
  onViewPlans,
}: EntitlementUpgradeModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<any>(null);

  const modalKeys = getEntitlementModalContentKeys(failure);

  const handleViewPlans = useCallback(() => {
    onClose?.();
    if (onViewPlans) {
      onViewPlans();
    } else if (typeof window !== "undefined") {
      window.location.assign("/app/billing/plans");
    }
  }, [onClose, onViewPlans]);

  useEffect(() => {
    syncEntitlementUpgradeModal(modalRef, open);
  }, [open]);

  useEffect(() => {
    const modalEl = modalRef.current;
    if (!modalEl || typeof modalEl.addEventListener !== "function") return;

    const handleHide = () => {
      onClose();
    };

    modalEl.addEventListener("hide", handleHide);
    return () => {
      modalEl.removeEventListener("hide", handleHide);
    };
  }, [onClose]);

  const benefits = [
    t("billing.upgradeModal.benefits.unlimitedPublicBundles"),
    t("billing.upgradeModal.benefits.allTemplatesDesign"),
    t("billing.upgradeModal.benefits.advancedAnalytics"),
    t("billing.upgradeModal.benefits.prioritySupport"),
  ];

  return (
    <s-modal
      ref={modalRef}
      id="entitlement-upgrade-modal"
      heading={t(modalKeys.heading)}
      onHide={onClose}
    >
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={handleViewPlans}
      >
        {t(modalKeys.primaryAction)}
      </s-button>
      {onSaveAsDraft && modalKeys.secondaryAction ? (
        <s-button
          slot="secondary-actions"
          loading={isSavingDraft ? true : undefined}
          onClick={onSaveAsDraft}
        >
          {t(modalKeys.secondaryAction)}
        </s-button>
      ) : null}

      <s-stack direction="block" gap="base">
        <s-paragraph>{t(modalKeys.description)}</s-paragraph>

        <s-stack direction="block" gap="small-100">
          <s-text tone="neutral" color="subdued">
            {t("billing.upgradeModal.benefitsHeading")}
          </s-text>
          <s-stack direction="block" gap="small-100">
            {benefits.map((benefit, index) => (
              <s-stack
                key={index}
                direction="inline"
                alignItems="center"
                gap="small-100"
              >
                <s-icon type="check" />
                <s-text>{benefit}</s-text>
              </s-stack>
            ))}
          </s-stack>
        </s-stack>

        <s-divider />

        <s-text tone="neutral" color="subdued">
          {t("billing.upgradeModal.managedByShopify")}
        </s-text>
      </s-stack>
    </s-modal>
  );
}
