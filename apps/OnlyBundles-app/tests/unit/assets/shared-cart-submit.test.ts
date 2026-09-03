import { readProductPageWidgetSources } from './widget-source-helpers';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  applySellingPlanToJsonCartItems,
  buildOfferAnalyticsCartProperties,
  buildProductPageCartFormData,
  extractBundleDetailsSourceProperties,
} = require('../../../app/assets/widgets/shared/engine/cart-submit.js');

describe('shared cart-submit helpers', () => {
  it('builds privacy-safe Shopify line properties for offer attribution', () => {
    expect(buildOfferAnalyticsCartProperties({
      sourceProperties: {
        _bundle_display_properties: JSON.stringify({ box: '2', items: '2 x Product A' }),
      },
      bundleId: ' bundle-1 ',
      bundleName: ' Gift Box ',
      offerDelivery: {
        offerPolicyId: ' policy-1 ',
        ruleVersion: 3,
        eligibilitySource: 'specific_link',
      },
      tierId: ' tier-2 ',
    })).toEqual({
      _bundle_display_properties: JSON.stringify({
        box: '2',
        items: '2 x Product A',
        bundleName: 'Gift Box',
        offerAnalytics: {
          bundleId: 'bundle-1',
          offerPolicyId: 'policy-1',
          offerRuleVersion: 3,
          offerTierId: 'tier-2',
          offerEligibilitySource: 'specific_link',
        },
      }),
    });

    expect(buildOfferAnalyticsCartProperties({
      sourceProperties: {
        _bundle_display_properties: JSON.stringify({ box: '1' }),
      },
      bundleId: 'bundle-1',
      offerDelivery: {
        offerPolicyId: 'x'.repeat(129),
        ruleVersion: -1,
        eligibilitySource: 'customer_email',
      },
    })).toEqual({
      _bundle_display_properties: JSON.stringify({
        box: '1',
        offerAnalytics: { bundleId: 'bundle-1' },
      }),
    });
  });

  it('builds EB-compatible product-page multipart cart form data', () => {
    const context = buildProductPageCartFormData([
      {
        id: 123,
        quantity: 2,
        properties: {
          _bundle_display_properties: '{"box":"1"}',
          _custom: 'value',
          _skip: null,
        },
      },
    ], {
      bundleName: 'Gift Box',
      offerId: 'offer-1',
      sessionKey: 'session-1',
      runtimeToken: 'signed-runtime-token',
    });

    expect(context.bundleDetailsKey).toBe('offer-1_session-1');
    expect(context.sourceProperties).toMatchObject({
      _bundle_display_properties: '{"box":"1"}',
      _custom: 'value',
    });
    expect(Array.from(context.formData.entries())).toEqual([
      ['items[0][id]', '123'],
      ['items[0][quantity]', '2'],
      ['items[0][properties][_bundle_display_properties]', '{"box":"1"}'],
      ['items[0][properties][_custom]', 'value'],
      ['items[0][properties][Box]', '1'],
      ['items[0][properties][_bundleName]', 'Gift Box'],
      ['items[0][properties][_wolfpackProductBundle:OfferId]', 'offer-1_session-1_1'],
      ['items[0][properties][_wolfpackProductBundle:prodQty]', '2'],
      ['items[0][properties][_wolfpack_bundle_runtime]', 'signed-runtime-token'],
    ]);
  });

  it('extracts bundle-details source properties from the first cart item with display metadata', () => {
    expect(extractBundleDetailsSourceProperties([
      { properties: { ignored: 'true' } },
      { properties: { _bundle_display_properties: '{"box":"1"}', keep: 'yes' } },
    ])).toEqual({
      _bundle_display_properties: '{"box":"1"}',
      keep: 'yes',
    });
  });

  it('adds one selling plan to every subscription component and omits public Box metadata', () => {
    const { formData } = buildProductPageCartFormData([
      { id: 101, quantity: 1, properties: {} },
      { id: 202, quantity: 2, properties: {} },
    ], {
      bundleName: 'Subscription bundle',
      offerId: 'offer',
      sessionKey: 'session',
      runtimeToken: 'signed-token',
      sellingPlanId: 'gid://shopify/SellingPlan/55',
    });

    expect(formData.get('items[0][selling_plan]')).toBe('55');
    expect(formData.get('items[1][selling_plan]')).toBe('55');
    expect(formData.has('items[0][properties][Box]')).toBe(false);
    expect(formData.get('items[0][properties][_wolfpack_bundle_runtime]')).toBe('signed-token');
  });

  it('adds one selling plan to every full-page JSON component and omits public Box metadata', () => {
    const original = [
      { id: '101', quantity: 1, properties: { Box: '1', _private: 'keep' } },
      { id: '202', quantity: 2, properties: { Box: '2' } },
    ];

    expect(applySellingPlanToJsonCartItems(
      original,
      'gid://shopify/SellingPlan/55',
    )).toEqual([
      { id: '101', quantity: 1, selling_plan: '55', properties: { _private: 'keep' } },
      { id: '202', quantity: 2, selling_plan: '55', properties: {} },
    ]);
    expect(original[0].properties.Box).toBe('1');
  });

  it('is used by the product-page widget controller', () => {
    const source = readProductPageWidgetSources();

    expect(source).toContain('buildProductPageCartFormData,');
    expect(source).toContain('return buildProductPageCartFormData(cartItems, {');
  });
});
