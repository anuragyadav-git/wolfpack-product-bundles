export interface CampaignResultRow {
  utmCampaign: string;
  revenueCents: number;
  orders: number;
}

export type CampaignResultSortKey = "utmCampaign" | "orders" | "revenueCents";
export type CampaignResultSortDirection = "asc" | "desc";

export function filterAndSortCampaignResults(
  rows: CampaignResultRow[],
  searchQuery: string,
  sortKey: CampaignResultSortKey,
  direction: CampaignResultSortDirection,
): CampaignResultRow[] {
  const query = searchQuery.trim().toLocaleLowerCase();
  const filtered = query
    ? rows.filter(row => row.utmCampaign.toLocaleLowerCase().includes(query))
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
