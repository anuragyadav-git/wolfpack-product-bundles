import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";

export async function waitForDashboardRouteReady<TBanners>(
  banners: Promise<TBanners>,
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  const [resolvedBanners] = await Promise.all([
    banners,
    loadingBar,
  ]);

  return {
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
