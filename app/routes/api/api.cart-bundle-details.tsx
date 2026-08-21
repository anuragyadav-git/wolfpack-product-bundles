import { json, type ActionFunctionArgs } from "@remix-run/node";
import prisma from "../../db.server";
import { SHOPIFY_REST_API_VERSION } from "../../constants/api";
import { requireAppProxy } from "../../lib/auth-guards.server";
import { AppLogger } from "../../lib/logger";
import { getOfflineSessionForShop } from "../../services/offline-token.server";
import { createStorefrontAccessToken } from "../../services/storefront-token.server";
import { sessionStorage } from "../../shopify.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type DisplayProperties = Record<string, string>;

const GET_CART_BUNDLE_DETAILS_QUERY = `
  query GetCartBundleDetails($cartId: ID!) {
    cart(id: $cartId) {
      id
      metafields(identifiers: [{ key: "bundle_details" }]) {
        key
        type
        value
      }
    }
  }
`;

const SET_CART_BUNDLE_DETAILS_MUTATION = `
  mutation SetCartBundleDetails($metafields: [MetafieldsSetInput!]!) {
    cartMetafieldsSet(metafields: $metafields) {
      metafields {
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function normalizeCartId(cartId: unknown, cartToken: unknown): string | null {
  if (typeof cartId === "string" && cartId.trim().startsWith("gid://shopify/Cart/")) {
    return cartId.trim();
  }

  const rawToken = (typeof cartId === "string" && cartId.trim())
    ? cartId.trim()
    : (typeof cartToken === "string" && cartToken.trim())
      ? cartToken.trim()
      : null;

  if (!rawToken) return null;
  const token = rawToken.replace(/^gid:\/\/shopify\/Cart\//, "");
  return token ? `gid://shopify/Cart/${token}` : null;
}

function validateBundleDetailsKey(key: unknown): string | null {
  if (typeof key !== "string") return null;
  const trimmed = key.trim();
  return /^[a-zA-Z0-9_-]{1,100}$/.test(trimmed) ? trimmed : null;
}

export function sanitizeDisplayProperties(props: unknown): DisplayProperties {
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    return {};
  }

  const sanitized: DisplayProperties = {};
  for (const [rawKey, rawValue] of Object.entries(props as Record<string, unknown>)) {
    if (typeof rawKey !== "string") continue;
    const key = rawKey.trim();

    let value: string | null = null;
    if (typeof rawValue === "string") {
      value = rawValue.trim();
    } else if (typeof rawValue === "number" || typeof rawValue === "boolean") {
      value = String(rawValue).trim();
    }

    if (!key || !value || key.length > 50 || value.length > 500) continue;
    if (key.startsWith("_") || key.includes("\n") || value.includes("\n")) continue;
    sanitized[key] = value;
  }

  return sanitized;
}

export function mergeBundleDetailsValue(
  existingValue: string | null,
  bundleDetailsKey: string,
  displayProperties: DisplayProperties,
): Record<string, { displayProperties: DisplayProperties }> {
  let detailsMap: Record<string, { displayProperties: DisplayProperties }> = {};
  if (existingValue) {
    try {
      const parsed = JSON.parse(existingValue);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        detailsMap = parsed;
      }
    } catch {
      detailsMap = {};
    }
  }

  detailsMap[bundleDetailsKey] = { displayProperties };
  return detailsMap;
}

async function postStorefrontGraphql(
  shop: string,
  storefrontAccessToken: string,
  query: string,
  variables: Record<string, unknown>,
) {
  const response = await fetch(`https://${shop}/api/${SHOPIFY_REST_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Storefront API request failed: ${response.status}`);
  }

  if (payload?.errors?.length) {
    throw new Error(payload.errors.map((error: { message?: string }) => error.message).join(", "));
  }

  return payload;
}

export async function action({ request }: ActionFunctionArgs) {
  const { session: proxySession } = await requireAppProxy(request);
  const shop = proxySession.shop;

  const body = await request.json().catch(() => null);
  const cartId = normalizeCartId(body?.cartId, body?.cartToken);
  const bundleDetailsKey = validateBundleDetailsKey(body?.bundleDetailsKey);
  const displayProperties = sanitizeDisplayProperties(body?.displayProperties);

  if (!cartId || !bundleDetailsKey || Object.keys(displayProperties).length === 0) {
    return json({ ok: false, error: "Invalid bundle details payload" }, { status: 400, headers: CORS_HEADERS });
  }

  let session = await getOfflineSessionForShop(prisma, shop, sessionStorage);

  if (session && !session.storefrontAccessToken && session.accessToken) {
    const admin = {
      graphql: async (query: string, options?: { variables?: Record<string, unknown> }) => fetch(
        `https://${shop}/admin/api/${SHOPIFY_REST_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session!.accessToken,
          },
          body: JSON.stringify({ query, variables: options?.variables }),
        },
      ),
    };

    await createStorefrontAccessToken(admin as never, shop);
    session = await getOfflineSessionForShop(prisma, shop, sessionStorage, {
      migrateIfNeeded: false,
      refreshIfNeeded: false,
    });
  }

  if (!session?.storefrontAccessToken) {
    AppLogger.warn("Cart bundle_details missing Storefront token", {
      component: "api.cart-bundle-details",
      operation: "action",
      shop,
    });
    return json({ ok: false, error: "Shop not configured" }, { status: 404, headers: CORS_HEADERS });
  }

  try {
    const existingPayload = await postStorefrontGraphql(
      shop,
      session.storefrontAccessToken,
      GET_CART_BUNDLE_DETAILS_QUERY,
      { cartId },
    );
    const existingValue = existingPayload?.data?.cart?.metafields?.[0]?.value ?? null;
    const mergedDetails = mergeBundleDetailsValue(existingValue, bundleDetailsKey, displayProperties);

    const setPayload = await postStorefrontGraphql(
      shop,
      session.storefrontAccessToken,
      SET_CART_BUNDLE_DETAILS_MUTATION,
      {
        metafields: [{
          ownerId: cartId,
          key: "bundle_details",
          type: "json",
          value: JSON.stringify(mergedDetails),
        }],
      },
    );
    const userErrors = setPayload?.data?.cartMetafieldsSet?.userErrors ?? [];

    if (userErrors.length > 0) {
      throw new Error(userErrors.map((error: { message?: string }) => error.message).join(", "));
    }

    return json({ ok: true }, { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    }

    AppLogger.error("Cart bundle_details sync failed", {
      component: "api.cart-bundle-details",
      operation: "action",
      shop,
    }, error);
    return json({ ok: false, error: "Failed to sync bundle details" }, { status: 502, headers: CORS_HEADERS });
  }
}
