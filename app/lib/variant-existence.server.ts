export interface ShopifyVariantIdentifier {
  numericId: string;
  isValidFormat: boolean;
  reason?: string;
}

export interface ShopifyStorefrontVariantLookupResult {
  ok: boolean;
  id: string;
  status: number;
  message?: string;
  available?: boolean;
}

const PRODUCT_VARIANT_GID_PREFIX = "gid://shopify/ProductVariant/";

function normalizeRawVariantId(rawVariantId: unknown): string {
  return String(rawVariantId ?? "").trim();
}

export async function validateVariantIdFromShopify(
  rawVariantId: string | number,
): Promise<ShopifyVariantIdentifier> {
  const normalizedRawId = normalizeRawVariantId(rawVariantId);
  if (!normalizedRawId) {
    return {
      numericId: "",
      isValidFormat: false,
      reason: "Variant id is required.",
    };
  }

  const gidMatch = normalizedRawId.match(/^gid:\/\/shopify\/ProductVariant\/(\d+)$/i);
  if (gidMatch) {
    return {
      numericId: gidMatch[1],
      isValidFormat: true,
    };
  }

  const candidate = normalizedRawId.includes("/")
    ? normalizedRawId.split("/").pop() || ""
    : normalizedRawId;
  if (/^\d+$/.test(candidate)) {
    return {
      numericId: candidate,
      isValidFormat: true,
    };
  }

  return {
    numericId: "",
    isValidFormat: false,
    reason: "Variant id format is invalid. Expected numeric or gid://shopify/ProductVariant/<id>.",
  };
}

export async function isVariantExistsOnShopifyStorefront(
  shopDomain: string,
  variantNumericId: string,
): Promise<ShopifyStorefrontVariantLookupResult> {
  if (!shopDomain) {
    return {
      ok: false,
      id: variantNumericId,
      status: 0,
      message: "Shop domain is required.",
    };
  }

  if (!/^\d+$/.test(variantNumericId)) {
    return {
      ok: false,
      id: variantNumericId,
      status: 0,
      message: "Variant id must be numeric.",
      available: false,
    };
  }

  const requestUrl = `https://${shopDomain}/variants/${encodeURIComponent(variantNumericId)}.js`;

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        id: variantNumericId,
        status: response.status,
        message: `Variant lookup failed with status ${response.status}`,
        available: false,
      };
    }

    const payload = await response.json().catch(() => null);
    const available = typeof payload?.available === "boolean" ? payload.available : undefined;

    return {
      ok: true,
      id: variantNumericId,
      status: response.status,
      available,
    };
  } catch (error: any) {
    return {
      ok: false,
      id: variantNumericId,
      status: 0,
      message: error instanceof Error ? error.message : "Variant lookup request failed.",
      available: false,
    };
  }
}

export function resolveShopifyVariantNumericId(rawVariantId: unknown): string {
  const raw = normalizeRawVariantId(rawVariantId);
  if (!raw) return "";

  if (raw.startsWith(PRODUCT_VARIANT_GID_PREFIX)) {
    return raw.replace(PRODUCT_VARIANT_GID_PREFIX, "");
  }

  if (!raw.includes("/")) {
    return /^\d+$/.test(raw) ? raw : "";
  }

  const candidate = raw.split("/").pop() || "";
  return /^\d+$/.test(candidate) ? candidate : "";
}
