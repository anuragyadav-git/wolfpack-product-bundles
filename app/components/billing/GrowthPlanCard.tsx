import { PLANS } from "../../constants/plans";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import brandStyles from "../../styles/billing/subscription-brand.module.css";

export interface GrowthPlanCardProps {
  isCurrentPlan: boolean;
  isUpgrading: boolean;
  onSelectPlan: () => void;
}

export function GrowthPlanCard({
  isCurrentPlan,
  isUpgrading,
  onSelectPlan,
}: GrowthPlanCardProps) {
  const { t } = useTranslation();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className={brandStyles.planCardWrap}>
      <div className={brandStyles.popularBadge}>
        <span>{t("billing.cards.mostPopular")}</span>
      </div>

      <div className={`${brandStyles.planCardFrame} ${brandStyles.growthCard}`}>
        <s-box padding="base">
          <div className={brandStyles.cardShell}>
            <s-stack direction="block" gap="large">
              <s-stack direction="block" gap="small-100">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                  <h3 className={brandStyles.planTitle}>{PLANS.growth.name}</h3>
                  {isCurrentPlan && <s-badge tone="success">{t("billing.cards.currentPlan")}</s-badge>}
                </s-stack>
                <s-stack direction="inline" alignItems="baseline" gap="small-400">
                  <span className={brandStyles.price}>${PLANS.growth.price}</span>
                  <span className={brandStyles.muted}>{t("billing.cards.perMonth")}</span>
                </s-stack>
                <p className={brandStyles.muted}>
                  {t("billing.cards.growthDescription")}
                </p>
                <p className={brandStyles.finePrint}>
                  {t("billing.cards.annualPrice", { price: PLANS.growth.annualPrice })}
                </p>
              </s-stack>

              <s-divider />

              <s-stack direction="block" gap="small">
                <p className={brandStyles.featureHeading}>{t("billing.cards.growthIncludes")}</p>
                <s-stack direction="block" gap="small-100">
                  {PLANS.growth.featureMessageIds.map((messageId, index) => (
                    <s-stack key={messageId} direction="inline" alignItems="center" gap="small-100">
                      <div className={brandStyles.check}>
                        <s-icon type="check" />
                      </div>
                      <span className={`${brandStyles.feature} ${index < 4 ? brandStyles.featured : ""}`}>
                        {t(messageId)}
                      </span>
                    </s-stack>
                  ))}
                </s-stack>
              </s-stack>
            </s-stack>

            <div className={brandStyles.actions}>
              <s-stack direction="block" gap="small-100">
                {!isCurrentPlan && (
                  <p className={brandStyles.finePrint}>
                    {t("billing.cards.trialAndBilling", { days: PLANS.growth.trialDays })}
                  </p>
                )}
                <s-button
                  variant="primary"
                  disabled={(isHydrated && isCurrentPlan) || undefined}
                  loading={isUpgrading || undefined}
                  onClick={isCurrentPlan ? undefined : onSelectPlan}
                  inlineSize="fill"
                >
                  {isCurrentPlan ? t("billing.cards.currentPlan") : t("billing.cards.chooseGrowth")}
                </s-button>
              </s-stack>
            </div>
          </div>
        </s-box>
      </div>
    </div>
  );
}
