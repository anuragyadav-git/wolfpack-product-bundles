import { BundleType } from "../constants/bundle";

export const DEFAULT_ONBOARDING_BUNDLE_TYPE = BundleType.PRODUCT_PAGE;

export function parseOnboardingBundleType(value: unknown): BundleType {
  return value === BundleType.FULL_PAGE || value === BundleType.PRODUCT_PAGE
    ? value
    : DEFAULT_ONBOARDING_BUNDLE_TYPE;
}

export function buildBundleCreatePath(value: unknown): string {
  return `/app/bundles/create?bundleType=${parseOnboardingBundleType(value)}`;
}
