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

export interface TopCampaignsProps {
  rows: CampaignResultRow[];
  formatRevenue: (cents: number) => string;
}

export function TopCampaigns({ rows, formatRevenue }: TopCampaignsProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<CampaignResultSortKey>("revenueCents");
  const [direction, setDirection] = useState<CampaignResultSortDirection>("desc");
  const searchRef = useRef<any>(null);
  const sortChoiceRef = useRef<any>(null);
  const directionChoiceRef = useRef<any>(null);
  const sortTriggerRef = useRef<any>(null);
  const filteredRows = useMemo(
    () => filterAndSortCampaignResults(rows, query, sortKey, direction),
    [rows, query, sortKey, direction],
  );
  const maxRev = filteredRows.reduce((max, row) => Math.max(max, row.revenueCents), 0);

  useEffect(() => {
    const search = searchRef.current;
    if (!search) return;
    const handleInput = (event: Event) => {
      setQuery((event.currentTarget as HTMLElement & { value?: string }).value ?? "");
    };
    search.addEventListener("input", handleInput);
    return () => search.removeEventListener("input", handleInput);
  }, []);

  useEffect(() => {
    const choices = sortChoiceRef.current;
    if (!choices) return;
    const handleChange = (event: Event) => {
      const nextKey = (event.currentTarget as HTMLElement & { values?: string[] }).values?.[0];
      if (nextKey === "utmCampaign" || nextKey === "orders" || nextKey === "revenueCents") {
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
      const nextDirection = (event.currentTarget as HTMLElement & { values?: string[] }).values?.[0];
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
          <h2 id="wpb-top-campaigns-title" className="wpb-section-title">Top Campaigns</h2>
          <p className="wpb-section-hint">Bundle revenue by UTM campaign</p>
        </div>
      </header>

      <div className="wpb-results-toolbar">
        <s-text-field
          ref={searchRef}
          label="Search campaigns"
          labelAccessibilityVisibility="exclusive"
          icon="search"
          placeholder="Search by campaign name"
          value={query}
          autocomplete="off"
        />
        <s-button
          ref={sortTriggerRef}
          commandFor="top-campaigns-sort-popover"
          variant="secondary"
          accessibilityLabel="Sort top campaigns"
        >
          <span className="wpb-results-sort-glyph" aria-hidden>↕</span> Sort
        </s-button>
        <s-popover id="top-campaigns-sort-popover">
          <s-box padding="base">
            <s-choice-list ref={sortChoiceRef} name="top-campaign-sort" label="Sort by">
              <s-choice value="utmCampaign" selected={sortKey === "utmCampaign" || undefined}>Campaign Name</s-choice>
              <s-choice value="orders" selected={sortKey === "orders" || undefined}>No. of Orders</s-choice>
              <s-choice value="revenueCents" selected={sortKey === "revenueCents" || undefined}>Total Bundle Value</s-choice>
            </s-choice-list>
            <s-divider />
            <s-choice-list
              ref={directionChoiceRef}
              name="top-campaign-direction"
              label="Direction"
              labelAccessibilityVisibility="exclusive"
            >
              <s-choice value="desc" selected={direction === "desc" || undefined}>↑ Highest</s-choice>
              <s-choice value="asc" selected={direction === "asc" || undefined}>↓ Lowest</s-choice>
            </s-choice-list>
          </s-box>
        </s-popover>
      </div>

      {filteredRows.length === 0 ? (
        <div className="wpb-results-empty">
          <span className="wpb-results-empty-icon" aria-hidden><s-icon type="search" /></span>
          <h3 className="wpb-results-empty-title">
            {rows.length === 0 ? "No orders found in this period" : "No campaigns found"}
          </h3>
          {rows.length > 0 && (
            <p className="wpb-section-hint">Try changing the search or sort options</p>
          )}
        </div>
      ) : (
        <div className="wpb-campaign-table" role="table" aria-label="Top campaign performance">
          <div className="wpb-campaign-table-head" role="row">
            <span role="columnheader">Campaign</span>
            <span role="columnheader">Orders</span>
            <span role="columnheader">Bundle revenue</span>
          </div>
          {filteredRows.slice(0, 5).map(r => {
            const pct = maxRev > 0 ? Math.round((r.revenueCents / maxRev) * 100) : 0;
            return (
              <div key={r.utmCampaign} className="wpb-campaign-row wpb-campaign-table-row" role="row">
                <div className="wpb-truncate-cell">
                  <p className="wpb-row-title">
                    {r.utmCampaign}
                  </p>
                  <progress className="wpb-campaign-meter" value={Math.max(2, pct)} max={100} />
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
