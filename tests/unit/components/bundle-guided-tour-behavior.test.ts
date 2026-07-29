import {
  getBundleGuidedTourStorageKey,
  isBundleGuidedTourDismissKey,
} from "../../../app/components/bundle-configure/BundleGuidedTour";

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
});
