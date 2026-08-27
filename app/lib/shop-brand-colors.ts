export type ShopBrandColorPair = {
  background: string;
  foreground: string;
};

export type ShopBrandColors = {
  primary: ShopBrandColorPair;
  secondary: ShopBrandColorPair;
  syncedAt?: string;
};

type BrandColorRole = "primaryBackground" | "primaryForeground" | "secondaryBackground" | "secondaryForeground";

const PRIMARY_BACKGROUND_FIELDS = [
  "Primary Color",
  "expert.navigationBanner.navigationBannerStepCompletionColor",
  "expert.generalSettings.conditionToastBgColor",
  "expert.navigationBanner.tabsActiveBgColor",
  "expert.productCard.productCardButtonColor",
  "expert.cartFooter.cartFooterNextButtonColor",
  "expert.cartFooter.cartFooterDiscountProgressBarFilledColor",
  "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonBg",
];

const PRIMARY_FOREGROUND_FIELDS = [
  "Button Text Color",
  "expert.navigationBanner.navigationCheckColor",
  "expert.generalSettings.conditionToastTextColor",
  "expert.navigationBanner.tabsActiveTextColor",
  "expert.productCard.productCardButtonTextColor",
  "expert.cartFooter.cartFooterNextButtonTextColor",
  "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonTextColor",
];

const SECONDARY_BACKGROUND_FIELDS = [
  "Secondary Color",
  "Product Background Color",
  "expert.navigationBanner.navigationBannerStepProgressBarEmptyColor",
  "expert.navigationBanner.tabsInactiveBgColor",
  "expert.productCard.productCardBgColor",
  "expert.emptyStateCard.emptyStateCardBorderColor",
  "expert.cartFooter.cartFooterBgColor",
  "expert.cartFooter.cartFooterBackButtonColor",
  "expert.cartFooter.cartFooterDiscountProgressBarEmptyColor",
];

const SECONDARY_FOREGROUND_FIELDS = [
  "Primary Text Color",
  "expert.navigationBanner.navigationBannerStepTextColor",
  "expert.generalSettings.productPageTitleColor",
  "expert.navigationBanner.tabsInactiveTextColor",
  "expert.productCard.productCardTextColor",
  "expert.emptyStateCard.emptyStateCardTextColor",
  "expert.cartFooter.cartFooterTextColor",
  "expert.cartFooter.cartFooterBackButtonTextColor",
  "expert.cartFooter.cartFooterDiscountTextColor",
  "expert.mixAndMatchConfig.generalSettings.bundleUpsellFontColor",
];

const COLOR_ROLE_BY_FIELD = new Map<string, BrandColorRole>([
  ...PRIMARY_BACKGROUND_FIELDS.map((key) => [key, "primaryBackground"] as const),
  ...PRIMARY_FOREGROUND_FIELDS.map((key) => [key, "primaryForeground"] as const),
  ...SECONDARY_BACKGROUND_FIELDS.map((key) => [key, "secondaryBackground"] as const),
  ...SECONDARY_FOREGROUND_FIELDS.map((key) => [key, "secondaryForeground"] as const),
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value.trim());
}

function readPair(value: unknown): ShopBrandColorPair | null {
  if (!isRecord(value) || !isHexColor(value.background) || !isHexColor(value.foreground)) {
    return null;
  }
  return {
    background: value.background.trim(),
    foreground: value.foreground.trim(),
  };
}

export function parseShopBrandColorsResponse(value: unknown): ShopBrandColors | null {
  if (!isRecord(value)) return null;
  const data = isRecord(value.data) ? value.data : null;
  const shop = data && isRecord(data.shop) ? data.shop : null;
  const brand = shop && isRecord(shop.brand) ? shop.brand : null;
  const colors = brand && isRecord(brand.colors) ? brand.colors : null;
  const primary = colors && Array.isArray(colors.primary) ? readPair(colors.primary[0]) : null;
  const secondary = colors && Array.isArray(colors.secondary) ? readPair(colors.secondary[0]) : null;
  return primary && secondary ? { primary, secondary } : null;
}

export function isShopBrandColors(value: unknown): value is ShopBrandColors {
  if (!isRecord(value)) return false;
  return Boolean(readPair(value.primary) && readPair(value.secondary));
}

export function getShopBrandColorRole(fieldKey: string): BrandColorRole | null {
  return COLOR_ROLE_BY_FIELD.get(fieldKey) ?? null;
}

export function resolveDesignColor({
  fieldKey,
  explicitValue,
  inheritedColorFieldKeys,
  shopBrandColors,
  templateDefault,
}: {
  fieldKey: string;
  explicitValue: string;
  inheritedColorFieldKeys: readonly string[];
  shopBrandColors: ShopBrandColors | null;
  templateDefault: string;
}) {
  if (!inheritedColorFieldKeys.includes(fieldKey)) return explicitValue || templateDefault;
  const role = getShopBrandColorRole(fieldKey);
  if (!role || !shopBrandColors) return templateDefault;
  if (role === "primaryBackground") return shopBrandColors.primary.background;
  if (role === "primaryForeground") return shopBrandColors.primary.foreground;
  if (role === "secondaryBackground") return shopBrandColors.secondary.background;
  return shopBrandColors.secondary.foreground;
}
