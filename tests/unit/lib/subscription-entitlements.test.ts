import {
  EntitlementDeniedError,
  detectBundleRequirements,
  getPlanEntitlements,
  type BundleEntitlementCandidate,
} from "../../../app/lib/subscriptions/entitlements";

function candidate(
  overrides: Partial<BundleEntitlementCandidate> = {},
): BundleEntitlementCandidate {
  return {
    bundleType: "FULL_PAGE",
    status: "DRAFT",
    enabledStepCount: 1,
    designTemplate: "FBP_SIDE_FOOTER",
    designPresetId: "STANDARD",
    usesAdvancedDesign: false,
    ...overrides,
  };
}

describe("subscription entitlement domain", () => {
  it("defines the complete Free plan without limiting drafts", () => {
    expect(getPlanEntitlements("FREE", "NONE")).toMatchObject({
      planCode: "FREE",
      billingInterval: "NONE",
      limits: {
        publicBundles: 1,
        enabledSteps: 2,
      },
      capabilities: {
        premiumTemplates: false,
        advancedDesign: false,
        advancedAnalytics: false,
        prioritySupport: false,
        unlimitedDrafts: true,
      },
    });
  });

  it("gives monthly and annual Growth identical access", () => {
    const monthly = getPlanEntitlements("GROWTH", "MONTHLY");
    const annual = getPlanEntitlements("GROWTH", "ANNUAL");

    expect(monthly.capabilities).toEqual(annual.capabilities);
    expect(monthly.limits).toEqual(annual.limits);
    expect(monthly.planCode).toBe("GROWTH");
    expect(annual.planCode).toBe("GROWTH");
  });

  it.each(["FULL_PAGE", "PRODUCT_PAGE"] as const)(
    "requires Growth when %s has more than two enabled steps",
    (bundleType) => {
      expect(detectBundleRequirements(candidate({
        bundleType,
        enabledStepCount: 3,
      }))).toContain("bundle.steps.limit");
    },
  );

  it("ignores disabled steps because callers pass the enabled count", () => {
    expect(detectBundleRequirements(candidate({ enabledStepCount: 2 })))
      .not.toContain("bundle.steps.limit");
  });

  it.each([
    ["FULL_PAGE", "FBP_SIDE_FOOTER", "CLASSIC"],
    ["PRODUCT_PAGE", "PDP_INPAGE", "GRID"],
    ["PRODUCT_PAGE", "PDP_MODAL", "SIMPLIFIED"],
  ] as const)("requires Growth for premium template %s/%s/%s", (
    bundleType,
    designTemplate,
    designPresetId,
  ) => {
    expect(detectBundleRequirements(candidate({
      bundleType,
      designTemplate,
      designPresetId,
    }))).toContain("bundle.template.premium");
  });

  it.each([
    ["FULL_PAGE", "FBP_SIDE_FOOTER", "STANDARD"],
    ["PRODUCT_PAGE", "PDP_INPAGE", "LIST"],
  ] as const)("keeps the Free template %s/%s/%s", (
    bundleType,
    designTemplate,
    designPresetId,
  ) => {
    expect(detectBundleRequirements(candidate({
      bundleType,
      designTemplate,
      designPresetId,
    }))).not.toContain("bundle.template.premium");
  });

  it("requires Growth for advanced Design but not unrelated bundle features", () => {
    expect(detectBundleRequirements(candidate({
      usesAdvancedDesign: true,
      usesBundleSubscriptions: true,
      usesCustomCode: true,
    }))).toEqual(["design.advanced"]);
  });

  it("serializes typed entitlement failures without unsafe configuration", () => {
    const error = new EntitlementDeniedError({
      code: "LIMIT_REACHED",
      entitlement: "bundle.public.limit",
      currentUsage: 1,
      limit: 1,
      remediation: "EDIT_CONFIGURATION",
    });

    expect(error.status).toBe(409);
    expect(error.toJSON()).toEqual({
      code: "LIMIT_REACHED",
      entitlement: "bundle.public.limit",
      requiredPlan: "GROWTH",
      currentUsage: 1,
      limit: 1,
      remediation: "EDIT_CONFIGURATION",
    });
  });
});
