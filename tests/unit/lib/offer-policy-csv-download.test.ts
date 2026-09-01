import { downloadOfferPolicyCsv } from '../../../app/lib/offer-policy-csv-download.client';

describe('offer policy CSV browser download', () => {
  it('uses authenticated fetch and downloads the response without navigating the iframe', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('csv body', {
      status: 200,
      headers: { 'content-type': 'text/csv' },
    }));
    const environment = {
      createObjectUrl: jest.fn().mockReturnValue('blob:csv'),
      revokeObjectUrl: jest.fn(),
      clickDownload: jest.fn(),
    };

    await downloadOfferPolicyCsv(fetcher, environment);

    expect(fetcher).toHaveBeenCalledWith('/app/offer-operations?download=1');
    expect(environment.clickDownload).toHaveBeenCalledWith('blob:csv', 'offer-policies-v1.csv');
    expect(environment.revokeObjectUrl).toHaveBeenCalledWith('blob:csv');
  });

  it('fails without creating a download when the authenticated response is not successful', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('', { status: 401 }));
    await expect(downloadOfferPolicyCsv(fetcher)).rejects.toThrow('offer_policy_export_failed');
  });
});
