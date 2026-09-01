import { buildStorefrontApiPath } from '../../../config/storefront-proxy-routes.js';
import { SPECIFIC_LINK_OFFER_QUERY_PARAM } from '../../../lib/specific-link-offer.js';
import { resolveOfferCountryEligibility } from '../../../lib/offer-country-eligibility.js';

export async function resolveSpecificLinkOfferStorefrontEligibility({
  bundle,
  locationSearch,
  countryCode,
  fetchImpl = fetch,
}: {
  bundle: any;
  locationSearch: string;
  countryCode: string | null;
  fetchImpl?: typeof fetch;
}): Promise<boolean> {
  if (bundle?.offerDelivery?.decisionRequired !== true) return true;

  if (!resolveOfferCountryEligibility(bundle.offerDelivery, countryCode)) {
    return false;
  }
  if (bundle.offerDelivery.serverDecisionRequired !== true) return true;

  const bundleId = String(bundle?.id ?? bundle?.bundleId ?? '').trim();
  const token = new URLSearchParams(locationSearch).get(
    SPECIFIC_LINK_OFFER_QUERY_PARAM,
  );
  if (!bundleId || (bundle.offerDelivery.specificLinkRequired === true && !token)) {
    return false;
  }

  const params = new URLSearchParams({ bundleId });
  const normalizedCountryCode = String(countryCode ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(normalizedCountryCode)) {
    params.set('country', normalizedCountryCode);
  }
  if (token) params.set(SPECIFIC_LINK_OFFER_QUERY_PARAM, token);
  try {
    const response = await fetchImpl(
      `${buildStorefrontApiPath('offer-eligibility.json')}?${params.toString()}`,
      { credentials: 'same-origin', cache: 'no-store' },
    );
    if (!response.ok) return false;
    const decision = await response.json();
    return decision?.eligible === true;
  } catch {
    return false;
  }
}
