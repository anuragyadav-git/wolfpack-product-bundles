import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import dashboardStyles from "./dashboard.module.css";

export function DashboardHeader({
  onSyncCollections,
}: {
  onSyncCollections: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={dashboardStyles.dashboardHeader}>
      <div className={dashboardStyles.dashboardTitleBlock}>
        <h1 className={dashboardStyles.dashboardTitle}>{t("dashboard.title")}</h1>
        <p className={dashboardStyles.dashboardSubtitle}>
          {t("dashboard.subtitle")}
        </p>
      </div>
      <div className={dashboardStyles.dashboardActions}>
        <s-button
          icon="refresh"
          accessibilityLabel={t("dashboard.header.syncCollections")}
          onClick={onSyncCollections}
        >
          <span className={dashboardStyles.dashboardActionLabel}>
            {t("dashboard.header.syncCollections")}
          </span>
        </s-button>
        <s-button
          icon="plus"
          variant="primary"
          accessibilityLabel={t("dashboard.header.createBundle")}
          onClick={() => navigate("/app/bundles/create")}
        >
          <span className={dashboardStyles.dashboardActionLabel}>
            {t("dashboard.header.createBundle")}
          </span>
        </s-button>
      </div>
    </div>
  );
}
