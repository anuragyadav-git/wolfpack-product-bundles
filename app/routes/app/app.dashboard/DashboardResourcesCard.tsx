import { useNavigate } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import dashboardStyles from "./dashboard.module.css";
import { APP_BRAND } from "../../../lib/app-brand";

type DashboardResourcesCardProps = {
  activeResource: string;
  setActiveResource: Dispatch<SetStateAction<string>>;
  handleDirectChat: () => void;
};

export function DashboardResourcesCard({ activeResource, setActiveResource, handleDirectChat }: DashboardResourcesCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleExploreUpdatesClick = () => {
    navigate("/app/events");
  };

  const handleSdkDocumentationClick = () => {
    window.open(APP_BRAND.links.company, "_blank", "noopener,noreferrer");
  };

  return (
  <div className={dashboardStyles.resourcesCard}>
    <div className={dashboardStyles.resourcesLayout}>
      <div className={dashboardStyles.resourcesList}>
        <button
          type="button"
          className={`${dashboardStyles.resourceItem} ${activeResource === 'bundle-inspirations' ? dashboardStyles.resourceItemActive : ''}`}
          onClick={() => setActiveResource('bundle-inspirations')}
        >
          <div className={dashboardStyles.resourceItemIcon}><s-icon type="image" /></div>
          <span className={dashboardStyles.resourceItemLabel}>{t("dashboard.resources.bundleInspiration")}</span>
        </button>
        <button type="button" className={dashboardStyles.resourceItem} onClick={handleDirectChat}>
          <div className={dashboardStyles.resourceItemIcon}><s-icon type="question-circle" /></div>
          <span className={dashboardStyles.resourceItemLabel}>{t("dashboard.resources.support")}</span>
        </button>
        <button
          type="button"
          className={dashboardStyles.resourceItem}
          onClick={handleExploreUpdatesClick}
        >
          <div className={dashboardStyles.resourceItemIcon}><s-icon type="notification" /></div>
          <span className={dashboardStyles.resourceItemLabel}>{t("dashboard.resources.exploreUpdate")}</span>
        </button>
        <button
          type="button"
          className={dashboardStyles.resourceItem}
          onClick={handleSdkDocumentationClick}
        >
          <div className={dashboardStyles.resourceItemIcon}><s-icon type="code" /></div>
          <span className={dashboardStyles.resourceItemLabel}>{t("dashboard.resources.sdkDocumentation")}</span>
        </button>
      </div>

      <div className={dashboardStyles.resourcesThumbnails}>
        <a href={APP_BRAND.links.company} target="_blank" rel="noopener noreferrer" className={dashboardStyles.resourceThumbnailCard}>
          <span aria-hidden="true" className={dashboardStyles.resourceThumbnailImage}>
            <s-icon type="image" />
          </span>
          <div className={dashboardStyles.resourceThumbnailFooter}>
            <span>{t("dashboard.resources.bundleGallery")}</span>
            <s-icon type="external" color="subdued" />
          </div>
        </a>
        <a href={APP_BRAND.links.company} target="_blank" rel="noopener noreferrer" className={dashboardStyles.resourceThumbnailCard}>
          <span aria-hidden="true" className={dashboardStyles.resourceThumbnailImage}>
            <s-icon type="image" />
          </span>
          <div className={dashboardStyles.resourceThumbnailFooter}>
            <span>{t("dashboard.resources.bundleGallery")}</span>
            <s-icon type="external" color="subdued" />
          </div>
        </a>
      </div>
    </div>
  </div>
  );
}
