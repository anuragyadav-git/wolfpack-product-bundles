import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundleKeyStatistics } from "../../../app/components/analytics/BundleKeyStatistics";
import { BundleSalesTrends } from "../../../app/components/analytics/BundleSalesTrends";

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

describe("BundleKeyStatistics", () => {
  it("exposes all six metric labels and exact formatted values", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleKeyStatistics, {
        summary: {
          totalOrderRevenue: 10_000,
          totalBundleRevenue: 7_500,
          ordersWithBundles: 2,
          averageOrderValue: 5_000,
          addToCartValue: 2_500,
          totalBundlesPurchased: 3,
        },
        formatMoney,
      }),
    );

    for (const label of [
      "Total order revenue",
      "Total bundle revenue",
      "Orders with bundles",
      "Average order value",
      "Add to cart value",
      "Total bundle purchased",
    ]) {
      expect(view).toContain(label);
    }
    for (const value of ["$100.00", "$75.00", "$50.00", "$25.00", ">2<", ">3<"]) {
      expect(view).toContain(value);
    }
  });

  it("renders zero money values without invalid numbers", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleKeyStatistics, {
        summary: {
          totalOrderRevenue: 0,
          totalBundleRevenue: 0,
          ordersWithBundles: 0,
          averageOrderValue: null,
          addToCartValue: null,
          totalBundlesPurchased: 0,
        },
        formatMoney,
      }),
    );

    expect(view).toContain("$0.00");
    expect(view.match(/\$0\.00/g)).toHaveLength(4);
    expect(view).not.toContain("—");
    expect(view).not.toContain("NaN");
    expect(view).not.toContain("Infinity");
  });
});

describe("BundleSalesTrends", () => {
  it("exposes both sales metric names and every exact point accessibly", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleSalesTrends, {
        trend: [
          { date: "2026-09-01", bundleRevenue: 1_000, ordersWithBundles: 1 },
          { date: "2026-09-02", bundleRevenue: 2_500, ordersWithBundles: 3 },
        ],
        formatMoney,
      }),
    );

    expect(view).toContain("Bundle revenue");
    expect(view).toContain("Orders with bundles");
    expect(view).toContain("2026-09-01: $10.00");
    expect(view).toContain("2026-09-02: $25.00");
    expect(view).toContain("2026-09-01: 1");
    expect(view).toContain("2026-09-02: 3");
  });
});
