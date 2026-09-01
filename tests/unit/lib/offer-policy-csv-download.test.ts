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

    expect(fetcher).toHaveBeenCalledWith('/app/offer-operations/export');
    expect(environment.clickDownload).toHaveBeenCalledWith('blob:csv', 'offer-policies-v2.csv');
    expect(environment.revokeObjectUrl).toHaveBeenCalledWith('blob:csv');
  });

  it('rejects a successful HTML document before creating a download', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('<!DOCTYPE html>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }));
    const environment = {
      createObjectUrl: jest.fn(),
      revokeObjectUrl: jest.fn(),
      clickDownload: jest.fn(),
    };

    await expect(downloadOfferPolicyCsv(fetcher, environment))
      .rejects.toThrow('offer_policy_export_invalid_content_type');
    expect(environment.createObjectUrl).not.toHaveBeenCalled();
    expect(environment.clickDownload).not.toHaveBeenCalled();
  });

  it('fails without creating a download when the authenticated response is not successful', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('', { status: 401 }));
    await expect(downloadOfferPolicyCsv(fetcher)).rejects.toThrow('offer_policy_export_failed');
  });
});
