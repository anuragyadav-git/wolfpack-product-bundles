import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

import {
  BundleReadinessOverlay,
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
  it("includes the full readiness context in the initial DOM", () => {
    const Overlay = BundleReadinessOverlay as React.ComponentType<
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
    const Overlay = BundleReadinessOverlay as React.ComponentType<Record<string, unknown>>;
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

  it("renders the open checklist as an accessible modal dialog", () => {
    const Overlay = BundleReadinessOverlay as React.ComponentType<Record<string, unknown>>;
    const markup = renderToStaticMarkup(
      React.createElement(Overlay, {
        items: [{ key: "products", label: "Products selected", points: 60, done: false }],
        open: true,
      }),
    );

    expect(markup).toContain("<dialog");
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('aria-labelledby="bundle-readiness-title"');
    expect(markup).toContain("Products selected");
  });
});
