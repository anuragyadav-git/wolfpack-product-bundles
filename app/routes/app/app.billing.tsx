/**
 * Billing Page Route
 *
 * Manages subscription and billing settings.
 * Uses shared billing components from app/components/billing.
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import { BundleAnalyticsService } from "../../services/bundle-analytics.server";
import { PLANS } from "../../constants/plans";
import { AppLogger } from "../../lib/logger";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import billingStyles from "../../styles/routes/app-billing.module.css";
import { useBillingState } from "../../hooks/useBillingState";
import {
  calculateUsagePercentage,
  getProgressBarTone,
} from "../../utils/pricing";
import { navigateBackOrFallback } from "../../lib/navigation";
import { openSupportChat } from "../../lib/support-chat.client";
import {
  AdminPageBackTitle,
  AdminPageTitleBar,
} from "../../components/AdminPageNavigation";
import { resolveShopEntitlements } from "../../services/subscriptions/subscription-service.server";
import {
  getShopifyAppPricingUrl,
} from "../../services/subscriptions/app-pricing-navigation.server";
import db from "../../db.server";
import { getCurrentShopifyAppIdentity } from "../../services/subscriptions/shopify-app-identity.server";

// Import shared billing components
import {
  UpgradeSuccessBanner,
  SubscriptionErrorBanner,
} from "../../components/billing";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  try {
    const url = new URL(request.url);
    const upgraded = url.searchParams.get("upgraded");
    const error = url.searchParams.get("error");

    const [subscriptionInfo, quickStats, currentBundleCount] = await Promise.all([
    resolveShopEntitlements({ shopDomain }),
      BundleAnalyticsService.getQuickStats(shopDomain),
      db.bundle.count({
        where: { shopId: shopDomain, status: { in: ["active", "unlisted"] } },
      }),
    ]);

    if (!subscriptionInfo.entitlements || !subscriptionInfo.planCode) {
      throw new Error("Could not retrieve subscription information");
    }

    const publicLimit = subscriptionInfo.entitlements.limits.publicBundles;

    return json({
      subscription: {
        plan: subscriptionInfo.planCode.toLowerCase() as "free" | "growth",
        status: subscriptionInfo.status.toLowerCase(),
        isActive: subscriptionInfo.status === "ACTIVE" || subscriptionInfo.planCode === "FREE",
        billingInterval: subscriptionInfo.billingInterval,
        bundleLimit: publicLimit ?? Number.MAX_SAFE_INTEGER,
        currentBundleCount,
        canCreateBundle: publicLimit === null || currentBundleCount < publicLimit,
      },
      stats: quickStats,
      plans: PLANS,
      upgraded: upgraded === "true",
      callbackError: error ?? null,
    });
  } catch (error: any) {
    AppLogger.error("Error loading billing page", {
      component: "app.billing",
      operation: "loader"
    }, error);

    return json(
      {
        error: "Failed to load billing information",
        subscription: null,
        stats: null,
        plans: PLANS,
        upgraded: false,
        callbackError: null,
      },
      { status: 500 }
    );
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "cancel") {
    try {
      const app = await getCurrentShopifyAppIdentity(admin);
      return json({
        success: true,
        hostedPlanUrl: getShopifyAppPricingUrl(session.shop, app.handle),
      });
    } catch (error: any) {
      AppLogger.error("Error opening Shopify plan management", {
        component: "app.billing",
        operation: "action-cancel"
      }, error);

      return json({ error: "Failed to open Shopify plan management" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

function CustomProgressBar({ progress, tone }: { progress: number; tone: string }) {
  return (
    <div className={billingStyles.progressTrack}>
      <div
        className={billingStyles.progressBar}
        data-tone={tone}
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
        }}
      />
    </div>
  );
}

export default function BillingPage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const billingState = useBillingState({
    upgraded: data.upgraded,
    callbackError: data.callbackError,
  });
  const {
    showCancelConfirm,
    openCancelConfirm,
    closeCancelConfirm,
    showSuccessBanner,
    dismissSuccessBanner,
    showErrorBanner,
    dismissErrorBanner,
  } = billingState;

  const isCancelling = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "cancel";
  const handleCancelSubscription = useCallback(() => {
    fetcher.submit({ intent: "cancel" }, { method: "post" });
    closeCancelConfirm();
  }, [fetcher, closeCancelConfirm]);

  useEffect(() => {
    if (fetcher.data && "hostedPlanUrl" in fetcher.data && fetcher.data.hostedPlanUrl) {
      open(fetcher.data.hostedPlanUrl, "_top");
    }
  }, [fetcher.data]);

  const currentPlan = data.subscription?.plan ?? "free";
  const isFreePlan = currentPlan === "free";
  const isGrowthPlan = currentPlan === "growth";

  const usagePercentage = data.subscription
    ? calculateUsagePercentage(data.subscription.currentBundleCount, data.subscription.bundleLimit)
    : 0;

  const progressBarTone = getProgressBarTone(usagePercentage);
  const handleBack = () =>
    navigateBackOrFallback(navigate, "/app/dashboard", {
      replaceFallback: true,
    });

  return (
    <>
      <AdminPageTitleBar
        title={t("billing.route.title")}
        breadcrumbLabel={t("billing.route.dashboard")}
        onBack={handleBack}
      />

      <s-query-container containerName="billing-page">
        <div className={billingStyles.pageShell}>
          <AdminPageBackTitle
            title={t("billing.route.title")}
            backLabel={t("billing.actions.back")}
            onBack={handleBack}
          />
          <s-stack direction="block" gap="large">

          {showSuccessBanner && (
            <UpgradeSuccessBanner
              onDismiss={dismissSuccessBanner}
            />
          )}

          {showErrorBanner && data.callbackError && (
            <SubscriptionErrorBanner
              errorCode={data.callbackError}
              onRetry={dismissErrorBanner}
              onDismiss={dismissErrorBanner}
            />
          )}

          {/* Current Plan Status */}
          <s-section>
            <s-stack direction="block" gap="base">
              <s-stack direction="inline" justifyContent="space-between" alignItems="start">
                <s-stack direction="block" gap="small-100">
                  <s-stack direction="inline" alignItems="center" gap="small-100">
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t("billing.route.currentPlan")}</h2>
                    {isGrowthPlan && (
                      <div className={billingStyles.starIcon}>
                        <s-icon type="check" />
                      </div>
                    )}
                  </s-stack>
                  <s-stack direction="inline" alignItems="center" gap="small">
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{PLANS[currentPlan].name}</span>
                    <s-badge tone={isGrowthPlan ? "success" : "info"}>
                      {data.subscription?.isActive ? t("billing.route.active") : t("billing.route.inactive")}
                    </s-badge>
                  </s-stack>
                </s-stack>
                {isGrowthPlan && (
                  <s-stack direction="block" gap="small-400" alignItems="end">
                    <span style={{ fontSize: 28, fontWeight: 700 }}>${PLANS.growth.price}</span>
                    <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>{t("billing.cards.perMonth")}</p>
                  </s-stack>
                )}
              </s-stack>

              <s-divider />

              {/* Bundle Usage */}
              <s-stack direction="block" gap="small">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t("billing.route.bundleUsage")}</p>
                  <s-badge
                    tone={
                      usagePercentage >= 90 ? "critical" :
                      usagePercentage >= 70 ? "warning" : "success"
                    }
                  >
                    {isFreePlan
                      ? t("billing.route.bundleCount", { current: data.subscription?.currentBundleCount ?? 0, limit: data.subscription?.bundleLimit ?? 0 })
                      : t("billing.values.unlimited")}
                  </s-badge>
                </s-stack>
                {isFreePlan && <CustomProgressBar progress={usagePercentage} tone={progressBarTone} />}
                {!data.subscription?.canCreateBundle && (
                  <s-box paddingBlockEnd="small-200">
                    <s-banner
                      tone="warning"
                      heading={t("common.upgradePrompt.limitReachedTitle")}
                      dismissible={false}
                      hidden={false}
                    >
                      {t("billing.route.limitReached")}
                      {isFreePlan && ` ${t("billing.route.limitUpgrade")}`}
                    </s-banner>
                  </s-box>
                )}
              </s-stack>

              {isFreePlan && (
                <>
                  <s-divider />
                  <s-button
                    variant="primary"
                    href="/app/billing/plans"
                  >
                    {t("common.actions.upgradeNow")}
                  </s-button>
                </>
              )}

              {/* Quick Stats */}
              {data.stats && (
                <>
                  <s-divider />
                  <s-stack direction="block" gap="small-100">
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t("billing.route.overview")}</p>
                    <s-grid gridTemplateColumns="@container billing-page (inline-size > 560px) 1fr 1fr 1fr 1fr, 1fr 1fr" gap="base">
                      <s-stack direction="block" gap="small-400">
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{data.stats.activeBundles}</span>
                        <span style={{ fontSize: 12, color: "#6d7175" }}>{t("billing.route.activeBundles")}</span>
                      </s-stack>
                      <s-stack direction="block" gap="small-400">
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{data.stats.totalSteps}</span>
                        <span style={{ fontSize: 12, color: "#6d7175" }}>{t("billing.route.totalSteps")}</span>
                      </s-stack>
                      <s-stack direction="block" gap="small-400">
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{data.stats.bundleTypes.productPage}</span>
                        <span style={{ fontSize: 12, color: "#6d7175" }}>{t("billing.route.productPage")}</span>
                      </s-stack>
                      <s-stack direction="block" gap="small-400">
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{data.stats.bundleTypes.fullPage}</span>
                        <span style={{ fontSize: 12, color: "#6d7175" }}>{t("billing.route.fullPage")}</span>
                      </s-stack>
                    </s-grid>
                  </s-stack>
                </>
              )}

              {/* Cancel Subscription */}
              {isGrowthPlan && !showCancelConfirm && (
                <>
                  <s-divider />
                  <s-button
                    variant="tertiary"
                    tone="critical"
                    onClick={openCancelConfirm}
                    disabled={isCancelling || undefined}
                  >
                    {t("billing.route.cancelSubscription")}
                  </s-button>
                </>
              )}

              {showCancelConfirm && (
                <>
                  <s-divider />
                  <s-box paddingBlockEnd="small-200">
                    <s-banner
                      tone="warning"
                      heading={t("billing.route.cancelHeading")}
                      dismissible={false}
                      hidden={false}
                    >
                      <s-stack direction="block" gap="small">
                        <p style={{ margin: 0, fontSize: 14 }}>
                          {t("billing.route.downgradeBody", { limit: PLANS.free.bundleLimit })}
                        </p>
                        {data.subscription && data.subscription.currentBundleCount > PLANS.free.bundleLimit && (
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                            {t("billing.route.archiveWarning", { current: data.subscription.currentBundleCount, excess: data.subscription.currentBundleCount - PLANS.free.bundleLimit })}
                          </p>
                        )}
                        <s-stack direction="inline" gap="small-100">
                          <s-button
                            variant="primary"
                            onClick={handleCancelSubscription}
                            loading={isCancelling || undefined}
                          >
                            {t("billing.route.confirmCancellation")}
                          </s-button>
                          <s-button onClick={closeCancelConfirm}>
                            {t("billing.route.keepSubscription")}
                          </s-button>
                        </s-stack>
                      </s-stack>
                    </s-banner>
                  </s-box>
                </>
              )}
            </s-stack>
          </s-section>

          {/* Plan Features */}
          <s-section>
            <s-stack direction="block" gap="base">
              <s-heading>{t("billing.route.features")}</s-heading>
              <div className={billingStyles.featuresGrid}>
                {PLANS[currentPlan].featureMessageIds.map((messageId) => (
                  <s-stack key={messageId} direction="inline" alignItems="center" gap="small-100">
                    <div className={billingStyles.checkIcon}>
                      <s-icon type="check" />
                    </div>
                    <s-text>{t(messageId)}</s-text>
                  </s-stack>
                ))}
              </div>
            </s-stack>
          </s-section>

          {/* Help Section */}
          <s-section>
            <s-stack direction="block" gap="small-100">
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t("billing.route.needHelp")}</h3>
              <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
                {t("billing.route.helpBody")}
              </p>
              <s-button
                onClick={() => openSupportChat()}
              >
                {t("billing.actions.contactSupport")}
              </s-button>
            </s-stack>
          </s-section>

          </s-stack>
        </div>
      </s-query-container>
    </>
  );
}
