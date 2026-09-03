import { buildOfferCountryLiquidGuard } from '../../../app/lib/offer-country-liquid-guard.server';

describe('offer country Liquid guard', () => {
  const markup = '<div data-offer></div>';

  it('leaves markup unchanged when targeting is disabled', () => {
    expect(buildOfferCountryLiquidGuard(markup, null)).toBe(markup);
    expect(buildOfferCountryLiquidGuard(markup, {
      countryTargetingEnabled: false,
      countryTargetingMode: 'include',
      countryCodes: ['CA'],
    })).toBe(markup);
  });

  it('uses Shopify localization with canonical include codes', () => {
    const liquid = buildOfferCountryLiquidGuard(markup, {
      countryTargetingEnabled: true,
      countryTargetingMode: 'include',
      countryCodes: ['us', 'CA', 'ca'],
    });

    expect(liquid).toContain('localization.country.iso_code');
    expect(liquid).toContain("{% assign wpb_offer_countries = ',CA,US,' %}");
    expect(liquid).toContain('{% if wpb_offer_countries contains wpb_country %}');
    expect(liquid).toContain(markup);
  });

  it('uses an unless guard for excluded countries', () => {
    expect(buildOfferCountryLiquidGuard(markup, {
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['US'],
    })).toContain('{% unless wpb_offer_countries contains wpb_country %}');
  });
});
