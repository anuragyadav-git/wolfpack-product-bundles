const authenticateAdmin = jest.fn();
jest.mock('../../../app/shopify.server', () => ({
  authenticate: { admin: authenticateAdmin },
}));

const exportOfferPolicyCsv = jest.fn();
const validateOfferPolicyCsvImport = jest.fn();
const applyOfferPolicyCsvImport = jest.fn();
jest.mock('../../../app/services/offer-policy-csv.server', () => ({
  exportOfferPolicyCsv,
  validateOfferPolicyCsvImport,
  applyOfferPolicyCsvImport,
}));

const { action, loader } = require('../../../app/routes/app/app.offer-operations') as {
  action: (args: any) => Promise<Response>;
  loader: (args: any) => Promise<Response>;
};

describe('offer operations route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateAdmin.mockResolvedValue({
      session: { shop: 'test.myshopify.com' },
      admin: { graphql: jest.fn() },
    });
  });

  it('renders the authenticated operations surface without loading bundle rows', async () => {
    const response = await loader({
      request: new Request('https://app.test/app/offer-operations'),
      params: {}, context: {},
    } as any) as Response;
    expect(response.status).toBe(200);
    expect(exportOfferPolicyCsv).not.toHaveBeenCalled();
  });

  it('downloads the authenticated shop export as a CSV attachment', async () => {
    exportOfferPolicyCsv.mockResolvedValue('schema_version,bundle_id\n1,bundle-1\n');
    const response = await loader({
      request: new Request('https://app.test/app/offer-operations?download=1'),
      params: {}, context: {},
    } as any) as Response;
    expect(exportOfferPolicyCsv).toHaveBeenCalledWith('test.myshopify.com');
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain('offer-policies-v1.csv');
  });

  it.each([
    ['validate', validateOfferPolicyCsvImport],
    ['apply', applyOfferPolicyCsvImport],
  ])('dispatches %s with authenticated shop context', async (intent, handler) => {
    handler.mockResolvedValue({ valid: true, rowCount: 1, changedCount: 1, errors: [] });
    const form = new FormData();
    form.set('intent', intent);
    form.set('csv', 'csv body');
    const response = await action({
      request: new Request('https://app.test/app/offer-operations', { method: 'POST', body: form }),
      params: {}, context: {},
    } as any) as Response;
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      shopId: 'test.myshopify.com',
      csv: 'csv body',
    }));
    expect(response.status).toBe(200);
  });

  it('rejects missing CSV and unknown intents', async () => {
    const missingCsv = new FormData();
    missingCsv.set('intent', 'validate');
    const missingResponse = await action({
      request: new Request('https://app.test/app/offer-operations', { method: 'POST', body: missingCsv }),
      params: {}, context: {},
    } as any) as Response;
    expect(missingResponse.status).toBe(400);

    const unknown = new FormData();
    unknown.set('intent', 'unknown');
    unknown.set('csv', 'body');
    const unknownResponse = await action({
      request: new Request('https://app.test/app/offer-operations', { method: 'POST', body: unknown }),
      params: {}, context: {},
    } as any) as Response;
    expect(unknownResponse.status).toBe(400);
  });
});
