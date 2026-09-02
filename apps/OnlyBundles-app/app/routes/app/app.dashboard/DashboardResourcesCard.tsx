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
          <button
            type="button"
            className={`${dashboardStyles.resourceItem} ${
              activeResource === "bundle-inspirations"
                ? dashboardStyles.resourceItemActive
                : ""
            }`}
            onClick={() => setActiveResource("bundle-inspirations")}
          >
            <div className={dashboardStyles.resourceItemIcon}>
              <s-icon type="image" />
            </div>
            <span className={dashboardStyles.resourceItemLabel}>
              {t("dashboard.resources.bundleInspiration")}
            </span>
          </button>
          <button
            type="button"
            className={dashboardStyles.resourceItem}
            onClick={handleDirectChat}
          >
            <div className={dashboardStyles.resourceItemIcon}>
              <s-icon type="question-circle" />
            </div>
            <span className={dashboardStyles.resourceItemLabel}>
              {t("dashboard.resources.support")}
            </span>
          </button>
          <s-clickable
            {...({ className: dashboardStyles.resourceItem } as any)}
            href={SDK_DOCUMENTATION_URL}
            target="_blank"
            accessibilityLabel={t("dashboard.resources.sdkDocumentation")}
          >
            <div className={dashboardStyles.resourceItemIcon}>
              <s-icon type="code" />
            </div>
            <span className={dashboardStyles.resourceItemLabel}>
              {t("dashboard.resources.sdkDocumentation")}
            </span>
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
