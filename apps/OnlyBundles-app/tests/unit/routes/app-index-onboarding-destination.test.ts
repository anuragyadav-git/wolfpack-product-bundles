import {
  default as AppIndex,
  AppRouteLoadingWorkspace,
  getInitialAppDestination,
} from "../../../app/routes/app/app._index";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { flushSync } from "react-dom";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";

const navigate = jest.fn();
const openSupportChat = jest.fn();

jest.mock("@remix-run/react", () => ({
  useNavigate: () => navigate,
}));

jest.mock("../../../app/lib/support-chat.client", () => ({
  openSupportChat: () => openSupportChat(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.loading.appLabel": "Loading Wolfpack Product Bundles",
        "common.loading.workspace": "Loading your workspace",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("initial app destination", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "https://admin.shopify.com/app",
    });
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    navigate.mockReset();
    openSupportChat.mockReset();
    window.history.replaceState({}, "", "/app");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
  });

  it("opens the dashboard for every authenticated app entry", () => {
    expect(getInitialAppDestination(true)).toBe("/app/dashboard");
  });

  it("keeps intentional app-home visits on the landing page", () => {
    expect(getInitialAppDestination(false)).toBeNull();
  });

  it("renders Polaris workspace feedback while client routing resolves", () => {
    const markup = renderToStaticMarkup(React.createElement(AppRouteLoadingWorkspace));

    expect(markup).toContain("<s-spinner");
    expect(markup).toContain('accessibilityLabel="Loading your workspace"');
    expect(markup).toContain("Loading your workspace");
  });

  it("delegates app-home creation and support actions", async () => {
    flushSync(() => {
      root.render(React.createElement(AppIndex));
    });
    await act(async () => {
      await Promise.resolve();
    });

    const actions = Array.from(
      container.querySelectorAll<HTMLElement>("button, s-button"),
    );
    const createBundle = actions.find((action) =>
      action.textContent?.includes("Get Started"),
    );
    const contactSupport = actions.find((action) =>
      action.textContent?.includes("Contact Support"),
    );

    flushSync(() => {
      createBundle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      contactSupport?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(navigate).toHaveBeenCalledWith("/app/bundles/create");
    expect(openSupportChat).toHaveBeenCalledTimes(1);
  });
});
