import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ElementRef,
} from "react";
import { useTranslation } from "react-i18next";
import styles from "./BundleReadinessOverlay.module.css";

const READINESS_TRIGGER_COLLAPSE_DELAY_MS = 5_000;

export function scheduleReadinessTriggerCollapse(
  collapse: () => void
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
  onItemClick?: (key: string) => void;
}

export function getReadinessScoreColor(score: number) {
  if (score >= 80) return "#008060";
  return "#f49300";
}

export function BundleReadinessOverlay({
  items,
  open,
  onOpenChange,
  onItemClick,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showTriggerDetails, setShowTriggerDetails] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const triggerRef = useRef<ElementRef<"s-clickable"> | null>(null);
  const popoverRef = useRef<ElementRef<"s-popover"> | null>(null);
  const expandedRef = useRef(false);
  const gaugeWasExpandedRef = useRef(false);
  const suppressNextOutsideClickRef = useRef(false);
  const outsideClickResetRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const timeout = scheduleReadinessTriggerCollapse(() => {
      setShowTriggerDetails(false);
    });

    return () => clearTimeout(timeout);
  }, []);

  const score = items.reduce((sum, i) => sum + (i.done ? i.points : 0), 0);
  const color = getReadinessScoreColor(score);

  useEffect(() => {
    if (expanded && !gaugeWasExpandedRef.current) {
      setAnimatedScore(0);
    }

    const frame = window.requestAnimationFrame(() => {
      setAnimatedScore(score);
    });

    gaugeWasExpandedRef.current = expanded;

    return () => window.cancelAnimationFrame(frame);
  }, [expanded, score]);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const progressLength = (animatedScore / 100) * arcLength;

  const syncExpandedState = useCallback((nextExpanded: boolean) => {
    if (expandedRef.current === nextExpanded) return;
    expandedRef.current = nextExpanded;
    setExpanded(nextExpanded);
    onOpenChange?.(nextExpanded);
  }, [onOpenChange]);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const handleShow = () => syncExpandedState(true);
    const handleHide = () => syncExpandedState(false);
    popover.addEventListener("show", handleShow);
    popover.addEventListener("hide", handleHide);

    return () => {
      popover.removeEventListener("show", handleShow);
      popover.removeEventListener("hide", handleHide);
    };
  }, [syncExpandedState]);

  useEffect(() => {
    const clearOutsideClickSuppression = () => {
      suppressNextOutsideClickRef.current = false;
      if (outsideClickResetRef.current) {
        clearTimeout(outsideClickResetRef.current);
        outsideClickResetRef.current = null;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      clearOutsideClickSuppression();
      if (!expandedRef.current) return;

      const path = event.composedPath();
      const popover = popoverRef.current;
      const trigger = triggerRef.current;
      if (
        (popover && path.includes(popover)) ||
        (trigger && path.includes(trigger))
      ) {
        return;
      }

      suppressNextOutsideClickRef.current = true;
    };

    const handlePointerUp = () => {
      if (!suppressNextOutsideClickRef.current) return;
      outsideClickResetRef.current = setTimeout(
        clearOutsideClickSuppression,
        0,
      );
    };

    const handleClick = (event: MouseEvent) => {
      if (!suppressNextOutsideClickRef.current) return;
      clearOutsideClickSuppression();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    document.addEventListener(
      "pointercancel",
      clearOutsideClickSuppression,
      true,
    );
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener(
        "pointercancel",
        clearOutsideClickSuppression,
        true,
      );
      document.removeEventListener("click", handleClick, true);
      clearOutsideClickSuppression();
    };
  }, []);

  useEffect(() => {
    if (open === false && expandedRef.current) {
      popoverRef.current?.hidePopover();
    }
  }, [open]);

  const allDone = items.every((i) => i.done);
  const showTriggerContext = showTriggerDetails;

  const renderDonut = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 56 56"
      className={styles.arc}
      aria-hidden="true"
    >
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="#e8e8e8"
        strokeWidth="4.5"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        transform="rotate(135 28 28)"
      />
      <circle
        className={styles.arcProgress}
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={`${progressLength} ${circumference - progressLength}`}
        transform="rotate(135 28 28)"
      />
      <text
        x="28"
        y="34"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );

  const chevron = (
    <svg
      className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ""}`}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M2 9L7 4L12 9"
        stroke="#666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <div
        className={`${styles.container} ${
          showTriggerContext ? styles.containerIntro : styles.containerCollapsed
        }`}
      >
        <s-clickable
          ref={triggerRef}
          inlineSize="100%"
          data-tour-target="fpb-readiness-score"
          data-readiness-trigger-state={
            showTriggerContext ? "expanded" : "collapsed"
          }
          aria-expanded={expanded}
          aria-controls="bundle-readiness-popover"
          commandFor="bundle-readiness-popover"
          command="--toggle"
          accessibilityLabel={t("common.readiness.toggleAccessibility")}
        >
          <div
            className={`${styles.collapsed} ${
              showTriggerContext
                ? styles.collapsedExpanded
                : styles.collapsedMinimal
            }`}
          >
            {renderDonut()}
            <div
              className={styles.scoreLabel}
              aria-hidden={!showTriggerContext}
            >
              <span className={styles.scoreLabelTitle}>
                {t("common.readiness.title")}
              </span>
              <span className={styles.scoreLabelSub}>
                {t("common.readiness.helper")}
              </span>
            </div>
            <span
              className={`${styles.chevronWrapper} ${
                showTriggerContext ? "" : styles.chevronHidden
              }`}
              aria-hidden="true"
            >
              {chevron}
            </span>
          </div>
        </s-clickable>
      </div>

      <s-popover
        id="bundle-readiness-popover"
        ref={popoverRef}
        inlineSize="360px"
        maxInlineSize="100%"
        maxBlockSize="480px"
      >
        <div className={styles.panel}>
          <div className={styles.panelItems}>
            {items.map((item) => {
                const showActionHint = !item.done && Boolean(item.description);
                const showActionChevron = !item.done && Boolean(onItemClick);

                return (
                  <s-clickable
                    key={item.key}
                    inlineSize="100%"
                    disabled={item.done}
                    commandFor={
                      showActionChevron
                        ? "bundle-readiness-popover"
                        : undefined
                    }
                    command={showActionChevron ? "--hide" : undefined}
                    onClick={
                      showActionChevron
                        ? () => {
                            syncExpandedState(false);
                            onItemClick?.(item.key);
                          }
                        : undefined
                    }
                    accessibilityLabel={t("common.readiness.itemAccessibility", {
                      label: item.label,
                    })}
                  >
                    <div
                      className={`${styles.panelItem} ${
                        item.done ? styles.panelItemDone : ""
                      } ${showActionChevron ? styles.panelItemClickable : ""}`}
                    >
                      <div className={styles.itemIndicator}>
                        {item.done ? (
                          <svg width="18" height="18" viewBox="0 0 20 20">
                            <circle
                              cx="10"
                              cy="10"
                              r="7.5"
                              fill="none"
                              stroke="#008f65"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M6.5 10.5l2.2 2.2L14 7.8"
                              stroke="#008f65"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 20 20">
                            <circle
                              cx="10"
                              cy="10"
                              r="8.5"
                              fill="none"
                              stroke="#c9cccf"
                              strokeWidth="1.5"
                            />
                          </svg>
                        )}
                      </div>
                      <div className={styles.itemContent}>
                        <div className={styles.itemMainRow}>
                          <span className={styles.itemLabel}>{item.label}</span>
                          {item.done && (
                            <span
                              className={`${styles.itemPoints} ${styles.itemPointsDone}`}
                            >
                              {t("common.readiness.points", {
                                points: item.points,
                              })}
                            </span>
                          )}
                        </div>
                        {showActionHint && (
                          <span className={styles.itemDesc}>
                            {item.description}
                          </span>
                        )}
                        {!item.done && (
                          <span
                            className={`${styles.itemPoints} ${styles.itemPointsPending}`}
                          >
                            {t("common.readiness.points", {
                              points: item.points,
                            })}
                          </span>
                        )}
                      </div>
                      {showActionChevron && (
                        <div className={styles.itemChevron} aria-hidden="true">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M3 1.5L7 5L3 8.5"
                              stroke="#8c8c8c"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </s-clickable>
                );
            })}
          </div>
          <div
            className={allDone ? styles.statusReady : styles.statusNotReady}
          >
            {allDone
              ? t("common.readiness.ready")
              : t("common.readiness.notReady")}
          </div>
        </div>
      </s-popover>
    </>
  );
}
