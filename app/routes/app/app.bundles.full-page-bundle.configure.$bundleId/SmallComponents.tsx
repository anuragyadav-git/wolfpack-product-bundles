import { useState, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { HelpTooltipKey } from "../../../constants/help-tooltips";
import fullPageBundleStyles from "../../../styles/routes/full-page-bundle-configure.module.css";
import { ConfigureHelpPopover } from "../_shared/bundle-configure/ConfigureHelpPopover";

export const QuestionHelpTooltip = ConfigureHelpPopover;

export function SettingsRow({
  title,
  description,
  tooltipKey,
  children,
}: {
  title: string;
  description?: string;
  tooltipKey?: HelpTooltipKey;
  children: ReactNode;
}) {
  return (
    <div className={fullPageBundleStyles.settingsRow}>
      <div className={fullPageBundleStyles.settingsRowText}>
        <p className={fullPageBundleStyles.settingsRowTitle}>
          {title}
          {tooltipKey && <QuestionHelpTooltip tooltipKey={tooltipKey} />}
        </p>
        {description && (
          <p className={fullPageBundleStyles.settingsRowDescription}>
            {description}
          </p>
        )}
      </div>
      <div className={fullPageBundleStyles.settingsRowControl}>{children}</div>
    </div>
  );
}

export function VisibilityBadge({ isOptimised }: { isOptimised: boolean }) {
  const { t } = useTranslation();
  const description = t(`tooltips.bundleVisibilityPending.description`);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const showTooltip = () => {
    if (wrapperRef.current) {
      const r = wrapperRef.current.getBoundingClientRect();
      setTooltipPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  };
  const hideTooltip = () => setTooltipPos(null);

  return (
    <span
      ref={wrapperRef}
      className={
        isOptimised
          ? fullPageBundleStyles.optimisedBadge
          : fullPageBundleStyles.pendingBadge
      }
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
      aria-label={`${isOptimised ? "Optimised" : "Pending"} — ${description}`}
    >
      {isOptimised ? "Optimised" : "Pending"}
      <svg
        width="11"
        height="11"
        viewBox="0 0 13 13"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="6.5"
          cy="6.5"
          r="5.75"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="6.5"
          y1="5.75"
          x2="6.5"
          y2="9.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="6.5" cy="4.25" r="0.75" fill="currentColor" />
      </svg>
      {tooltipPos && (
        <span
          className={fullPageBundleStyles.pendingTooltipCard}
          style={{
            position: "fixed",
            top: tooltipPos.top,
            right: tooltipPos.right,
          }}
          role="tooltip"
        >
          {description}
        </span>
      )}
    </span>
  );
}
