import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export {};

const useFetcher = jest.fn();
jest.mock('@remix-run/react', () => ({
  useFetcher,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const authenticateAdmin = jest.fn();
jest.mock('../../../app/shopify.server', () => ({
  authenticate: { admin: authenticateAdmin },
}));

const validateOfferPolicyCsvImport = jest.fn();
const applyOfferPolicyCsvImport = jest.fn();
jest.mock('../../../app/services/offer-policy-csv.server', () => ({
  validateOfferPolicyCsvImport,
  applyOfferPolicyCsvImport,
}));

const { action, loader, default: OfferOperationsRoute } = require('../../../app/routes/app/app.offer-operations') as {
  action: (args: any) => Promise<Response>;
  loader: (args: any) => Promise<Response>;
  default: React.ComponentType;
};

describe('offer operations route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetcher.mockReturnValue({ data: undefined, state: 'idle', submit: jest.fn() });
    authenticateAdmin.mockResolvedValue({
      session: { shop: 'test.myshopify.com' },
      admin: { graphql: jest.fn() },
    });
  });

  it('lets merchants dismiss the informational import safety banner', () => {
    const view = renderToStaticMarkup(React.createElement(OfferOperationsRoute));

    expect(view).toContain(
      '<s-banner tone="info" heading="offerPolicyCsv.import.safetyTitle" dismissible="true"',
    );
  });

  it('renders the authenticated operations surface without serving file bytes', async () => {
    const response = await loader({
      request: new Request('https://app.test/app/offer-operations?download=1'),
      params: {}, context: {},
    } as any) as Response;
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ ready: true });
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
      admin: expect.any(Object),
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
