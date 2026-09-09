import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {JSDOM} from "jsdom";

import {FpbImagesGifsPanel} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
}));

jest.mock("../../../app/components/shared/FilePicker", () => ({
  FilePicker: ({onChange}: {onChange: (url: string | null) => void}) =>
    React.createElement(
      "button",
      {
        onClick: () => onChange("https://cdn.shopify.com/promo.jpg"),
        type: "button",
      },
      "Choose media",
    ),
}));

describe("FPB media feature boundary", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "https://admin.shopify.com",
    });
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
  });

  it("updates the promo image and marks the route draft dirty", () => {
    const markAsDirty = jest.fn();
    const setPromoBannerBgImage = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbImagesGifsPanel, {
          activeAssetTabIndex: 0,
          activeSection: "images_gifs",
          floatingBadgeEnabled: false,
          floatingBadgeText: "",
          fullPageBundleStyles: {},
          markAsDirty,
          promoBannerBgImage: null,
          setActiveAssetTabIndex: jest.fn(),
          setFloatingBadgeEnabled: jest.fn(),
          setFloatingBadgeText: jest.fn(),
          setPromoBannerBgImage,
          steps: [],
          updateStepField: jest.fn(),
        } as any),
      );
    });

    const picker = container.querySelector<HTMLElement>("button");
    expect(picker).not.toBeNull();
    flushSync(() => {
      picker?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });

    expect(setPromoBannerBgImage).toHaveBeenCalledWith(
      "https://cdn.shopify.com/promo.jpg",
    );
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });

  it("renders no media controls outside the media section", () => {
    flushSync(() => {
      root.render(
        React.createElement(FpbImagesGifsPanel, {
          activeAssetTabIndex: 0,
          activeSection: "bundle_visibility",
          floatingBadgeEnabled: false,
          floatingBadgeText: "",
          fullPageBundleStyles: {},
          markAsDirty: jest.fn(),
          promoBannerBgImage: null,
          setActiveAssetTabIndex: jest.fn(),
          setFloatingBadgeEnabled: jest.fn(),
          setFloatingBadgeText: jest.fn(),
          setPromoBannerBgImage: jest.fn(),
          steps: [],
          updateStepField: jest.fn(),
        } as any),
      );
    });

    expect(container.querySelector("button")).toBeNull();
  });
});
