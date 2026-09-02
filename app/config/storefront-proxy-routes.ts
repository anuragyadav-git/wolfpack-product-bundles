export const STOREFRONT_PROXY_ROOT = "/apps/product-bundles";

const STOREFRONT_PROXY_ROOT_PATTERN = /^\/(apps|a|community|tools)\/[A-Za-z0-9_-]{1,30}$/;
const FPB_PROXY_PATH_PATTERN = /^\/(apps|a|community|tools)\/([A-Za-z0-9_-]{1,30})\/wpb(?:\/|$)/;

type StorefrontProxyRootInput = {
  configuredRoot?: string;
  pathname?: string;
};

type StorefrontProxyWindow = Window & {
  __WOLFPACK_STOREFRONT_PROXY_ROOT__?: string;
};

function normalizeStorefrontProxyRoot(value: string): string {
  const normalizedRoot = value.trim().replace(/\/+$/, "");
  if (!STOREFRONT_PROXY_ROOT_PATTERN.test(normalizedRoot)) {
    throw new Error(`Invalid storefront proxy root: ${value}`);
  }
  return normalizedRoot;
}

function readConfiguredProxyRoot(): string | undefined {
  if (typeof window !== "undefined") {
    const hostedRoot = (window as StorefrontProxyWindow).__WOLFPACK_STOREFRONT_PROXY_ROOT__;
    if (hostedRoot) return hostedRoot;
  }
  if (typeof process === "undefined") return undefined;
  return process.env?.STOREFRONT_PROXY_ROOT;
}

function readBrowserPathname(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location?.pathname;
}

export function setStorefrontProxyRoot(value: string): string {
  const normalizedRoot = normalizeStorefrontProxyRoot(value);
  if (typeof window !== "undefined") {
    (window as StorefrontProxyWindow).__WOLFPACK_STOREFRONT_PROXY_ROOT__ = normalizedRoot;
  }
  return normalizedRoot;
}

export function resolveStorefrontProxyRoot(
  input: StorefrontProxyRootInput = {},
): string {
  const configuredRoot = input.configuredRoot ?? readConfiguredProxyRoot();
  if (configuredRoot) {
    return normalizeStorefrontProxyRoot(configuredRoot);
  }

  const pathname = input.pathname ?? readBrowserPathname();
  const fpbPath = pathname?.match(FPB_PROXY_PATH_PATTERN);
  if (fpbPath) return `/${fpbPath[1]}/${fpbPath[2]}`;
  if (typeof window !== "undefined" && pathname) {
    throw new Error("Storefront proxy root is not configured");
  }
  return STOREFRONT_PROXY_ROOT;
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
