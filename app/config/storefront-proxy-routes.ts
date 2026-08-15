export const STOREFRONT_PROXY_ROOT = "/apps/product-bundles";

export function buildStorefrontProxyPath(path: string): string {
  return `${STOREFRONT_PROXY_ROOT}/${path}`;
}

export function buildStorefrontApiPath(path: string): string {
  return buildStorefrontProxyPath(`api/${path}`);
}
