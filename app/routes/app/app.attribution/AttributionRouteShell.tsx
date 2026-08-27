import { Suspense } from "react";
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { navigateBackOrFallback } from "../../../lib/navigation";
import type { loader } from "../app.attribution";
import styles from "./AttributionRouteShell.module.css";
import { AdminSectionLoadingState } from "../../../components/AdminSectionLoadingState";
import {
  AdminPageBackTitle,
  AdminPageTitleBar,
} from "../../../components/AdminPageNavigation";
import { PixelStatusCard } from "./PixelStatusCard";
import AttributionDashboard from "./AttributionDashboard";

function AttributionCriticalFunnelHeader() {
  return (
    <section
      className={styles.criticalHeroCard}
      aria-labelledby="wpb-critical-funnel-hero-title"
    >
      <header className={styles.criticalHeroHeader}>
        <div>
          <p className={styles.criticalHeroKicker}>Bundle Funnel</p>
          <h2
            id="wpb-critical-funnel-hero-title"
            className={styles.criticalHeroTitle}
          >
            How shoppers move through your bundles
          </h2>
        </div>
      </header>
    </section>
  );
}

function AttributionCriticalStatus({
  status,
}: {
  status: { active: boolean };
}) {
  return (
    <div className={styles.pixelStatusBoundary}>
      <PixelStatusCard pixelActive={Boolean(status.active)} />
    </div>
  );
}

export default function AttributionRouteShell() {
  const { analytics, pixelStatus } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleBack = () =>
    navigateBackOrFallback(navigate, "/app/dashboard", {
      replaceFallback: true,
    });

  return (
    <>
      <AdminPageTitleBar
        title="Analytics"
        breadcrumbLabel="Dashboard"
        onBack={handleBack}
      />
      <s-query-container
        containerName="analytics-page"
        {...({ className: styles.analyticsQueryContainer } as any)}
      >
        <div className={styles.criticalHeroShell}>
          <AdminPageBackTitle
            title="Analytics"
            backLabel="Back to previous page"
            onBack={handleBack}
          />
          <Suspense fallback={null}>
            <Await resolve={pixelStatus}>
              {(resolvedPixelStatus: any) => (
                <AttributionCriticalStatus status={resolvedPixelStatus} />
              )}
            </Await>
          </Suspense>
          <AttributionCriticalFunnelHeader />
        </div>
        <Suspense fallback={<AdminSectionLoadingState label={t("common.loading.workspace")} />}>
          <Await resolve={analytics}>
            {(resolvedAnalytics: any) => (
              <AttributionDashboard data={resolvedAnalytics} />
            )}
          </Await>
        </Suspense>
      </s-query-container>
    </>
  );
}
