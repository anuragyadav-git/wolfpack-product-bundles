import type { AdminTaskAlert } from "../lib/admin-alert-feedback";

interface AdminTaskAlertBannerProps {
  actionLabel?: string;
  alert: AdminTaskAlert | null;
  onAction?: () => void;
  onDismiss: () => void;
}

export function AdminTaskAlertBanner({
  actionLabel,
  alert,
  onAction,
  onDismiss,
}: AdminTaskAlertBannerProps) {
  if (!alert) return null;

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        heading={alert.heading}
        tone="critical"
        dismissible
        hidden={false}
        onDismiss={onDismiss}
      >
        {actionLabel && onAction ? (
          <s-button slot="primary-action" onClick={onAction}>
            {actionLabel}
          </s-button>
        ) : null}
        {alert.message}
      </s-banner>
    </s-box>
  );
}
