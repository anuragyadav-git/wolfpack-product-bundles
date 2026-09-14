import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { flushSync } from "react-dom";
import { JSDOM } from "jsdom";

import {
  BundleGuidedTour,
  getBundleGuidedTourStorageKey,
  isBundleGuidedTourDesktopViewport,
  isBundleGuidedTourDismissKey,
  pickVisibleTourTarget,
} from "../../../app/components/bundle-configure/BundleGuidedTour";
import {
  FPB_TOUR_STEPS,
  PPB_TOUR_STEPS,
  getGuidedTourTransition,
  type TourStep,
} from "../../../app/components/bundle-configure/tourSteps";

describe("BundleGuidedTour behavior", () => {
  it("keeps completion and dismissal persistence scoped to the shop", () => {
    expect(getBundleGuidedTourStorageKey("alpha.myshopify.com")).toBe(
      "wpb_first_bundle_tour_seen_alpha.myshopify.com",
    );
    expect(getBundleGuidedTourStorageKey("beta.myshopify.com")).not.toBe(
      getBundleGuidedTourStorageKey("alpha.myshopify.com"),
    );
  });

  it("dismisses from Escape without treating other navigation keys as dismissal", () => {
    expect(isBundleGuidedTourDismissKey("Escape")).toBe(true);
    expect(isBundleGuidedTourDismissKey("Enter")).toBe(false);
    expect(isBundleGuidedTourDismissKey("Tab")).toBe(false);
  });

  it("enables the guided tour only at desktop widths", () => {
    expect(isBundleGuidedTourDesktopViewport(767)).toBe(false);
    expect(isBundleGuidedTourDesktopViewport(768)).toBe(true);
    expect(isBundleGuidedTourDesktopViewport(1280)).toBe(true);
  });

  it("targets the visible readiness control when responsive copies exist", () => {
    const hidden = {
      getClientRects: () => ({length: 0}),
    } as HTMLElement;
    const visible = {
      getClientRects: () => ({length: 1}),
    } as HTMLElement;

    expect(pickVisibleTourTarget([hidden, visible])).toBe(visible);
    expect(pickVisibleTourTarget([hidden])).toBe(hidden);
  });

  it("changes section without opening an overlay that would cover the tour", () => {
    const readinessStep: TourStep = {
      title: "Check app embed",
      body: "Check the storefront readiness status.",
      targetSection: "fpb-readiness-score",
      sectionId: "step_setup",
    };

    expect(getGuidedTourTransition(readinessStep)).toEqual({
      sectionId: "step_setup",
      readinessOpen: false,
    });
  });

  it("navigates the final FPB and PPB steps to bundle settings", () => {
    expect(getGuidedTourTransition(FPB_TOUR_STEPS.at(-1)!)).toEqual({
      sectionId: "bundle_settings",
      readinessOpen: false,
    });
    expect(getGuidedTourTransition(PPB_TOUR_STEPS.at(-1)!)).toEqual({
      sectionId: "bundle_settings",
      readinessOpen: false,
    });
  });

  it("advances through the tour and completes exactly once", async () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      pretendToBeVisual: true,
      url: "https://app.example.test",
    });
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      localStorage: dom.window.localStorage,
      requestAnimationFrame: () => 1,
      cancelAnimationFrame: () => undefined,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    Object.defineProperty(dom.window, "innerWidth", {
      configurable: true,
      value: 1280,
    });
    dom.window.requestAnimationFrame = () => 1;
    dom.window.cancelAnimationFrame = () => undefined;

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const onComplete = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(BundleGuidedTour, {
          steps: [
            { title: "First", body: "First body", targetSection: "" },
            { title: "Second", body: "Second body", targetSection: "" },
          ],
          shop: "alpha.myshopify.com",
          onComplete,
        })
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    const findAction = (label: string) =>
      Array.from(container.querySelectorAll<HTMLElement>("button, s-button"))
        .find((element) => element.textContent?.trim() === label);

    const next = findAction("Next →");
    expect(next).toBeDefined();

    act(() => {
      next?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const complete = findAction("Got it");
    expect(complete).toBeDefined();

    act(() => {
      complete?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(
      localStorage.getItem(
        getBundleGuidedTourStorageKey("alpha.myshopify.com")
      )
    ).toBe("1");

    act(() => root.unmount());
    container.remove();
  });

  it("does not repeat a step transition when only the callback identity changes", async () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      pretendToBeVisual: true,
      url: "https://app.example.test",
    });
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      localStorage: dom.window.localStorage,
      requestAnimationFrame: () => 1,
      cancelAnimationFrame: () => undefined,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    Object.defineProperty(dom.window, "innerWidth", {
      configurable: true,
      value: 1280,
    });
    dom.window.requestAnimationFrame = () => 1;
    dom.window.cancelAnimationFrame = () => undefined;

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const firstOnStepChange = jest.fn();
    const replacementOnStepChange = jest.fn();
    const steps: TourStep[] = [
      { title: "First", body: "First body", targetSection: "" },
    ];

    flushSync(() => {
      root.render(
        React.createElement(BundleGuidedTour, {
          steps,
          shop: "alpha.myshopify.com",
          onStepChange: firstOnStepChange,
        })
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(firstOnStepChange).toHaveBeenCalledTimes(1);

    flushSync(() => {
      root.render(
        React.createElement(BundleGuidedTour, {
          steps,
          shop: "alpha.myshopify.com",
          onStepChange: replacementOnStepChange,
        })
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(replacementOnStepChange).not.toHaveBeenCalled();

    act(() => root.unmount());
    container.remove();
  });
});
