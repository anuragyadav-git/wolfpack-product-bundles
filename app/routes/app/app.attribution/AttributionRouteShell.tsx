import { lazy, Suspense, useMemo } from "react";
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { navigateBackOrFallback } from "../../../lib/navigation";
import type { loader } from "../app.attribution";
import styles from "./AttributionRouteShell.module.css";
import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";
import {
  AdminPageBackTitle,
  AdminPageTitleBar,
} from "../../../components/AdminPageNavigation";

const AttributionDashboard = lazy(() => import("./AttributionDashboard"));
const PixelStatusCard = lazy(() =>
  import("./PixelStatusCard").then((module) => ({
    default: module.PixelStatusCard,
  }))
);

function AttributionCriticalFunnelHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.criticalHeroShell}>
      <AdminPageBackTitle
        title="Analytics"
        backLabel="Back to previous page"
        onBack={onBack}
      />
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
    </div>
  );
}

function AttributionCriticalStatus({
  status,
}: {
  status: { active: boolean };
}) {
  return (
    <div className={styles.pixelStatusBoundary}>
      <div className={styles.pixelStatusShell}>
        <PixelStatusCard pixelActive={Boolean(status.active)} />
      </div>
    </div>
  );
}

export function waitForAnalyticsRouteReady<TAnalytics, TPixelStatus>(
  analytics: Promise<TAnalytics>,
  pixelStatus: Promise<TPixelStatus>,
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  return Promise.all([analytics, pixelStatus, loadingBar]);
}

export default function AttributionRouteShell() {
  const { analytics, pixelStatus } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const routeReady = useMemo(
    () => waitForAnalyticsRouteReady(analytics, pixelStatus),
    [analytics, pixelStatus],
  );
  const handleBack = () =>
    navigateBackOrFallback(navigate, "/app/dashboard", {
      replaceFallback: true,
    });

  return (
    <Suspense fallback={<AdminRouteLoadingBar label="Loading Analytics" />}>
      <Await resolve={routeReady}>
        {([resolvedAnalytics, resolvedPixelStatus]) => (
          <>
            <AdminPageTitleBar
              title="Analytics"
              breadcrumbLabel="Dashboard"
              onBack={handleBack}
            />
            <s-query-container
              containerName="analytics-page"
              className={styles.analyticsQueryContainer}
            >
              <AttributionCriticalFunnelHeader onBack={handleBack} />
              <AttributionCriticalStatus status={resolvedPixelStatus} />
              <AttributionDashboard
                data={resolvedAnalytics}
                pixelStatus={resolvedPixelStatus}
              />
            </s-query-container>
          </>
        )}
      </Await>
    </Suspense>
  );
}
