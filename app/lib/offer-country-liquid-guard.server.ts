import type { OfferCountryEligibilityPolicy } from './offer-country-eligibility';

function normalizeCountryCodes(values: readonly string[] | null | undefined) {
  return [...new Set((values ?? [])
    .map((value) => value.trim().toUpperCase())
    .filter((value) => /^[A-Z]{2}$/.test(value)))]
    .sort();
}

export function buildOfferCountryLiquidGuard(
  markup: string,
  policy: OfferCountryEligibilityPolicy | null | undefined,
): string {
  if (policy?.countryTargetingEnabled !== true) return markup;

  const configuredCountries = `,${normalizeCountryCodes(policy.countryCodes).join(',')},`;
  const open = policy.countryTargetingMode === 'exclude'
    ? '{% unless wpb_offer_countries contains wpb_country %}'
    : '{% if wpb_offer_countries contains wpb_country %}';
  const close = policy.countryTargetingMode === 'exclude'
    ? '{% endunless %}'
    : '{% endif %}';
  return [
    "{% assign wpb_country = localization.country.iso_code | upcase | prepend: ',' | append: ',' %}",
    `{% assign wpb_offer_countries = '${configuredCountries}' %}`,
    open,
    markup,
    close,
  ].join('');
}
