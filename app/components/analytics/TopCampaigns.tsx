/**
 * TopCampaigns — full-width UTM campaign performance table.
 *
 * Issue: docs/issues-prod/wpb-analytics-revamp-1.md
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  filterAndSortCampaignResults,
  type CampaignResultRow,
  type CampaignResultSortDirection,
  type CampaignResultSortKey,
} from "../../lib/analytics";
import { translateAdmin } from "~/i18n/config";

export interface TopCampaignsProps {
  rows: CampaignResultRow[];
  formatRevenue: (cents: number) => string;
}

export function TopCampaigns({ rows, formatRevenue }: TopCampaignsProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<CampaignResultSortKey>("revenueCents");
  const [direction, setDirection] =
    useState<CampaignResultSortDirection>("desc");
  const searchRef = useRef<any>(null);
  const sortChoiceRef = useRef<any>(null);
  const directionChoiceRef = useRef<any>(null);
  const sortTriggerRef = useRef<any>(null);
  const filteredRows = useMemo(
    () => filterAndSortCampaignResults(rows, query, sortKey, direction),
    [rows, query, sortKey, direction]
  );
  const maxRev = filteredRows.reduce(
    (max, row) => Math.max(max, row.revenueCents),
    0
  );

  useEffect(() => {
    const search = searchRef.current;
    if (!search) return;
    const handleInput = (event: Event) => {
      setQuery(
        (event.currentTarget as HTMLElement & { value?: string }).value ?? ""
      );
    };
    search.addEventListener("input", handleInput);
    return () => search.removeEventListener("input", handleInput);
  }, []);

  useEffect(() => {
    const choices = sortChoiceRef.current;
    if (!choices) return;
    const handleChange = (event: Event) => {
      const nextKey = (
        event.currentTarget as HTMLElement & { values?: string[] }
      ).values?.[0];
      if (
        nextKey === "utmCampaign" ||
        nextKey === "orders" ||
        nextKey === "revenueCents"
      ) {
        setSortKey(nextKey);
      }
    };
    choices.addEventListener("change", handleChange);
    return () => choices.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const choices = directionChoiceRef.current;
    if (!choices) return;
    const handleChange = (event: Event) => {
      const nextDirection = (
        event.currentTarget as HTMLElement & { values?: string[] }
      ).values?.[0];
      if (nextDirection !== "asc" && nextDirection !== "desc") return;
      setDirection(nextDirection);
      sortTriggerRef.current?.click();
    };
    choices.addEventListener("change", handleChange);
    return () => choices.removeEventListener("change", handleChange);
  }, []);

  return (
    <section className="wpb-card" aria-labelledby="wpb-top-campaigns-title">
      <header className="wpb-section-header">
        <div>
          <h2 id="wpb-top-campaigns-title" className="wpb-section-title">
            {translateAdmin(
              "adminExtracted.components.analytics.topcampaigns.topCampaigns"
            )}
          </h2>
          <p className="wpb-section-hint">
            {translateAdmin(
              "adminExtracted.components.analytics.topcampaigns.bundleRevenueByUtmCampaign"
            )}
          </p>
        </div>
      </header>

      <div className="wpb-results-toolbar">
        <s-text-field
          ref={searchRef}
          label={translateAdmin("adminAttributes.searchCampaigns")}
          labelAccessibilityVisibility="exclusive"
          icon="search"
          placeholder={translateAdmin("adminAttributes.searchByCampaignName")}
          value={query}
          autocomplete="off"
        />
        <s-button
          ref={sortTriggerRef}
          commandFor="top-campaigns-sort-popover"
          variant="secondary"
          accessibilityLabel={translateAdmin(
            "adminAttributes.sortTopCampaigns"
          )}
        >
          <span className="wpb-results-sort-glyph" aria-hidden>
            ↕
          </span>{" "}
          {translateAdmin(
            "adminExtracted.components.analytics.bundleperformancematrix.sort"
          )}
        </s-button>
        <s-popover id="top-campaigns-sort-popover">
          <s-box padding="base">
            <s-choice-list
              ref={sortChoiceRef}
              name="top-campaign-sort"
              label={translateAdmin("adminAttributes.sortBy")}
            >
              <s-choice
                value="utmCampaign"
                selected={sortKey === "utmCampaign" || undefined}
              >
                {translateAdmin(
                  "adminExtracted.components.analytics.topcampaigns.campaignName"
                )}
              </s-choice>
              <s-choice
                value="orders"
                selected={sortKey === "orders" || undefined}
              >
                {translateAdmin(
                  "adminExtracted.components.analytics.bundleperformancematrix.noOfOrders"
                )}
              </s-choice>
              <s-choice
                value="revenueCents"
                selected={sortKey === "revenueCents" || undefined}
              >
                {translateAdmin(
                  "adminExtracted.components.analytics.bundleperformancematrix.totalBundleValue"
                )}
              </s-choice>
            </s-choice-list>
            <s-divider />
            <s-choice-list
              ref={directionChoiceRef}
              name="top-campaign-direction"
              label={translateAdmin("adminAttributes.direction")}
              labelAccessibilityVisibility="exclusive"
            >
              <s-choice
                value="desc"
                selected={direction === "desc" || undefined}
              >
                {translateAdmin(
                  "adminExtracted.components.analytics.bundleperformancematrix.highest"
                )}
              </s-choice>
              <s-choice value="asc" selected={direction === "asc" || undefined}>
                {translateAdmin(
                  "adminExtracted.components.analytics.bundleperformancematrix.lowest"
                )}
              </s-choice>
            </s-choice-list>
          </s-box>
        </s-popover>
      </div>

      {filteredRows.length === 0 ? (
        <div className="wpb-results-empty">
          <span className="wpb-results-empty-icon" aria-hidden>
            <s-icon type="search" />
          </span>
          <h3 className="wpb-results-empty-title">
            {rows.length === 0
              ? "No orders found in this period"
              : "No campaigns found"}
          </h3>
          {rows.length > 0 && (
            <p className="wpb-section-hint">
              {translateAdmin(
                "adminExtracted.components.analytics.topcampaigns.tryChangingTheSearchOrSortOptions"
              )}
            </p>
          )}
        </div>
      ) : (
        <div
          className="wpb-campaign-table"
          role="table"
          aria-label={translateAdmin("adminAttributes.topCampaignPerformance")}
        >
          <div className="wpb-campaign-table-head" role="row">
            <span role="columnheader">
              {translateAdmin(
                "adminExtracted.components.analytics.topcampaigns.campaign"
              )}
            </span>
            <span role="columnheader">
              {translateAdmin(
                "adminExtracted.components.analytics.topcampaigns.orders"
              )}
            </span>
            <span role="columnheader">
              {translateAdmin(
                "adminExtracted.components.analytics.topcampaigns.bundleRevenue"
              )}
            </span>
          </div>
          {filteredRows.slice(0, 5).map((r) => {
            const pct =
              maxRev > 0 ? Math.round((r.revenueCents / maxRev) * 100) : 0;
            return (
              <div
                key={r.utmCampaign}
                className="wpb-campaign-row wpb-campaign-table-row"
                role="row"
              >
                <div className="wpb-truncate-cell">
                  <p className="wpb-row-title">{r.utmCampaign}</p>
                  <progress
                    className="wpb-campaign-meter"
                    value={Math.max(2, pct)}
                    max={100}
                  />
                </div>
                <p className="wpb-muted-micro wpb-row-align-end">
                  {r.orders.toLocaleString()}
                </p>
                <div className="wpb-row-align-end">
                  <p className="wpb-row-value">
                    {formatRevenue(r.revenueCents)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
