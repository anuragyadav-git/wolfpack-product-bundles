export const STOREFRONT_PROXY_ROOT = "/apps/product-bundles";

const STOREFRONT_PROXY_ROOT_PATTERN = /^\/(apps|a|community|tools)\/[A-Za-z0-9_-]{1,30}$/;
const FPB_PROXY_PATH_PATTERN = /^\/(apps|a|community|tools)\/([A-Za-z0-9_-]{1,30})\/wpb(?:\/|$)/;

type StorefrontProxyRootInput = {
  configuredRoot?: string;
  pathname?: string;
};

function readConfiguredProxyRoot(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env?.STOREFRONT_PROXY_ROOT;
}

function readBrowserPathname(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.pathname;
}

export function resolveStorefrontProxyRoot(
  input: StorefrontProxyRootInput = {},
): string {
  const configuredRoot = input.configuredRoot ?? readConfiguredProxyRoot();
  if (configuredRoot) {
    const normalizedRoot = configuredRoot.replace(/\/+$/, "");
    return STOREFRONT_PROXY_ROOT_PATTERN.test(normalizedRoot)
      ? normalizedRoot
      : STOREFRONT_PROXY_ROOT;
  }

  const pathname = input.pathname ?? readBrowserPathname();
  const fpbPath = pathname?.match(FPB_PROXY_PATH_PATTERN);
  return fpbPath
    ? `/${fpbPath[1]}/${fpbPath[2]}`
    : STOREFRONT_PROXY_ROOT;
}

export function buildStorefrontProxyPath(
  path: string,
  proxyRoot?: string,
): string {
  const root = proxyRoot === undefined
    ? resolveStorefrontProxyRoot()
    : resolveStorefrontProxyRoot({ configuredRoot: proxyRoot });
  return `${root}/${path}`;
}

export function buildStorefrontApiPath(
  path: string,
  proxyRoot?: string,
): string {
  return buildStorefrontProxyPath(`api/${path}`, proxyRoot);
}
