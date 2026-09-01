import { buildStorefrontApiPath } from '../../../config/storefront-proxy-routes.js';
import { SPECIFIC_LINK_OFFER_QUERY_PARAM } from '../../../lib/specific-link-offer.js';

export async function resolveSpecificLinkOfferStorefrontEligibility({
  bundle,
  locationSearch,
  fetchImpl = fetch,
}: {
  bundle: any;
  locationSearch: string;
  fetchImpl?: typeof fetch;
}): Promise<boolean> {
  if (bundle?.offerDelivery?.decisionRequired !== true) return true;

  const bundleId = String(bundle?.id ?? bundle?.bundleId ?? '').trim();
  const token = new URLSearchParams(locationSearch).get(
    SPECIFIC_LINK_OFFER_QUERY_PARAM,
  );
  if (!bundleId || (bundle.offerDelivery.specificLinkRequired === true && !token)) {
    return false;
  }

  const params = new URLSearchParams({ bundleId });
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
