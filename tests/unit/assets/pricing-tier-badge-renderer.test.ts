export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require("jsdom");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createPricingTierBadgeElement,
  getPricingTierBadgeTemplateValues,
} = require("../../../app/assets/widgets/shared/components/pricing-tier-badge.js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  ProductPageFooterModalStateMethods,
} = require("../../../app/assets/widgets/product-page/methods/footer-modal-state-methods.js");

describe("pricing tier badge storefront renderer", () => {
  it("derives a percentage value without inventing savings copy", () => {
    expect(getPricingTierBadgeTemplateValues({ discountValue: 12.5 }, "percentage_off"))
      .toEqual({ savedPercentage: "12.5%" });
  });

  it("derives a localized fixed savings total through the runtime formatter", () => {
    expect(getPricingTierBadgeTemplateValues(
      { discountValue: 1250 },
      "fixed_amount_off",
      (value: number) => `$${(value / 100).toFixed(2)}`,
    )).toEqual({ savedTotal: "$12.50" });
  });

  it("renders meaningful text and exposes it as a description", () => {
    const document = new JSDOM("<!doctype html>").window.document;
    const badge = createPricingTierBadgeElement({
      enabled: true,
      text: "Save {{saved_percentage}}",
      shape: "pill",
      visibility: "selected",
    }, {
      savedPercentage: "20%",
    }, {
      document,
      id: "tier-badge-rule-1",
      selected: true,
    });

    expect(badge?.textContent).toBe("Save 20%");
    expect(badge?.id).toBe("tier-badge-rule-1");
    expect(badge?.hidden).toBe(false);
  });

  it("keeps selected-only badges hidden for inactive tiers", () => {
    const document = new JSDOM("<!doctype html>").window.document;
    const badge = createPricingTierBadgeElement({
      enabled: true,
      text: "Best value",
      shape: "pill",
      visibility: "selected",
    }, {}, { document, selected: false });

    expect(badge?.hidden).toBe(true);
  });

  it("moves the accessible description when a shopper selects another PPB tier", () => {
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const document = new JSDOM("<!doctype html>").window.document;
    (global as any).document = document;
    (global as any).getComputedStyle = () => ({ getPropertyValue: () => "" });

    try {
      const context = {
        elements: { qtyPillsEl: document.createElement("div") },
        selectedBundle: {
          messaging: {
            displayOptions: {
              bundleQuantityOptions: { enabled: true, defaultRuleIndex: 0 },
            },
          },
          pricing: {
            method: "percentage_off",
            rules: [
              {
                id: "rule-1",
                conditionType: "quantity",
                conditionValue: 2,
                discountValue: 10,
                tierBadge: {
                  enabled: true,
                  text: "Save {{saved_percentage}}",
                  shape: "pill",
                  visibility: "selected",
                },
              },
              {
                id: "rule-2",
                conditionType: "quantity",
                conditionValue: 4,
                discountValue: 20,
                tierBadge: {
                  enabled: true,
                  text: "Best value",
                  shape: "folded",
                  visibility: "selected",
                },
              },
            ],
          },
        },
      } as any;
      Object.assign(context, ProductPageFooterModalStateMethods);
      context.renderFooter = jest.fn();
      context.updateAddToCartButton = jest.fn();

      ProductPageFooterModalStateMethods.renderQuantityOptionPills.call(context);

      const buttons = Array.from(
        context.elements.qtyPillsEl.querySelectorAll("button"),
      ) as HTMLElement[];
      expect(buttons[0].getAttribute("aria-describedby")).toBe("wpb-tier-badge-rule-1");
      expect(buttons[1].getAttribute("aria-describedby")).toBeNull();

      (buttons[1] as HTMLButtonElement).click();

      expect(buttons[0].getAttribute("aria-describedby")).toBeNull();
      expect(buttons[1].getAttribute("aria-describedby")).toBe("wpb-tier-badge-rule-2");
      expect(context.renderFooter).toHaveBeenCalledTimes(1);
      expect(context.updateAddToCartButton).toHaveBeenCalledTimes(1);
    } finally {
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
    }
  });
});
