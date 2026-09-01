import { useTranslation } from "react-i18next";

interface ProxyHealthBannerProps {
  shop: string;
  appUrl: string;
}

export function ProxyHealthBanner({ shop, appUrl }: ProxyHealthBannerProps) {
  const { t } = useTranslation();
  const reinstallUrl = `${appUrl}/?shop=${shop}`;

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        tone="critical"
        heading={t("common.proxyHealth.title")}
        dismissible={false}
        hidden={false}
      >
        <s-button slot="primary-action" variant="primary" href={reinstallUrl} target="_blank">
          {t("common.actions.reinstallApp")}
        </s-button>
        <strong>{t("common.proxyHealth.title")}</strong> - {t("common.proxyHealth.body")}
      </s-banner>
    </s-box>
  );
}
