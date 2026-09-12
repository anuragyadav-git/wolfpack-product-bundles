import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { SettingsContextualSaveBar } from "../../../app/routes/app/app.settings/SettingsFeedback";

const show = jest.fn(() => Promise.resolve());
const hide = jest.fn(() => Promise.resolve());
const loading = jest.fn();

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({ loading, saveBar: { show, hide } }),
}));

describe("SettingsContextualSaveBar lifecycle", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    show.mockClear();
    hide.mockClear();
    loading.mockClear();
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

  function render(isOpen: boolean, isSaving = false) {
    flushSync(() => {
      root.render(
        React.createElement(SettingsContextualSaveBar, {
          isOpen,
          isSaving,
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

  it("stays open and gives Save its native loading state while saving", () => {
    render(true, true);

    const saveButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent === "Save");
    const discardButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent === "Discard");

    expect(show).toHaveBeenCalledWith("settings-contextual-save-bar");
    expect(hide).not.toHaveBeenCalled();
    expect(saveButton?.getAttribute("loading")).toBe("true");
    expect(saveButton?.disabled).toBe(true);
    expect(discardButton?.disabled).toBe(true);
    expect(loading).toHaveBeenCalledWith(true);
  });

  it("hides a shown Save Bar when the Settings editor unmounts", () => {
    render(true);
    expect(show).toHaveBeenCalledWith("settings-contextual-save-bar");

    flushSync(() => root.unmount());

    expect(hide).toHaveBeenCalledWith("settings-contextual-save-bar");
    root = createRoot(container);
  });
});
