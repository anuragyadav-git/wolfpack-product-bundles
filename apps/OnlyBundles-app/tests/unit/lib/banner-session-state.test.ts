import {
  isBannerDismissedInSession,
  dismissBannerInSession,
  clearBannerDismissalInSession,
  getBannerSessionStorageKey,
} from "../../../app/lib/banner-session-state";

class MockSessionStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("banner session state persistence", () => {
  let mockStorage: MockSessionStorage;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    mockStorage = new MockSessionStorage();
    (globalThis as any).window = {
      sessionStorage: mockStorage,
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it("generates namespaced session storage keys", () => {
    expect(getBannerSessionStorageKey("dashboard_setup")).toBe("wpb_banner_dismissed_dashboard_setup");
  });

  it("returns false when banner has not been dismissed", () => {
    expect(isBannerDismissedInSession("dashboard_setup")).toBe(false);
  });

  it("stores dismissal in sessionStorage and returns true", () => {
    dismissBannerInSession("dashboard_setup");
    expect(mockStorage.getItem("wpb_banner_dismissed_dashboard_setup")).toBe("true");
    expect(isBannerDismissedInSession("dashboard_setup")).toBe(true);
  });

  it("clears dismissal from sessionStorage when reset", () => {
    dismissBannerInSession("dashboard_setup");
    expect(isBannerDismissedInSession("dashboard_setup")).toBe(true);

    clearBannerDismissalInSession("dashboard_setup");
    expect(isBannerDismissedInSession("dashboard_setup")).toBe(false);
    expect(mockStorage.getItem("wpb_banner_dismissed_dashboard_setup")).toBeNull();
  });

  it("returns false in SSR / non-window environment", () => {
    (globalThis as any).window = undefined;
    expect(isBannerDismissedInSession("dashboard_setup")).toBe(false);
    expect(() => dismissBannerInSession("dashboard_setup")).not.toThrow();
    expect(() => clearBannerDismissalInSession("dashboard_setup")).not.toThrow();
  });

  it("handles storage exceptions gracefully", () => {
    mockStorage.getItem = jest.fn(() => {
      throw new Error("QuotaExceededError or SecurityError");
    });

    expect(isBannerDismissedInSession("dashboard_setup")).toBe(false);
  });

  it("handles storage write exceptions gracefully", () => {
    mockStorage.setItem = jest.fn(() => {
      throw new Error("SecurityError in sandbox iframe");
    });

    expect(() => dismissBannerInSession("dashboard_setup")).not.toThrow();
  });
});
