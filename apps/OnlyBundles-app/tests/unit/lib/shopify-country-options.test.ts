import {
  SHOPIFY_COUNTRY_CODES,
  buildShopifyCountryOptions,
} from '../../../app/lib/shopify-country-options';

describe('Shopify country options', () => {
  it('uses unique Shopify CountryCode values without the unknown sentinel', () => {
    expect(new Set(SHOPIFY_COUNTRY_CODES).size).toBe(SHOPIFY_COUNTRY_CODES.length);
    expect(SHOPIFY_COUNTRY_CODES).toEqual(expect.arrayContaining(['CA', 'GB', 'IN', 'US']));
    expect(SHOPIFY_COUNTRY_CODES).not.toContain('ZZ');
    expect(SHOPIFY_COUNTRY_CODES.every((code) => /^[A-Z]{2}$/.test(code))).toBe(true);
  });

  it('uses the platform region formatter and creates searchable labels', () => {
    const options = buildShopifyCountryOptions('en');
    const unitedStates = options.find((option) => option.code === 'US');

    expect(unitedStates?.label).toBe('United States');
    expect(unitedStates?.searchValue).toContain('united states');
    expect(unitedStates?.searchValue).toContain('us');
  });
});
