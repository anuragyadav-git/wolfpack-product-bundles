import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { ErrorPage } from "../../../app/components/ErrorPage";

const mockNavigate = jest.fn();
const mockOpenSupportChat = jest.fn();

jest.mock("@remix-run/react", () => ({
  isRouteErrorResponse: (error: unknown) => (
    typeof error === "object"
    && error !== null
    && "routeError" in error
  ),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../app/lib/support-chat.client", () => ({
  openSupportChat: () => mockOpenSupportChat(),
}));

describe("ErrorPage", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement("div");
    root = createRoot(container);
    mockNavigate.mockReset();
    mockOpenSupportChat.mockReset();
  });

  afterEach(() => {
    flushSync(() => root.unmount());
  });

  function renderErrorPage(error: unknown) {
    flushSync(() => {
      root.render(React.createElement(ErrorPage, { error }));
    });
  }

  function containsText(value: string) {
    return container.textContent?.includes(value) ?? false;
  }

  it("renders the Only Bundles identity and technical detail for a server error", () => {
    renderErrorPage(new Error("Request failed"));

    const logo = container.querySelector(
      's-image[alt="Only Bundles"]',
    );
    expect(logo?.getAttribute("src")).toBe(
      "/branding/only-bundles/only-bundles-icon.png",
    );
    expect(containsText("Unexpected Error")).toBe(true);
    expect(containsText("Technical details")).toBe(true);
    expect(containsText("Request failed")).toBe(true);
  });

  it("renders status-specific guidance for a missing page", () => {
    renderErrorPage({ routeError: true, status: 404 });

    expect(containsText("Page Not Found")).toBe(true);
    expect(containsText(
      "The page you're looking for doesn't exist or may have been moved.",
    )).toBe(true);
    expect(containsText("Technical details")).toBe(false);
  });

  it("returns to the dashboard through Remix navigation", () => {
    renderErrorPage(new Error("Request failed"));

    const dashboardAction = Array.from(container.querySelectorAll("button, s-button"))
      .find((element) => element.textContent === "Go to Dashboard");
    flushSync(() => {
      dashboardAction?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard", { replace: true });
  });

  it("opens the existing support chat", () => {
    renderErrorPage(new Error("Request failed"));

    const supportAction = Array.from(container.querySelectorAll("button, s-button"))
      .find((element) => element.textContent === "Contact Support");
    flushSync(() => {
      supportAction?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockOpenSupportChat).toHaveBeenCalledTimes(1);
  });
});
