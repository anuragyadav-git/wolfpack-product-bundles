import styles from "./AdminRouteLoadingBar.module.css";

export const ADMIN_ROUTE_LOADING_BAR_DURATION_MS = 800;

export function waitForAdminRouteLoadingBar() {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, ADMIN_ROUTE_LOADING_BAR_DURATION_MS);
  });
}

export function AdminRouteLoadingBar({ label }: { label: string }) {
  return (
    <div
      className={styles.loadingBar}
      role="progressbar"
      aria-label={label}
      aria-busy="true"
    >
      <span className={styles.loadingBarIndicator} aria-hidden="true" />
    </div>
  );
}
