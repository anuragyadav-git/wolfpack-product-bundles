import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { dismissBannerInSession } from "../../../app/lib/banner-session-state";

const submit = jest.fn();

jest.mock("@remix-run/react", () => ({
  useFetcher: jest.fn(() => ({
    data: undefined,
    state: "idle",
    submit,
  })),
}));

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: jest.fn(() => new Proxy({}, {
    get() {
      throw new Error("App Bridge property accessed during server render");
    },
  })),
}));

describe("PixelStatusCard", () => {
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as any).window = {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      },
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it("renders the warning as persistent without accessing App Bridge during server rendering", async () => {
    const {
      PixelStatusCard,
      UTM_PIXEL_STATUS_BANNER_KEY,
    } = await import(
      "../../../app/routes/app/app.attribution/PixelStatusCard"
    );

    dismissBannerInSession(UTM_PIXEL_STATUS_BANNER_KEY);

    const view = renderToStaticMarkup(
      React.createElement(PixelStatusCard, { pixelActive: false }),
    );

    expect(view).toContain('<s-banner tone="warning" heading="UTM Pixel Tracking"');
    expect(view).toContain('dismissible="false"');
    expect(view).toContain("UTM Pixel Tracking");
  });

  it("renders the success banner as dismissible", async () => {
    const { PixelStatusCard } = await import(
      "../../../app/routes/app/app.attribution/PixelStatusCard"
    );

    const view = renderToStaticMarkup(
      React.createElement(PixelStatusCard, { pixelActive: true }),
    );

    expect(view).toContain('<s-banner tone="success" heading="UTM Pixel Tracking"');
    expect(view).toContain('dismissible="true"');
  });

  it("renders no success banner after dismissal for the current session", async () => {
    const {
      PixelStatusCard,
      UTM_PIXEL_STATUS_BANNER_KEY,
    } = await import("../../../app/routes/app/app.attribution/PixelStatusCard");

    dismissBannerInSession(UTM_PIXEL_STATUS_BANNER_KEY);

    expect(renderToStaticMarkup(
      React.createElement(PixelStatusCard, { pixelActive: true }),
    )).toBe("");
  });
});
