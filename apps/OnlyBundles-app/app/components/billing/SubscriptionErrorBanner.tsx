import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { openSupportChat } from "../../lib/support-chat.client";

export interface SubscriptionErrorBannerProps {
  errorCode: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}

function getErrorMessage(errorCode: string | null, t: TFunction): string {
  return errorCode === "billing_unverified"
    ? t("billing.error.verificationFailed")
    : t("billing.error.unexpected");
}

export function SubscriptionErrorBanner({
  errorCode,
  onRetry,
  onDismiss,
}: SubscriptionErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        tone="critical"
        heading={t("billing.error.heading")}
        dismissible={false}
        hidden={false}
      >
        <s-button slot="primary-action" onClick={onRetry}>
          {t("billing.actions.tryAgain")}
        </s-button>
        {getErrorMessage(errorCode, t)}
        <div style={{ marginTop: 8 }}>
          <s-stack direction="inline" gap="small">
            <s-button variant="tertiary" onClick={() => openSupportChat()}>
              {t("billing.actions.contactSupport")}
            </s-button>
            <s-button variant="tertiary" onClick={onDismiss}>
              {t("common.actions.dismiss")}
            </s-button>
          </s-stack>
        </div>
      </s-banner>
    </s-box>
  );
}
