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
  const response = await fetcher('/app/offer-operations?download=1');
  if (!response.ok) throw new Error('offer_policy_export_failed');
  const objectUrl = environment.createObjectUrl(await response.blob());
  try {
    environment.clickDownload(objectUrl, 'offer-policies-v1.csv');
  } finally {
    environment.revokeObjectUrl(objectUrl);
  }
}
