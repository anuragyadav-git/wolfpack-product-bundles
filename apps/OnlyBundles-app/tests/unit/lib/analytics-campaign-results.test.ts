import {
  filterAndSortCampaignResults,
  type CampaignResultRow,
} from "../../../app/lib/analytics/campaign-results";

const rows: CampaignResultRow[] = [
  { utmCampaign: "Summer Launch", revenueCents: 12_000, orders: 3 },
  { utmCampaign: "Creator Drop", revenueCents: 5_000, orders: 7 },
  { utmCampaign: "Autumn Preview", revenueCents: 8_000, orders: 4 },
];

describe("filterAndSortCampaignResults", () => {
  it("searches campaign names case-insensitively", () => {
    expect(filterAndSortCampaignResults(rows, "CREATOR", "utmCampaign", "asc")).toEqual([
      rows[1],
    ]);
  });

  it("sorts by orders using Highest", () => {
    expect(filterAndSortCampaignResults(rows, "", "orders", "desc").map(row => row.utmCampaign)).toEqual([
      "Creator Drop",
      "Autumn Preview",
      "Summer Launch",
    ]);
  });

  it("sorts by bundle value using Lowest", () => {
    expect(filterAndSortCampaignResults(rows, "", "revenueCents", "asc").map(row => row.utmCampaign)).toEqual([
      "Creator Drop",
      "Autumn Preview",
      "Summer Launch",
    ]);
  });
});
