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
    dropZoneContent,
    label,
    onChange,
  }: {
    dropZoneContent?: React.ReactNode;
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
      dropZoneContent ?? "Choose media",
    ),
}));

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/ConfigureHelpPopover",
  () => ({
    ConfigureHelpPopover: ({tooltipKey}: {tooltipKey: string}) =>
      React.createElement(
        "button",
        {
          "aria-label": `${tooltipKey} help`,
          type: "button",
        },
        "Help",
      ),
  }),
);

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
    const updateStepField = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbImagesGifsPanel, {
          activeSection: "images_gifs",
          floatingBadgeEnabled: false,
          floatingBadgeText: "",
          markAsDirty,
          bundleBannerDesktopUrl: "",
          bundleBannerMobileUrl: "",
          setBundleBannerDesktopUrl,
          setBundleBannerMobileUrl,
          setFloatingBadgeEnabled: jest.fn(),
          setFloatingBadgeText: jest.fn(),
          steps: [{
            id: "step-1",
            name: "Step 1",
            imageUrl: "https://cdn.shopify.com/retired-tab-icon.png",
            bannerImageUrl: "https://cdn.shopify.com/retired-step-banner.png",
          }],
          updateStepField,
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
    expect(
      container.querySelectorAll('button[aria-label$=" upload"]'),
    ).toHaveLength(2);
    expect(container.querySelector('s-icon[type="desktop"]')).not.toBeNull();
    expect(container.querySelector('s-icon[type="mobile"]')).not.toBeNull();
    expect(String(container.textContent).includes("FORMAT")).toBe(false);
    expect(updateStepField).not.toHaveBeenCalled();
    expect(container.innerHTML).not.toContain("imagesgifspanel.mediaAssets");
    expect(container.innerHTML).not.toContain(
      "imagesgifspanel.addVisualMediaToEnhanceTheBundleExperienceForShoppers",
    );
  });

  it("renders no media controls outside the media section", () => {
    flushSync(() => {
      root.render(
        React.createElement(FpbImagesGifsPanel, {
          activeSection: "bundle_visibility",
          floatingBadgeEnabled: false,
          floatingBadgeText: "",
          markAsDirty: jest.fn(),
          bundleBannerDesktopUrl: "",
          bundleBannerMobileUrl: "",
          setBundleBannerDesktopUrl: jest.fn(),
          setBundleBannerMobileUrl: jest.fn(),
          setFloatingBadgeEnabled: jest.fn(),
          setFloatingBadgeText: jest.fn(),
        } as any),
      );
    });

    expect(container.querySelector("button")).toBeNull();
  });

  it("exposes floating promo badge help without changing route draft state", () => {
    const markAsDirty = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbImagesGifsPanel, {
          activeSection: "images_gifs",
          floatingBadgeEnabled: false,
          floatingBadgeText: "",
          markAsDirty,
          bundleBannerDesktopUrl: "",
          bundleBannerMobileUrl: "",
          setBundleBannerDesktopUrl: jest.fn(),
          setBundleBannerMobileUrl: jest.fn(),
          setFloatingBadgeEnabled: jest.fn(),
          setFloatingBadgeText: jest.fn(),
        }),
      );
    });

    click('button[aria-label="floatingPromoBadge help"]');

    expect(markAsDirty).not.toHaveBeenCalled();
  });

  function click(selector: string) {
    const element = container.querySelector<HTMLElement>(selector);
    expect(element).not.toBeNull();
    flushSync(() => {
      element?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });
  }
});
