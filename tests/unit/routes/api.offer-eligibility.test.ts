/* eslint-disable import/first */
jest.mock('../../../app/lib/logger', () => ({
  AppLogger: { error: jest.fn(), warn: jest.fn() },
}));
jest.mock('../../../app/shopify.server', () => ({
  authenticate: { public: { appProxy: jest.fn() } },
}));
jest.mock('../../../app/db.server', () => ({
  __esModule: true,
  default: {
    bundle: { findFirst: jest.fn() },
    bundleAnalytics: { create: jest.fn() },
  },
}));

import { loader } from '../../../app/routes/api/api.offer-eligibility[.]json';
import { authenticate } from '../../../app/shopify.server';
import { createSpecificLinkOfferToken } from '../../../app/lib/specific-link-offer-token.server';

const getDb = () => require('../../../app/db.server').default;
const findBundle = () => getDb().bundle.findFirst as jest.MockedFunction<any>;
const createAnalytics = () => getDb().bundleAnalytics.create as jest.MockedFunction<any>;
const mockAppProxy = authenticate.public.appProxy as jest.MockedFunction<any>;

function request(bundleId = 'bundle-1', token?: string) {
  const url = new URL('https://test.myshopify.com/apps/product-bundles/api/offer-eligibility.json');
  url.searchParams.set('bundleId', bundleId);
  if (token) url.searchParams.set('wpb_offer', token);
  return new Request(url);
}

describe('api.offer-eligibility', () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = 'test-secret';
    mockAppProxy.mockResolvedValue({ session: { shop: 'test.myshopify.com' } });
    createAnalytics().mockResolvedValue({ id: 'event-1' });
  });

  afterAll(() => {
    process.env.SHOPIFY_API_SECRET = originalSecret;
  });

  it('returns a no-store matched decision for the signed proxy shop', async () => {
    const created = createSpecificLinkOfferToken({
      token: 'a'.repeat(43),
    });
    findBundle().mockResolvedValue({
      id: 'bundle-1',
      shopId: 'test.myshopify.com',
      offerPolicy: {
        id: 'policy-1',
        specificLinkRequired: true,
        ruleVersion: 2,
        conditions: [{
          type: 'specific_link',
          tokenHash: created.tokenHash,
          expiresAt: null,
          revokedAt: null,
        }],
      },
    });

    const response = await loader({
      request: request('bundle-1', created.token),
      params: {},
      context: {},
    } as any);
    const payload = await response.json();

    expect(findBundle()).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: 'bundle-1',
        shopId: 'test.myshopify.com',
        status: { in: ['active', 'unlisted'] },
      },
    }));
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(payload).toEqual({
      eligible: true,
      reasonCode: 'matched',
      offerPolicyId: 'policy-1',
      ruleVersion: 2,
    });
    expect(JSON.stringify(payload)).not.toContain(created.token);
    expect(createAnalytics()).toHaveBeenCalledWith({
      data: {
        bundleId: 'bundle-1',
        shopId: 'test.myshopify.com',
        event: 'offer_eligibility_decision',
        metadata: {
          eligibilitySource: 'specific_link',
          reasonCode: 'matched',
          ruleVersion: 2,
        },
      },
    });
  });

  it('fails closed for a missing token and rejects missing bundle context', async () => {
    findBundle().mockResolvedValue({
      id: 'bundle-1',
      shopId: 'test.myshopify.com',
      offerPolicy: {
        id: 'policy-1',
        specificLinkRequired: true,
        ruleVersion: 1,
        conditions: [],
      },
    });

    const missingToken = await loader({
      request: request(),
      params: {},
      context: {},
    } as any);
    expect((await missingToken.json()).eligible).toBe(false);

    const missingBundleId = await loader({
      request: new Request('https://test.myshopify.com/apps/product-bundles/api/offer-eligibility.json'),
      params: {},
      context: {},
    } as any);
    expect(missingBundleId.status).toBe(400);
  });

  it('enforces a scheduled storefront decision without a link token', async () => {
    findBundle().mockResolvedValue({
      id: 'bundle-1',
      shopId: 'test.myshopify.com',
      offerPolicy: {
        id: 'policy-1',
        specificLinkRequired: false,
        startsAt: new Date('2999-01-01T00:00:00.000Z'),
        endsAt: null,
        ruleVersion: 3,
        conditions: [],
      },
    });
    const response = await loader({ request: request(), params: {}, context: {} } as any);
    expect(await response.json()).toEqual({
      eligible: false,
      reasonCode: 'schedule_not_started',
      offerPolicyId: 'policy-1',
      ruleVersion: 3,
    });
    expect(createAnalytics()).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        metadata: expect.objectContaining({ eligibilitySource: 'schedule' }),
      }),
    }));
  });

  it('returns 404 for another shop or non-public bundle and 500 without caching on failure', async () => {
    findBundle().mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('db unavailable'));

    const missing = await loader({ request: request(), params: {}, context: {} } as any);
    expect(missing.status).toBe(404);

    const failed = await loader({ request: request(), params: {}, context: {} } as any);
    expect(failed.status).toBe(500);
    expect(failed.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
