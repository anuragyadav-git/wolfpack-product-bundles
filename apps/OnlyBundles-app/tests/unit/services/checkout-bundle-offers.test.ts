import {
  buildCheckoutOfferRuntime,
  calculateCheckoutOfferSelectionAmount,
  resolveActiveCheckoutOffer,
} from "../../../app/services/checkout-bundle-offers.server";

const variant = (id: string, title = `Variant ${id}`) => ({
  id: `gid://shopify/ProductVariant/${id}`,
  variantGraphqlId: `gid://shopify/ProductVariant/${id}`,
  title,
});

describe("checkout bundle offer runtime contract", () => {
  it("builds FPB offers with authoritative tier quantity and discount fields", () => {
    const result = buildCheckoutOfferRuntime({
      status: "ACTIVE",
      bundleType: "full_page",
      personalizationData: {
        addonProducts: {
          isEnabled: true,
          title: "Choose an extra",
          tiers: [{
            tierId: "tier-1",
            title: "Gift tier",
            maxQuantity: 3,
            eligibilityCondition: { type: "QUANTITY", value: 2 },
            discount: { type: "PERCENTAGE", value: 100 },
            selectedAddonProducts: [{
              title: "Gift",
              variants: [variant("201", "Red"), variant("202", "Blue")],
            }],
          }],
        },
      },
      steps: [],
    });

    expect(result.offers).toEqual([expect.objectContaining({
      key: "fpb:tier-1",
      kind: "gift",
      title: "Gift tier",
      maxQuantity: 3,
      eligibility: { type: "QUANTITY", value: 2 },
      discount: { type: "PERCENTAGE", value: 100 },
      variants: [
        expect.objectContaining({ id: "gid://shopify/ProductVariant/201" }),
        expect.objectContaining({ id: "gid://shopify/ProductVariant/202" }),
      ],
    })]);
  });

  it("builds PPB offers from persisted add-on tiers and step variants", () => {
    const result = buildCheckoutOfferRuntime({
      status: "ACTIVE",
      bundleType: "product_page",
      steps: [{
        id: "step-gift",
        name: "Choose a gift",
        isFreeGift: true,
        maxQuantity: 2,
        addonTiers: [{
          tierId: "tier-free",
          maxQuantity: 2,
          eligibilityCondition: { type: "QUANTITY", value: 3 },
          discount: { type: "PERCENTAGE", value: 100 },
        }],
        StepProduct: [{ title: "PPB Gift", variants: [variant("301")] }],
      }],
    });

    expect(result.offers[0]).toMatchObject({
      key: "ppb:step-gift:tier-free",
      kind: "gift",
      maxQuantity: 2,
      variants: [{ id: "gid://shopify/ProductVariant/301" }],
    });
  });

  it("keeps gifts single-quantity unless configuration explicitly permits more", () => {
    const baseStep = {
      id: "step-gift",
      isFreeGift: true,
      StepProduct: [{ title: "Gift", variants: [variant("302")] }],
    };
    const defaultGift = buildCheckoutOfferRuntime({
      status: "ACTIVE",
      bundleType: "product_page",
      steps: [baseStep],
    });
    const configuredGift = buildCheckoutOfferRuntime({
      status: "ACTIVE",
      bundleType: "product_page",
      steps: [{ ...baseStep, maxQuantity: 2 }],
    });

    expect(defaultGift.offers[0].maxQuantity).toBe(1);
    expect(configuredGift.offers[0].maxQuantity).toBe(2);
  });

  it("fails closed for inactive bundles and disabled FPB add-ons", () => {
    expect(buildCheckoutOfferRuntime({ status: "DRAFT", steps: [] }).offers).toEqual([]);
    expect(buildCheckoutOfferRuntime({
      status: "ACTIVE",
      personalizationData: { addonProducts: { isEnabled: false, tiers: [{}] } },
      steps: [],
    }).offers).toEqual([]);
  });

  it("selects the highest eligible tier from signed base component quantity", () => {
    const offers = buildCheckoutOfferRuntime({
      status: "ACTIVE",
      bundleType: "full_page",
      personalizationData: {
        addonProducts: {
          isEnabled: true,
          tiers: [
            { tierId: "one", eligibilityCondition: { type: "QUANTITY", value: 1 }, selectedAddonProducts: [{ variants: [variant("401")] }] },
            { tierId: "three", eligibilityCondition: { type: "QUANTITY", value: 3 }, selectedAddonProducts: [{ variants: [variant("402")] }] },
          ],
        },
      },
      steps: [],
    }).offers;

    expect(resolveActiveCheckoutOffer(offers, "fpb:three", {
      components: [{ variantId: "gid://shopify/ProductVariant/1", quantity: 3 }],
    })?.key).toBe("fpb:three");
    expect(resolveActiveCheckoutOffer(offers, "fpb:three", {
      components: [{ variantId: "gid://shopify/ProductVariant/1", quantity: 2 }],
    })).toBeNull();
  });

  it("derives amount-tier eligibility from current cached component prices", () => {
    expect(calculateCheckoutOfferSelectionAmount({
      steps: [{
        StepProduct: [{
          variants: [{ id: "gid://shopify/ProductVariant/501", price: "12.50" }],
        }],
        StepCategory: [],
      }],
    }, {
      components: [{ variantId: "gid://shopify/ProductVariant/501", quantity: 2 }],
    })).toBe(25);
  });
});
