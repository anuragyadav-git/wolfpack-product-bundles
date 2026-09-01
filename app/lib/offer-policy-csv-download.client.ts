export async function downloadOfferPolicyCsv(
  fetcher: typeof fetch = fetch,
  environment = {
    createObjectUrl: (blob: Blob) => URL.createObjectURL(blob),
    revokeObjectUrl: (url: string) => URL.revokeObjectURL(url),
    clickDownload: (url: string, filename: string) => {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
    },
  },
): Promise<void> {
  const response = await fetcher('/app/offer-operations/export');
  if (!response.ok) throw new Error('offer_policy_export_failed');
  if (!response.headers.get('content-type')?.toLowerCase().startsWith('text/csv')) {
    throw new Error('offer_policy_export_invalid_content_type');
  }
  const objectUrl = environment.createObjectUrl(await response.blob());
  try {
    environment.clickDownload(objectUrl, 'offer-policies-v2.csv');
  } finally {
    environment.revokeObjectUrl(objectUrl);
  }
}
