/* eslint-disable testing-library/no-unnecessary-act -- Raw React createRoot needs act; no Testing Library utilities are used. */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { loadCanny } from "../../../app/lib/canny.client";
import { CannyChangelog } from "../../../app/components/canny/CannyChangelog";
import { CannyFeedback } from "../../../app/components/canny/CannyFeedback";

jest.mock("../../../app/lib/canny.client", () => ({ loadCanny: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe("Canny merchant surfaces", () => {
  const config = { appID: "app", boardToken: "board", portalURL: "https://qa.canny.io" };
  let dom: JSDOM;
  let root: Root;
  let host: HTMLElement;
  let canny: jest.Mock;
  const originalFetch = global.fetch;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://app.example.com" });
    Object.assign(global, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
    host = document.getElementById("root")!;
    root = createRoot(host);
    canny = jest.fn((command, options) => {
      if (command === "initChangelog") {
        document.querySelectorAll<HTMLElement>("[data-canny-changelog]").forEach(button => {
          button.addEventListener("click", () => canny("opened"));
        });
      }
      if (command === "render") {
        document.querySelector("[data-canny]")!.appendChild(document.createElement("iframe"));
        options.onLoadCallback();
      }
    });
    jest.mocked(loadCanny).mockResolvedValue(canny);
    window.Canny = canny;
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ ssoToken: "short-lived" })));
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    dom.window.close();
    global.fetch = originalFetch;
    delete (global as Record<string, unknown>).window;
    delete (global as Record<string, unknown>).document;
    jest.useRealTimers();
  });
  it("defers background initialization and initializes each bell only once", async () => {
    await act(async () => root.render(React.createElement(CannyChangelog, { config })));
    expect(loadCanny).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(8000));
    expect(canny).toHaveBeenCalledWith("initChangelog", expect.objectContaining({ appID: "app", align: "right", position: "bottom", omitNonEssentialCookies: true }));
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    expect(canny.mock.calls.filter(([command]) => command === "opened")).toHaveLength(1);
    expect(canny.mock.calls.filter(([command]) => command === "initChangelog")).toHaveLength(1);
  });
  it("opens on the first early click and leaves subsequent toggles to Canny", async () => {
    await act(async () => root.render(React.createElement(CannyChangelog, { config })));
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    expect(canny.mock.calls.filter(([command]) => command === "opened")).toHaveLength(1);
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    expect(canny.mock.calls.filter(([command]) => command === "opened")).toHaveLength(2);
  });
  it("does not initialize a detached bell when SDK loading finishes after navigation", async () => {
    let finish!: (value: typeof canny) => void;
    jest.mocked(loadCanny).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    await act(async () => root.render(React.createElement(CannyChangelog, { config })));
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    await act(async () => root.render(null));
    await act(async () => finish(canny));
    expect(canny).not.toHaveBeenCalledWith("initChangelog", expect.anything());
  });
  it("shows a retryable bell error without breaking the Dashboard", async () => {
    jest.mocked(loadCanny).mockRejectedValueOnce(new Error("blocked"));
    await act(async () => root.render(React.createElement(CannyChangelog, { config })));
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    expect(host.textContent).toContain("canny.unavailable");
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    expect(canny).toHaveBeenCalledWith("opened");
  });
  it("renders a signed board without changing embedded app URLs, and cleans it on exit", async () => {
    await act(async () => root.render(React.createElement(CannyFeedback, { config })));
    expect(fetch).toHaveBeenCalledWith("/app/canny/session", expect.objectContaining({ cache: "no-store", signal: expect.anything() }));
    expect(canny).toHaveBeenCalledWith("render", expect.objectContaining({ boardToken: "board", ssoToken: "short-lived", basePath: null }));
    expect(host.querySelector("s-spinner")).toBeNull();
    await act(async () => root.render(null));
    expect(document.querySelector("iframe")).toBeNull();
  });
  it("never renders an unsigned widget after a session failure and supports retry", async () => {
    jest.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 503 }));
    await act(async () => root.render(React.createElement(CannyFeedback, { config })));
    expect(canny).not.toHaveBeenCalledWith("render", expect.anything());
    expect(host.querySelector("s-banner")?.getAttribute("heading")).toBe("canny.unavailable");
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    expect(canny).toHaveBeenCalledWith("render", expect.objectContaining({ ssoToken: "short-lived" }));
  });
  it("reports unavailable configuration without loading any third-party code", async () => {
    await act(async () => root.render(React.createElement(CannyFeedback, { config: null })));
    expect(host.querySelector("s-banner")?.getAttribute("heading")).toBe("canny.unavailable");
    expect(loadCanny).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("initializes a fresh bell after route re-entry without duplicating the old trigger", async () => {
    await act(async () => root.render(React.createElement(CannyChangelog, { config })));
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    await act(async () => root.render(null));
    await act(async () => root.render(React.createElement(CannyChangelog, { config })));
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    expect(canny.mock.calls.filter(([command]) => command === "initChangelog")).toHaveLength(2);
    expect(canny.mock.calls.filter(([command]) => command === "opened")).toHaveLength(2);
  });
  it("closes the changelog on Escape from the app and on route exit", async () => {
    await act(async () => root.render(React.createElement(CannyChangelog, { config })));
    await act(async () => host.querySelector<HTMLElement>("s-button")!.click());
    await act(async () => document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(canny).toHaveBeenCalledWith("closeChangelog");
    canny.mockClear();
    await act(async () => root.render(null));
    expect(canny).toHaveBeenCalledWith("closeChangelog");
  });
  it("aborts a pending identity request and never renders a detached widget", async () => {
    let finish!: (value: Response) => void;
    jest.mocked(fetch).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    await act(async () => root.render(React.createElement(CannyFeedback, { config })));
    const signal = jest.mocked(fetch).mock.calls[0][1]!.signal!;
    await act(async () => root.render(null));
    expect(signal.aborted).toBe(true);
    await act(async () => finish(new Response(JSON.stringify({ ssoToken: "token" }))));
    expect(canny).not.toHaveBeenCalledWith("render", expect.anything());
  });
  it("times out a widget that never reports readiness and removes its iframe", async () => {
    canny.mockImplementation(() => {
      document.querySelector("[data-canny]")?.appendChild(document.createElement("iframe"));
    });
    await act(async () => root.render(React.createElement(CannyFeedback, { config })));
    await act(async () => jest.advanceTimersByTime(30000));
    expect(host.querySelector("s-banner")?.getAttribute("heading")).toBe("canny.unavailable");
    expect(document.querySelector("iframe")).toBeNull();
  });
});
