import { json, type ActionFunctionArgs } from "@remix-run/node";
import { AppLogger } from "../../lib/logger";
import { authenticate } from "../../shopify.server";
import type { StorefrontApiContext } from "@shopify/shopify-app-remix/server";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

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
  storefront: StorefrontApiContext,
  query: string,
  variables: Record<string, unknown>,
) {
  const response = await storefront.graphql(query, { variables });

  const payload: any = await response.json().catch(() => null);

  if (payload?.errors?.length) {
    throw new Error(payload.errors.map((error: { message?: string }) => error.message).join(", "));
  }

  return payload;
}

export async function action({ request }: ActionFunctionArgs) {
  const context = await authenticate.public.appProxy(request);
  if (!context.session || !context.storefront) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const shop = context.session.shop;

  const body = await request.json().catch(() => null);
  const cartId = normalizeCartId(body?.cartId, body?.cartToken);
  const bundleDetailsKey = validateBundleDetailsKey(body?.bundleDetailsKey);
  const displayProperties = sanitizeDisplayProperties(body?.displayProperties);

  if (!cartId || !bundleDetailsKey || Object.keys(displayProperties).length === 0) {
    return json({ ok: false, error: "Invalid bundle details payload" }, { status: 400 });
  }

  try {
    const existingPayload = await postStorefrontGraphql(
      context.storefront,
      GET_CART_BUNDLE_DETAILS_QUERY,
      { cartId },
    );
    const existingValue = existingPayload?.data?.cart?.metafields?.[0]?.value ?? null;
    const mergedDetails = mergeBundleDetailsValue(existingValue, bundleDetailsKey, displayProperties);

    const setPayload = await postStorefrontGraphql(
      context.storefront,
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

    return json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    }

    AppLogger.error("Cart bundle_details sync failed", {
      component: "api.cart-bundle-details",
      operation: "action",
      shop,
    }, error);
    return json({ ok: false, error: "Failed to sync bundle details" }, { status: 502 });
  }
}
