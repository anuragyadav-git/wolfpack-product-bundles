import {
  closePendingDashboardPreview,
  navigatePendingDashboardPreview,
  openPendingDashboardPreview,
} from "../../../app/lib/dashboard-preview-window";

describe("dashboard preview window", () => {
  it("opens a blank tab synchronously and keeps it connected until navigation", () => {
    const popup = { opener: {} } as Window;
    const openWindow = jest.fn(() => popup);

    expect(openPendingDashboardPreview(openWindow)).toBe(popup);
    expect(openWindow).toHaveBeenCalledWith("about:blank", "_blank");
    expect(popup.opener).toEqual({});
  });

  it("navigates the pending tab before removing its opener", () => {
    const operations: string[] = [];
    const replace = jest.fn(() => operations.push("navigate"));
    const popupRecord = {
      closed: false,
      location: { replace },
    };
    Object.defineProperty(popupRecord, "opener", {
      configurable: true,
      get: () => ({}),
      set: () => operations.push("clear-opener"),
    });
    const popup = popupRecord as unknown as Window;

    expect(navigatePendingDashboardPreview(popup, "https://shop.test/apps/product-bundles/wpb/1?wpb_preview=token")).toBe(true);
    expect(replace).toHaveBeenCalledWith("https://shop.test/apps/product-bundles/wpb/1?wpb_preview=token");
    expect(operations).toEqual(["navigate", "clear-opener"]);
  });

  it("reports that a missing or closed pending tab cannot be navigated", () => {
    expect(navigatePendingDashboardPreview(null, "https://shop.test/preview")).toBe(false);
    expect(navigatePendingDashboardPreview({ closed: true } as Window, "https://shop.test/preview")).toBe(false);
  });

  it("closes an unused pending tab", () => {
    const close = jest.fn();
    closePendingDashboardPreview({ closed: false, close } as unknown as Window);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
