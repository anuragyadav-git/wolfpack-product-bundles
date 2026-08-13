export const BUNDLE_PREVIEW_QUERY_PARAM = "wpb_preview";

export function appendBundlePreviewToken(url: string, token: string): string {
  const previewUrl = new URL(url);
  previewUrl.searchParams.set(BUNDLE_PREVIEW_QUERY_PARAM, token);
  return previewUrl.toString();
}

export function buildBundleConfigApiUrl(
  bundleId: string,
  locationSearch = "",
): string {
  const apiUrl = `/apps/onlybundles/api/bundle/${encodeURIComponent(bundleId)}.json`;
  const previewToken = new URLSearchParams(locationSearch).get(
    BUNDLE_PREVIEW_QUERY_PARAM,
  );

  return previewToken
    ? `${apiUrl}?${BUNDLE_PREVIEW_QUERY_PARAM}=${encodeURIComponent(previewToken)}`
    : apiUrl;
}
