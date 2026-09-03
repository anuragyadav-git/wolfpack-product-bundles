import {
  buildOfferCountryTargetingRule,
  encodeOfferCountryTargetingRule,
  resolveOfferCountryEligibility,
} from '../../../app/lib/offer-country-eligibility';

describe('offer country eligibility', () => {
  it('builds a canonical inert or targeted runtime rule', () => {
    expect(buildOfferCountryTargetingRule(null)).toEqual({
      enabled: false,
      mode: 'include',
      countryCodes: [],
    });
    expect(buildOfferCountryTargetingRule({
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['us', 'CA', 'ca', 'invalid'],
    })).toEqual({
      enabled: true,
      mode: 'exclude',
      countryCodes: ['CA', 'US'],
    });
  });
  it('keeps disabled targeting inert', () => {
    expect(resolveOfferCountryEligibility({
      countryTargetingEnabled: false,
      countryTargetingMode: 'include',
      countryCodes: ['CA'],
    }, null)).toBe(true);
  });

  it('encodes the signed Function rule without a nested JSON contract', () => {
    expect(encodeOfferCountryTargetingRule({
      enabled: false,
      mode: 'include',
      countryCodes: ['CA'],
    })).toBe('');
    expect(encodeOfferCountryTargetingRule({
      enabled: true,
      mode: 'include',
      countryCodes: ['us', 'CA', 'ca'],
    })).toBe('include:CA,US');
    expect(encodeOfferCountryTargetingRule({
      enabled: true,
      mode: 'exclude',
      countryCodes: ['us'],
    })).toBe('exclude:US');
  });

  it.each([
    ['include', 'CA', true],
    ['include', 'US', false],
    ['exclude', 'CA', false],
    ['exclude', 'US', true],
  ] as const)('applies a %s rule to Shopify country %s', (mode, countryCode, eligible) => {
    expect(resolveOfferCountryEligibility({
      countryTargetingEnabled: true,
      countryTargetingMode: mode,
      countryCodes: ['CA'],
    }, countryCode)).toBe(eligible);
  });

  it('fails closed for an unknown country in include mode and remains eligible in exclude mode', () => {
    expect(resolveOfferCountryEligibility({
      countryTargetingEnabled: true,
      countryTargetingMode: 'include',
      countryCodes: ['CA'],
    }, null)).toBe(false);
    expect(resolveOfferCountryEligibility({
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['CA'],
    }, null)).toBe(true);
  });
});
