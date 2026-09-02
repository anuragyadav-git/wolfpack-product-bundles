export type OfferCountryEligibilityPolicy = {
  countryTargetingEnabled?: boolean | null;
  countryTargetingMode?: 'include' | 'exclude' | string | null;
  countryCodes?: readonly string[] | null;
};

export type OfferCountryTargetingRule = {
  enabled: boolean;
  mode: 'include' | 'exclude';
  countryCodes: string[];
};

function normalizeCountryCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export function buildOfferCountryTargetingRule(
  policy: OfferCountryEligibilityPolicy | null | undefined,
): OfferCountryTargetingRule {
  return {
    enabled: policy?.countryTargetingEnabled === true,
    mode: policy?.countryTargetingMode === 'exclude' ? 'exclude' : 'include',
    countryCodes: [...new Set((policy?.countryCodes ?? []).flatMap((value) => {
      const normalized = normalizeCountryCode(value);
      return normalized ? [normalized] : [];
    }))].sort(),
  };
}

export function encodeOfferCountryTargetingRule(
  rule: OfferCountryTargetingRule,
): string {
  if (!rule.enabled) return '';
  const normalized = buildOfferCountryTargetingRule({
    countryTargetingEnabled: true,
    countryTargetingMode: rule.mode,
    countryCodes: rule.countryCodes,
  });
  return `${normalized.mode}:${normalized.countryCodes.join(',')}`;
}

export function resolveOfferCountryEligibility(
  policy: OfferCountryEligibilityPolicy | null | undefined,
  countryCode: unknown,
): boolean {
  if (policy?.countryTargetingEnabled !== true) return true;

  const currentCountryCode = normalizeCountryCode(countryCode);
  const configuredCountryCodes = new Set(
    (policy.countryCodes ?? []).flatMap((value) => {
      const normalized = normalizeCountryCode(value);
      return normalized ? [normalized] : [];
    }),
  );
  const matches = currentCountryCode !== null
    && configuredCountryCodes.has(currentCountryCode);
  return policy.countryTargetingMode === 'exclude' ? !matches : matches;
}
