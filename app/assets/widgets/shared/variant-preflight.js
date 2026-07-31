export function resolveRuntimeVariantNumericId(rawVariantId) {
  const normalizedRawId = String(rawVariantId ?? "").trim();
  if (!normalizedRawId) return "";

  const match = /^gid:\/\/shopify\/ProductVariant\/(\d+)$/i.exec(normalizedRawId);
  if (match?.[1]) return match[1];

  const candidate = normalizedRawId.includes("/")
    ? normalizedRawId.split("/").pop() || ""
    : normalizedRawId;
  return /^\d+$/.test(candidate) ? candidate : "";
}

export async function preflightVariantOnStorefront(
  rawVariantId,
  fetchImpl = typeof fetch === "function" ? fetch : null,
) {
  const variantNumericId = resolveRuntimeVariantNumericId(rawVariantId);
  if (!variantNumericId) {
    return {
      ok: false,
      id: String(rawVariantId ?? ""),
      status: 0,
      message: "Variant id format is invalid. Expected numeric or gid://shopify/ProductVariant/<id>.",
    };
  }

  if (typeof fetchImpl !== "function") {
    return {
      ok: false,
      id: variantNumericId,
      status: 0,
      message: "Browser fetch is not available for storefront variant preflight.",
    };
  }

  try {
    const response = await fetchImpl(`/variants/${encodeURIComponent(variantNumericId)}.js`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response?.ok) {
      return {
        ok: false,
        id: variantNumericId,
        status: response?.status || 0,
        message: response?.status
          ? `Variant lookup failed with status ${response.status}`
          : "Variant lookup failed.",
      };
    }

    const payload = await response.json().catch(() => null);
    const available = typeof payload?.available === "boolean" ? payload.available : undefined;

    return {
      ok: true,
      id: variantNumericId,
      status: response.status,
      message: available === false ? "Variant lookup returned available:false." : undefined,
      available,
    };
  } catch (error) {
    return {
      ok: false,
      id: variantNumericId,
      status: 0,
      message: error instanceof Error ? error.message : "Variant lookup request failed.",
    };
  }
}
