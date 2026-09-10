import React from "react";
import { flushSync } from "react-dom";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { useAppBridge } from "@shopify/app-bridge-react";
import { DesignLivePreview } from "../../../app/routes/app/app.settings/DesignLivePreview";
import {
  configureStorefrontPreviewCurrencyContext,
  createPreviewController,
} from "../../../app/routes/root/settings-design-preview-frame/route";

const mockToastShow = jest.fn();

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: jest.fn(),
}));

const mockUseAppBridge = useAppBridge as jest.MockedFunction<typeof useAppBridge>;

describe("Settings Design preview runtime", () => {
  let dom: JSDOM;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    dom = new JSDOM("<!doctype html><html><body></body></html>", {
      pretendToBeVisual: true,
      url: "https://preview.example/settings",
    });
    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MessageEvent: dom.window.MessageEvent,
      CustomEvent: dom.window.CustomEvent,
      Element: dom.window.Element,
      HTMLElement: dom.window.HTMLElement,
      HTMLIFrameElement: dom.window.HTMLIFrameElement,
      MutationObserver: dom.window.MutationObserver,
      ResizeObserver: ResizeObserverMock,
      requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
      cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    mockToastShow.mockReset();
    mockUseAppBridge.mockReturnValue(
      { toast: { show: mockToastShow } } as unknown as ReturnType<typeof useAppBridge>,
    );
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
    dom.window.close();
  });

  it("provides Shopify base and presentment currency to the production renderer", () => {
    const previewWindow: Parameters<typeof configureStorefrontPreviewCurrencyContext>[0] = {};

    configureStorefrontPreviewCurrencyContext(previewWindow, "USD");

    expect(previewWindow.shopCurrency).toBe("USD");
    expect(previewWindow.shopifyMultiCurrency).toEqual({
      shopBaseCurrency: "USD",
      customerCurrency: "USD",
    });
    expect(previewWindow.__WOLFPACK_PRESENTMENT_CURRENCY__).toBe("USD");
    expect(previewWindow.Shopify?.currency).toEqual({
      active: "USD",
      rate: "1.0",
    });
  });

  it.each([
    ["full_page", "standard"],
    ["full_page", "classic"],
    ["full_page", "compact"],
    ["full_page", "horizontal"],
    ["product_page", "product-list"],
    ["product_page", "product-grid"],
    ["product_page", "horizontal-slots"],
    ["product_page", "vertical-slots"],
  ] as const)(
    "awaits successful %s fixture initialization",
    async (bundleType, templateKey) => {
      const widgetRoot = document.createElement("div");
      widgetRoot.dataset.previewTemplate = templateKey;
      document.body.appendChild(widgetRoot);

      const controller = await createPreviewController(bundleType, widgetRoot);

      expect(controller.isInitialized).toBe(true);
      expect(widgetRoot.dataset.initialized).toBe("true");
      const headings = Array.from(widgetRoot.querySelectorAll("h1, h2, h3, h4"))
        .map((heading) => heading.textContent);
      expect(headings).not.toContain("Bundle unavailable");
      widgetRoot.remove();
    },
  );

  it("shows a Shopify error toast for a trusted renderer failure", async () => {
    flushSync(() => {
      root.render(React.createElement(DesignLivePreview, { fieldValues: {} }));
    });
    const frame = container.querySelector("iframe");
    expect(frame?.contentWindow).toBeTruthy();

    await act(async () => {
      window.dispatchEvent(new MessageEvent("message", {
        origin: window.location.origin,
        source: frame?.contentWindow,
        data: {
          version: 2,
          type: "ERROR",
          payload: { message: "Renderer failed" },
        },
      }));
    });

    expect(mockToastShow).toHaveBeenCalledWith(
      "The storefront preview is not ready. Try again.",
      { isError: true, duration: 5000 },
    );
    expect(container.querySelector("s-banner")).toBeNull();
  });
});
