import { sanitizeRichHtmlFragment } from '../shared/rich-html.js';

type ProductMedia = { id?: string | number; alt?: string | null; src?: string; url?: string };

function mediaUrl(media: ProductMedia | string | null | undefined) {
  if (typeof media === "string") return media;
  return media?.src || media?.url || "";
}

export function filterIrrelevantVariantImages<T extends Record<string, any>>(product: T): T {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const referencedIds = new Set(variants.flatMap((variant: any) => {
    const id = variant?.featured_media?.id ?? variant?.image?.id ?? variant?.image_id;
    return id == null ? [] : [String(id)];
  }));
  const referencedUrls = new Set(variants.map((variant: any) => mediaUrl(
    variant?.featured_media || variant?.image || variant?.featuredImage,
  )).filter(Boolean));
  if (referencedIds.size === 0 && referencedUrls.size === 0) return product;

  const media = (Array.isArray(product.media) ? product.media : []) as ProductMedia[];
  const directlyReferenced = media.filter((item) => (
    (item.id != null && referencedIds.has(String(item.id))) || referencedUrls.has(mediaUrl(item))
  ));
  const relevantAlts = new Set(directlyReferenced.map((item) => item.alt).filter(Boolean));
  const filteredMedia = media.filter((item) => directlyReferenced.includes(item) || relevantAlts.has(item.alt));
  const keptIds = new Set([
    ...filteredMedia.flatMap((item) => item.id == null ? [] : [String(item.id)]),
    ...(media.length === 0 ? referencedIds : []),
  ]);
  const keptUrls = new Set([
    ...filteredMedia.map(mediaUrl).filter(Boolean),
    ...(media.length === 0 ? referencedUrls : []),
  ]);
  const images = (Array.isArray(product.images) ? product.images : []) as ProductMedia[];
  const filteredImages = images.filter((item) => (
    (item.id != null && keptIds.has(String(item.id))) || keptUrls.has(mediaUrl(item))
  ));

  return { ...product, media: filteredMedia, images: filteredImages };
}

export function buildJudgeMePreviewBadgeUrl(shop: string, token: string, productId: string | number) {
  const url = new URL("https://api.judge.me/api/v1/widgets/preview_badge");
  url.searchParams.set("shop_domain", shop);
  url.searchParams.set("external_id", String(productId));
  url.searchParams.set("api_token", token);
  return url.toString();
}

export async function fetchJudgeMePreviewBadges({
  shop,
  token,
  productIds,
  fetcher = fetch,
}: any) {
  if (!shop || !token || productIds.length === 0) return null;
  const responses = await Promise.all(productIds.map(async (productId: string|number) => {
    try {
      const response = await fetcher(buildJudgeMePreviewBadgeUrl(shop, token, productId));
      if (!response.ok) return null;
      const payload = await response.json() as {
        product_external_id?: string | number;
        badge?: string;
      };
      return payload.badge ? [String(payload.product_external_id ?? productId), payload.badge] as const : null;
    } catch (_: any) {
      return null;
    }
  }));
  const badges = Object.fromEntries(responses.filter((entry) => entry !== null));
  return Object.keys(badges).length > 0 ? { badges } : null;
}

export async function hydrateJudgeMeReviewCards({ root, products, shop, token }: any) {
  const productIds = products.map((product: { parentProductId: any; productId: any; id: any; }) => (
    product.parentProductId || product.productId || product.id
  )).filter(Boolean);
  const result = await fetchJudgeMePreviewBadges({ shop, token, productIds });
  if (!result) return;
  Array.from(root.children as HTMLCollectionOf<HTMLElement>).forEach((card, index) => {
    const product = products[index];
    const productId = product?.parentProductId || product?.productId || product?.id;
    const badge = result.badges[String(productId)] || '';
    if (!badge) return;
    const runtimeDocument = root.ownerDocument || document;
    const mount = runtimeDocument.createElement('div');
    mount.setAttribute('data-wpb-judgeme-badge', String(productId));
    mount.append(sanitizeRichHtmlFragment(
      badge,
      'review-badge',
      runtimeDocument.defaultView as unknown as Window,
    ));
    card.appendChild(mount);
  });
}
