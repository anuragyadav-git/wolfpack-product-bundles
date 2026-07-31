import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import styles from "./BundleReadinessOverlay.module.css";

const READINESS_TRIGGER_COLLAPSE_DELAY_MS = 5_000;

export function scheduleReadinessTriggerCollapse(
  collapse: () => void,
): ReturnType<typeof setTimeout> {
  return setTimeout(collapse, READINESS_TRIGGER_COLLAPSE_DELAY_MS);
}

export interface BundleReadinessItem {
  key: string;
  label: string;
  description?: string;
  points: number;
  done: boolean;
}

interface Props {
  items: BundleReadinessItem[];
  bundleId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideCollapsedTrigger?: boolean;
  onItemClick?: (key: string) => void;
}

function scoreColor(score: number) {
  if (score >= 80) return "#008060";
  return "#f49300";
}

export function BundleReadinessOverlay({ items, open, onOpenChange, hideCollapsedTrigger = false, onItemClick }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(open ?? false);
  const [showTriggerDetails, setShowTriggerDetails] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasExpandedRef = useRef(expanded);

  useEffect(() => {
    const timeout = scheduleReadinessTriggerCollapse(() => {
      setShowTriggerDetails(false);
    });

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (open !== undefined) setExpanded(open);
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !expanded) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : triggerRef.current;

    if (!dialog.open && typeof dialog.showModal === "function") {
      dialog.showModal();
    }

    const firstTarget = dialog.querySelector<HTMLElement>(
      '[data-readiness-incomplete="true"], s-button, button:not([disabled])',
    );
    firstTarget?.focus();
  }, [expanded]);

  useEffect(() => {
    if (wasExpandedRef.current && !expanded) {
      window.requestAnimationFrame(() => {
        (previousFocusRef.current ?? triggerRef.current)?.focus();
      });
    }
    wasExpandedRef.current = expanded;
  }, [expanded]);

  const score = items.reduce((sum, i) => sum + (i.done ? i.points : 0), 0);
  const color = scoreColor(score);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const progressLength = (score / 100) * arcLength;

  const closeChecklist = useCallback(() => {
    setExpanded(false);
    onOpenChange?.(false);

    window.requestAnimationFrame(() => {
      (previousFocusRef.current ?? triggerRef.current)?.focus();
    });
  }, [onOpenChange]);

  const toggle = useCallback(() => {
    if (expanded) {
      closeChecklist();
      return;
    }

    setExpanded(true);
    onOpenChange?.(true);
  }, [closeChecklist, expanded, onOpenChange]);

  const allDone = items.every((i) => i.done);
  const showTriggerContext = showTriggerDetails || expanded;

  const activateItem = useCallback((key: string) => {
    if (!onItemClick) return;
    closeChecklist();
    onItemClick(key);
  }, [closeChecklist, onItemClick]);

  const handleItemKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, key: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateItem(key);
      }
    },
    [activateItem],
  );

  if (hideCollapsedTrigger && !expanded) return null;

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), s-button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("hidden"));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleDialogBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) closeChecklist();
  };

  const donut = (
    <svg width="48" height="48" viewBox="0 0 56 56" className={styles.arc}>
      <circle
        cx="28" cy="28" r={radius}
        fill="none" stroke="#e8e8e8" strokeWidth="4.5"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        transform="rotate(135 28 28)"
      />
      <circle
        cx="28" cy="28" r={radius}
        fill="none" stroke={color} strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={`${progressLength} ${circumference - progressLength}`}
        transform="rotate(135 28 28)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="28" y="34" textAnchor="middle" fontSize="16" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );

  const chevron = (
    <svg
      className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ""}`}
      width="14" height="14" viewBox="0 0 14 14" fill="none"
    >
      <path d="M2 9L7 4L12 9" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <>
      {expanded && (
        <dialog
          id="bundle-readiness-dialog"
          ref={dialogRef}
          className={styles.dialog}
          aria-modal="true"
          aria-labelledby="bundle-readiness-title"
          onCancel={(event) => {
            event.preventDefault();
            closeChecklist();
          }}
          onClick={handleDialogBackdropClick}
          onKeyDown={handleDialogKeyDown}
        >
          <div className={styles.sheetHeader}>
            <span id="bundle-readiness-title" className={styles.sheetTitle}>
              {t("common.readiness.title")}
            </span>
            <s-button
              variant="tertiary"
              icon="x"
              accessibilityLabel={t("common.actions.close")}
              onClick={closeChecklist}
            />
          </div>
          <div className={styles.panel}>
              <div className={styles.panelItems}>
                {items.map((item) => {
                  const showActionHint = !item.done && Boolean(item.description);
                  const showActionChevron = !item.done && Boolean(onItemClick);

                  return (
                    <button
                        key={item.key}
                        type="button"
                        data-readiness-incomplete={!item.done || undefined}
                        className={`${styles.panelItem} ${item.done ? styles.panelItemDone : ""} ${showActionChevron ? styles.panelItemClickable : ""}`}
                        onClick={() => {
                          activateItem(item.key);
                        }}
                        onKeyDown={(event) => handleItemKeyDown(event, item.key)}
                        aria-label={t("common.readiness.itemAccessibility", { label: item.label })}
                      >
                        <div className={styles.itemIndicator}>
                          {item.done ? (
                            <svg width="18" height="18" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="7.5" fill="none" stroke="#008f65" strokeWidth="1.8" />
                              <path d="M6.5 10.5l2.2 2.2L14 7.8" stroke="#008f65" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8.5" fill="none" stroke="#c9cccf" strokeWidth="1.5" />
                            </svg>
                          )}
                        </div>
                        <div className={styles.itemContent}>
                          <div className={styles.itemMainRow}>
                            <span className={styles.itemLabel}>{item.label}</span>
                            {item.done && (
                              <span className={`${styles.itemPoints} ${styles.itemPointsDone}`}>
                                {t("common.readiness.points", { points: item.points })}
                              </span>
                            )}
                          </div>
                          {showActionHint && (
                            <span className={styles.itemDesc}>{item.description}</span>
                          )}
                          {!item.done && (
                            <span className={`${styles.itemPoints} ${styles.itemPointsPending}`}>
                              {t("common.readiness.points", { points: item.points })}
                            </span>
                          )}
                        </div>
                        {showActionChevron && (
                          <div className={styles.itemChevron} aria-hidden="true">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M3 1.5L7 5L3 8.5" stroke="#8c8c8c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                    </button>
                  );
                })}
              </div>
              <div className={allDone ? styles.statusReady : styles.statusNotReady}>
                {allDone ? t("common.readiness.ready") : t("common.readiness.notReady")}
              </div>
          </div>
        </dialog>
      )}

      <div
        className={`${styles.container} ${
          showTriggerContext ? styles.containerIntro : styles.containerCollapsed
        }`}
      >
        {!hideCollapsedTrigger && (
          <button
            ref={triggerRef}
            type="button"
            data-tour-target="fpb-readiness-score"
            className={`${styles.collapsed} ${
              showTriggerContext
                ? styles.collapsedExpanded
                : styles.collapsedMinimal
            }`}
            data-readiness-trigger-state={
              showTriggerContext ? "expanded" : "collapsed"
            }
            onClick={toggle}
            aria-label={t("common.readiness.toggleAccessibility")}
            aria-expanded={expanded}
            aria-controls={expanded ? "bundle-readiness-dialog" : undefined}
          >
            {donut}
            <div
              className={styles.scoreLabel}
              aria-hidden={!showTriggerContext}
            >
              <span className={styles.scoreLabelTitle}>{t("common.readiness.title")}</span>
              <span className={styles.scoreLabelSub}>
                {t("common.readiness.helper")}
              </span>
            </div>
            <span
              className={styles.chevronWrapper}
              aria-hidden="true"
            >
              {chevron}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
