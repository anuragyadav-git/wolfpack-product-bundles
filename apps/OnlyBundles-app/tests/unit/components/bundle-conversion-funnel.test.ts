import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundleConversionFunnel } from "../../../app/components/analytics/BundleConversionFunnel";
import { calculateFunnelRetention } from "../../../app/lib/analytics/funnel-retention";

describe("calculateFunnelRetention", () => {
  it("rounds each stage retention to a whole percentage", () => {
    expect(calculateFunnelRetention(645, 305, 116)).toEqual({
      viewToCart: 47,
      cartToOrder: 38,
    });
  });

  it("preserves retention above 100 percent", () => {
    expect(calculateFunnelRetention(10, 15, 30)).toEqual({
      viewToCart: 150,
      cartToOrder: 200,
    });
  });

  it("returns null when a preceding stage is zero", () => {
    expect(calculateFunnelRetention(0, 0, 0)).toEqual({
      viewToCart: null,
      cartToOrder: null,
    });
  });
});

describe("BundleConversionFunnel", () => {
  it("exposes the localized stages, exact counts, and conversion values", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleConversionFunnel, {
        bundleViews: 645,
        addedToCart: 305,
        orders: 116,
        formatCount: (value: number) => `count-${value}`,
      }),
    );

    expect(view).toContain('role="img"');
    expect(view).toContain("Bundle Views");
    expect(view).toContain("Added to cart");
    expect(view).toContain("Orders");
    expect(view).toContain("count-645");
    expect(view).toContain("count-305");
    expect(view).toContain("count-116");
    expect(view).toContain("47%");
    expect(view).toContain("38%");
  });

  it("renders a complete zero state without invalid numeric output", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleConversionFunnel, {
        bundleViews: 0,
        addedToCart: 0,
        orders: 0,
        formatCount: (value: number) => String(value),
      }),
    );

    expect(view.match(/>0<\/text>/g)).toHaveLength(3);
    expect(view.match(/>—<\/text>/g)).toHaveLength(2);
    expect(view).not.toContain("NaN");
    expect(view).not.toContain("Infinity");
  });
});
