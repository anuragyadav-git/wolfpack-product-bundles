import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";

export async function waitForDashboardRouteReady<TAppEmbedStatus, TBanners>(
  appEmbedStatus: Promise<TAppEmbedStatus>,
  banners: Promise<TBanners>,
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  const [resolvedAppEmbedStatus, resolvedBanners] = await Promise.all([
    appEmbedStatus,
    banners,
    loadingBar,
  ]);

  return {
    appEmbedStatus: resolvedAppEmbedStatus,
    banners: resolvedBanners,
  };
}

export function DashboardLoadingWorkspace() {
  return (
    <>
      <AdminRouteLoadingBar label="Loading Dashboard" />
      <div className="dashboardLoadingWorkspace" role="status" aria-live="polite">
        <s-heading {...({ className: "dashboardLoadingWorkspaceMessage" } as any)}>
          Loading your workspace
        </s-heading>
      </div>
    </>
  );
}
