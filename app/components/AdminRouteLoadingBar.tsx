import styles from "./AdminRouteLoadingBar.module.css";

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
