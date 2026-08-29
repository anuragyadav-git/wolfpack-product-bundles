import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { CartTransformService } from "./services/cart-transform-service.server";
import { AddOnDiscountFunctionService } from "./services/addon-discount-function-service.server";
import { ensureVariantBundleMetafieldDefinitions } from "./services/bundles/metafield-sync.server";
import { syncThemeColors } from "./services/theme-colors.server";
import { activateUtmPixel } from "./services/pixel-activation.server";
import { AppLogger } from "./lib/logger";
import { ensureShopIdentity, recordBusinessEvent } from "./services/app-events.server";
import { normalizeSavedCustomUtmParameters } from "./lib/analytics/attribution-controls";
import { syncPpbStorefrontRuntime } from "./services/ppb-storefront-runtime.server";

const sessionStorage = new PrismaSessionStorage(prisma);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.July26, // 2026-07: Latest recommended Admin API version
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage,
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    expiringOfflineAccessTokens: true,
  },
  hooks: {
    afterAuth: async ({ session, admin }: any) => {
      AppLogger.info("afterAuth hook triggered", { shop: session.shop });
      const existingShop = await prisma.shop.findUnique({
        where: { shopDomain: session.shop },
        select: { id: true, shopifyShopGid: true },
      });
      let shopifyShopGid = existingShop?.shopifyShopGid ?? null;
      const setupAdmin: Pick<typeof admin, "graphql"> = admin;

      // Create variant-level metafield definitions with storefront access.
      // These enable the Liquid widget to read bundle_ui_config and other metafields.
      try {
        await ensureVariantBundleMetafieldDefinitions(setupAdmin);
      } catch (error: any) {
        AppLogger.error("Failed to create metafield definitions", { shop: session.shop }, error);
      }

      // Create or reactivate the shop record. Shopify App Pricing is verified separately.
      try {
        await prisma.shop.upsert({
          where: { shopDomain: session.shop },
          create: { shopDomain: session.shop, name: session.shop },
          update: { uninstalledAt: null },
        });
        shopifyShopGid = await ensureShopIdentity(setupAdmin, session.shop);
        await recordBusinessEvent({
          eventHandle: existingShop ? "app_reauthorized" : "app_installed",
          shopDomain: session.shop,
          shopifyShopGid,
          surface: "admin",
          actor: "merchant",
          routeFamily: "auth",
          result: "success",
        });
      } catch (error: any) {
        AppLogger.error("Failed to create shop record", { shop: session.shop }, error);
      }

      // Sync $app:serverUrl metafield so the theme widget can read the app server URL.
      // Runs on install/re-install; URL is a static deploy-time value so syncing once is sufficient.
      try {
        const appUrl = process.env.SHOPIFY_APP_URL;
        if (appUrl) {
          const shopIdResponse = await setupAdmin.graphql(`query { shop { id } }`);
          if (shopIdResponse.ok) {
            const shopIdData = await shopIdResponse.json();
            const shopGlobalId = shopIdData.data?.shop?.id;
            if (shopGlobalId) {
              await setupAdmin.graphql(
                `mutation UpdateAppUrlMetafield($metafields: [MetafieldsSetInput!]!) {
                   metafieldsSet(metafields: $metafields) {
                     metafields { id }
                     userErrors { field message }
                   }
                 }`,
                {
                  variables: {
                    metafields: [{
                      ownerId: shopGlobalId,
                      namespace: "$app",
                      key: "serverUrl",
                      type: "single_line_text_field",
                      value: appUrl,
                    }],
                  },
                },
              );
            }
          }
        }
      } catch (error: any) {
        AppLogger.error("Failed to sync $app:serverUrl metafield", { shop: session.shop }, error);
      }

      // Sync theme colors for bundle widget color inheritance (non-critical)
      try {
        await syncThemeColors(session.shop);
      } catch (error: any) {
        AppLogger.error("Failed to sync theme colors", { shop: session.shop }, error);
      }

      try {
        await syncPpbStorefrontRuntime(setupAdmin, session.shop);
      } catch (error: any) {
        AppLogger.error("Failed to sync Shopify-hosted PPB runtime", { shop: session.shop }, error);
      }

      // Auto-activate UTM pixel on install/re-auth so bundle revenue tracking is on
      // by default. Merchants can opt-out via "Disable tracking" on the Analytics page.
      try {
        const appUrl = process.env.SHOPIFY_APP_URL;
        if (appUrl) {
          const shop = await prisma.shop.findUnique({
            where: { shopDomain: session.shop },
            select: { customUtmParameters: true },
          });
          await activateUtmPixel(
            setupAdmin,
            appUrl,
            session.shop,
            normalizeSavedCustomUtmParameters(shop?.customUtmParameters),
          );
          AppLogger.info("UTM pixel auto-activated", { shop: session.shop });
        }
      } catch (error: any) {
        AppLogger.warn("Failed to auto-activate UTM pixel (non-fatal)", { shop: session.shop }, error);
        await recordBusinessEvent({
          eventHandle: "pixel_activation_failed",
          shopDomain: session.shop,
          shopifyShopGid,
          surface: "admin",
          actor: "system",
          routeFamily: "auth",
          result: "failure",
          errorCode: "activation_failed",
          attributes: {
            error_message_safe: error instanceof Error ? error.message : "Pixel activation failed",
          },
        });
      }

      // Automatically activate cart transform for new installations
      try {
        const result = await CartTransformService.completeSetup(setupAdmin, session.shop);
        if (!result.success) {
          AppLogger.warn("Cart transform setup failed (non-critical)", { shop: session.shop, error: result.error });
          await recordBusinessEvent({
            eventHandle: "cart_transform_setup_failed",
            shopDomain: session.shop,
            shopifyShopGid,
            surface: "admin",
            actor: "system",
            routeFamily: "auth",
            result: "failure",
            errorCode: "setup_failed",
            attributes: {
              error_message_safe: result.error ?? "Cart transform setup failed",
            },
          });
        } else {
          await recordBusinessEvent({
            eventHandle: "cart_transform_enabled",
            shopDomain: session.shop,
            shopifyShopGid,
            surface: "admin",
            actor: "system",
            routeFamily: "auth",
            result: "success",
            attributes: {
              cart_transform_id: result.cartTransformId ?? null,
              already_exists: result.alreadyExists ?? false,
            },
          });
        }
      } catch (error: any) {
        AppLogger.error("Error during cart transform setup", { shop: session.shop }, error);
        await recordBusinessEvent({
          eventHandle: "cart_transform_setup_failed",
          shopDomain: session.shop,
          shopifyShopGid,
          surface: "admin",
          actor: "system",
          routeFamily: "auth",
          result: "failure",
          errorCode: "exception",
          attributes: {
            error_message_safe: error instanceof Error ? error.message : "Cart transform setup error",
          },
        });
      }

      // Automatically activate the Add On discount function so selected add-on
      // cart lines can render native Shopify discount allocations.
      try {
        const result = await AddOnDiscountFunctionService.completeSetup(setupAdmin, session.shop);
        if (result.success) {
          await recordBusinessEvent({
            eventHandle: "addon_discount_function_enabled",
            shopDomain: session.shop,
            shopifyShopGid,
            surface: "admin",
            actor: "system",
            routeFamily: "cart_transform",
            result: "success",
            attributes: {
              discount_id: result.discountId ?? null,
              function_id: result.functionId ?? null,
              function_handle: result.functionHandle ?? null,
              setup_outcome: result.outcome ?? null,
            },
          });
        } else {
          AppLogger.warn("Add-on discount function setup failed (non-critical)", { shop: session.shop, error: result.error });
          await recordBusinessEvent({
            eventHandle: "addon_discount_function_failed",
            shopDomain: session.shop,
            shopifyShopGid,
            surface: "admin",
            actor: "system",
            routeFamily: "cart_transform",
            result: "failure",
            errorCode: "setup_failed",
            attributes: {
              error_message_safe: result.error ?? "Add-on discount function setup failed",
            },
          });
        }
      } catch (error: any) {
        AppLogger.error("Error during add-on discount function setup", { shop: session.shop }, error);
        await recordBusinessEvent({
          eventHandle: "addon_discount_function_failed",
          shopDomain: session.shop,
          shopifyShopGid,
          surface: "admin",
          actor: "system",
          routeFamily: "cart_transform",
          result: "failure",
          errorCode: "exception",
          attributes: {
            error_message_safe: error instanceof Error ? error.message : "Add-on discount function setup error",
          },
        });
      }

    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export { sessionStorage };
