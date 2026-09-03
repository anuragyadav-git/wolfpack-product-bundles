import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { SettingsContextualSaveBar } from "../../../app/routes/app/app.settings/SettingsFeedback";

const show = jest.fn(() => Promise.resolve());
const hide = jest.fn(() => Promise.resolve());

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({ saveBar: { show, hide } }),
}));

describe("SettingsContextualSaveBar lifecycle", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    show.mockClear();
    hide.mockClear();
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement("div");
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
  });

  function render(isOpen: boolean) {
    flushSync(() => {
      root.render(
        React.createElement(SettingsContextualSaveBar, {
          isOpen,
          onDiscard: jest.fn(),
          onSave: jest.fn(),
        }),
      );
    });
  }

  it("does not hide a Save Bar that has never opened", () => {
    render(false);

    expect(show).not.toHaveBeenCalled();
    expect(hide).not.toHaveBeenCalled();

    flushSync(() => root.unmount());
    expect(hide).not.toHaveBeenCalled();
    root = createRoot(container);
  });

  it("shows when dirty and hides while still mounted after changes clear", () => {
    render(false);
    render(true);

    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith("settings-contextual-save-bar");

    render(false);

    expect(hide).toHaveBeenCalledTimes(1);
    expect(hide).toHaveBeenCalledWith("settings-contextual-save-bar");
  });
});
