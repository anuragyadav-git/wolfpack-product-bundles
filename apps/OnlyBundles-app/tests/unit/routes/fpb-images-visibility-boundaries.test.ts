import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {JSDOM} from "jsdom";

import {FpbImagesGifsPanel} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
}));

jest.mock("../../../app/components/shared/AssetUpload", () => ({
  AssetUpload: ({
    label,
    onChange,
  }: {
    label?: string;
    onChange: (url: string | null) => void;
  }) =>
    React.createElement(
      "button",
      {
        "aria-label": label?.includes("bannerImageMobile")
          ? "mobile upload"
          : "desktop upload",
        onClick: () =>
          onChange(
            label?.includes("bannerImageMobile")
              ? "https://cdn.shopify.com/mobile.jpg"
              : "https://cdn.shopify.com/desktop.jpg",
          ),
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

  it("updates desktop and mobile promo banners and marks the route draft dirty", () => {
    const markAsDirty = jest.fn();
    const setBundleBannerDesktopUrl = jest.fn();
    const setBundleBannerMobileUrl = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbImagesGifsPanel, {
          activeAssetTabIndex: 0,
          activeSection: "images_gifs",
          floatingBadgeEnabled: false,
          floatingBadgeText: "",
          fullPageBundleStyles: {},
          markAsDirty,
          bundleBannerDesktopUrl: "",
          bundleBannerMobileUrl: "",
          setActiveAssetTabIndex: jest.fn(),
          setBundleBannerDesktopUrl,
          setBundleBannerMobileUrl,
          setFloatingBadgeEnabled: jest.fn(),
          setFloatingBadgeText: jest.fn(),
          steps: [],
          updateStepField: jest.fn(),
        } as any),
      );
    });

    click('button[aria-label="desktop upload"]');
    click('button[aria-label="mobile upload"]');

    expect(setBundleBannerDesktopUrl).toHaveBeenCalledWith(
      "https://cdn.shopify.com/desktop.jpg",
    );
    expect(setBundleBannerMobileUrl).toHaveBeenCalledWith(
      "https://cdn.shopify.com/mobile.jpg",
    );
    expect(markAsDirty).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).not.toContain("imagesgifspanel.mediaAssets");
    expect(container.innerHTML).not.toContain(
      "imagesgifspanel.addVisualMediaToEnhanceTheBundleExperienceForShoppers",
    );
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
          bundleBannerDesktopUrl: "",
          bundleBannerMobileUrl: "",
          setActiveAssetTabIndex: jest.fn(),
          setBundleBannerDesktopUrl: jest.fn(),
          setBundleBannerMobileUrl: jest.fn(),
          setFloatingBadgeEnabled: jest.fn(),
          setFloatingBadgeText: jest.fn(),
          steps: [],
          updateStepField: jest.fn(),
        } as any),
      );
    });

    expect(container.querySelector("button")).toBeNull();
  });

  function click(selector: string) {
    const element = container.querySelector<HTMLElement>(selector);
    expect(element).not.toBeNull();
    flushSync(() => {
      element?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });
  }
});
