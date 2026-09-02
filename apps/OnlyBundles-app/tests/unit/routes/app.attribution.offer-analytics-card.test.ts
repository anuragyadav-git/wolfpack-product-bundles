import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OfferAnalyticsCard } from "../../../app/routes/app/app.attribution/OfferAnalyticsCard";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        "analyticsPage.offers.title": "Offer performance",
        "analyticsPage.offers.filterLabel": "Offer policy",
        "analyticsPage.offers.allOffers": "All offers",
        "analyticsPage.offers.ruleVersion": `Rule version ${String(options?.version ?? "")}`,
        "analyticsPage.offers.tierCount": `${String(options?.count ?? "")} tiers`,
        "analyticsPage.offers.engaged": "Engaged sessions",
        "analyticsPage.offers.addedToCart": "Added to cart",
        "analyticsPage.offers.checkedOut": "Completed orders",
        "analyticsPage.offers.revenue": "Revenue",
      };
      return labels[key] ?? key;
    },
  }),
}));

describe("OfferAnalyticsCard", () => {
  it("keeps unique offer context without repeating the bundle funnel metrics", () => {
    const view = renderToStaticMarkup(
      React.createElement(OfferAnalyticsCard, {
        model: {
          selectedOfferPolicyId: "policy-1",
          options: [{
            id: "policy-1",
            label: "VIP launch",
            ruleVersion: 4,
            eligibilitySource: "specific_link",
            tierIds: ["tier-1", "tier-2"],
          }],
          funnelSnapshot: {
            engaged: 11,
            addedToCart: 7,
            checkedOut: 3,
            revenueCents: 12345,
          },
        },
        onSelectionChange: jest.fn(),
      }),
    );

    expect(view).toContain("Offer policy");
    expect(view).toContain("VIP launch");
    expect(view).toContain("Rule version 4");
    expect(view).toContain("specific link");
    expect(view).toContain("2 tiers");
    expect(view).not.toContain("Engaged sessions");
    expect(view).not.toContain("Added to cart");
    expect(view).not.toContain("Completed orders");
    expect(view).not.toContain("$123");
  });
});
