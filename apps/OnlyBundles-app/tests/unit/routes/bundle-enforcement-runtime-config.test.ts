import { buildFullPageBundleMetafieldConfig } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server";
import { buildSyncBundleConfiguration } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server";

const offerPolicy = {
  id: "policy-1", ruleVersion: 2, scheduleMode: "recurring",
  recurrenceFrequency: "weekly", recurrenceTimezone: "America/Toronto",
  recurrenceAnchorDate: new Date("2026-09-14T00:00:00Z"),
  recurrenceWindowStartMinute: 540, recurrenceWindowEndMinute: 660,
  recurrenceTermination: "never", countryTargetingEnabled: true,
  countryTargetingMode: "include", countryCodes: ["CA"], priority: 3,
};

it.each(["full_page", "product_page"])("passes the complete saved enforcement policy to the %s metafield writer", (bundleType) => {
  const bundle = {
    id: "bundle-1", shopId: "test.myshopify.com", name: "Bundle", status: "active",
    bundleType, steps: [], pricing: null, offerPolicy,
    bundleSubscriptionConfig: { enabled: true, selectedPlanIds: ["gid://shopify/SellingPlan/1"] },
  };
  const config = bundleType === "full_page"
    ? buildFullPageBundleMetafieldConfig(bundle)
    : buildSyncBundleConfiguration(bundle, "gid://shopify/Product/1");
  expect(config.offerPolicy).toEqual(offerPolicy);
  expect(config.shopId).toBe(bundle.shopId);
  expect(config.bundleSubscriptionConfig).toEqual(bundle.bundleSubscriptionConfig);
});

it('keeps FPB addon membership and step roles in the canonical policy input', () => {
  const addonProducts = { isEnabled: true, tiers: [{ tierId: 'tier', selectedAddonProducts: [{ id: 'gid://shopify/Product/1' }] }] };
  const config = buildFullPageBundleMetafieldConfig({ bundleType: 'full_page', id: 'bundle', steps: [{ id: 'gift', isFreeGift: true, addonDisplayFree: true, addonTiers: [{ id: 'tier' }] }], personalizationData: { addonProducts } });
  expect(config.personalizationData).toEqual({ addonProducts });
  expect(config.steps[0]).toMatchObject({ isFreeGift: true, addonDisplayFree: true, addonTiers: [{ id: 'tier' }] });
});
