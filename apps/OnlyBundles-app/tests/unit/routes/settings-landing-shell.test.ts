import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { SettingsLandingShell } from "../../../app/routes/app/app.settings/SettingsLandingShell";

describe("Settings landing shell", () => {
  it("renders three actionable Polaris cards without loading a settings workspace", () => {
    const view = renderToStaticMarkup(
      React.createElement(SettingsLandingShell, {
        onBack: jest.fn(),
        onSelect: jest.fn(),
      })
    );

    expect(view.match(/<s-clickable/g)).toHaveLength(3);
    expect(view).toContain("Design");
    expect(view).toContain("Language");
    expect(view).toContain("Controls");
    expect(view).toContain('accessibilityLabel="Open Design settings"');
    expect(view).not.toContain("Configure</s-text>");
    expect(view).not.toContain("Design Control Panel");
  });

  it("does not replace the Settings cards with route-level feedback", () => {
    const view = renderToStaticMarkup(
      React.createElement(SettingsLandingShell, {
        onBack: jest.fn(),
        onSelect: jest.fn(),
      })
    );

    expect(view).toContain('accessibilityLabel="Open Controls settings"');
    expect(view).not.toContain('role="progressbar"');
  });

  it("delegates destination selection and loading intent to the route owner", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      FocusEvent: dom.window.FocusEvent,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const onSelect = jest.fn();
    const onIntent = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(SettingsLandingShell, {
          onBack: jest.fn(),
          onSelect,
          onIntent,
        })
      );
    });

    const design = container.querySelector<HTMLElement>(
      's-clickable[accessibilitylabel="Open Design settings"]'
    );
    expect(design).not.toBeNull();

    flushSync(() => {
      design?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      design?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onIntent).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("design");

    flushSync(() => root.unmount());
    container.remove();
  });
});
