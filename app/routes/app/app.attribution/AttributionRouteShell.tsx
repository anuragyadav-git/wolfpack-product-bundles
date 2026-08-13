import { lazy, Suspense, useMemo } from "react";
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { navigateBackOrFallback } from "../../../lib/navigation";
import type { loader } from "../app.attribution";
import styles from "./AttributionRouteShell.module.css";
import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";

const AttributionDashboard = lazy(() => import("./AttributionDashboard"));
const PixelStatusCard = lazy(() =>
  import("./PixelStatusCard").then((module) => ({
    default: module.PixelStatusCard,
  }))
);

function AttributionCriticalFunnelHeader() {
  return (
    <div className={styles.criticalHeroShell}>
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

export default function AttributionRouteShell() {
  const { analytics, pixelStatus } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const routeReady = useMemo(
    () => Promise.all([analytics, pixelStatus, waitForAdminRouteLoadingBar()]),
    [analytics, pixelStatus],
  );

  return (
    <Suspense fallback={<AdminRouteLoadingBar label="Loading Analytics" />}>
      <Await resolve={routeReady}>
        {([, resolvedPixelStatus]) => (
          <>
            <ui-title-bar title="Analytics">
              <button
                variant="breadcrumb"
                onClick={() =>
                  navigateBackOrFallback(navigate, "/app/dashboard", { replaceFallback: true })
                }
              >
                Dashboard
              </button>
            </ui-title-bar>
            <s-query-container
              containerName="analytics-page"
              className={styles.analyticsQueryContainer}
            >
              <AttributionCriticalFunnelHeader />
              <AttributionCriticalStatus status={resolvedPixelStatus} />
              <AttributionDashboard />
            </s-query-container>
          </>
        )}
      </Await>
    </Suspense>
  );
}
