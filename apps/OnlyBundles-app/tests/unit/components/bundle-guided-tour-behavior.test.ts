import {
  getBundleGuidedTourStorageKey,
  isBundleGuidedTourDesktopViewport,
  isBundleGuidedTourDismissKey,
  pickVisibleTourTarget,
} from "../../../app/components/bundle-configure/BundleGuidedTour";
import {
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
});
