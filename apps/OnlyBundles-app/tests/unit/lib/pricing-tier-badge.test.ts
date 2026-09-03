import {
  parsePricingTierBadge,
  renderPricingTierBadgeText,
  validatePricingTierBadgeForMethod,
} from "../../../app/lib/pricing-tier-badge";

describe("parsePricingTierBadge", () => {
  it("normalizes a valid configured badge", () => {
    expect(parsePricingTierBadge({
      enabled: true,
      text: "Best value",
      shape: "banner_rounded",
      visibility: "always",
      foregroundColor: "#FFFFFF",
      backgroundColor: "#123abc",
    })).toEqual({
      enabled: true,
      text: "Best value",
      shape: "banner_rounded",
      visibility: "always",
      foregroundColor: "#ffffff",
      backgroundColor: "#123abc",
    });
  });

  it.each([
    [{ enabled: true, text: "Save {{mystery}}", shape: "pill", visibility: "always" }, "unsupported variable"],
    [{ enabled: true, text: "Best", shape: "ribbon", visibility: "always" }, "invalid shape"],
    [{ enabled: true, text: "Best", shape: "pill", visibility: "hover" }, "invalid visibility"],
    [{ enabled: true, text: "Best", shape: "pill", visibility: "always", backgroundColor: "red;display:none" }, "invalid background color"],
    [{ enabled: true, text: "Save {{saved_percentage}} {{", shape: "pill", visibility: "always" }, "malformed variable"],
    [{ enabled: true, text: "", shape: "pill", visibility: "always" }, "text is required"],
  ])("rejects %s", (input, expectedMessage) => {
    expect(() => parsePricingTierBadge(input)).toThrow(expectedMessage);
  });

  it("returns undefined when the rule has no badge", () => {
    expect(parsePricingTierBadge(undefined)).toBeUndefined();
  });
});

describe("renderPricingTierBadgeText", () => {
  const percentageBadge = {
    enabled: true,
    text: "Save {{saved_percentage}}",
    shape: "pill" as const,
    visibility: "always" as const,
  };

  it("interpolates every supported variable occurrence", () => {
    expect(renderPricingTierBadgeText(
      { ...percentageBadge, text: "Save {{saved_percentage}} — {{saved_percentage}} off" },
      { savedPercentage: "20%" },
    )).toBe("Save 20% — 20% off");
  });

  it("suppresses a badge when a required runtime value is unavailable", () => {
    expect(renderPricingTierBadgeText(percentageBadge, {})).toBeNull();
  });

  it("suppresses disabled badges", () => {
    expect(renderPricingTierBadgeText({ ...percentageBadge, enabled: false }, {
      savedPercentage: "20%",
    })).toBeNull();
  });
});

describe("validatePricingTierBadgeForMethod", () => {
  it("accepts percentage savings only for a percentage discount", () => {
    const badge = parsePricingTierBadge({
      enabled: true,
      text: "Save {{saved_percentage}}",
      shape: "pill",
      visibility: "always",
    })!;

    expect(validatePricingTierBadgeForMethod(badge, "percentage_off")).toBeNull();
    expect(validatePricingTierBadgeForMethod(badge, "fixed_amount_off"))
      .toContain("percentage discounts");
  });

  it("accepts total savings only for a fixed amount discount", () => {
    const badge = parsePricingTierBadge({
      enabled: true,
      text: "Save {{saved_total}}",
      shape: "pill",
      visibility: "always",
    })!;

    expect(validatePricingTierBadgeForMethod(badge, "fixed_amount_off")).toBeNull();
    expect(validatePricingTierBadgeForMethod(badge, "percentage_off"))
      .toContain("fixed amount discounts");
  });
});
