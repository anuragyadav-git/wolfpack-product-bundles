import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {renderToStaticMarkup} from "react-dom/server";
import {JSDOM} from "jsdom";

import {
  BundleReadinessOverlay,
  getReadinessScoreColor,
  scheduleReadinessTriggerCollapse,
} from "../../../app/components/bundle-configure/BundleReadinessOverlay";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.readiness.title": "Readiness Score",
        "common.readiness.helper":
          "Complete all steps to maximise your bundle's success.",
      };

      return translations[key] ?? key;
    },
  }),
}));

describe("BundleReadinessOverlay trigger", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      pretendToBeVisual: true,
    });
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      HTMLDialogElement: dom.window.HTMLDialogElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
    jest.useRealTimers();
  });

  it.each([
    [0, "#f49300"],
    [65, "#f49300"],
    [79, "#f49300"],
    [80, "#008060"],
    [100, "#008060"],
  ])("uses the shared gauge color for a score of %s", (score, color) => {
    expect(getReadinessScoreColor(score)).toBe(color);
  });

  it("includes the full readiness context in the initial DOM", () => {
    const Overlay = BundleReadinessOverlay as unknown as React.ComponentType<
      Record<string, unknown>
    >;
    const markup = renderToStaticMarkup(
      React.createElement(Overlay, {
        items: [
          {
            key: "products",
            label: "Products selected",
            points: 60,
            done: true,
          },
        ],
      }),
    );

    expect(markup).toContain("60");
    expect(markup).toContain('data-readiness-trigger-state="expanded"');
    expect(markup).toContain('aria-hidden="false"');
    expect(markup).toContain("Readiness Score");
    expect(markup).toContain(
      "Complete all steps to maximise your bundle&#x27;s success.",
    );
  });

  it("collapses after five seconds", () => {
    jest.useFakeTimers();
    const collapse = jest.fn();

    const timeout = scheduleReadinessTriggerCollapse(collapse);

    jest.advanceTimersByTime(4_999);
    expect(collapse).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(collapse).toHaveBeenCalledTimes(1);

    clearTimeout(timeout);
    jest.useRealTimers();
  });

  it("can hide the floating trigger when another surface owns the control", () => {
    const Overlay = BundleReadinessOverlay as unknown as React.ComponentType<Record<string, unknown>>;
    const markup = renderToStaticMarkup(
      React.createElement(Overlay, {
        items: [{ key: "products", label: "Products selected", points: 60, done: true }],
        open: true,
        hideCollapsedTrigger: true,
      }),
    );

    expect(markup).not.toContain('data-tour-target="fpb-readiness-score"');
    expect(markup).toContain("Products selected");
  });

  it("includes the checklist content and score when open", () => {
    const Overlay = BundleReadinessOverlay as unknown as React.ComponentType<Record<string, unknown>>;
    const markup = renderToStaticMarkup(
      React.createElement(Overlay, {
        items: [{ key: "products", label: "Products selected", points: 60, done: false }],
        open: true,
      }),
    );

    expect(markup).toContain("Products selected");
    expect(markup).toContain('aria-label="Readiness Score: 0"');
    expect(markup).toContain('data-tour-target="fpb-readiness-score"');
    expect(markup).toContain('hidden=""');
  });

  it("closes exactly once when the modal is dismissed", () => {
    const onOpenChange = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(BundleReadinessOverlay, {
          items: [
            {
              key: "products",
              label: "Products selected",
              points: 60,
              done: false,
            },
          ],
          open: true,
          onOpenChange,
        }),
      );
    });

    const modal = container.querySelector("s-modal");
    expect(modal).not.toBeNull();

    flushSync(() => {
      modal?.dispatchEvent(new Event("hide", {bubbles: true}));
      modal?.dispatchEvent(new Event("afterhide", {bubbles: true}));
    });

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("opens an incomplete item and closes the checklist exactly once", () => {
    const onItemClick = jest.fn();
    const onOpenChange = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(BundleReadinessOverlay, {
          items: [
            {
              key: "products",
              label: "Products selected",
              description: "Choose products",
              points: 60,
              done: false,
            },
          ],
          open: true,
          onItemClick,
          onOpenChange,
        }),
      );
    });

    const action = Array.from(
      container.querySelectorAll<HTMLElement>("button, s-clickable"),
    ).find((element) => element.textContent?.includes("Products selected"));

    flushSync(() => {
      action?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });

    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith("products");
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
