import { i18n } from '../i18n/config';

export type OfferCountryTargetingMode = 'include' | 'exclude';

export type OfferCountryTargetingAdminState = {
  enabled: boolean;
  mode: OfferCountryTargetingMode;
  countryCodes: string[];
};

type OfferCountryTargetingPolicyState = {
  countryTargetingEnabled: boolean;
  countryTargetingMode: OfferCountryTargetingMode;
  countryCodes: string[];
};

type RawOfferCountryTargeting = {
  enabled: FormDataEntryValue | null;
  mode: FormDataEntryValue | null;
  countryCodes: FormDataEntryValue[];
};

type OfferCountryTargetingData = {
  countryTargetingEnabled: boolean;
  countryTargetingMode: OfferCountryTargetingMode;
  countryCodes: string[];
};

type OfferCountryTargetingSaveResult =
  | { changed: boolean; data: OfferCountryTargetingData }
  | { issue: { path: string; message: string } };

const DEFAULT_STATE: OfferCountryTargetingAdminState = {
  enabled: false,
  mode: 'include',
  countryCodes: [],
};

function normalizeCountryCodes(values: readonly FormDataEntryValue[]): string[] {
  return Array.from(new Set(values.map((value) => String(value).trim().toUpperCase())))
    .filter(Boolean)
    .sort();
}

export function buildOfferCountryTargetingAdminState(
  policy: OfferCountryTargetingPolicyState | null,
): OfferCountryTargetingAdminState {
  if (!policy) return { ...DEFAULT_STATE, countryCodes: [] };
  return {
    enabled: policy.countryTargetingEnabled,
    mode: policy.countryTargetingMode,
    countryCodes: normalizeCountryCodes(policy.countryCodes),
  };
}
export function resolveOfferCountryTargetingSave(
  raw: RawOfferCountryTargeting,
  currentPolicy: OfferCountryTargetingPolicyState | null,
): OfferCountryTargetingSaveResult {
  const current = buildOfferCountryTargetingAdminState(currentPolicy);
  if (raw.enabled === null && raw.mode === null && raw.countryCodes.length === 0) {
    return {
      changed: false,
      data: {
        countryTargetingEnabled: current.enabled,
        countryTargetingMode: current.mode,
        countryCodes: current.countryCodes,
      },
    };
  }

  const mode = String(raw.mode ?? '');
  if (mode !== 'include' && mode !== 'exclude') {
    return {
      issue: {
        path: 'offerDelivery.countryMode',
        message: i18n.t('countryTargeting.validation.mode'),
      },
    };
  }

  const enabled = raw.enabled === 'true';
  const countryCodes = normalizeCountryCodes(raw.countryCodes);
  if (enabled && (
    countryCodes.length === 0
    || countryCodes.some((countryCode) => !/^[A-Z]{2}$/.test(countryCode))
  )) {
    return {
      issue: {
        path: 'offerDelivery.countryCodes',
        message: i18n.t('countryTargeting.validation.countries'),
      },
    };
  }

  const data: OfferCountryTargetingData = {
    countryTargetingEnabled: enabled,
    countryTargetingMode: mode,
    countryCodes,
  };
  return {
    changed: current.enabled !== enabled
      || current.mode !== mode
      || current.countryCodes.join(',') !== countryCodes.join(','),
    data,
  };
}
