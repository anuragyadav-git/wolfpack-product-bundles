import { buildStorefrontProxyPath } from "../config/storefront-proxy-routes";

function normalizeShopDomain(shop: string): string {
  return shop.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function parseFpbPublicNumber(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const publicNumber = Number(value);
  return Number.isSafeInteger(publicNumber) ? publicNumber : null;
}

export function buildFpbStorefrontUrl(
  shop: string,
  publicNumber: number,
  proxyRoot?: string,
): string {
  if (!Number.isSafeInteger(publicNumber) || publicNumber < 1) {
    throw new Error("FPB public number must be a positive integer");
  }
  return `https://${normalizeShopDomain(shop)}${buildStorefrontProxyPath(`wpb/${publicNumber}`, proxyRoot)}`;
}

export function appendFpbPreviewToken(url: string, token: string): string {
  const previewUrl = new URL(url);
  previewUrl.searchParams.set("wpb_preview", token);
  return previewUrl.toString();
}
