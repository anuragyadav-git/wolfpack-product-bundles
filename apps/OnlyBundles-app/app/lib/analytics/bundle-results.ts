import type { BundleMatrixRow } from "./engagement-helpers";

export type BundleResultSortKey =
  | "bundleName"
  | "views"
  | "ordersFromBundle"
  | "revenueCents"
  | "overallConversionRate";

export type BundleResultSortDirection = "asc" | "desc";

export function filterAndSortBundleResults(
  rows: BundleMatrixRow[],
  searchQuery: string,
  sortKey: BundleResultSortKey,
  direction: BundleResultSortDirection,
): BundleMatrixRow[] {
  const query = searchQuery.trim().toLocaleLowerCase();
  const filtered = query
    ? rows.filter(row => row.bundleName.toLocaleLowerCase().includes(query))
    : rows.slice();

  return filtered.sort((left, right) => {
    const leftValue = left[sortKey];
    const rightValue = right[sortKey];
    const comparison = typeof leftValue === "number" && typeof rightValue === "number"
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue));
    return direction === "asc" ? comparison : -comparison;
  });
}
