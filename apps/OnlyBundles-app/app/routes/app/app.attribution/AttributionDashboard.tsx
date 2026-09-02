import { useFetcher, useNavigate } from "@remix-run/react";
import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import "../../../components/analytics/shared/tokens.css";
import {
  FunnelHero,
  BundlePerformanceMatrix,
  TopCampaigns,
} from "../../../components/analytics";
import { LazyBundleMetricChart } from "../../../components/analytics/lazy";
import styles from "../../../styles/routes/app-attribution.module.css";
import type { AttributionDashboardData } from "../app.attribution";
import { analyzeCustomUtmInput } from "../../../lib/analytics/attribution-controls";
import { showAdminTransientErrorToast } from "../../../lib/admin-alert-feedback";
import { OfferAnalyticsCard } from "./OfferAnalyticsCard";
import { translateAdmin } from "~/i18n/config";
import { TUTORIAL_LINKS } from "../../../lib/tutorial-links";

type AttributionDashboardViewData = Omit<
  AttributionDashboardData,
  "from" | "to" | "accessMode"
> & {
  from?: string;
  to?: string;
  accessMode: "SUMMARY" | "ADVANCED";
};

// ─── Helpers ─────────────────────────────────────────────────

function formatRevenue(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// ─── DateRangeSelector ───────────────────────────────────────

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatRangeLabel(days: number, from?: string, to?: string): string {
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

interface DateRangeSelectorProps {
  days: number;
  from?: string;
  to?: string;
}

function DateRangeSelector({ days, from, to }: DateRangeSelectorProps) {
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fromDate, setFromDate] = useState(from || "");
  const [toDate, setToDate] = useState(to || "");
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerLabel = formatRangeLabel(days, from, to);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setFromDate(from || "");
    setToDate(to || "");
  }, [from, to]);

  // Close on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverOpen]);

  function navigateTo(daysN?: number, fromStr?: string, toStr?: string) {
    const url = new URL(window.location.href);
    url.searchParams.delete("days");
    url.searchParams.delete("from");
    url.searchParams.delete("to");
    if (fromStr && toStr) {
      url.searchParams.set("from", fromStr);
      url.searchParams.set("to", toStr);
    } else {
      url.searchParams.set("days", String(daysN ?? 30));
    }
    setPopoverOpen(false);
    navigate(`${url.pathname}?${url.searchParams.toString()}`);
  }

  function handleApply() {
    if (!fromDate || !toDate) return;
    navigateTo(undefined, fromDate, toDate);
  }

  return (
    <div ref={containerRef} className={styles.dateSelector}>
      <s-button icon="calendar" onClick={() => setPopoverOpen((v) => !v)}>
        {triggerLabel}
      </s-button>

      {popoverOpen && (
        <div className={styles.datePopover}>
          {/* Preset chips */}
          <div className={styles.presetChips}>
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.presetChip}${
                  !from && days === d ? ` ${styles.presetChipActive}` : ""
                }`}
                onClick={() => navigateTo(d)}
              >
                {translateAdmin("adminDynamic.lastDays", { days: d })}
              </button>
            ))}
          </div>

          {/* Native date range inputs */}
          <div className={styles.dateInputStack}>
            <div>
              <label className={styles.dateInputLabel}>
                {translateAdmin(
                  "adminExtracted.appAttribution.attributiondashboard.from"
                )}
              </label>
              <input
                type="date"
                value={fromDate}
                max={toDate || today}
                onChange={(e) => setFromDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <div>
              <label className={styles.dateInputLabel}>
                {translateAdmin(
                  "adminExtracted.appAttribution.attributiondashboard.to"
                )}
              </label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={today}
                onChange={(e) => setToDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>

          <div className={styles.calendarApplyRow}>
            <s-button
              variant="primary"
              disabled={!fromDate || !toDate || undefined}
              onClick={handleApply}
            >
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.apply"
              )}
            </s-button>
          </div>
        </div>
      )}
    </div>
  );
}

interface BackfillWindowModalProps {
  days: number;
  from?: string;
  to?: string;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function BackfillWindowModal({
  days,
  from,
  to,
  isSubmitting,
  onConfirm,
}: BackfillWindowModalProps) {
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

// ─── Main Component ───────────────────────────────────────────

export function removeCustomUtmParameter(
  parameters: string[],
  parameterToRemove: string
): string[] {
  return parameters.filter((parameter) => parameter !== parameterToRemove);
}

export function CustomUtmTrackingCard({
  customUtmParameters,
}: {
  customUtmParameters: string[];
}) {
  const fetcher = useFetcher<{
    success?: boolean;
    customUtmParameters?: string[];
    message?: string;
    error?: string;
  }>();
  const [input, setInput] = useState(customUtmParameters.join("\n"));
  const [savedParameters, setSavedParameters] = useState(customUtmParameters);
  const shopify = useAppBridge();
  const inputAnalysis = useMemo(() => analyzeCustomUtmInput(input), [input]);
  const savedInput = savedParameters.join("\n");
  const isDirty = input !== savedInput;

  useEffect(() => {
    setInput(customUtmParameters.join("\n"));
    setSavedParameters(customUtmParameters);
  }, [customUtmParameters]);

  useEffect(() => {
    if (
      fetcher.data?.success &&
      Array.isArray(fetcher.data.customUtmParameters)
    ) {
      setInput(fetcher.data.customUtmParameters.join("\n"));
      setSavedParameters(fetcher.data.customUtmParameters);
    }
  }, [fetcher.data]);

  useEffect(() => {
    void (isDirty
      ? shopify.saveBar.show("analytics-custom-utm-save-bar")
      : shopify.saveBar.hide("analytics-custom-utm-save-bar"));
  }, [isDirty, shopify]);

  useEffect(
    () => () => {
      void shopify.saveBar.hide("analytics-custom-utm-save-bar");
    },
    [shopify]
  );

  const isSaving = fetcher.state !== "idle";
  const feedback = fetcher.data?.error ?? fetcher.data?.message;
  const previewLabel =
    inputAnalysis.accepted.length > 0
      ? `Only Bundles will track: ${inputAnalysis.accepted.join(", ")}`
      : null;
  const savedLabel =
    savedParameters.length > 0
      ? "Currently tracking"
      : "No custom attributes are configured yet.";

  function submitCustomUtmParameters(nextInput: string) {
    fetcher.submit(
      {
        intent: "saveCustomUtms",
        customUtmParameters: nextInput,
      },
      { method: "post" }
    );
  }

  function handleSaveSubmit(event?: { preventDefault: () => void }) {
    event?.preventDefault();
    submitCustomUtmParameters(input);
  }

  function handleRemoveSavedParameter(parameterToRemove: string) {
    const nextParameters = removeCustomUtmParameter(
      savedParameters,
      parameterToRemove
    );
    setInput(nextParameters.join("\n"));
  }

  function handleDiscard() {
    setInput(savedInput);
  }

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            {translateAdmin(
              "adminExtracted.appAttribution.attributiondashboard.customUtmAttributes"
            )}
          </h2>
          <p className={styles.mutedBodyText}>
            {translateAdmin(
              "adminExtracted.appAttribution.attributiondashboard.enterParameterNamesSeparatedByCommasOrNewLinesOnlyBundlesCapture"
            )}
          </p>
        </div>
        <s-button
          variant="secondary"
          icon="info"
          commandFor="custom-utm-attributes-help"
          command="--show"
        >
          {translateAdmin("common.actions.learnMore")}
        </s-button>
      </div>
      <div className={styles.customUtmBody}>
        {savedParameters.length > 0 ? (
          <div className={styles.customUtmSavedBlock}>
            <p className={styles.mutedBodyText}>{savedLabel}</p>
            <div
              className={styles.customUtmChipList}
              aria-label={translateAdmin(
                "adminAttributes.savedCustomUTMAttributes"
              )}
            >
              {savedParameters.map((parameter) => (
                <span key={parameter} className={styles.customUtmChip}>
                  <span className={styles.customUtmChipText}>{parameter}</span>
                  <button
                    type="button"
                    className={styles.customUtmChipRemove}
                    aria-label={`Remove ${parameter}`}
                    disabled={isSaving || undefined}
                    onClick={() => handleRemoveSavedParameter(parameter)}
                  >
                    <s-icon type="x" size="small"></s-icon>
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <fetcher.Form
          method="post"
          className={styles.customUtmForm}
          onSubmit={handleSaveSubmit}
        >
          <input type="hidden" name="intent" value="saveCustomUtms" />
          <input type="hidden" name="customUtmParameters" value={input} />
          <s-text-area
            label={translateAdmin("adminAttributes.parameterNames")}
            value={input}
            rows={3}
            placeholder={translateAdmin(
              "adminAttributes.utmInfluencerPartnerIdCreator"
            )}
            onInput={(event) => {
              setInput((event.target as HTMLTextAreaElement).value);
            }}
          />
          <div className={styles.customUtmFeedback} aria-live="polite">
            {previewLabel && (
              <p className={styles.customUtmPreview}>{previewLabel}</p>
            )}
            {savedParameters.length === 0 ? (
              <p className={styles.mutedBodyText}>{savedLabel}</p>
            ) : null}
            {inputAnalysis.rejected.length > 0 ? (
              <p className={styles.errorText}>
                {translateAdmin("adminDynamic.ignoredParameters", {
                  parameters: inputAnalysis.rejected.join(", "),
                })}
              </p>
            ) : null}
            {inputAnalysis.limitReached ? (
              <p className={styles.mutedBodyText}>
                {translateAdmin(
                  "adminExtracted.appAttribution.attributiondashboard.onlyTheFirst10ValidCustomAttributesWillBeSaved"
                )}
              </p>
            ) : null}
          </div>
          {feedback ? (
            <span
              className={
                fetcher.data?.error ? styles.errorText : styles.successText
              }
            >
              {feedback}
            </span>
          ) : null}
        </fetcher.Form>
      </div>
      <ui-save-bar id="analytics-custom-utm-save-bar">
        <button
          variant="primary"
          onClick={() => handleSaveSubmit()}
          disabled={isSaving}
        >
          {translateAdmin("dashboard.language.save")}
        </button>
        <button onClick={handleDiscard} disabled={isSaving}>
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.configurecontextualsavebar.discard"
          )}
        </button>
      </ui-save-bar>
      <s-modal
        id="custom-utm-attributes-help"
        heading={translateAdmin(
          "adminExtracted.appAttribution.attributiondashboard.customUtmAttributes"
        )}
      >
        <s-button
          slot="secondary-actions"
          commandFor="custom-utm-attributes-help"
          command="--hide"
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>

        <s-stack direction="block" gap="base">
          <div>
            <h3 className={styles.sectionTitle}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.howCustomAttributesWork"
              )}
            </h3>
            <p className={styles.mutedBodyText}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.customAttributesAreExtraUrlQueryParametersYouAddToCampaignAffili"
              )}
            </p>
          </div>
          <div>
            <h3 className={styles.sectionTitle}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.howToSetThemUp"
              )}
            </h3>
            <p className={styles.mutedBodyText}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.addParameterNamesOnePerLineOrSeparatedByCommasEnterOnlyTheParame"
              )}
            </p>
            <p className={styles.mutedBodyText}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.exampleNames"
              )}{" "}
              <code className={styles.codeSample}>
                {translateAdmin(
                  "adminExtracted.appAttribution.attributiondashboard.utmInfluencerPartnerId"
                )}
              </code>
            </p>
            <p className={styles.mutedBodyText}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.exampleLink"
              )}{" "}
              <code className={styles.codeSample}>
                {translateAdmin(
                  "adminExtracted.appAttribution.attributiondashboard.httpsStoreComProductsBundleUtmSourceInstagramUtmInfluencerMayaAm"
                )}
              </code>
            </p>
          </div>
          <div>
            <h3 className={styles.sectionTitle}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.whatHappensAfterSaving"
              )}
            </h3>
            <p className={styles.mutedBodyText}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.onlyBundlesSavesUpTo10ValidNamesUpdatesTheTrackingPixelSettingsA"
              )}
            </p>
            <p className={styles.mutedBodyText}>
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.whenAShopperReachesCheckoutFromAMatchingLinkTheSavedValuesAreSto"
              )}
            </p>
          </div>
          <s-box paddingBlockEnd="small-200">
            <s-banner
              heading={translateAdmin("adminAttributes.privacyCheck")}
              tone="warning"
              dismissible={false}
              hidden={false}
            >
              {translateAdmin(
                "adminExtracted.appAttribution.attributiondashboard.doNotTrackShopperIdentifiersSuchAsEmailAddressesPhoneNumbersCust"
              )}
            </s-banner>
          </s-box>
          <s-link href={TUTORIAL_LINKS.analytics} target="_blank">
            {translateAdmin("common.actions.learnMore")}
          </s-link>
        </s-stack>
      </s-modal>
    </section>
  );
}

function AttributionDashboardContent({
  data,
  onOfferSelectionChange,
}: {
  data: AttributionDashboardViewData;
  onOfferSelectionChange: (offerPolicyId: string | null) => void;
}) {
  const { t } = useTranslation();
  const {
    days,
    from,
    to,
    prevFrom,
    prevTo,
    funnelSnapshot,
    bundleMetricTrend,
    bundleMatrix,
    topCampaignsRows,
    customUtmParameters,
    offerAnalytics,
    accessMode = "ADVANCED",
  } = data;
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const exportFetcher = useFetcher<{
    success?: boolean;
    csv?: string;
    filename?: string;
    error?: string;
  }>();
  const backfillFetcher = useFetcher<{
    success?: boolean;
    message?: string;
    error?: string;
  }>();

  const [compare, setCompare] = useState(true);

  const comparePeriodLabel = useMemo(() => {
    if (!prevFrom || !prevTo) return null;
    const fmt = (s: string) => {
      const [, m, d] = s.split("-");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
    };
    return `${fmt(prevFrom)} – ${fmt(prevTo)}`;
  }, [prevFrom, prevTo]);

  useEffect(() => {
    const result = exportFetcher.data;
    if (!result) return;
    if (!result.success || !result.csv || !result.filename) {
      if (result.error) {
        showAdminTransientErrorToast(
          shopify,
          t("common.alerts.exportUnavailable")
        );
      }
      return;
    }

    const objectUrl = URL.createObjectURL(
      new Blob([result.csv], {
        type: "text/csv;charset=utf-8",
      })
    );
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = result.filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(objectUrl);
    shopify.toast.show(t("common.success.csvExported"));
  }, [exportFetcher.data, shopify, t]);

  useEffect(() => {
    const result = backfillFetcher.data;
    if (result?.message) {
      shopify.toast.show(t("common.success.backfillComplete"));
    } else if (result?.error) {
      showAdminTransientErrorToast(
        shopify,
        t("common.alerts.backfillUnavailable")
      );
    }
  }, [backfillFetcher.data, shopify, t]);

  function handleBackfillConfirm() {
    backfillFetcher.submit(
      from && to
        ? { intent: "backfill", from, to }
        : { intent: "backfill", days: String(days) },
      { method: "post" }
    );
  }

  function handleExport() {
    const offerPolicyId = offerAnalytics?.selectedOfferPolicyId ?? undefined;
    exportFetcher.submit(
      from && to
        ? {
            intent: "export",
            from,
            to,
            ...(offerPolicyId ? { offerPolicyId } : {}),
          }
        : {
            intent: "export",
            days: String(days),
            ...(offerPolicyId ? { offerPolicyId } : {}),
          },
      { method: "post" }
    );
  }

  return (
    <div className={styles.dashboardShell}>
      <div className={styles.dashboardStack}>
        {accessMode === "ADVANCED" && (
          <OfferAnalyticsCard
            model={offerAnalytics}
            onSelectionChange={onOfferSelectionChange}
          />
        )}
        {/* Date range selector + Compare toggle + Export */}
        {accessMode === "SUMMARY" && (
          <s-box paddingBlockEnd="small-200">
            <s-banner tone="info">
              {t("subscription.analytics.summaryNotice")}
            </s-banner>
          </s-box>
        )}
        {accessMode === "ADVANCED" && (
          <div className={styles.headerRow}>
            <div className={styles.comparePillSlot}>
              <div className={styles.datePickerWrap}>
                <DateRangeSelector days={days} from={from} to={to} />
              </div>
              {compare && comparePeriodLabel && (
                <span className={styles.comparePill}>
                  {translateAdmin("adminDynamic.comparedWith", {
                    period: comparePeriodLabel,
                  })}
                </span>
              )}
            </div>
            <div className={styles.analyticsActions}>
              <div className={styles.analyticsActionButton}>
                <s-button
                  inlineSize="fill"
                  variant={compare ? "primary" : "secondary"}
                  icon={compare ? "check" : "chart-line"}
                  onClick={() => setCompare((v) => !v)}
                >
                  {translateAdmin(
                    compare
                      ? "adminDynamic.compareOn"
                      : "adminDynamic.compareOff"
                  )}
                </s-button>
              </div>
              <div className={styles.analyticsActionButton}>
                <s-button
                  inlineSize="fill"
                  variant="secondary"
                  icon="download"
                  loading={exportFetcher.state !== "idle" || undefined}
                  disabled={exportFetcher.state !== "idle" || undefined}
                  onClick={handleExport}
                >
                  {translateAdmin("offerPolicyCsv.export.action")}
                </s-button>
              </div>
              <div className={styles.analyticsActionButton}>
                <s-button
                  inlineSize="fill"
                  variant="secondary"
                  icon="refresh"
                  loading={backfillFetcher.state !== "idle" || undefined}
                  commandFor="analytics-backfill-window-modal"
                  command="--show"
                >
                  {translateAdmin(
                    "adminExtracted.appAttribution.attributiondashboard.backfillWindow"
                  )}
                </s-button>
              </div>
            </div>
          </div>
        )}
        {accessMode === "ADVANCED" && (
          <BackfillWindowModal
            days={days}
            from={from}
            to={to}
            isSubmitting={backfillFetcher.state !== "idle"}
            onConfirm={handleBackfillConfirm}
          />
        )}
        {/* ────────── Revamped analytics sections (wpb-analytics-revamp-1) ─────── */}

        <FunnelHero
          snapshot={funnelSnapshot}
          windowLabel={from && to ? `${from} → ${to}` : `Last ${days} days`}
          formatRevenue={formatRevenue}
          formatCount={(n) => n.toLocaleString()}
          showHeader={false}
        />

        {accessMode === "ADVANCED" && (
          <Suspense fallback={null}>
            <LazyBundleMetricChart
              trend={bundleMetricTrend}
              rangeDays={days}
              formatRevenue={formatRevenue}
            />
          </Suspense>
        )}

        {accessMode === "ADVANCED" && (
          <BundlePerformanceMatrix
            rows={bundleMatrix}
            formatRevenue={formatRevenue}
            onRowClick={(bundleId) =>
              navigate(`/app/bundles/full-page-bundle/configure/${bundleId}`)
            }
          />
        )}

        {accessMode === "ADVANCED" && (
          <CustomUtmTrackingCard customUtmParameters={customUtmParameters} />
        )}

        {accessMode === "ADVANCED" && (
          <TopCampaigns rows={topCampaignsRows} formatRevenue={formatRevenue} />
        )}
      </div>
    </div>
  );
}

export default function AttributionDashboard({
  data,
  onOfferSelectionChange,
}: {
  data: AttributionDashboardViewData;
  onOfferSelectionChange: (offerPolicyId: string | null) => void;
}) {
  return (
    <AttributionDashboardContent
      data={data}
      onOfferSelectionChange={onOfferSelectionChange}
    />
  );
}
