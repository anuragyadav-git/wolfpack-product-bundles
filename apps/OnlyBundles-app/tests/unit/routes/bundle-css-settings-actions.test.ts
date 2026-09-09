import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {JSDOM} from "jsdom";

import {FpbBundleCssSettings} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsCss";
import {PpbBundleLevelCssSettings} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.bundleCss";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
}));

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/BundleStatusSection",
  () => ({BundleStatusSection: () => null}),
);

describe("bundle CSS settings actions", () => {
  let container: HTMLDivElement;
  let root: Root;

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
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
    jest.clearAllMocks();
  });

  function activateCssDisclosure() {
    const action = Array.from(
      container.querySelectorAll<HTMLElement>("button, s-clickable"),
    ).find((element) =>
      element.textContent?.includes("bundlesettingscss.bundleLevelCss"),
    );

    flushSync(() => {
      action?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });
  }

  it("delegates the FPB disclosure toggle to the FPB state owner", () => {
    const setBundleLevelCssExpanded = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbBundleCssSettings, {
          bundleLevelCss: "",
          bundleLevelCssExpanded: false,
          bundleStatus: "draft",
          markAsDirty: jest.fn(),
          setBundleLevelCss: jest.fn(),
          setBundleLevelCssExpanded,
          setBundleStatus: jest.fn(),
        } as any),
      );
    });

    activateCssDisclosure();

    expect(setBundleLevelCssExpanded).toHaveBeenCalledTimes(1);
    expect(setBundleLevelCssExpanded.mock.calls[0][0](false)).toBe(true);
  });

  it("delegates the PPB disclosure toggle to the PPB state owner", () => {
    const setBundleLevelCssExpanded = jest.fn();
    const props = {
      bundleLevelCss: "",
      bundleLevelCssExpanded: true,
      markAsDirty: jest.fn(),
      setBundleLevelCss: jest.fn(),
      setBundleLevelCssExpanded,
    };

    flushSync(() => {
      root.render(React.createElement(PpbBundleLevelCssSettings, props));
    });

    activateCssDisclosure();

    expect(setBundleLevelCssExpanded).toHaveBeenCalledTimes(1);
    expect(setBundleLevelCssExpanded.mock.calls[0][0](true)).toBe(false);
  });
});
