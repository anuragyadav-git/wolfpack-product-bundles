import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import dashboardStyles from "./dashboard.module.css";
import { SDK_DOCUMENTATION_URL } from "../../../lib/tutorial-links";

type DashboardResourcesCardProps = {
  activeResource: string;
  setActiveResource: Dispatch<SetStateAction<string>>;
  handleDirectChat: () => void;
};

export function DashboardResourcesCard({
  activeResource,
  setActiveResource,
  handleDirectChat,
}: DashboardResourcesCardProps) {
  const { t } = useTranslation();

  return (
    <div className={dashboardStyles.resourcesCard}>
      <div className={dashboardStyles.resourcesLayout}>
        <div className={dashboardStyles.resourcesList}>
          <s-clickable
            {...{
              className: `${dashboardStyles.resourceItem} ${
                activeResource === "bundle-inspirations"
                  ? dashboardStyles.resourceItemActive
                  : ""
              }`,
            }}
            onClick={() => setActiveResource("bundle-inspirations")}
          >
            <s-stack direction="inline" alignItems="center" gap="base">
              <s-icon type="image" />
              <s-text>{t("dashboard.resources.bundleInspiration")}</s-text>
            </s-stack>
          </s-clickable>
          <s-clickable
            {...{ className: dashboardStyles.resourceItem }}
            onClick={handleDirectChat}
          >
            <s-stack direction="inline" alignItems="center" gap="base">
              <s-icon type="question-circle" />
              <s-text>{t("dashboard.resources.support")}</s-text>
            </s-stack>
          </s-clickable>
          <s-clickable
            {...{ className: dashboardStyles.resourceItem }}
            href={SDK_DOCUMENTATION_URL}
            target="_blank"
            accessibilityLabel={t("dashboard.resources.sdkDocumentation")}
          >
            <s-stack direction="inline" alignItems="center" gap="base">
              <s-icon type="code" />
              <s-text>{t("dashboard.resources.sdkDocumentation")}</s-text>
            </s-stack>
          </s-clickable>
        </div>

        <div className={dashboardStyles.resourcesThumbnails}>
          <div
            className={`${dashboardStyles.resourceThumbnailCard} ${dashboardStyles.resourceThumbnailCardUnavailable}`}
            aria-disabled="true"
          >
            <span
              aria-hidden="true"
              className={dashboardStyles.resourceThumbnailImage}
            >
              <s-icon type="image" />
            </span>
            <div className={dashboardStyles.resourceThumbnailFooter}>
              <span>{t("dashboard.resources.bundleGallery")}</span>
              <s-badge>{t("dashboard.resources.comingSoon")}</s-badge>
            </div>
          </div>
          <div
            className={`${dashboardStyles.resourceThumbnailCard} ${dashboardStyles.resourceThumbnailCardUnavailable}`}
            aria-disabled="true"
          >
            <span
              aria-hidden="true"
              className={dashboardStyles.resourceThumbnailImage}
            >
              <s-icon type="image" />
            </span>
            <div className={dashboardStyles.resourceThumbnailFooter}>
              <span>{t("dashboard.resources.bundleGallery")}</span>
              <s-badge>{t("dashboard.resources.comingSoon")}</s-badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
