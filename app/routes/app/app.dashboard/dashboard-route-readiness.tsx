import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";

export function waitForDashboardRouteReady<TAppEmbedStatus, TBanners>(
  appEmbedStatus: Promise<TAppEmbedStatus>,
  banners: Promise<TBanners>,
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  return Promise.all([appEmbedStatus, banners, loadingBar]).then(([
    resolvedAppEmbedStatus,
    resolvedBanners,
  ]) => ({
    appEmbedStatus: resolvedAppEmbedStatus,
    banners: resolvedBanners,
  }));
}

export function DashboardLoadingWorkspace() {
  return (
    <>
      <AdminRouteLoadingBar label="Loading Dashboard" />
      <div className="dashboardLoadingWorkspace" role="status" aria-live="polite">
        <s-heading className="dashboardLoadingWorkspaceMessage">
          Loading your workspace
        </s-heading>
      </div>
    </>
  );
}
