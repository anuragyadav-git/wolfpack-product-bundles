import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { TemplateReadyScreen } from "../../../app/components/bundle-configure/TemplateReadyScreen";

describe("TemplateReadyScreen", () => {
  it("renders the preview completion content", () => {
    const view = renderToStaticMarkup(
      React.createElement(TemplateReadyScreen, {
        isPreviewLoading: false,
        onPreview: jest.fn(),
      })
    );

    expect(view).toContain("View your bundle");
    expect(view).toContain("View your bundle with your customizations");
    expect(view).toContain("Your bundle is ready");
    expect(view).toContain("Preview it now with your customizations");
    expect(view).toContain("Preview bundle");
  });

  it("disables the preview action while preview generation is running", () => {
    const view = renderToStaticMarkup(
      React.createElement(TemplateReadyScreen, {
        isPreviewLoading: true,
        onPreview: jest.fn(),
      })
    );

    expect(view).toContain("disabled");
    expect(view).toContain('aria-busy="true"');
  });

  it("exposes a semantic projected button that delegates preview activation", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    const container = document.createElement("div");
    const root = createRoot(container);
    const onPreview = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(TemplateReadyScreen, {
          isPreviewLoading: false,
          onPreview,
        }),
      );
    });
    const previewAction = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((element) => element.textContent?.includes("Preview bundle"));

    expect(previewAction).toBeDefined();
    expect(previewAction?.type).toBe("button");

    flushSync(() => {
      previewAction?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    flushSync(() => root.unmount());

    expect(onPreview).toHaveBeenCalledTimes(1);
  });
});
