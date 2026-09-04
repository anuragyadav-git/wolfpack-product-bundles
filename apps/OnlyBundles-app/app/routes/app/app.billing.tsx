/**
 * Billing Page Route
 *
 * Manages subscription and billing settings.
 * Uses shared billing components from app/components/billing.
 */

import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
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
import { getShopifyAppPricingUrl } from "../../services/subscriptions/app-pricing-navigation.server";
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

    const [subscriptionInfo, quickStats, currentBundleCount] =
      await Promise.all([
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
        isActive:
          subscriptionInfo.status === "ACTIVE" ||
          subscriptionInfo.planCode === "FREE",
        billingInterval: subscriptionInfo.billingInterval,
        bundleLimit: publicLimit ?? Number.MAX_SAFE_INTEGER,
        currentBundleCount,
        canCreateBundle:
          publicLimit === null || currentBundleCount < publicLimit,
      },
      stats: quickStats,
      plans: PLANS,
      upgraded: upgraded === "true",
      callbackError: error ?? null,
    });
  } catch (error: any) {
    AppLogger.error(
      "Error loading billing page",
      {
        component: "app.billing",
        operation: "loader",
      },
      error
    );

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
      AppLogger.error(
        "Error opening Shopify plan management",
        {
          component: "app.billing",
          operation: "action-cancel",
        },
        error
      );

      return json(
        { error: "Failed to open Shopify plan management" },
        { status: 500 }
      );
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

function CustomProgressBar({
  progress,
  tone,
}: {
  progress: number;
  tone: string;
}) {
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

  const isCancelling =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === "cancel";
  const handleCancelSubscription = useCallback(() => {
    fetcher.submit({ intent: "cancel" }, { method: "post" });
    closeCancelConfirm();
  }, [fetcher, closeCancelConfirm]);

  useEffect(() => {
    if (
      fetcher.data &&
      "hostedPlanUrl" in fetcher.data &&
      fetcher.data.hostedPlanUrl
    ) {
      open(fetcher.data.hostedPlanUrl, "_top");
    }
  }, [fetcher.data]);

  const currentPlan = data.subscription?.plan ?? "free";
  const isFreePlan = currentPlan === "free";
  const isGrowthPlan = currentPlan === "growth";

  const usagePercentage = data.subscription
    ? calculateUsagePercentage(
        data.subscription.currentBundleCount,
        data.subscription.bundleLimit
      )
    : 0;

  const progressBarTone = getProgressBarTone(usagePercentage);
  const handleBack = () =>
    navigateBackOrFallback(navigate, "/app/dashboard", {
      replaceFallback: true,
    });
  const overviewItems = data.stats
    ? [
        {
          id: "active-bundles",
          icon: "check-circle" as const,
          value: data.stats.activeBundles,
          label: t("billing.route.activeBundles"),
        },
        {
          id: "total-steps",
          icon: "note" as const,
          value: data.stats.totalSteps,
          label: t("billing.route.totalSteps"),
        },
        {
          id: "product-page",
          icon: "product" as const,
          value: data.stats.bundleTypes.productPage,
          label: t("billing.route.productPage"),
        },
        {
          id: "full-page",
          icon: "globe" as const,
          value: data.stats.bundleTypes.fullPage,
          label: t("billing.route.fullPage"),
        },
      ]
    : [];

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
              <UpgradeSuccessBanner onDismiss={dismissSuccessBanner} />
            )}

            {showErrorBanner && data.callbackError && (
              <SubscriptionErrorBanner
                errorCode={data.callbackError}
                onRetry={dismissErrorBanner}
                onDismiss={dismissErrorBanner}
              />
            )}

            <s-section heading={t("billing.route.currentPlan")}>
              <s-stack direction="block" gap="large">
                <s-grid
                  gridTemplateColumns="@container billing-page (inline-size > 640px) 1fr auto, 1fr"
                  gap="base"
                  alignItems="center"
                >
                  <s-stack direction="inline" alignItems="center" gap="base">
                    <s-box
                      padding="small"
                      background="subdued"
                      borderRadius="base"
                    >
                      <s-icon
                        type="credit-card"
                        tone={isGrowthPlan ? "success" : "info"}
                      />
                    </s-box>
                    <s-stack direction="block" gap="small-100">
                      <s-heading>{PLANS[currentPlan].name}</s-heading>
                      <s-badge
                        tone={isGrowthPlan ? "success" : "info"}
                        icon={
                          data.subscription?.isActive
                            ? "check-circle"
                            : undefined
                        }
                      >
                        {data.subscription?.isActive
                          ? t("billing.route.active")
                          : t("billing.route.inactive")}
                      </s-badge>
                    </s-stack>
                  </s-stack>
                  {isGrowthPlan && (
                    <s-stack
                      direction="inline"
                      gap="small-100"
                      alignItems="baseline"
                    >
                      <s-heading>${PLANS.growth.price}</s-heading>
                      <s-text color="subdued">
                        {t("billing.cards.perMonth")}
                      </s-text>
                    </s-stack>
                  )}
                </s-grid>

                <s-divider />

                <s-stack direction="block" gap="base">
                  <s-grid
                    gridTemplateColumns="1fr auto"
                    gap="base"
                    alignItems="center"
                  >
                    <s-stack direction="inline" alignItems="center" gap="small">
                      <s-box>
                        <s-icon type="product" color="subdued" />
                      </s-box>
                      <s-text type="strong">
                        {t("billing.route.bundleUsage")}
                      </s-text>
                    </s-stack>
                    <s-badge
                      tone={
                        usagePercentage >= 90
                          ? "critical"
                          : usagePercentage >= 70
                          ? "warning"
                          : "success"
                      }
                    >
                      {isFreePlan
                        ? t("billing.route.bundleCount", {
                            current: data.subscription?.currentBundleCount ?? 0,
                            limit: data.subscription?.bundleLimit ?? 0,
                          })
                        : t("billing.values.unlimited")}
                    </s-badge>
                  </s-grid>
                  {isFreePlan && (
                    <CustomProgressBar
                      progress={usagePercentage}
                      tone={progressBarTone}
                    />
                  )}
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

                {data.stats && (
                  <>
                    <s-divider />
                    <s-stack direction="block" gap="base">
                      <s-text type="strong">
                        {t("billing.route.overview")}
                      </s-text>
                      <s-grid
                        gridTemplateColumns="@container billing-page (inline-size > 560px) 1fr 1fr 1fr 1fr, 1fr 1fr"
                        gap="base"
                      >
                        {overviewItems.map((item) => (
                          <s-box
                            key={item.id}
                            padding="base"
                            background="subdued"
                            border="base"
                            borderRadius="base"
                          >
                            <s-stack direction="block" gap="small">
                              <s-box>
                                <s-icon type={item.icon} color="subdued" />
                              </s-box>
                              <s-heading>{item.value}</s-heading>
                              <s-text color="subdued">{item.label}</s-text>
                            </s-stack>
                          </s-box>
                        ))}
                      </s-grid>
                    </s-stack>
                  </>
                )}

                {isFreePlan && (
                  <>
                    <s-divider />
                    <s-stack direction="inline" justifyContent="end">
                      <s-box>
                        <s-button
                          variant="primary"
                          icon="arrow-right"
                          href="/app/billing/plans"
                        >
                          {t("common.actions.upgradeNow")}
                        </s-button>
                      </s-box>
                    </s-stack>
                  </>
                )}

                {isGrowthPlan && !showCancelConfirm && (
                  <>
                    <s-divider />
                    <s-stack direction="inline" justifyContent="end">
                      <s-box>
                        <s-button
                          variant="secondary"
                          icon="edit"
                          onClick={openCancelConfirm}
                          disabled={isCancelling || undefined}
                        >
                          {t("billing.route.cancelSubscription")}
                        </s-button>
                      </s-box>
                    </s-stack>
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
                          <s-paragraph>
                            {t("billing.route.downgradeBody", {
                              limit: PLANS.free.bundleLimit,
                            })}
                          </s-paragraph>
                          {data.subscription &&
                            data.subscription.currentBundleCount >
                              PLANS.free.bundleLimit && (
                              <s-text type="strong">
                                {t("billing.route.archiveWarning", {
                                  current: data.subscription.currentBundleCount,
                                  excess:
                                    data.subscription.currentBundleCount -
                                    PLANS.free.bundleLimit,
                                })}
                              </s-text>
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

            <s-section heading={t("billing.route.features")}>
              <s-grid
                gridTemplateColumns="@container billing-page (inline-size > 700px) 1fr 1fr, 1fr"
                gap="base"
              >
                {PLANS[currentPlan].featureMessageIds.map((messageId) => (
                  <s-box
                    key={messageId}
                    padding="base"
                    border="base"
                    borderRadius="base"
                  >
                    <s-stack direction="inline" alignItems="center" gap="small">
                      <s-box>
                        <s-icon type="check-circle" tone="success" />
                      </s-box>
                      <s-box>
                        <s-text>{t(messageId)}</s-text>
                      </s-box>
                    </s-stack>
                  </s-box>
                ))}
              </s-grid>
            </s-section>

            <s-section heading={t("billing.route.needHelp")}>
              <s-grid
                gridTemplateColumns="@container billing-page (inline-size > 560px) 1fr auto, 1fr"
                gap="base"
                alignItems="center"
              >
                <s-stack direction="inline" alignItems="center" gap="base">
                  <s-box
                    padding="small"
                    background="subdued"
                    borderRadius="base"
                  >
                    <s-icon type="info" color="subdued" />
                  </s-box>
                  <s-paragraph color="subdued">
                    {t("billing.route.helpBody")}
                  </s-paragraph>
                </s-stack>
                <s-box>
                  <s-button onClick={() => openSupportChat()}>
                    {t("billing.actions.contactSupport")}
                  </s-button>
                </s-box>
              </s-grid>
            </s-section>
          </s-stack>
        </div>
      </s-query-container>
    </>
  );
}
