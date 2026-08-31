import {
  resolveSpecificLinkOfferStorefrontEligibility,
} from '../../../app/assets/widgets/shared/specific-link-offer-eligibility';

describe('specific-link offer storefront eligibility', () => {
  it('uses the Shopify-hosted snapshot without a request when link delivery is disabled', async () => {
    const fetchImpl = jest.fn();
    await expect(resolveSpecificLinkOfferStorefrontEligibility({
      bundle: { id: 'bundle-1', offerDelivery: { specificLinkRequired: false } },
      locationSearch: '',
      fetchImpl,
    })).resolves.toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('forwards one opaque URL token to the signed app-proxy eligibility endpoint', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ eligible: true }),
    });
    await expect(resolveSpecificLinkOfferStorefrontEligibility({
      bundle: { id: 'bundle-1', offerDelivery: { specificLinkRequired: true } },
      locationSearch: '?wpb_offer=opaque-token&ignored=value',
      fetchImpl,
    })).resolves.toBe(true);

    expect(fetchImpl).toHaveBeenCalledWith(
      '/apps/product-bundles/api/offer-eligibility.json?bundleId=bundle-1&wpb_offer=opaque-token',
      { credentials: 'same-origin', cache: 'no-store' },
    );
  });

  it.each([
    ['', jest.fn()],
    ['?wpb_offer=invalid', jest.fn().mockResolvedValue({ ok: false })],
    ['?wpb_offer=invalid', jest.fn().mockRejectedValue(new Error('offline'))],
  ])('fails closed when a required decision is unavailable', async (locationSearch, fetchImpl) => {
    await expect(resolveSpecificLinkOfferStorefrontEligibility({
      bundle: { id: 'bundle-1', offerDelivery: { specificLinkRequired: true } },
      locationSearch,
      fetchImpl,
    })).resolves.toBe(false);
  });
});
