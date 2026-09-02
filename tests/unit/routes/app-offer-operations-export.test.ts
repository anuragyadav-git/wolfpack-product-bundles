export {};

const authenticateAdmin = jest.fn();
jest.mock('../../../app/shopify.server', () => ({
  authenticate: { admin: authenticateAdmin },
}));

const exportOfferPolicyCsv = jest.fn();
jest.mock('../../../app/services/offer-policy-csv.server', () => ({
  exportOfferPolicyCsv,
}));

const { loader } = require('../../../app/routes/app/app.offer-operations.export') as {
  loader: (args: any) => Promise<Response>;
};

describe('offer operations CSV export resource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateAdmin.mockResolvedValue({
      session: { shop: 'test.myshopify.com' },
    });
  });

  it('returns the authenticated shop export as a version 2 CSV attachment', async () => {
    exportOfferPolicyCsv.mockResolvedValue('schema_version,bundle_id\n2,bundle-1\n');

    const response = await loader({
      request: new Request('https://app.test/app/offer-operations/export'),
      params: {}, context: {},
    } as any) as Response;

    expect(authenticateAdmin).toHaveBeenCalledWith(expect.any(Request));
    expect(exportOfferPolicyCsv).toHaveBeenCalledWith('test.myshopify.com');
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="offer-policies-v2.csv"',
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.text()).resolves.toContain('2,bundle-1');
  });
});
