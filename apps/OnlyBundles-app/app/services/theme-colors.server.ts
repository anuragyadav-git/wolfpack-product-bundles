import { Prisma } from "@prisma/client";
import prisma from "../db.server";
import { BundleType } from "../constants/bundle";
import { AppLogger } from "../lib/logger";
import {
  parseShopBrandColorsResponse,
  type ShopBrandColors,
} from "../lib/shop-brand-colors";
import type { StorefrontApiContext } from "@shopify/shopify-app-remix/server";

export type { ShopBrandColors } from "../lib/shop-brand-colors";

const SHOP_BRAND_COLORS_QUERY = `
  query ShopBrandColors {
    shop {
      brand {
        colors {
          primary { background foreground }
          secondary { background foreground }
        }
      }
    }
  }
`;

async function writeShopBrandColors(shopDomain: string, colors: ShopBrandColors) {
  await Promise.all([BundleType.PRODUCT_PAGE, BundleType.FULL_PAGE].map((bundleType) => (
    prisma.designSettings.upsert({
      where: { shopId_bundleType: { shopId: shopDomain, bundleType } },
      create: {
        shopId: shopDomain,
        bundleType,
        themeColors: colors as unknown as Prisma.InputJsonObject,
      },
      update: { themeColors: colors as unknown as Prisma.InputJsonObject },
    })
  )));
}

async function clearShopBrandColors(shopDomain: string) {
  await prisma.designSettings.updateMany({
    where: {
      shopId: shopDomain,
      bundleType: { in: [BundleType.PRODUCT_PAGE, BundleType.FULL_PAGE] },
    },
    data: { themeColors: Prisma.DbNull },
  });
}

export async function fetchShopBrandColors(
  storefront: StorefrontApiContext,
  shopDomain: string,
): Promise<ShopBrandColors | null> {
  try {
    const response = await storefront.graphql(SHOP_BRAND_COLORS_QUERY);
    const colors = parseShopBrandColorsResponse(await response.json());
    if (!colors) throw new Error("Storefront Brand colors are missing or malformed");
    return colors;
  } catch (error: unknown) {
    AppLogger.warn("fetchShopBrandColors: unavailable", {
      component: "theme-colors.server",
      shopDomain,
    }, error as Error);
    return null;
  }
}

/**
 * Refreshes the cached Storefront API Shop Brand pairs.
 * A failed or empty response clears the cache so inherited colors fall through
 * to canonical template defaults instead of stale merchant Brand data.
 */
export async function syncThemeColors(
  shopDomain: string,
  storefrontContext?: StorefrontApiContext,
): Promise<ShopBrandColors | null> {
  const storefront = storefrontContext ?? (
    await (await import("../shopify.server")).unauthenticated.storefront(shopDomain)
  ).storefront;
  const colors = await fetchShopBrandColors(storefront, shopDomain);
  if (!colors) {
    await clearShopBrandColors(shopDomain);
    return null;
  }

  const cachedColors = { ...colors, syncedAt: new Date().toISOString() };
  await writeShopBrandColors(shopDomain, cachedColors);
  AppLogger.info("syncThemeColors: Shop Brand colors synced", {
    component: "theme-colors.server",
    shopDomain,
  });
  return cachedColors;
}
