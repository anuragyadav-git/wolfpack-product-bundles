import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {JSDOM} from "jsdom";

import {FpbBundleCartSettings} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsBundleCart";
import {FpbDefaultProductsSettings} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsDefaultProducts";
import {FpbQuantitySettings} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsQuantity";
import {FpbBundleTemplateSettings} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsTemplate";
import {FpbTimelineSettings} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsTimeline";

const resourcePicker = jest.fn();

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({resourcePicker}),
}));

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
}));

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/SmallComponents",
  () => ({QuestionHelpTooltip: () => null}),
);

jest.mock("../../../app/components/shared/FilePicker", () => ({
  FilePicker: ({
    onChange,
    triggerIcon,
  }: {
    onChange: (url: string | null) => void;
    triggerIcon?: string;
  }) =>
    React.createElement(
      "button",
      {
        "aria-label": triggerIcon === "mobile" ? "mobile picker" : "desktop picker",
        onClick: () =>
          onChange(
            triggerIcon === "mobile"
              ? "https://cdn.shopify.com/mobile.jpg"
              : "https://cdn.shopify.com/desktop.jpg",
          ),
        type: "button",
      },
      "Choose image",
    ),
}));

describe("FPB bundle settings feature boundaries", () => {
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
    jest.clearAllMocks();
  });

  function click(selector: string) {
    const element = container.querySelector<HTMLElement>(selector);
    expect(element).not.toBeNull();
    flushSync(() => {
      element?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });
  }

  function clickByText(text: string) {
    const element = Array.from(
      container.querySelectorAll<HTMLElement>("button, s-button"),
    ).find((candidate) => candidate.textContent?.includes(text));
    expect(element).toBeDefined();
    flushSync(() => {
      element?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });
  }

  it("opens bundle-cart translations with the current copy", () => {
    const openMultiLanguageModal = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbBundleCartSettings, {
          fullPageBundleStyles: {},
          markAsDirty: jest.fn(),
          openMultiLanguageModal,
          setTextOverrides: jest.fn(),
          shopLocales: [{locale: "fr", name: "French", primary: false}],
          textOverrides: {
            reviewBundle: "Check your choices",
            yourBundle: "My box",
          },
        } as any),
      );
    });

    click("s-button");

    expect(openMultiLanguageModal).toHaveBeenCalledWith("Bundle Cart", [
      {key: "yourBundle", label: "Bundle Cart Title", fallback: "My box"},
      {
        key: "reviewBundle",
        label: "Bundle Cart Subtitle",
        fallback: "Check your choices",
      },
    ]);
  });

  it("delegates discount-default editing to route navigation", () => {
    const handleSectionChange = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbBundleTemplateSettings, {
          handleSectionChange,
          markAsDirty: jest.fn(),
          setTextOverrides: jest.fn(),
          textOverrides: {},
        } as any),
      );
    });

    click("s-button");
    expect(handleSectionChange).toHaveBeenCalledWith("discount_pricing");
  });

  it("delegates desktop and mobile banner selections and marks the draft dirty", () => {
    const markAsDirty = jest.fn();
    const setBundleBannerDesktopUrl = jest.fn();
    const setBundleBannerMobileUrl = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbTimelineSettings, {
          bundleBannerDesktopUrl: "",
          bundleBannerMobileUrl: "",
          markAsDirty,
          setBundleBannerDesktopUrl,
          setBundleBannerMobileUrl,
        } as any),
      );
    });

    click('button[aria-label="desktop picker"]');
    click('button[aria-label="mobile picker"]');

    expect(setBundleBannerDesktopUrl).toHaveBeenCalledWith(
      "https://cdn.shopify.com/desktop.jpg",
    );
    expect(setBundleBannerMobileUrl).toHaveBeenCalledWith(
      "https://cdn.shopify.com/mobile.jpg",
    );
    expect(markAsDirty).toHaveBeenCalledTimes(2);
  });

  it("uses Shopify's resource picker for default products", async () => {
    const clearValidationError = jest.fn();
    const markAsDirty = jest.fn();
    const setDefaultProductsData = jest.fn();
    resourcePicker.mockResolvedValue([
      {
        id: "gid://shopify/Product/10",
        title: "Product",
        variants: [{id: "gid://shopify/ProductVariant/20"}],
      },
    ]);

    flushSync(() => {
      root.render(
        React.createElement(FpbDefaultProductsSettings, {
          clearValidationError,
          defaultProductsData: {
            isDefaultProductsEnabled: true,
            products: [],
          },
          markAsDirty,
          setDefaultProductsData,
          validationErrors: {},
        } as any),
      );
    });

    clickByText("bundlesettingsdefaultproducts.browseProducts");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(resourcePicker).toHaveBeenCalledWith({
      action: "select",
      multiple: true,
      selectionIds: [],
      type: "product",
    });
    expect(setDefaultProductsData).toHaveBeenCalledTimes(1);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
    expect(clearValidationError).toHaveBeenCalledWith(
      "settings.defaultProducts",
    );
  });

  it("clears the slot icon through the owned reset action", () => {
    const markAsDirty = jest.fn();
    const setProductSlotIconUrl = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(FpbQuantitySettings, {
          activeTabIndex: 0,
          clearValidationError: jest.fn(),
          maxQtyPerProduct: "1",
          markAsDirty,
          productSlotIconUrl: "https://cdn.shopify.com/slot.svg",
          productSlotsEnabled: true,
          quantityValidationEnabled: false,
          setMaxQtyPerProduct: jest.fn(),
          setProductSlotIconUrl,
          setProductSlotsEnabled: jest.fn(),
          setQuantityValidationEnabled: jest.fn(),
          setShowSlotIconPicker: jest.fn(),
          showSlotIconPicker: false,
          stepConditions: {"step-1": [{type: "quantity"}]},
          steps: [{id: "step-1"}],
          validationErrors: {},
        } as any),
      );
    });

    clickByText("bundlesettingsquantity.reset");
    expect(setProductSlotIconUrl).toHaveBeenCalledWith("");
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });
});
