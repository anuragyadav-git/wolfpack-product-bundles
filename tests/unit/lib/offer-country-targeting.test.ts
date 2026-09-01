import {
  buildOfferCountryTargetingAdminState,
  resolveOfferCountryTargetingSave,
} from '../../../app/lib/offer-country-targeting';

describe('offer country targeting', () => {
  it('uses inert defaults when no policy exists', () => {
    expect(buildOfferCountryTargetingAdminState(null)).toEqual({
      enabled: false,
      mode: 'include',
      countryCodes: [],
    });
  });

  it('preserves a disabled configured rule', () => {
    expect(buildOfferCountryTargetingAdminState({
      countryTargetingEnabled: false,
      countryTargetingMode: 'exclude',
      countryCodes: ['US', 'CA'],
    })).toEqual({
      enabled: false,
      mode: 'exclude',
      countryCodes: ['CA', 'US'],
    });
  });

  it('normalizes unique ISO country codes', () => {
    expect(resolveOfferCountryTargetingSave({
      enabled: 'true',
      mode: 'include',
      countryCodes: [' ca ', 'US', 'ca'],
    }, null)).toEqual({
      changed: true,
      data: {
        countryTargetingEnabled: true,
        countryTargetingMode: 'include',
        countryCodes: ['CA', 'US'],
      },
    });
  });

  it('does not overwrite country targeting when all fields are omitted', () => {
    expect(resolveOfferCountryTargetingSave({
      enabled: null,
      mode: null,
      countryCodes: [],
    }, {
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['GB'],
    })).toEqual({
      changed: false,
      data: {
        countryTargetingEnabled: true,
        countryTargetingMode: 'exclude',
        countryCodes: ['GB'],
      },
    });
  });

  it.each([
    [{ enabled: 'true', mode: 'include', countryCodes: [] }, 'offerDelivery.countryCodes'],
    [{ enabled: 'true', mode: 'include', countryCodes: ['USA'] }, 'offerDelivery.countryCodes'],
    [{ enabled: 'true', mode: 'unsupported', countryCodes: ['US'] }, 'offerDelivery.countryMode'],
  ])('rejects invalid enabled targeting', (raw, path) => {
    expect(resolveOfferCountryTargetingSave(raw, null)).toEqual({
      issue: expect.objectContaining({ path }),
    });
  });
});
