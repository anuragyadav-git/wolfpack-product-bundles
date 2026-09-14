import { collectBundleLineRevenue } from "../../../app/lib/analytics/bundle-line-revenue";

const displayProperties = (bundleId: string) => ({
  _bundle_display_properties: JSON.stringify({
    offerAnalytics: { bundleId },
  }),
});

describe("collectBundleLineRevenue", () => {
  it("sums tagged flat checkout line values by bundle", () => {
    expect(collectBundleLineRevenue([
      { properties: displayProperties("bundle-a"), finalLinePrice: { amount: 12.5 } },
      { properties: displayProperties("bundle-a"), finalLinePrice: { amount: 7.25 } },
      { properties: displayProperties("bundle-b"), finalLinePrice: { amount: 3 } },
    ], ["bundle-a", "bundle-b"])).toEqual({
      "bundle-a": 1_975,
      "bundle-b": 300,
    });
  });

  it("counts a tagged Cart Transform parent once instead of its components", () => {
    expect(collectBundleLineRevenue([{
      properties: displayProperties("bundle-a"),
      finalLinePrice: { amount: 25 },
      lineComponents: [
        { properties: displayProperties("bundle-a"), finalLinePrice: { amount: 10 } },
        { properties: displayProperties("bundle-a"), finalLinePrice: { amount: 15 } },
      ],
    }], ["bundle-a"])).toEqual({ "bundle-a": 2_500 });
  });

  it("uses the canonical current Admin line value for a verified bundle line", () => {
    expect(collectBundleLineRevenue([{
      bundleId: "bundle-a",
      discountedTotalSet: {
        shopMoney: { amount: "19.99" },
      },
    }], ["bundle-a"])).toEqual({ "bundle-a": 1_999 });
  });

  it("ignores unknown identities and malformed money instead of guessing", () => {
    expect(collectBundleLineRevenue([
      { finalLinePrice: { amount: 50 } },
      { properties: displayProperties("bundle-other"), finalLinePrice: { amount: 10 } },
      { properties: displayProperties("bundle-a"), finalLinePrice: { amount: "not-money" } },
    ], ["bundle-a"])).toEqual({ "bundle-a": 0 });
  });
});
