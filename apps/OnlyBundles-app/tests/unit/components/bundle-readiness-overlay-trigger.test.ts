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
    dom.window.customElements.define(
      "s-clickable",
      class extends dom.window.HTMLElement {},
    );
    dom.window.customElements.define(
      "s-popover",
      class extends dom.window.HTMLElement {
        hidePopover() {
          this.dispatchEvent(new dom.window.Event("hide", {bubbles: true}));
        }
      },
    );
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
    expect(markup).toContain("<s-popover");
    expect(markup).not.toContain("<s-modal");
    expect(markup).toContain('commandFor="bundle-readiness-popover"');
    expect(markup).toContain('command="--toggle"');
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

  it("changes the trigger state to compact after five seconds", () => {
    jest.useFakeTimers();

    flushSync(() => {
      root.render(
        React.createElement(BundleReadinessOverlay, {
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
    });

    const trigger = container.querySelector(
      '[data-tour-target="fpb-readiness-score"]',
    );
    expect(trigger?.getAttribute("data-readiness-trigger-state")).toBe(
      "expanded",
    );

    flushSync(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(trigger?.getAttribute("data-readiness-trigger-state")).toBe(
      "collapsed",
    );
  });

  it("keeps the checklist in the native popover without duplicating the trigger score", () => {
    const Overlay = BundleReadinessOverlay as unknown as React.ComponentType<Record<string, unknown>>;
    const markup = renderToStaticMarkup(
      React.createElement(Overlay, {
        items: [{ key: "products", label: "Products selected", points: 60, done: false }],
      }),
    );

    expect(markup).toContain("Products selected");
    expect(markup).toContain('data-tour-target="fpb-readiness-score"');
    expect(markup).toContain('id="bundle-readiness-popover"');
    expect(markup).not.toContain('aria-label="Readiness Score: 0"');
    expect(markup.match(/Readiness Score/g)).toHaveLength(1);
  });

  it("synchronizes route state exactly once for each popover lifecycle change", () => {
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
          onOpenChange,
        }),
      );
    });

    const popover = container.querySelector("s-popover");
    expect(popover).not.toBeNull();

    flushSync(() => {
      popover?.dispatchEvent(new Event("show", {bubbles: true}));
      popover?.dispatchEvent(new Event("hide", {bubbles: true}));
      popover?.dispatchEvent(new Event("afterhide", {bubbles: true}));
    });

    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("closes before activating a deliberately clicked incomplete checklist item", () => {
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
          onItemClick,
          onOpenChange,
        }),
      );
    });

    const popover = container.querySelector("s-popover");
    flushSync(() => {
      popover?.dispatchEvent(new Event("show", {bubbles: true}));
    });

    const action = Array.from(
      container.querySelectorAll<HTMLElement>("s-popover s-clickable"),
    ).find((element) => element.textContent?.includes("Products selected"));
    expect(action).toBeDefined();
    expect(action?.getAttribute("commandfor")).toBe(
      "bundle-readiness-popover",
    );
    expect(action?.getAttribute("command")).toBe("--hide");

    flushSync(() => {
      action?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });

    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith("products");
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(onOpenChange.mock.invocationCallOrder[1]).toBeLessThan(
      onItemClick.mock.invocationCallOrder[0],
    );
  });

  it("does not activate a checklist item when the popover is light-dismissed", () => {
    const onItemClick = jest.fn();
    const onOpenChange = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(BundleReadinessOverlay, {
          items: [
            {
              key: "product_active",
              label: "Set Parent Product to Active",
              description: "Publish the product",
              points: 15,
              done: false,
            },
          ],
          onItemClick,
          onOpenChange,
        }),
      );
    });

    const popover = container.querySelector("s-popover");
    flushSync(() => {
      popover?.dispatchEvent(new Event("show", {bubbles: true}));
      popover?.dispatchEvent(new Event("hide", {bubbles: true}));
    });

    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("consumes an outside action click when it light-dismisses the popover", () => {
    const outsideAction = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(BundleReadinessOverlay, {
            items: [
              {
                key: "product_active",
                label: "Set Parent Product to Active",
                description: "Publish the product",
                points: 15,
                done: false,
              },
            ],
          }),
          React.createElement(
            "button",
            {type: "button", onClick: outsideAction},
            "Edit Product",
          ),
        ),
      );
    });

    const popover = container.querySelector("s-popover");
    const editProduct = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent === "Edit Product");
    expect(editProduct).toBeDefined();

    flushSync(() => {
      popover?.dispatchEvent(new Event("show", {bubbles: true}));
      editProduct?.dispatchEvent(new MouseEvent("pointerdown", {bubbles: true}));
      popover?.dispatchEvent(new Event("hide", {bubbles: true}));
      editProduct?.dispatchEvent(new MouseEvent("pointerup", {bubbles: true}));
      editProduct?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });

    expect(outsideAction).not.toHaveBeenCalled();

    flushSync(() => {
      editProduct?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });

    expect(outsideAction).toHaveBeenCalledTimes(1);
  });

  it("does not activate a completed checklist item", () => {
    const onItemClick = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(BundleReadinessOverlay, {
          items: [
            {
              key: "embed",
              label: "App Embed Enabled",
              points: 15,
              done: true,
            },
          ],
          onItemClick,
        }),
      );
    });

    const completedItem = container.querySelector<HTMLElement>(
      's-popover s-clickable[accessibilityLabel="common.readiness.itemAccessibility"]',
    );
    expect(completedItem?.hasAttribute("disabled")).toBe(true);

    const popover = container.querySelector("s-popover");
    const commandEvent = new Event("command", {bubbles: true});
    Object.defineProperty(commandEvent, "source", {value: completedItem});
    flushSync(() => {
      popover?.dispatchEvent(commandEvent);
    });

    expect(onItemClick).not.toHaveBeenCalled();
  });
});
