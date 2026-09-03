import { PLANS } from "../../constants/plans";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import brandStyles from "../../styles/billing/subscription-brand.module.css";

export interface FreePlanCardProps {
  isCurrentPlan: boolean;
}

export function FreePlanCard({ isCurrentPlan }: FreePlanCardProps) {
  const { t } = useTranslation();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className={brandStyles.planCardWrap}>
      <div className={brandStyles.planCardFrame}>
        <s-box padding="base">
          <div className={brandStyles.cardShell}>
            <s-stack direction="block" gap="large">
              <s-stack direction="block" gap="small-100">
                <s-stack
                  direction="inline"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <h3 className={brandStyles.planTitle}>{PLANS.free.name}</h3>
                  {isCurrentPlan && (
                    <s-badge tone="success">
                      {t("billing.cards.currentPlan")}
                    </s-badge>
                  )}
                </s-stack>
                <s-stack
                  direction="inline"
                  alignItems="baseline"
                  gap="small-400"
                >
                  <span className={brandStyles.price}>
                    {t("billing.cards.freePrice")}
                  </span>
                </s-stack>
                <p className={brandStyles.muted}>
                  {t("billing.cards.freeDescription")}
                </p>
              </s-stack>

              <s-divider />

              <s-stack direction="block" gap="small">
                <p className={brandStyles.featureHeading}>
                  {t("billing.cards.includes")}
                </p>
                <s-stack direction="block" gap="small-100">
                  {PLANS.free.featureMessageIds.map((messageId) => (
                    <s-stack
                      key={messageId}
                      direction="inline"
                      alignItems="center"
                      gap="small-100"
                    >
                      <div className={brandStyles.check}>
                        <s-icon type="check" />
                      </div>
                      <span className={brandStyles.feature}>
                        {t(messageId)}
                      </span>
                    </s-stack>
                  ))}
                </s-stack>
              </s-stack>
            </s-stack>

            <div className={brandStyles.actions}>
              <s-stack direction="block" gap="small-100">
                <s-button
                  variant={isCurrentPlan ? "secondary" : "primary"}
                  disabled={isHydrated || undefined}
                  inlineSize="fill"
                >
                  {isCurrentPlan
                    ? t("billing.cards.currentPlan")
                    : t("billing.cards.freePlan")}
                </s-button>
              </s-stack>
            </div>
          </div>
        </s-box>
      </div>
    </div>
  );
}
