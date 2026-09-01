import {
  applyOfferPolicyCsvImport,
  exportOfferPolicyCsv,
  validateOfferPolicyCsvImport,
} from '../../../app/services/offer-policy-csv.server';
import { OFFER_POLICY_CSV_COLUMNS } from '../../../app/lib/offer-policy-csv';

jest.mock('../../../app/db.server', () => ({
  __esModule: true,
  default: {
    bundle: { findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../../app/services/bundles/storefront-sync.server', () => ({
  syncBundleStorefrontNow: jest.fn(),
}));

const database = require('../../../app/db.server').default;
const findMany = database.bundle.findMany as jest.Mock;
const transaction = database.$transaction as jest.Mock;
const { syncBundleStorefrontNow } = require('../../../app/services/bundles/storefront-sync.server') as {
  syncBundleStorefrontNow: jest.Mock;
};
const offerPolicyCreate = jest.fn();
const offerPolicyUpdateMany = jest.fn();
const offerConditionUpdateMany = jest.fn();

const bundle = {
  id: 'bundle-1',
  name: 'Starter bundle',
  bundleType: 'full_page',
  status: 'draft',
  offerPolicy: null,
};

function csv(overrides: Record<string, string> = {}) {
  const row: Record<string, string> = {
    schema_version: '1', bundle_id: 'bundle-1', bundle_name: 'Starter bundle',
    bundle_type: 'full_page', bundle_status: 'draft', specific_link_required: 'false',
    priority: '10', stop_lower_priority: 'true', starts_at: '', ends_at: '',
    country_targeting_enabled: 'false', country_targeting_mode: 'include',
    country_codes: '', rule_version: '0', ...overrides,
  };
  return `${OFFER_POLICY_CSV_COLUMNS.join(',')}\n${OFFER_POLICY_CSV_COLUMNS.map((key) => row[key]).join(',')}\n`;
}

describe('offer policy CSV service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findMany.mockResolvedValue([{ ...bundle, offerPolicy: null }]);
    offerPolicyCreate.mockResolvedValue({ id: 'policy-1' });
    offerPolicyUpdateMany.mockResolvedValue({ count: 1 });
    transaction.mockImplementation(async (work: (tx: any) => Promise<unknown>) => work({
      offerPolicy: { create: offerPolicyCreate, updateMany: offerPolicyUpdateMany },
      offerCondition: { updateMany: offerConditionUpdateMany },
    }));
    syncBundleStorefrontNow.mockResolvedValue({ synced: true });
  });

  it('exports only bundles from the authenticated shop', async () => {
    const result = await exportOfferPolicyCsv('test.myshopify.com');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { shopId: 'test.myshopify.com' },
    }));
    expect(result).toContain('bundle-1');
    expect(result).not.toContain('token');
  });

  it('validates without writing or syncing', async () => {
    const result = await validateOfferPolicyCsvImport({
      shopId: 'test.myshopify.com',
      csv: csv(),
    });
    expect(result).toEqual(expect.objectContaining({
      valid: true,
      rowCount: 1,
      changedCount: 1,
    }));
    expect(transaction).not.toHaveBeenCalled();
    expect(syncBundleStorefrontNow).not.toHaveBeenCalled();
  });

  it('does not write any row when validation fails', async () => {
    const result = await applyOfferPolicyCsvImport({
      admin: { graphql: jest.fn() } as any,
      shopId: 'test.myshopify.com',
      csv: csv({ priority: '0' }),
    });
    expect(result.valid).toBe(false);
    expect(transaction).not.toHaveBeenCalled();
    expect(syncBundleStorefrontNow).not.toHaveBeenCalled();
  });

  it('atomically creates a missing policy and syncs the changed draft bundle', async () => {
    const admin = { graphql: jest.fn() } as any;
    const result = await applyOfferPolicyCsvImport({
      admin,
      shopId: 'test.myshopify.com',
      csv: csv(),
    });
    expect(offerPolicyCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        bundleId: 'bundle-1',
        shopId: 'test.myshopify.com',
        priority: 10,
        ruleVersion: 1,
      }),
    }));
    expect(syncBundleStorefrontNow).toHaveBeenCalledWith({
      admin,
      shopDomain: 'test.myshopify.com',
      bundleId: 'bundle-1',
      bundleType: 'full_page',
      reason: 'save',
    });
    expect(result).toEqual(expect.objectContaining({ valid: true, appliedCount: 1, syncedCount: 1 }));
  });

  it('updates by shop, bundle, and expected version and revokes link credentials when disabled', async () => {
    findMany.mockResolvedValue([{
      ...bundle,
      offerPolicy: {
        id: 'policy-1', specificLinkRequired: true, priority: 10,
        stopLowerPriority: true, startsAt: null, endsAt: null,
        countryTargetingEnabled: false, countryTargetingMode: 'include',
        countryCodes: [], ruleVersion: 4,
        conditions: [{ type: 'specific_link', revokedAt: null, expiresAt: null }],
      },
    }]);
    await applyOfferPolicyCsvImport({
      admin: { graphql: jest.fn() } as any,
      shopId: 'test.myshopify.com',
      csv: csv({ rule_version: '4', priority: '11' }),
    });
    expect(offerPolicyUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { bundleId: 'bundle-1', shopId: 'test.myshopify.com', ruleVersion: 4 },
      data: expect.objectContaining({ specificLinkRequired: false, ruleVersion: { increment: 1 } }),
    }));
    expect(offerConditionUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { offerPolicyId: 'policy-1', type: 'specific_link', revokedAt: null },
    }));
  });

  it('reports Shopify sync failures without rolling back applied policy rows', async () => {
    syncBundleStorefrontNow.mockRejectedValue(new Error('Shopify unavailable'));
    const result = await applyOfferPolicyCsvImport({
      admin: { graphql: jest.fn() } as any,
      shopId: 'test.myshopify.com',
      csv: csv(),
    });
    expect(result).toEqual(expect.objectContaining({
      valid: true,
      appliedCount: 1,
      syncedCount: 0,
      syncErrors: [{ bundleId: 'bundle-1', code: 'storefront_sync_failed' }],
    }));
  });
});
