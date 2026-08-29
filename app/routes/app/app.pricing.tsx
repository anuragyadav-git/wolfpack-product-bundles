/**
 * Pricing Page Route
 *
 * Displays pricing plans and handles plan selection/upgrade.
 * Uses shared billing components from app/components/billing.
 */

import { defer, json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { Await, useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import { PLANS } from "../../constants/plans";
import { AppLogger } from "../../lib/logger";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pricingStyles from "../../styles/routes/app-pricing.module.css";

// Import shared billing components
import {
  SubscriptionQuotaCard,
  FreePlanCard,
  GrowthPlanCard,
  FeatureComparisonTable,
  UpgradeConfirmationModal,
  ValuePropsSection,
  FAQSection,
} from "../../components/billing";
import { navigateBackOrFallback } from "../../lib/navigation";
import {
  AdminPageBackTitle,
  AdminPageTitleBar,
} from "../../components/AdminPageNavigation";
import { AdminSectionLoadingState } from "../../components/AdminSectionLoadingState";
import { getShopifyAppPricingUrl } from "../../services/subscriptions/app-pricing-navigation.server";
import { recordBusinessEvent } from "../../services/app-events.server";
import { resolveShopEntitlements } from "../../services/subscriptions/subscription-service.server";
import { getCurrentShopifyAppIdentity } from "../../services/subscriptions/shopify-app-identity.server";
import db from "../../db.server";

type PricingSubscriptionData = {
  error?: "Failed to load pricing information";
  currentPlan: keyof typeof PLANS;
  currentBundleCount: number;
  bundleLimit: number;
  canCreateBundle: boolean;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const subscription = (async () => {
    // Reuse cached subscription info from dashboard/bootstrap whenever available.
    try {
      const [subscriptionInfo, currentBundleCount] = await Promise.all([
        resolveShopEntitlements({ shopDomain }),
        db.bundle.count({
          where: { shopId: shopDomain, status: { in: ["active", "unlisted"] } },
        }),
      ]);
      if (!subscriptionInfo.entitlements) {
        throw new Error("Could not verify subscription information");
      }
      const bundleLimit = subscriptionInfo.entitlements.limits.publicBundles
        ?? Number.MAX_SAFE_INTEGER;

      return {
        currentPlan: subscriptionInfo.planCode === "GROWTH" ? "growth" : "free",
        currentBundleCount,
        bundleLimit,
        canCreateBundle: bundleLimit === Number.MAX_SAFE_INTEGER
          || currentBundleCount < bundleLimit,
      } satisfies PricingSubscriptionData;
    } catch (error: any) {
      AppLogger.error("Error loading pricing page", {
        component: "app.pricing",
        operation: "loader"
      }, error);

      return {
        error: "Failed to load pricing information" as const,
        currentPlan: "free",
        currentBundleCount: 0,
        bundleLimit: PLANS.free.bundleLimit,
        canCreateBundle: true,
      } satisfies PricingSubscriptionData;
    }
  })();

  return defer({
    subscription,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const formData = await request.formData();
  const plan = formData.get("plan");

  if (plan === "growth") {
    try {
      const app = await getCurrentShopifyAppIdentity(admin);
      const hostedPlanUrl = getShopifyAppPricingUrl(shopDomain, app.handle);
      await recordBusinessEvent({
        eventHandle: "subscription_checkout_started",
        shopDomain,
        surface: "pricing",
        result: "redirect",
        attributes: { plan_code: "GROWTH" },
        sendToShopify: false,
      });
      return json({
        success: true,
        hostedPlanUrl,
      });

    } catch (error: any) {
      AppLogger.error("Error creating subscription from pricing page", {
        component: "app.pricing",
        operation: "action-upgrade"
      }, error);

      return json(
        { error: "Failed to open Shopify plan selection" },
        { status: 500 }
      );
    }
  }

  return json({ error: "Invalid plan" }, { status: 400 });
}

function PricingBody({
  data,
}: {
  data: PricingSubscriptionData;
}) {
  const fetcher = useFetcher<typeof action>();

  // Upgrade confirmation modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSelectPlan = useCallback((planId: string) => {
    if (planId === "growth") {
      setShowUpgradeModal(true);
    }
  }, []);

  const handleConfirmUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    fetcher.submit(
      { plan: "growth" },
      { method: "post" }
    );
  }, [fetcher]);

  // Handle redirect to Shopify billing confirmation
  useEffect(() => {
    if (fetcher.data && "hostedPlanUrl" in fetcher.data && fetcher.data.hostedPlanUrl) {
      open(fetcher.data.hostedPlanUrl, '_top');
    }
  }, [fetcher.data]);

  const isFreePlan = data.currentPlan === "free";
  const isGrowthPlan = data.currentPlan === "growth";
  const isUpgrading = fetcher.state === "submitting";

  // Bundle quota data
  const currentBundleCount = data.currentBundleCount;
  const bundleLimit = data.bundleLimit;

  return (
    <>
      {showUpgradeModal && (
        <UpgradeConfirmationModal
          open={showUpgradeModal}
          isLoading={isUpgrading}
          onConfirm={handleConfirmUpgrade}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      <div className={pricingStyles.contentStack}>
        <SubscriptionQuotaCard
          currentBundleCount={currentBundleCount}
          bundleLimit={bundleLimit}
          isFreePlan={isFreePlan}
          showUpgradePrompt={true}
        />

        {isFreePlan && <ValuePropsSection />}

        <div className={pricingStyles.planCardsGrid}>
          <FreePlanCard isCurrentPlan={isFreePlan} />
          <GrowthPlanCard
            isCurrentPlan={isGrowthPlan}
            isUpgrading={isUpgrading}
            onSelectPlan={() => handleSelectPlan("growth")}
          />
        </div>

        <FeatureComparisonTable />

        <FAQSection />
      </div>
    </>
  );
}

export default function PricingPage() {
  const { subscription } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      <s-query-container containerName="pricing-page">
        <div className={pricingStyles.pageShell}>
          <AdminPageBackTitle
            title={t("billing.route.title")}
            backLabel={t("billing.actions.back")}
            onBack={handleBack}
          />
          <Suspense fallback={<AdminSectionLoadingState label={t("common.loading.workspace")} />}>
            <Await resolve={subscription}>
              {(data) => <PricingBody data={data} />}
            </Await>
          </Suspense>
        </div>
      </s-query-container>
    </>
  );
}
