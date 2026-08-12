/**
 * Unit Tests: api.bundle.$bundleId.json + wpb.$bundleId — DRAFT access control
 *
 * Triage: docs/superpowers/specs/2026-06-13-june-2026-feedback-triage.md item #8
 * Intent: DRAFT bundles must be hidden from public storefront surfaces. The
 *   widget API loads by verified shop and bundle ID, then permits DRAFT only
 *   with a bound preview token. The FPB document route uses the same contract.
 */
/* eslint-disable import/first */

jest.mock('../../../app/lib/logger', () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    startTimer: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../../../app/shopify.server', () => ({
  authenticate: {
    public: {
      appProxy: jest.fn(),
    },
  },
}));

jest.mock('../../../app/db.server', () => ({
  __esModule: true,
  default: {
    bundle: {
      findFirst: jest.fn(),
    },
    designSettings: {
      findUnique: jest.fn(),
    },
  },
}));

import { createHmac } from 'node:crypto';
import { loader as apiBundleLoader } from '../../../app/routes/api/api.bundle.$bundleId[.]json';
import { loader as wpbProxyLoader } from '../../../app/routes/root/wpb.$bundleId';
import { authenticate } from '../../../app/shopify.server';
import { BundleStatus } from '../../../app/constants/bundle';
import { createBundlePreviewToken } from '../../../app/lib/bundle-preview-token.server';

const getDb = () => require('../../../app/db.server').default;
const mockFindFirst = () => getDb().bundle.findFirst as jest.MockedFunction<any>;
const mockFindDesignSettings = () => getDb().designSettings.findUnique as jest.MockedFunction<any>;
const mockAppProxy = authenticate.public.appProxy as jest.MockedFunction<any>;

function makeApiRequest(bundleId: string, previewToken?: string) {
  const params = new URLSearchParams({
    shop: 'test.myshopify.com',
    timestamp: '1234567890',
  });
  if (previewToken) params.set('wpb_preview', previewToken);
  const message = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('');
  params.set('signature', createHmac('sha256', 'test_api_secret').update(message).digest('hex'));
  return new Request(`https://test.myshopify.com/apps/product-bundles/api/bundle/${bundleId}.json?${params.toString()}`);
}

function makeProxyRequest(bundleId: string) {
  const params = new URLSearchParams({
    shop: 'test-shop.myshopify.com',
    path_prefix: '/apps/product-bundles',
    timestamp: '1770000000',
  });
  const message = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('');
  params.set('signature', createHmac('sha256', 'test_api_secret').update(message).digest('hex'));
  return new Request(`https://test-shop.myshopify.com/apps/product-bundles/wpb/${bundleId}?${params.toString()}`);
}

describe('api.bundle.$bundleId.json — status filtering', () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = 'test_api_secret';
    mockAppProxy.mockResolvedValue({
      session: { shop: 'test.myshopify.com', accessToken: 'token' },
    });
  });

  afterAll(() => {
    process.env.SHOPIFY_API_SECRET = originalSecret;
  });

  const draftBundle = {
    id: 'bundle-1',
    name: 'Draft bundle',
    shopId: 'test.myshopify.com',
    bundleType: 'product_page',
    status: BundleStatus.DRAFT,
    steps: [],
    pricing: null,
    updatedAt: new Date('2026-08-10T00:00:00.000Z'),
  };

  it('loads by signed shop and bundle identity, then rejects an unsigned DRAFT', async () => {
    mockFindFirst().mockResolvedValue(draftBundle);

    const response = await apiBundleLoader({
      request: makeApiRequest('bundle-1'),
      params: { bundleId: 'bundle-1' },
      context: {},
    } as any);

    expect(mockFindFirst()).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bundle-1', shopId: 'test.myshopify.com' },
      }),
    );
    expect(response.status).toBe(404);
  });

  it('serves a DRAFT only with a valid bound preview token and disables caching', async () => {
    mockFindFirst().mockResolvedValue(draftBundle);
    const previewToken = createBundlePreviewToken({
      shop: 'test.myshopify.com',
      bundleId: 'bundle-1',
      apiSecret: 'test_api_secret',
    });

    const response = await apiBundleLoader({
      request: makeApiRequest('bundle-1', previewToken),
      params: { bundleId: 'bundle-1' },
      context: {},
    } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('rejects a DRAFT token bound to another bundle', async () => {
    mockFindFirst().mockResolvedValue(draftBundle);
    const previewToken = createBundlePreviewToken({
      shop: 'test.myshopify.com',
      bundleId: 'bundle-2',
      apiSecret: 'test_api_secret',
    });

    const response = await apiBundleLoader({
      request: makeApiRequest('bundle-1', previewToken),
      params: { bundleId: 'bundle-1' },
      context: {},
    } as any);

    expect(response.status).toBe(404);
  });

  it('does not authorize ARCHIVED bundles with a valid preview token', async () => {
    mockFindFirst().mockResolvedValue({
      ...draftBundle,
      status: BundleStatus.ARCHIVED,
    });
    const previewToken = createBundlePreviewToken({
      shop: 'test.myshopify.com',
      bundleId: 'bundle-1',
      apiSecret: 'test_api_secret',
    });

    const response = await apiBundleLoader({
      request: makeApiRequest('bundle-1', previewToken),
      params: { bundleId: 'bundle-1' },
      context: {},
    } as any);

    expect(response.status).toBe(404);
  });
});

describe('wpb.$bundleId (FPB proxy page) — draft access control', () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = 'test_api_secret';
    mockFindDesignSettings().mockResolvedValue(null);
  });

  afterAll(() => {
    process.env.SHOPIFY_API_SECRET = originalSecret;
  });

  it('queries by verified shop and bundle identity before preview-token authorization', async () => {
    mockFindFirst().mockResolvedValue(null);

    await wpbProxyLoader({
      request: makeProxyRequest('bundle-1'),
      params: { bundleId: 'bundle-1' },
      context: {},
    } as any);

    const call = mockFindFirst().mock.calls[0]?.[0];
    expect(call?.where).toEqual({
      id: 'bundle-1',
      shopId: 'test-shop.myshopify.com',
      bundleType: 'full_page',
    });
  });

  it('returns 404 for an unsigned DRAFT bundle', async () => {
    mockFindFirst().mockResolvedValue({
      id: 'bundle-1',
      shopId: 'test-shop.myshopify.com',
      bundleType: 'full_page',
      status: BundleStatus.DRAFT,
    });

    const response = await wpbProxyLoader({
      request: makeProxyRequest('bundle-1'),
      params: { bundleId: 'bundle-1' },
      context: {},
    } as any);

    expect(response.status).toBe(404);
  });
});
