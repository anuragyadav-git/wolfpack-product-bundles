import { useTranslation } from "react-i18next";

export interface UpgradeSuccessBannerProps {
  onDismiss: () => void;
}

export function UpgradeSuccessBanner({ onDismiss }: UpgradeSuccessBannerProps) {
  const { t } = useTranslation();
  const stats = [
    {
      label: t("billing.success.bundleLimit"),
      value: t("billing.success.bundleLimitValue"),
    },
    {
      label: t("billing.success.designControl"),
      value: t("billing.success.fullAccess"),
    },
    {
      label: t("billing.success.support"),
      value: t("billing.success.priority"),
    },
  ];

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        heading={t("billing.success.heading")}
        tone="success"
        dismissible
        hidden={false}
        onDismiss={onDismiss}
      >
        <s-stack direction="block" gap="small">
          <s-paragraph>{t("billing.success.body")}</s-paragraph>

          <s-stack direction="inline" gap="base">
            {stats.map(({ label, value }: any) => (
              <s-box
                key={label}
                padding="small"
                background="subdued"
                borderRadius="base"
              >
                <s-stack direction="block" gap="small-400">
                  <s-text color="subdued">{label}</s-text>
                  <s-text>{value}</s-text>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
      </s-banner>
    </s-box>
  );
}
