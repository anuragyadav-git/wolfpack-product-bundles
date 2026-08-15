import type { ReactNode } from "react";
import styles from "./AdminPageNavigation.module.css";

type AdminPageTitleBarProps = {
  title: string;
  breadcrumbLabel: string;
  onBack: () => void;
};

export function AdminPageTitleBar({
  title,
  breadcrumbLabel,
  onBack,
}: AdminPageTitleBarProps) {
  return (
    <ui-title-bar title={title}>
      <button variant="breadcrumb" onClick={onBack}>
        {breadcrumbLabel}
      </button>
    </ui-title-bar>
  );
}

type AdminPageBackTitleProps = {
  title: string;
  backLabel: string;
  onBack: () => void;
  actions?: ReactNode;
};

export function AdminPageBackTitle({
  title,
  backLabel,
  onBack,
  actions,
}: AdminPageBackTitleProps) {
  return (
    <header className={styles.header}>
      <s-stack direction="inline" gap="small" alignItems="center">
        <s-button
          variant="tertiary"
          icon="arrow-left"
          accessibilityLabel={backLabel}
          onClick={onBack}
        />
        <s-heading>{title}</s-heading>
      </s-stack>
      {actions}
    </header>
  );
}
