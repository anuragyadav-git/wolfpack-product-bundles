import type { ReactNode } from "react";

import styles from "./DisabledConfigurationRegion.module.css";

export function DisabledConfigurationRegion({
  children,
  disabled,
}: {
  children?: ReactNode;
  disabled: boolean;
}) {
  const inertAttributes = disabled
    ? ({ inert: "" } as Record<string, string>)
    : {};

  return (
    <div
      {...inertAttributes}
      className={`${styles.region} ${disabled ? styles.disabled : ""}`.trim()}
      aria-disabled={disabled || undefined}
    >
      {children}
    </div>
  );
}
