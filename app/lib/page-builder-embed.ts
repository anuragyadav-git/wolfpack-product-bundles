export type PageBuilderEmbedRequest =
  | {
      bundleType: "product_page";
      parentProductHandle: string;
      locale: string;
    }
  | {
      bundleType: "full_page";
      publicNumber: number;
      locale: string;
    };

export function parsePageBuilderEmbedRequest(
  searchParams: URLSearchParams,
): PageBuilderEmbedRequest | null {
  const bundleType = searchParams.get("bundleType")?.trim() ?? "";
  const locale = searchParams.get("locale")?.trim() ?? "";
  if (!locale) return null;

  if (bundleType === "product_page") {
    const parentProductHandle = searchParams
      .get("parentProductHandle")
      ?.trim()
      .toLowerCase() ?? "";
    return parentProductHandle
      ? { bundleType, parentProductHandle, locale }
      : null;
  }

  if (bundleType === "full_page") {
    const rawPublicNumber = searchParams.get("publicNumber")?.trim() ?? "";
    if (!/^\d+$/.test(rawPublicNumber)) return null;
    const publicNumber = Number(rawPublicNumber);
    return Number.isSafeInteger(publicNumber) && publicNumber > 0
      ? { bundleType, publicNumber, locale }
      : null;
  }

  return null;
}
