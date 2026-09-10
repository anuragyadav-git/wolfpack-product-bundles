import { useTranslation } from "react-i18next";
import dashboardStyles from "./dashboard.module.css";

type DashboardTopCardsProps = {
  handleDirectChat: () => void;
};

export function DashboardTopCards({
  handleDirectChat,
}: DashboardTopCardsProps) {
  const { t } = useTranslation();
  return (
    <div className={dashboardStyles.topCardsGrid}>
      <div className={dashboardStyles.topCardSection}>
        <div className={dashboardStyles.supportCard}>
          <div className={dashboardStyles.supportCardHero}>
            <p className={dashboardStyles.supportCardHeroTitle}>
              {t("dashboard.support.heroTitle")}
            </p>
            <p className={dashboardStyles.supportCardHeroDesc}>
              {t("dashboard.support.heroDesc")}
            </p>
          </div>
          <div className={dashboardStyles.supportCardBody}>
            <div className={dashboardStyles.supportAvatarWrap}>
              <s-image
                src="/Parth.avif"
                alt={t("dashboard.support.imageAlt")}
                aspectRatio="1/1"
                objectFit="cover"
                loading="eager"
              />
            </div>
            <div className={dashboardStyles.supportContent}>
              <s-stack direction="block" gap="base">
                <s-stack direction="block" gap="small-100">
                  <s-heading>{t("dashboard.support.heading")}</s-heading>
                  <s-text color="subdued">{t("dashboard.support.body")}</s-text>
                </s-stack>
                <s-text color="subdued">
                  <span className={dashboardStyles.onlineNow}>
                    {t("dashboard.support.onlineNow")}
                  </span>{" "}
                  • {t("dashboard.support.availability")}
                </s-text>
              </s-stack>
            </div>
            <div className={dashboardStyles.supportCta}>
              <s-clickable
                inlineSize="100%"
                background="strong"
                borderRadius="base"
                padding="small"
                accessibilityLabel={t("dashboard.support.cta")}
                onClick={handleDirectChat}
              >
                <s-stack
                  direction="inline"
                  alignItems="center"
                  justifyContent="center"
                >
                  <s-text type="strong" color="base">
                    {t("dashboard.support.cta")}
                  </s-text>
                </s-stack>
              </s-clickable>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${dashboardStyles.supportCard} ${dashboardStyles.supportIssuesCard}`}
      >
        <div
          className={`${dashboardStyles.supportCardHero} ${dashboardStyles.supportIssuesHero}`}
        >
          <p className={dashboardStyles.supportCardHeroTitle}>
            {t("dashboard.supportIssues.title")}
          </p>
          <p className={dashboardStyles.supportCardHeroDesc}>
            {t("dashboard.supportIssues.description")}
          </p>
        </div>
        <div className={dashboardStyles.supportIssuesBody}>
          <s-stack direction="block" gap="small-100">
            <s-stack direction="inline" alignItems="center" gap="small-100">
              <s-icon type="question-circle" color="subdued" />
              <s-text>{t("dashboard.supportIssues.bundleNotShowing")}</s-text>
            </s-stack>
            <s-stack direction="inline" alignItems="center" gap="small-100">
              <s-icon type="question-circle" color="subdued" />
              <s-text>{t("dashboard.supportIssues.uninstallHelp")}</s-text>
            </s-stack>
            <s-stack direction="inline" alignItems="center" gap="small-100">
              <s-icon type="question-circle" color="subdued" />
              <s-text>{t("dashboard.supportIssues.storeDesignHelp")}</s-text>
            </s-stack>
          </s-stack>
          <div className={dashboardStyles.supportIssuesCta}>
            <s-clickable
              inlineSize="100%"
              border="base"
              borderRadius="base"
              padding="small"
              accessibilityLabel={t("dashboard.supportIssues.cta")}
              onClick={handleDirectChat}
            >
              <s-stack
                direction="inline"
                alignItems="center"
                justifyContent="space-between"
                gap="small"
              >
                <s-stack direction="inline" alignItems="center" gap="small">
                  <s-icon type="chat" />
                  <s-text>{t("dashboard.supportIssues.cta")}</s-text>
                </s-stack>
                <s-icon type="external" color="subdued" />
              </s-stack>
            </s-clickable>
          </div>
        </div>
      </div>
    </div>
  );
}
