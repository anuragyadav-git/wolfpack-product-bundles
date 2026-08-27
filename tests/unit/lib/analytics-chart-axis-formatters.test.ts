import {
  formatBundleSplitDateAxisTick,
  formatCompactCountAxisTick,
  formatCompactCurrencyAxisTick,
} from "../../../app/lib/analytics/chart-axis-formatters";

describe("analytics chart axis formatters", () => {
  it("formats engagement count values for compact chart ticks", () => {
    expect(formatCompactCountAxisTick(0)).toBe("0");
    expect(formatCompactCountAxisTick(34)).toBe("34");
    expect(formatCompactCountAxisTick(1200)).toBe("1.2K");
    expect(formatCompactCountAxisTick(1500000)).toBe("1.5M");
  });

  it("formats bundle revenue cents for compact chart ticks", () => {
    expect(formatCompactCurrencyAxisTick(0)).toBe("$0");
    expect(formatCompactCurrencyAxisTick(999)).toBe("$10");
    expect(formatCompactCurrencyAxisTick(125000)).toBe("$1.3K");
    expect(formatCompactCurrencyAxisTick(150000000)).toBe("$1.5M");
  });

  it("shows only the day number for Bundle Split ranges up to 30 days", () => {
    expect(formatBundleSplitDateAxisTick("2026-07-07", 7)).toBe("7");
    expect(formatBundleSplitDateAxisTick("2026-07-14", 30)).toBe("14");
  });

  it("shows abbreviated month and day for Bundle Split ranges over 30 days", () => {
    expect(formatBundleSplitDateAxisTick("2026-07-07", 31)).toBe("Jul 7");
    expect(formatBundleSplitDateAxisTick("2026-08-06", 90)).toBe("Aug 6");
  });

  it("never adds a year and preserves an invalid date label", () => {
    expect(formatBundleSplitDateAxisTick("2026-12-31", 365)).toBe("Dec 31");
    expect(formatBundleSplitDateAxisTick("not-a-date", 30)).toBe("not-a-date");
  });
});
