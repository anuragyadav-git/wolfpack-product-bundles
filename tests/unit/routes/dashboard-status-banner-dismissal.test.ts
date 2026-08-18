import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardStatusGrid, DASHBOARD_STOREFRONT_SETUP_BANNER_KEY } from "../../../app/routes/app/app.dashboard/DashboardStatusGrid";
import { dismissBannerInSession, isBannerDismissedInSession } from "../../../app/lib/banner-session-state";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

const APP_EMBED_RESOURCE = {
  handle: "bundle-app-embed",
  label: "Wolfpack Bundle",
  kind: "embed" as const,
  status: "active" as const,
  enabled: true,
  target: null,
};

describe("dashboard status banner dismissal with session persistence", () => {
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

  it("renders banner markup when not dismissed in session", () => {
    const props = {
      resources: [APP_EMBED_RESOURCE],
      error: false,
      appEmbedEnabled: true,
      themeEditorUrl: "https://theme-editor.test",
      onOpenThemeEditor: jest.fn(),
    };

    const view = renderToStaticMarkup(React.createElement(DashboardStatusGrid, props));
    expect(view).toContain("s-banner");
  });

  it("persists dismissal in session storage when dismissed", () => {
    expect(isBannerDismissedInSession(DASHBOARD_STOREFRONT_SETUP_BANNER_KEY)).toBe(false);

    dismissBannerInSession(DASHBOARD_STOREFRONT_SETUP_BANNER_KEY);

    expect(isBannerDismissedInSession(DASHBOARD_STOREFRONT_SETUP_BANNER_KEY)).toBe(true);
  });

  it("renders nothing when already dismissed in session (e.g. on page reload)", () => {
    dismissBannerInSession(DASHBOARD_STOREFRONT_SETUP_BANNER_KEY);

    const props = {
      resources: [APP_EMBED_RESOURCE],
      error: false,
      appEmbedEnabled: true,
      themeEditorUrl: "https://theme-editor.test",
      onOpenThemeEditor: jest.fn(),
    };

    const view = renderToStaticMarkup(React.createElement(DashboardStatusGrid, props));
    expect(view).toBe("");
  });
});
