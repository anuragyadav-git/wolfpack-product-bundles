/**
 * BundlePerformanceMatrix — searchable and sortable per-bundle result table.
 *
 * Issue: docs/issues-prod/wpb-analytics-revamp-1.md
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  filterAndSortBundleResults,
  type BundleMatrixRow,
  type BundleResultSortDirection,
  type BundleResultSortKey,
} from "../../lib/analytics";
import { translateAdmin } from "~/i18n/config";

export interface BundlePerformanceMatrixProps {
  rows: BundleMatrixRow[];
  formatRevenue: (cents: number) => string;
  onRowClick?: (bundleId: string) => void;
}

const SORT_OPTIONS: Array<{ key: BundleResultSortKey; label: string }> = [
  { key: "bundleName", label: "Bundle Name" },
  { key: "views", label: "Bundle Views" },
  { key: "ordersFromBundle", label: "No. of Orders" },
  { key: "revenueCents", label: "Total Bundle Value" },
  { key: "overallConversionRate", label: "Overall conversions" },
];

type ChoiceListElement = HTMLElement & { values?: string[] };
type TextFieldElement = HTMLElement & { value?: string };

export function BundlePerformanceMatrix({
  rows,
  formatRevenue,
  onRowClick,
}: BundlePerformanceMatrixProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<BundleResultSortKey>("revenueCents");
  const [direction, setDirection] = useState<BundleResultSortDirection>("desc");
  const searchRef = useRef<any>(null);
  const sortChoiceRef = useRef<any>(null);
  const directionChoiceRef = useRef<any>(null);
  const sortTriggerRef = useRef<any>(null);
  const filteredRows = useMemo(
    () => filterAndSortBundleResults(rows, query, sortKey, direction),
    [rows, query, sortKey, direction]
  );

  useEffect(() => {
    const search = searchRef.current;
    if (!search) return;
    const handleInput = (event: Event) =>
      setQuery((event.currentTarget as TextFieldElement).value ?? "");
    search.addEventListener("input", handleInput);
    return () => search.removeEventListener("input", handleInput);
  }, []);

  useEffect(() => {
    const choices = sortChoiceRef.current;
    if (!choices) return;
    const handleChange = (event: Event) => {
      const nextKey = (event.currentTarget as ChoiceListElement).values?.[0] as
        | BundleResultSortKey
        | undefined;
      if (nextKey && SORT_OPTIONS.some((option) => option.key === nextKey))
        setSortKey(nextKey);
    };
    choices.addEventListener("change", handleChange);
    return () => choices.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const choices = directionChoiceRef.current;
    if (!choices) return;
    const handleChange = (event: Event) => {
      const nextDirection = (event.currentTarget as ChoiceListElement)
        .values?.[0] as BundleResultSortDirection | undefined;
      if (nextDirection !== "asc" && nextDirection !== "desc") return;
      setDirection(nextDirection);
      sortTriggerRef.current?.click();
    };
    choices.addEventListener("change", handleChange);
    return () => choices.removeEventListener("change", handleChange);
  }, []);

  return (
    <section
      className="wpb-card wpb-card--flush"
      aria-labelledby="wpb-bundle-matrix-title"
    >
      <header className="wpb-section-header">
        <div>
          <h2 id="wpb-bundle-matrix-title" className="wpb-section-title">
            {translateAdmin(
              "adminExtracted.components.analytics.bundleperformancematrix.bundlePerformance"
            )}
          </h2>
          <p className="wpb-section-hint">
            {translateAdmin("adminDynamic.bundlesInPeriod", {
              count: rows.length,
            })}
          </p>
        </div>
      </header>

      <div className="wpb-results-toolbar">
        <s-text-field
          ref={searchRef}
          label={translateAdmin("dashboard.search.label")}
          labelAccessibilityVisibility="exclusive"
          icon="search"
          placeholder={translateAdmin("adminAttributes.searchByBundleName")}
          value={query}
          autocomplete="off"
        />
        <s-button
          ref={sortTriggerRef}
          commandFor="bundle-performance-sort-popover"
          variant="secondary"
          accessibilityLabel={translateAdmin(
            "adminAttributes.sortBundlePerformance"
          )}
        >
          <span className="wpb-results-sort-glyph" aria-hidden>
            ↕
          </span>{" "}
          {translateAdmin(
            "adminExtracted.components.analytics.bundleperformancematrix.sort"
          )}
        </s-button>
        <s-popover id="bundle-performance-sort-popover">
          <s-box padding="base">
            <s-choice-list
              ref={sortChoiceRef}
              name="bundle-performance-sort"
              label={translateAdmin("adminAttributes.sortBy")}
            >
              {SORT_OPTIONS.map((option) => (
                <s-choice
                  key={option.key}
                  value={option.key}
                  selected={option.key === sortKey || undefined}
                >
                  {option.label}
                </s-choice>
              ))}
            </s-choice-list>
            <s-divider />
            <s-choice-list
              ref={directionChoiceRef}
              name="bundle-performance-direction"
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
            {translateAdmin(
              "adminExtracted.components.analytics.bundleperformancematrix.noItemsFound"
            )}
          </h3>
          <p className="wpb-section-hint">
            {translateAdmin(
              "adminExtracted.components.analytics.bundleperformancematrix.tryChangingTheFiltersOrSearchTerm"
            )}
          </p>
        </div>
      ) : (
        <div className="wpb-matrix-scroll">
          <table className="wpb-matrix-table">
            <thead>
              <tr className="wpb-matrix-head-row">
                <th className="wpb-matrix-th wpb-matrix-th--bundle">
                  {translateAdmin(
                    "adminExtracted.components.analytics.bundleperformancematrix.bundle"
                  )}
                </th>
                <th className="wpb-matrix-th wpb-matrix-th--right">
                  {translateAdmin(
                    "adminExtracted.components.analytics.bundleperformancematrix.views"
                  )}
                </th>
                <th className="wpb-matrix-th wpb-matrix-th--right">
                  {translateAdmin(
                    "adminExtracted.components.analytics.bundleperformancematrix.noOfOrders"
                  )}
                </th>
                <th className="wpb-matrix-th wpb-matrix-th--right">
                  {translateAdmin(
                    "adminExtracted.components.analytics.bundleperformancematrix.totalBundleValue"
                  )}
                </th>
                <th className="wpb-matrix-th wpb-matrix-th--right">
                  {translateAdmin(
                    "adminExtracted.components.analytics.bundleperformancematrix.overallConversions"
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                return (
                  <tr
                    key={row.bundleId}
                    onClick={
                      onRowClick ? () => onRowClick(row.bundleId) : undefined
                    }
                    className="wpb-matrix-row"
                    data-clickable={Boolean(onRowClick)}
                  >
                    <td className="wpb-matrix-cell wpb-matrix-cell--primary">
                      {row.bundleName}
                    </td>
                    <td className="wpb-matrix-cell wpb-matrix-cell--right">
                      {row.views.toLocaleString()}
                    </td>
                    <td className="wpb-matrix-cell wpb-matrix-cell--right">
                      {row.ordersFromBundle.toLocaleString()}
                    </td>
                    <td className="wpb-matrix-cell wpb-matrix-cell--right wpb-matrix-cell--revenue">
                      {formatRevenue(row.revenueCents)}
                    </td>
                    <td className="wpb-matrix-cell wpb-matrix-cell--right wpb-matrix-cell--muted">
                      {row.overallConversionRate.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
