/* eslint-disable import/first */
jest.mock('../../../app/db.server', () => ({
  __esModule: true,
  default: {
    bundle: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import {
  handleGenerateSpecificLinkOffer,
  handleRevokeSpecificLinkOffer,
} from '../../../app/routes/app/shared/specific-link-offer-action.server';

const getDb = () => require('../../../app/db.server').default;
const findBundle = () => getDb().bundle.findFirst as jest.MockedFunction<any>;
const transaction = () => getDb().$transaction as jest.MockedFunction<any>;

function session(shop = 'test.myshopify.com') {
  return { shop } as any;
}

describe('specific-link offer Admin actions', () => {
  const policyCreate = jest.fn();
  const policyUpdate = jest.fn();
  const conditionUpsert = jest.fn();
  const conditionUpdateMany = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    transaction().mockImplementation(async (callback: any) => callback({
      offerPolicy: { create: policyCreate, update: policyUpdate },
      offerCondition: { upsert: conditionUpsert, updateMany: conditionUpdateMany },
    }));
    policyCreate.mockResolvedValue({ id: 'policy-1', enabled: false, ruleVersion: 1 });
    policyUpdate.mockResolvedValue({ id: 'policy-1', enabled: true, ruleVersion: 4 });
    conditionUpsert.mockResolvedValue({ id: 'condition-1' });
    conditionUpdateMany.mockResolvedValue({ count: 1 });
  });

  it('generates a copyable PPB campaign link without persisting the raw token', async () => {
    findBundle().mockResolvedValue({
      id: 'bundle-1',
      shopId: 'test.myshopify.com',
      bundleType: 'product_page',
      shopifyProductHandle: 'bundle-product',
      publicNumber: null,
      offerPolicy: null,
    });
    const formData = new FormData();
    formData.set('expiresAt', '2026-09-30T12:00:00.000Z');

    const response = await handleGenerateSpecificLinkOffer(
      session(),
      'bundle-1',
      formData,
      new Date('2026-08-31T12:00:00.000Z'),
    );
    const payload = await response.json();
    if (!('campaignLink' in payload)) throw new Error('Expected generated campaign link');
    const link = new URL(payload.campaignLink);
    const token = link.searchParams.get('wpb_offer');

    expect(response.status).toBe(200);
    expect(link.pathname).toBe('/products/bundle-product');
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(policyCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        bundleId: 'bundle-1',
        shopId: 'test.myshopify.com',
        enabled: false,
        ruleVersion: 1,
      }),
    }));
    const conditionData = conditionUpsert.mock.calls[0]?.[0]?.create;
    expect(conditionData.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(conditionData)).not.toContain(token);
    expect(conditionData.expiresAt).toEqual(new Date('2026-09-30T12:00:00.000Z'));
  });

  it('regenerates an existing FPB link and increments its rule version', async () => {
    findBundle().mockResolvedValue({
      id: 'bundle-1',
      shopId: 'test.myshopify.com',
      bundleType: 'full_page',
      shopifyProductHandle: null,
      publicNumber: 12,
      offerPolicy: { id: 'policy-1', enabled: true, ruleVersion: 3 },
    });

    const response = await handleGenerateSpecificLinkOffer(
      session(),
      'bundle-1',
      new FormData(),
    );
    const payload = await response.json();
    if (!('campaignLink' in payload)) throw new Error('Expected regenerated campaign link');

    expect(new URL(payload.campaignLink).pathname).toBe('/apps/product-bundles/wpb/12');
    expect(policyUpdate).toHaveBeenCalledWith({
      where: { id: 'policy-1' },
      data: { ruleVersion: { increment: 1 } },
      select: { id: true, enabled: true, ruleVersion: true },
    });
    expect(payload.ruleVersion).toBe(4);
  });

  it('revokes idempotently and rejects bundles outside the authenticated shop', async () => {
    findBundle()
      .mockResolvedValueOnce({
        id: 'bundle-1',
        offerPolicy: { id: 'policy-1' },
      })
      .mockResolvedValueOnce(null);

    const revoked = await handleRevokeSpecificLinkOffer(
      session(),
      'bundle-1',
      new Date('2026-08-31T12:00:00.000Z'),
    );
    expect(revoked.status).toBe(200);
    expect(conditionUpdateMany).toHaveBeenCalledWith({
      where: { offerPolicyId: 'policy-1', type: 'specific_link' },
      data: { revokedAt: new Date('2026-08-31T12:00:00.000Z') },
    });

    const missing = await handleRevokeSpecificLinkOffer(session(), 'bundle-2');
    expect(missing.status).toBe(404);
  });

  it('rejects invalid expiry and missing storefront destinations before mutation', async () => {
    findBundle().mockResolvedValue({
      id: 'bundle-1',
      shopId: 'test.myshopify.com',
      bundleType: 'product_page',
      shopifyProductHandle: null,
      publicNumber: null,
      offerPolicy: null,
    });
    const invalid = new FormData();
    invalid.set('expiresAt', 'not-a-date');

    expect((await handleGenerateSpecificLinkOffer(session(), 'bundle-1', invalid)).status).toBe(400);
    expect((await handleGenerateSpecificLinkOffer(session(), 'bundle-1', new FormData())).status).toBe(400);
    expect(transaction()).not.toHaveBeenCalled();
  });
});
