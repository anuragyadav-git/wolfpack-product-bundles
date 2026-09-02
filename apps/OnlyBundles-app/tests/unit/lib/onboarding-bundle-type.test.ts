import { BundleType } from "../../../app/constants/bundle";
import {
  DEFAULT_ONBOARDING_BUNDLE_TYPE,
  parseOnboardingBundleType,
  buildBundleCreatePath,
} from "../../../app/lib/onboarding-bundle-type";

describe("onboarding bundle type handoff", () => {
  it("accepts both supported bundle types", () => {
    expect(parseOnboardingBundleType(BundleType.PRODUCT_PAGE)).toBe(BundleType.PRODUCT_PAGE);
    expect(parseOnboardingBundleType(BundleType.FULL_PAGE)).toBe(BundleType.FULL_PAGE);
  });

  it("falls back to product page for missing or invalid values", () => {
    expect(DEFAULT_ONBOARDING_BUNDLE_TYPE).toBe(BundleType.PRODUCT_PAGE);
    expect(parseOnboardingBundleType(null)).toBe(BundleType.PRODUCT_PAGE);
    expect(parseOnboardingBundleType("unsupported")).toBe(BundleType.PRODUCT_PAGE);
  });

  it("builds a validated create route handoff", () => {
    expect(buildBundleCreatePath(BundleType.FULL_PAGE)).toBe(
      "/app/bundles/create?bundleType=full_page",
    );
    expect(buildBundleCreatePath("unsupported")).toBe(
      "/app/bundles/create?bundleType=product_page",
    );
  });
});
