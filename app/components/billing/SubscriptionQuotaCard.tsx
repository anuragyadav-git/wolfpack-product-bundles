import {
  calculateUsagePercentage,
  getProgressBarTone,
  getBadgeTone,
  shouldShowUpgradePrompt,
  getUpgradePromptTone,
} from "../../utils/pricing";
import { useTranslation } from "react-i18next";
import brandStyles from "../../styles/billing/subscription-brand.module.css";

export interface SubscriptionQuotaCardProps {
  currentBundleCount: number;
  bundleLimit: number;
  isFreePlan: boolean;
  showUpgradePrompt?: boolean;
}

function CustomProgressBar({ progress, tone }: { progress: number; tone: string }) {
  return (
    <div className={brandStyles.progressTrack}>
      <div
        className={brandStyles.progressBar}
        data-tone={tone}
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
        }}
      />
    </div>
  );
}

export function SubscriptionQuotaCard({
  currentBundleCount,
  bundleLimit,
  isFreePlan,
  showUpgradePrompt = true,
}: SubscriptionQuotaCardProps) {
  const { t } = useTranslation();
  const percentage = calculateUsagePercentage(currentBundleCount, bundleLimit);
  const badgeTone = getBadgeTone(percentage);
  const progressBarTone = getProgressBarTone(percentage);
  const usageMessage = isFreePlan
    ? t("common.upgradePrompt.usageBody", {
      current: currentBundleCount,
      limit: bundleLimit,
    })
    : t("billing.planFeatures.unlimitedBundlesSteps");

  const showBanner = showUpgradePrompt && shouldShowUpgradePrompt(percentage, isFreePlan);
  const bannerMessage = t(percentage >= 80
    ? "common.upgradePrompt.limitReachedBody"
    : "common.upgradePrompt.approachingBody", {
    current: currentBundleCount,
    limit: bundleLimit,
  });
  const bannerTone = getUpgradePromptTone(percentage);

  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="block" gap="small-100">
          <div className={brandStyles.sectionHeader}>
            <h3 className={brandStyles.sectionTitle}>{t("billing.route.bundleUsage")}</h3>
            <s-badge tone={badgeTone}>
              {isFreePlan
                ? t("billing.route.bundleCount", { current: currentBundleCount, limit: bundleLimit })
                : t("billing.values.unlimited")}
            </s-badge>
          </div>
          <p className={brandStyles.muted}>{usageMessage}</p>
        </s-stack>
        {isFreePlan && <CustomProgressBar progress={percentage} tone={progressBarTone} />}
        {showBanner && (
          <s-box paddingBlockEnd="base">
            <s-banner
              tone={bannerTone}
              heading={t("billing.route.bundleUsage")}
              dismissible
              hidden={false}
            >
              {bannerMessage}
            </s-banner>
          </s-box>
        )}
      </s-stack>
    </s-section>
  );
}
