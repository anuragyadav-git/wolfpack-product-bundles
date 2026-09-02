import { i18n } from "../../../i18n/config";
import type { OfferOperationsAdminState } from "../../../lib/offer-policy-admin";
import { resolveOfferSchedule } from "../../../lib/offer-policy-decision";
import { ConfigureHelpPopover } from "../_shared/bundle-configure/ConfigureHelpPopover";

interface OfferOperationsSectionProps {
  active: boolean;
  state: OfferOperationsAdminState;
  onPriorityChange: (priority: number) => void;
  onStopLowerPriorityChange: (stopLowerPriority: boolean) => void;
  onScheduleModeChange: (
    mode: OfferOperationsAdminState["scheduleMode"]
  ) => void;
  onStartsAtChange: (startsAt: string | null) => void;
  onEndsAtChange: (endsAt: string | null) => void;
  onRecurrenceFrequencyChange: (
    frequency: OfferOperationsAdminState["recurrenceFrequency"]
  ) => void;
  onRecurrenceAnchorDateChange: (date: string | null) => void;
  onRecurrenceWindowStartChange: (time: string | null) => void;
  onRecurrenceWindowEndChange: (time: string | null) => void;
  onRecurrenceTerminationChange: (
    termination: OfferOperationsAdminState["recurrenceTermination"]
  ) => void;
  onRecurrenceEndsOnChange: (date: string | null) => void;
  onRecurrenceRunCountChange: (count: number | null) => void;
}

function minuteValue(value: string | null): number | null {
  const match = value?.match(/^(\d{2}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function OfferOperationsSection({
  active,
  state,
  onPriorityChange,
  onStopLowerPriorityChange,
  onScheduleModeChange,
  onStartsAtChange,
  onEndsAtChange,
  onRecurrenceFrequencyChange,
  onRecurrenceAnchorDateChange,
  onRecurrenceWindowStartChange,
  onRecurrenceWindowEndChange,
  onRecurrenceTerminationChange,
  onRecurrenceEndsOnChange,
  onRecurrenceRunCountChange,
}: OfferOperationsSectionProps) {
  if (!active) return null;

  const schedule = resolveOfferSchedule({
    scheduleMode: state.scheduleMode,
    startsAt: state.startsAt,
    endsAt: state.endsAt,
    recurrenceFrequency: state.recurrenceFrequency,
    recurrenceTimezone: state.recurrenceTimezone,
    recurrenceAnchorDate: state.recurrenceAnchorDate,
    recurrenceWindowStartMinute: minuteValue(state.recurrenceWindowStart),
    recurrenceWindowEndMinute: minuteValue(state.recurrenceWindowEnd),
    recurrenceTermination: state.recurrenceTermination,
    recurrenceEndsOn: state.recurrenceEndsOn,
    recurrenceRunCount: state.recurrenceRunCount,
  });
  const statusTone =
    schedule.state === "active"
      ? "success"
      : schedule.state === "invalid"
      ? "critical"
      : "info";

  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-heading>{i18n.t("offerOperations.title")}</s-heading>
          <ConfigureHelpPopover tooltipKey="offerOperations" />
        </s-stack>
        <s-paragraph>{i18n.t("offerOperations.description")}</s-paragraph>
        <s-banner tone="info" dismissible>
          <s-paragraph>
            {i18n.t("offerOperations.shopifyOwnership")}
          </s-paragraph>
        </s-banner>
        <s-number-field
          label={i18n.t("offerOperations.priorityLabel")}
          details={i18n.t("offerOperations.priorityDetails")}
          min={1}
          max={9999}
          value={String(state.priority)}
          onInput={(event) => {
            const priority = Number((event.target as HTMLInputElement).value);
            if (Number.isInteger(priority)) onPriorityChange(priority);
          }}
        />
        <s-switch
          label={i18n.t("offerOperations.stopLowerLabel")}
          details={i18n.t("offerOperations.stopLowerDetails")}
          checked={state.stopLowerPriority}
          onChange={(event) =>
            onStopLowerPriorityChange(event.currentTarget.checked === true)
          }
        />
        <s-divider />
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-text>{i18n.t("offerOperations.statusLabel")}</s-text>
          <s-badge tone={statusTone}>
            {i18n.t(`offerOperations.status.${schedule.state}`)}
          </s-badge>
        </s-stack>
        {schedule.nextTransitionAt ? (
          <s-text>
            {i18n.t("offerOperations.nextTransition", {
              timestamp: schedule.nextTransitionAt,
            })}
          </s-text>
        ) : null}
        <s-select
          label={i18n.t("offerOperations.scheduleModeLabel")}
          value={state.scheduleMode}
          onChange={(event) =>
            onScheduleModeChange(
              event.currentTarget
                .value as OfferOperationsAdminState["scheduleMode"]
            )
          }
        >
          <s-option value="always">
            {i18n.t("offerOperations.scheduleModeAlways")}
          </s-option>
          <s-option value="one_time">
            {i18n.t("offerOperations.scheduleModeOneTime")}
          </s-option>
          <s-option value="recurring">
            {i18n.t("offerOperations.scheduleModeRecurring")}
          </s-option>
        </s-select>
        {state.scheduleMode === "one_time" ? (
          <>
            <s-text-field
              label={i18n.t("offerOperations.startsAtLabel")}
              details={i18n.t("offerOperations.dateDetails")}
              value={state.startsAt ?? ""}
              placeholder={i18n.t("offerOperations.datePlaceholder")}
              onInput={(event) => {
                const value = (event.target as HTMLInputElement).value.trim();
                onStartsAtChange(value || null);
              }}
            />
            <s-text-field
              label={i18n.t("offerOperations.endsAtLabel")}
              details={i18n.t("offerOperations.dateDetails")}
              value={state.endsAt ?? ""}
              placeholder={i18n.t("offerOperations.datePlaceholder")}
              onInput={(event) => {
                const value = (event.target as HTMLInputElement).value.trim();
                onEndsAtChange(value || null);
              }}
            />
          </>
        ) : null}
        {state.scheduleMode === "recurring" ? (
          <>
            <s-banner tone="info" dismissible>
              <s-paragraph>
                {i18n.t("offerOperations.recurrenceTimezone", {
                  timezone: state.recurrenceTimezone,
                })}
              </s-paragraph>
            </s-banner>
            <s-select
              label={i18n.t("offerOperations.recurrenceFrequencyLabel")}
              value={state.recurrenceFrequency ?? "weekly"}
              onChange={(event) =>
                onRecurrenceFrequencyChange(
                  event.currentTarget
                    .value as OfferOperationsAdminState["recurrenceFrequency"]
                )
              }
            >
              <s-option value="weekly">
                {i18n.t("offerOperations.recurrenceWeekly")}
              </s-option>
              <s-option value="monthly">
                {i18n.t("offerOperations.recurrenceMonthly")}
              </s-option>
            </s-select>
            <s-date-field
              label={i18n.t("offerOperations.recurrenceAnchorDateLabel")}
              details={i18n.t("offerOperations.recurrenceAnchorDateDetails")}
              value={state.recurrenceAnchorDate ?? ""}
              onInput={(event) =>
                onRecurrenceAnchorDateChange(event.currentTarget.value || null)
              }
            />
            <s-grid
              gridTemplateColumns="repeat(auto-fit, minmax(12rem, 1fr))"
              gap="base"
            >
              <s-text-field
                label={i18n.t("offerOperations.recurrenceWindowStartLabel")}
                placeholder={i18n.t(
                  "offerOperations.recurrenceTimePlaceholder"
                )}
                value={state.recurrenceWindowStart ?? ""}
                onInput={(event) =>
                  onRecurrenceWindowStartChange(
                    (event.target as HTMLInputElement).value || null
                  )
                }
              />
              <s-text-field
                label={i18n.t("offerOperations.recurrenceWindowEndLabel")}
                details={i18n.t("offerOperations.recurrenceWindowDetails")}
                placeholder={i18n.t(
                  "offerOperations.recurrenceTimePlaceholder"
                )}
                value={state.recurrenceWindowEnd ?? ""}
                onInput={(event) =>
                  onRecurrenceWindowEndChange(
                    (event.target as HTMLInputElement).value || null
                  )
                }
              />
            </s-grid>
            <s-select
              label={i18n.t("offerOperations.recurrenceTerminationLabel")}
              value={state.recurrenceTermination}
              onChange={(event) =>
                onRecurrenceTerminationChange(
                  event.currentTarget
                    .value as OfferOperationsAdminState["recurrenceTermination"]
                )
              }
            >
              <s-option value="never">
                {i18n.t("offerOperations.recurrenceNever")}
              </s-option>
              <s-option value="on_date">
                {i18n.t("offerOperations.recurrenceOnDate")}
              </s-option>
              <s-option value="after_runs">
                {i18n.t("offerOperations.recurrenceAfterRuns")}
              </s-option>
            </s-select>
            {state.recurrenceTermination === "on_date" ? (
              <s-date-field
                label={i18n.t("offerOperations.recurrenceEndsOnLabel")}
                value={state.recurrenceEndsOn ?? ""}
                onInput={(event) =>
                  onRecurrenceEndsOnChange(event.currentTarget.value || null)
                }
              />
            ) : null}
            {state.recurrenceTermination === "after_runs" ? (
              <s-number-field
                label={i18n.t("offerOperations.recurrenceRunCountLabel")}
                min={1}
                value={
                  state.recurrenceRunCount == null
                    ? ""
                    : String(state.recurrenceRunCount)
                }
                onInput={(event) => {
                  const value = (event.target as HTMLInputElement).value;
                  onRecurrenceRunCountChange(value ? Number(value) : null);
                }}
              />
            ) : null}
          </>
        ) : null}
      </s-stack>
    </s-section>
  );
}
