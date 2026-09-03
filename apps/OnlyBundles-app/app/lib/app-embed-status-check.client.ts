import {
  hasActiveThemeExtension,
  normalizeThemeExtensionResources,
  type ShopifyThemeExtensionInfo,
} from "./theme-extension-status";

export type AppBridgeThemeStatus = {
  resources: ReturnType<typeof normalizeThemeExtensionResources>;
  appEmbedEnabled: boolean;
};

type AppBridgeExtensionsApi = {
  app?: {
    extensions?: () => Promise<ShopifyThemeExtensionInfo[]>;
  };
};

export async function getThemeExtensionStatusFromAppBridge(
  shopify: AppBridgeExtensionsApi,
): Promise<AppBridgeThemeStatus> {
  const extensions = await shopify.app?.extensions?.();
  const resources = normalizeThemeExtensionResources(extensions ?? []);
  return {
    resources,
    appEmbedEnabled: hasActiveThemeExtension(resources, "bundle-app-embed"),
  };
}

export function resolveConfiguredAppEmbedEnabled(
  currentAppEmbedEnabled: boolean | null,
  appBridgeStatus: Pick<AppBridgeThemeStatus, "appEmbedEnabled"> | null,
): boolean {
  return appBridgeStatus?.appEmbedEnabled ?? currentAppEmbedEnabled ?? true;
}

export async function verifyAppEmbedEnabledBeforePreview(
  currentAppEmbedEnabled: boolean,
  checkStatus: () => Promise<boolean>,
  options: {
    onValidationStart?: () => void;
    onValidationBlocked?: () => void;
  } = {},
): Promise<boolean> {
  if (!currentAppEmbedEnabled) return false;
  options.onValidationStart?.();
  const appEmbedEnabled = await checkStatus();
  if (!appEmbedEnabled) {
    options.onValidationBlocked?.();
  }
  return appEmbedEnabled;
}
