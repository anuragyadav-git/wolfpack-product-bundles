import {
  FEATURE_COMPARISON,
  PRICING_FAQ,
  VALUE_PROPS,
} from "../../../app/constants/pricing-data";
import { PLANS } from "../../../app/constants/plans";

describe("subscription pricing content", () => {
  it("describes one Free and unlimited Growth public bundle", () => {
    expect(FEATURE_COMPARISON).toContainEqual(expect.objectContaining({
      featureMessageId: "billing.comparison.publicBundles",
      free: "1",
      growth: "billing.values.unlimited",
    }));
  });

  it("keeps merchandising features in both plans", () => {
    expect(FEATURE_COMPARISON).toContainEqual(expect.objectContaining({
      featureMessageId: "billing.comparison.merchandising",
      free: true,
      growth: true,
    }));
  });

  it("positions Growth around approved advanced capabilities", () => {
    expect(VALUE_PROPS.map((item) => item.titleMessageId)).toEqual([
      "billing.valueProps.scaleTitle",
      "billing.valueProps.designTitle",
      "billing.valueProps.analyticsTitle",
    ]);
  });

  it("routes downgrade messaging through the localized immediate-policy copy", () => {
    expect(PRICING_FAQ).toContainEqual({
      questionMessageId: "billing.faq.downgradeQuestion",
      answerMessageId: "billing.faq.downgradeAnswer",
    });
  });

  it("uses the approved browser-safe Growth prices", () => {
    expect(PLANS.growth.price).toBe(19.99);
    expect(PLANS.growth.annualPrice).toBe(199);
  });

  it("offers one Shopify-managed 14-day Growth trial", () => {
    expect(PLANS.growth.trialDays).toBe(14);
  });
});
