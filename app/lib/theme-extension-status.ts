export type ThemeExtensionStatus = "active" | "available" | "unavailable";

export type ShopifyThemeExtensionActivation = {
  handle?: string;
  name?: string;
  target?: string;
  status?: ThemeExtensionStatus;
  activations?: Array<{ target?: string; themeId?: string }>;
};

export type ShopifyThemeExtensionInfo = {
  handle?: string;
  type?: string;
  activations?: ShopifyThemeExtensionActivation[];
};

export const THEME_EXTENSION_RESOURCES = [
  { handle: "bundle-app-embed", label: "Wolfpack Bundle", kind: "embed" },
  { handle: "bundle-full-page", label: "Wolfpack Bundle Full Page", kind: "block" },
  { handle: "bundle-product-page", label: "Bundle Builder", kind: "block" },
  { handle: "bundle-upsell-block", label: "Bundle Upsell Block", kind: "block" },
  { handle: "bundle-upsell-button", label: "Bundle Upsell Button", kind: "block" },
] as const;

export type NormalizedThemeExtensionResource = (typeof THEME_EXTENSION_RESOURCES)[number] & {
  status: ThemeExtensionStatus;
  enabled: boolean;
  target: string | null;
};

export function normalizeThemeExtensionResources(
  extensions: ShopifyThemeExtensionInfo[],
): NormalizedThemeExtensionResource[] {
  const themeExtension = extensions.find((extension) => extension.type === "theme_app_extension");
  const activations = themeExtension?.activations ?? [];

  return THEME_EXTENSION_RESOURCES.map((resource) => {
    const activation = activations.find((candidate) => candidate.handle === resource.handle);
    return {
      ...resource,
      status: activation?.status ?? "unavailable",
      enabled: activation?.status === "active",
      target: activation?.target ?? null,
    };
  });
}

export function hasActiveThemeExtension(
  resources: NormalizedThemeExtensionResource[],
  handle: string,
): boolean {
  return resources.some((resource) => resource.handle === handle && resource.enabled);
}
