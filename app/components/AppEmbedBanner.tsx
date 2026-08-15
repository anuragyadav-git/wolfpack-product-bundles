import { useTranslation } from "react-i18next";
import { openThemeEditorInNewTab } from "../lib/theme-editor-navigation.client";

interface AppEmbedBannerProps {
  appEmbedEnabled: boolean;
  themeEditorUrl: string | null;
  onEnableClick?: () => void;
}

export function AppEmbedBanner({
  appEmbedEnabled,
  themeEditorUrl,
  onEnableClick,
}: AppEmbedBannerProps) {
  const { t } = useTranslation();

  if (appEmbedEnabled) return null;

  return (
    <s-box paddingBlockEnd="large-200">
      <s-banner
        tone="warning"
        heading={t("common.appEmbed.guideTitle")}
        dismissible={false}
        hidden={false}
      >
        <s-stack
          direction="inline"
          justifyContent="space-between"
          alignItems="center"
          gap="base"
        >
          <s-text>{t("common.appEmbed.body")}</s-text>
          {themeEditorUrl ? (
            <s-button
              variant="secondary"
              onClick={() => {
                if (onEnableClick) {
                  onEnableClick();
                  return;
                }
                openThemeEditorInNewTab(themeEditorUrl);
              }}
            >
              {t("common.actions.enableHere")}
            </s-button>
          ) : null}
        </s-stack>
      </s-banner>
    </s-box>
  );
}
