import { appendBundlePreviewToken } from "./bundle-preview-url";
import {
  closePendingDashboardPreview,
  navigatePendingDashboardPreview,
  openPendingDashboardPreview,
} from "./dashboard-preview-window";

export type SettingsPreviewBundle = {
  id: string;
  name: string;
  type: string;
  bundleType: "full_page" | "product_page";
  viewUrl: string;
};

export type SettingsPreviewPreparation = {
  success?: boolean;
  ready?: boolean;
  previewToken?: string;
  shareablePreviewUrl?: string;
  error?: string | null;
};

export class SettingsPreviewError extends Error {
  constructor(public readonly code: "popupBlocked" | "notReady") {
    super(code);
  }
}

export function buildSettingsBundlePreparePreviewUrl(bundle: SettingsPreviewBundle): string {
  const bundleTypePath = bundle.bundleType === "full_page"
    ? "full-page-bundle"
    : "product-page-bundle";
  return `/app/bundles/${bundleTypePath}/configure/${encodeURIComponent(bundle.id)}/prepare-preview`;
}

export function resolveSettingsBundlePreviewUrl(
  bundle: SettingsPreviewBundle,
  preparation: SettingsPreviewPreparation,
): string {
  if (!preparation.success || !preparation.ready) {
    throw new SettingsPreviewError("notReady");
  }
  if (bundle.bundleType === "full_page" && preparation.shareablePreviewUrl) {
    return preparation.shareablePreviewUrl;
  }
  if (bundle.bundleType === "product_page" && preparation.previewToken) {
    return appendBundlePreviewToken(bundle.viewUrl, preparation.previewToken);
  }
  throw new SettingsPreviewError("notReady");
}

type PreviewDependencies = {
  fetch?: typeof fetch;
  openWindow?: (url?: string | URL, target?: string, features?: string) => Window | null;
};

export async function openSettingsBundleStorefrontPreview(
  bundle: SettingsPreviewBundle,
  dependencies: PreviewDependencies = {},
): Promise<string> {
  const popup = openPendingDashboardPreview(
    dependencies.openWindow ?? window.open.bind(window),
  );
  if (!popup) throw new SettingsPreviewError("popupBlocked");

  try {
    const response = await (dependencies.fetch ?? fetch)(
      buildSettingsBundlePreparePreviewUrl(bundle),
      { method: "POST" },
    );
    const preparation = await response.json() as SettingsPreviewPreparation;
    if (!response.ok) {
      if (preparation.error) throw new Error(preparation.error);
      throw new SettingsPreviewError("notReady");
    }
    const previewUrl = resolveSettingsBundlePreviewUrl(bundle, preparation);
    if (!navigatePendingDashboardPreview(popup, previewUrl)) {
      throw new SettingsPreviewError("popupBlocked");
    }
    return previewUrl;
  } catch (error) {
    closePendingDashboardPreview(popup);
    throw error;
  }
}
