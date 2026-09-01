import { JSDOM } from "jsdom";
import {
  ProductPageStickyAddToCartMethods,
  resolveStickyAddToCartIntent,
  shouldMountStickyAddToCart,
} from "../../../app/assets/widgets/product-page/methods/sticky-add-to-cart-methods";

describe("PPB sticky add-to-cart runtime", () => {
  const originalDocument = global.document;
  const originalWindow = global.window;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    global.document = dom.window.document;
    global.window = dom.window as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    global.document = originalDocument;
    global.window = originalWindow;
  });

  it.each([
    [{ enabled: false, showDesktop: true, showMobile: true }, false, false],
    [{ enabled: true, showDesktop: true, showMobile: false }, false, true],
    [{ enabled: true, showDesktop: false, showMobile: true }, true, true],
    [{ enabled: true, showDesktop: false, showMobile: true }, false, false],
  ])("applies the persisted device gate", (config, isMobile, expected) => {
    expect(shouldMountStickyAddToCart(config, isMobile)).toBe(expected);
  });

  it.each([
    ["add_selected_offer", false, "delegate"],
    ["add_selected_offer", true, "scroll"],
    ["scroll_to_offers", false, "scroll"],
  ])("resolves %s with primary disabled=%s", (action, primaryDisabled, expected) => {
    expect(resolveStickyAddToCartIntent(action, primaryDisabled)).toBe(expected);
  });

  it("hides while the primary CTA is visible and delegates once when it leaves the viewport", () => {
    let intersectionCallback: IntersectionObserverCallback = () => {};
    class FakeIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
      root = null;
      rootMargin = "0px";
      thresholds = [0];
    }
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: FakeIntersectionObserver,
    });

    const primary = document.createElement("button");
    primary.textContent = "Add Bundle to Cart";
    const click = jest.spyOn(primary, "click");
    document.body.appendChild(primary);
    const context: any = {
      selectedBundle: {
        stickyAddToCart: {
          enabled: true,
          showDesktop: true,
          showMobile: true,
          action: "add_selected_offer",
        },
      },
      elements: { addToCartButton: primary },
      validateStep: jest.fn(() => true),
    };

    ProductPageStickyAddToCartMethods.setupStickyAddToCart.call(context);
    const floating = document.querySelector<HTMLElement>("[data-wpb-sticky-add-to-cart]")!;
    const floatingButton = floating.querySelector("button")!;

    intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(floating.hidden).toBe(true);
    intersectionCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(floating.hidden).toBe(false);

    floatingButton.click();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("does not fabricate storefront copy when the canonical CTA has no label", () => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: undefined,
    });
    const primary = document.createElement("button");
    document.body.appendChild(primary);
    const context: any = {
      selectedBundle: {
        stickyAddToCart: {
          enabled: true,
          showDesktop: true,
          showMobile: true,
          action: "scroll_to_offers",
        },
      },
      elements: { addToCartButton: primary },
    };

    ProductPageStickyAddToCartMethods.setupStickyAddToCart.call(context);
    const floatingButton = document.querySelector<HTMLButtonElement>(
      "[data-wpb-sticky-add-to-cart] button",
    )!;

    expect(floatingButton.textContent).toBe("");
    expect(floatingButton.hasAttribute("aria-label")).toBe(false);
  });

  it("scrolls to and focuses the first incomplete control instead of bypassing a disabled CTA", () => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: undefined,
    });
    const primary = document.createElement("button");
    primary.disabled = true;
    primary.textContent = "Complete All Steps to Continue";
    const incomplete = document.createElement("button");
    incomplete.dataset.stepIndex = "0";
    incomplete.scrollIntoView = jest.fn();
    incomplete.focus = jest.fn();
    const stepsContainer = document.createElement("div");
    stepsContainer.appendChild(incomplete);
    document.body.append(primary, stepsContainer);
    const context: any = {
      selectedBundle: {
        stickyAddToCart: {
          enabled: true,
          showDesktop: true,
          showMobile: true,
          action: "add_selected_offer",
        },
        steps: [{ isDefault: false, isFreeGift: false }],
      },
      elements: { addToCartButton: primary, stepsContainer },
      validateStep: jest.fn(() => false),
    };

    ProductPageStickyAddToCartMethods.setupStickyAddToCart.call(context);
    document.querySelector<HTMLButtonElement>("[data-wpb-sticky-add-to-cart] button")!.click();

    expect(incomplete.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(incomplete.focus).toHaveBeenCalledTimes(1);
  });
});
