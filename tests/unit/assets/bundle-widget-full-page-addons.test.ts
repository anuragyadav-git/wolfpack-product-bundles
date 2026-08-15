import { PricingCalculator } from '../../../app/assets/widgets/shared/pricing-calculator';
import { fullPageStepFooterMethods } from '../../../app/assets/widgets/full-page/methods/step-footer-methods';

describe('Full Page widget direct Add-ons contract', () => {
  it('treats eligible chargeable add-ons as separate add-on cart lines', () => {
    const context = {
      getAddonTierEvaluation: () => ({ isEligible: true, tier: { tierId: 'tier-1' } }),
      getAddonLineDiscount: () => ({ type: 'PERCENTAGE', value: 100 }),
    };

    expect(fullPageStepFooterMethods.isSelectedAddonCartLine.call(context, {
      isFreeGift: true,
      addonDisplayFree: false,
    })).toBe(true);
    expect(fullPageStepFooterMethods.isSelectedAddonCartLine.call(context, {
      isFreeGift: false,
      addonDisplayFree: false,
    })).toBe(false);
  });

  it('keeps selected add-on discount savings out of parent cart display properties', () => {
    const originalWindow = (global as any).window;
    const paidStep = { id: 'paid-step' };
    const paidAddonStep = { id: 'addon-step', isFreeGift: true, addonDisplayFree: false };

    try {
      (global as any).window = {
        Shopify: { currency: { active: 'USD', format: ['$', '{{amount}}'].join('') } },
      };
      const sourceProperties = fullPageStepFooterMethods.buildCartLineSourceProperties.call(
        { selectedBundle: { pricing: { enabled: false, rules: [] } } },
        [
          { product: { title: 'Paid product', price: 10000 }, quantity: 1, step: paidStep },
          { product: { title: 'Paid add-on', price: 6000 }, quantity: 1, step: paidAddonStep },
        ],
      );

      expect(JSON.parse(sourceProperties._bundle_display_properties)).toEqual({
        box: '1',
        items: '1 x Paid product',
        retailPrice: '$100.00',
      });
    } finally {
      (global as any).window = originalWindow;
    }
  });

  it('counts chargeable add-ons in totals while skipping true free gifts', () => {
    const selectedProducts = [{ paidVariant: 1 }, { addonVariant: 1 }];
    const stepProductData = [
      [{ selectionId: 'paidVariant', price: 10000 }],
      [{ selectionId: 'addonVariant', price: 6000 }],
    ];

    expect(PricingCalculator.calculateBundleTotal(
      selectedProducts,
      stepProductData,
      [{ name: 'Step 1' }, { isFreeGift: true, addonDisplayFree: false }],
    )).toMatchObject({ totalPrice: 16000, totalQuantity: 2, unitPrices: [10000, 6000] });
    expect(PricingCalculator.calculateBundleTotal(
      selectedProducts,
      stepProductData,
      [{ name: 'Step 1' }, { isFreeGift: true, addonDisplayFree: true }],
    )).toMatchObject({ totalPrice: 10000, totalQuantity: 1, unitPrices: [10000] });
  });
});
