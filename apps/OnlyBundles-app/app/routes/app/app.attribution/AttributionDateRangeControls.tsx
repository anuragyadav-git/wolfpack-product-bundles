import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { translateAdmin } from "~/i18n/config";
import {
  buildAttributionRangePath,
  validateAttributionDateRange,
} from "../../../lib/analytics/attribution-controls";

const ATTRIBUTION_DATE_POPOVER_ID = "analytics-date-range-popover";

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatRangeLabel(
  days: number,
  from?: string,
  to?: string
): string {
  if (from && to) {
    const start = new Date(from + "T00:00:00Z");
    const end = new Date(to + "T00:00:00Z");
    const startStr = formatDateLabel(start);
    const endStr = formatDateLabel(end);
    if (start.getUTCFullYear() === end.getUTCFullYear()) {
      const startNoYear = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
      return `${startNoYear} – ${endStr}`;
    }
    return `${startStr} – ${endStr}`;
  }
  return `Last ${days} days`;
}

export function DateRangeSelector({
  days,
  from,
  to,
}: {
  days: number;
  from?: string;
  to?: string;
}) {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(from || "");
  const [toDate, setToDate] = useState(to || "");

  const triggerLabel = formatRangeLabel(days, from, to);
  const today = new Date().toISOString().split("T")[0];
  const isDateRangeValid = validateAttributionDateRange(
    fromDate,
    toDate,
    today
  );
  const dateRangeError =
    fromDate && toDate && !isDateRangeValid
      ? translateAdmin("offerPolicy.errors.invalid_date_range")
      : undefined;

  useEffect(() => {
    setFromDate(from || "");
    setToDate(to || "");
  }, [from, to]);

  function navigateTo(
    selection:
      | { days: number; from?: never; to?: never }
      | { days?: never; from: string; to: string },
  ) {
    navigate(buildAttributionRangePath(window.location.href, selection));
  }

  function handleApply() {
    if (!isDateRangeValid) return;
    navigateTo({ from: fromDate, to: toDate });
  }

  return (
    <>
      <s-button
        icon="calendar"
        commandFor={ATTRIBUTION_DATE_POPOVER_ID}
        command="--toggle"
      >
        {triggerLabel}
      </s-button>

      <s-popover
        id={ATTRIBUTION_DATE_POPOVER_ID}
        inlineSize="360px"
        maxInlineSize="100%"
      >
        <s-box padding="base">
          <s-stack direction="block" gap="base">
            <s-stack direction="inline" gap="small">
            {([7, 30, 90] as const).map((presetDays) => (
              <s-clickable-chip
                key={presetDays}
                color={!from && days === presetDays ? "strong" : "base"}
                accessibilityLabel={translateAdmin("adminDynamic.lastDays", {
                  days: presetDays,
                })}
                commandFor={ATTRIBUTION_DATE_POPOVER_ID}
                command="--hide"
                onClick={() => navigateTo({ days: presetDays })}
              >
                {translateAdmin("adminDynamic.lastDays", {
                  days: presetDays,
                })}
              </s-clickable-chip>
            ))}
            </s-stack>

            <s-stack direction="block" gap="small">
            <s-date-field
              label={translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.from"
              )}
              value={fromDate}
              error={dateRangeError}
              onInput={(event) => setFromDate(event.currentTarget.value ?? "")}
            />
            <s-date-field
              label={translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.to"
              )}
              value={toDate}
              error={dateRangeError}
              onInput={(event) => setToDate(event.currentTarget.value ?? "")}
            />
            </s-stack>

            <s-stack direction="inline" justifyContent="end">
            <s-button
              variant="primary"
              disabled={!isDateRangeValid || undefined}
              commandFor={ATTRIBUTION_DATE_POPOVER_ID}
              command="--hide"
              onClick={handleApply}
            >
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.apply"
              )}
            </s-button>
            </s-stack>
          </s-stack>
        </s-box>
      </s-popover>
    </>
  );
}

export function BackfillWindowModal({
  days,
  from,
  to,
  isSubmitting,
  onConfirm,
}: {
  days: number;
  from?: string;
  to?: string;
  isSubmitting: boolean;
  onConfirm: () => void;
}) {
  const selectedWindow = formatRangeLabel(days, from, to);

  return (
    <s-modal
      id="analytics-backfill-window-modal"
      heading={translateAdmin("adminAttributes.backfillAnalyticsWindow")}
      size="base"
    >
      <s-button
        slot="primary-action"
        variant="primary"
        icon="refresh"
        loading={isSubmitting || undefined}
        disabled={isSubmitting || undefined}
        commandFor="analytics-backfill-window-modal"
        command="--hide"
        onClick={onConfirm}
      >
        {translateAdmin(
          "adminExtracted.appAttribution.attributiondashboard.backfillSelectedWindow"
        )}
      </s-button>
      <s-button
        slot="secondary-actions"
        commandFor="analytics-backfill-window-modal"
        command="--hide"
      >
        {translateAdmin("dashboard.storefrontSetup.close")}
      </s-button>

      <s-stack direction="block" gap="base">
        <s-paragraph>
          {translateAdmin("adminDynamic.selectedWindow", {
            window: selectedWindow,
          })}
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>
            {translateAdmin(
              "adminExtracted.appAttribution.attributiondashboard.matchesOrderLineItemsToBundlesAndImportsAvailableRevenueLandingP"
            )}
          </s-list-item>
          <s-list-item>
            {translateAdmin(
              "adminExtracted.appAttribution.attributiondashboard.existingAttributionRecordsAreSkippedSoRunningTheSameWindowAgainD"
            )}
          </s-list-item>
          <s-list-item>
            {translateAdmin(
              "adminExtracted.appAttribution.attributiondashboard.shopifyOrdersAndStorefrontTrackingAreNotModified"
            )}
          </s-list-item>
        </s-unordered-list>
      </s-stack>
    </s-modal>
  );
}
