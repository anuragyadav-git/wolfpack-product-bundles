import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";

const DEFAULT_APP_EMBED_STATUS = { appEmbedEnabled: false, themeEditorUrl: null };
const DEFAULT_BANNERS = { subscription: null, proxyHealthy: true };

export function waitForDashboardRouteReady<TAppEmbedStatus, TBanners>(
  appEmbedStatus: Promise<TAppEmbedStatus>,
  banners: Promise<TBanners>,
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  const safeAppEmbedStatus = appEmbedStatus.catch(() => DEFAULT_APP_EMBED_STATUS as TAppEmbedStatus);
  const safeBanners = banners.catch(() => DEFAULT_BANNERS as TBanners);

  let timerId: ReturnType<typeof setTimeout> | undefined;

  const readinessPromise = Promise.all([safeAppEmbedStatus, safeBanners, loadingBar]).then(
    ([resolvedAppEmbedStatus, resolvedBanners]) => {
      if (timerId) clearTimeout(timerId);
      return {
        appEmbedStatus: resolvedAppEmbedStatus,
        banners: resolvedBanners,
      };
    },
  );

  const timeoutPromise = new Promise<{ appEmbedStatus: TAppEmbedStatus; banners: TBanners }>((resolve) => {
    timerId = globalThis.setTimeout(() => {
      Promise.all([safeAppEmbedStatus, safeBanners])
        .then(([s, b]) => resolve({ appEmbedStatus: s, banners: b }))
        .catch(() =>
          resolve({
            appEmbedStatus: DEFAULT_APP_EMBED_STATUS as TAppEmbedStatus,
            banners: DEFAULT_BANNERS as TBanners,
          }),
        );
    }, 5000);
  });

  return Promise.race([readinessPromise, timeoutPromise]);
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
