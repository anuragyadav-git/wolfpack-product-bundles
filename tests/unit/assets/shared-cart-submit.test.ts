import { readProductPageWidgetSources } from './widget-source-helpers';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  buildProductPageCartFormData,
  extractBundleDetailsSourceProperties,
} = require('../../../app/assets/widgets/shared/engine/cart-submit.js');

describe('shared cart-submit helpers', () => {
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

  it('is used by the product-page widget controller', () => {
    const source = readProductPageWidgetSources();

    expect(source).toContain("import { buildProductPageCartFormData } from '../../shared/engine/cart-submit.js';");
    expect(source).toContain('return buildProductPageCartFormData(cartItems, {');
  });
});
