import { normalizeProductVariantGid, type RuntimeTokenPayload } from "./cart-transform-runtime-token.server";

export type CheckoutOfferDiscount = {
  type: "PERCENTAGE";
  value: number;
};

export type CheckoutOfferVariant = {
  id: string;
  title: string;
  productTitle?: string;
  imageUrl?: string | null;
};

export type CheckoutOffer = {
  key: string;
  groupKey: string;
  tierId: string;
  kind: "addon" | "gift";
  title: string;
  maxQuantity: number;
  eligibility: { type: "QUANTITY" | "AMOUNT"; value: number };
  discount: CheckoutOfferDiscount | null;
  variants: CheckoutOfferVariant[];
};

export type CheckoutOfferRuntime = {
  offers: CheckoutOffer[];
};

function positiveInteger(value: unknown, fallback = 1) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeDiscount(input: any, displayFree = false): CheckoutOfferDiscount | null {
  if (displayFree === true) return { type: "PERCENTAGE", value: 100 };
  const type = String(input?.type ?? input?.discountType ?? "").toUpperCase();
  const value = Number(input?.value ?? input?.discountValue);
  if (type !== "PERCENTAGE" || !Number.isFinite(value) || value <= 0) return null;
  return { type: "PERCENTAGE", value: Math.min(100, value) };
}

function normalizeEligibility(input: any) {
  const type = String(input?.type ?? input?.eligibilityType ?? "QUANTITY").toUpperCase() === "AMOUNT"
    ? "AMOUNT" as const
    : "QUANTITY" as const;
  const rawValue = Number(input?.value ?? input?.eligibilityValue);
  return { type, value: Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 1 };
}

function conditionMaximum(tier: any) {
  const condition = (Array.isArray(tier?.conditions) ? tier.conditions : []).find((candidate: any) => {
    const type = String(candidate?.type ?? "").toLowerCase();
    const operator = String(candidate?.condition ?? candidate?.operator ?? "").toLowerCase();
    return type === "quantity" && (operator.includes("lessthanorequal") || operator.includes("maximum") || operator === "lte");
  });
  return condition?.value;
}

function normalizeMaxQuantity(tier: any, fallback: unknown = 1) {
  return positiveInteger(tier?.maxQuantity ?? tier?.quantity?.max ?? conditionMaximum(tier), positiveInteger(fallback));
}

function variantTitle(product: any, variant: any) {
  const title = String(variant?.variantTitle ?? variant?.title ?? "").trim();
  const productTitle = String(product?.title ?? product?.name ?? "").trim();
  if (!title || title === "Default Title") return productTitle;
  return productTitle ? `${productTitle} - ${title}` : title;
}

function collectVariants(products: any[]): CheckoutOfferVariant[] {
  const variants = new Map<string, CheckoutOfferVariant>();
  for (const product of products) {
    const productTitle = String(product?.title ?? product?.name ?? "").trim();
    const imageUrl = product?.imageUrl ?? product?.image?.url ?? product?.images?.[0]?.originalSrc ?? null;
    for (const variant of Array.isArray(product?.variants) ? product.variants : []) {
      const id = normalizeProductVariantGid(
        variant?.variantGraphqlId ?? variant?.graphqlId ?? variant?.id ?? variant?.variantId,
      );
      if (!id || variants.has(id)) continue;
      variants.set(id, {
        id,
        title: variantTitle(product, variant) || id.split("/").pop() || id,
        productTitle: productTitle || undefined,
        imageUrl: variant?.imageUrl ?? variant?.image?.url ?? imageUrl,
      });
    }
  }
  return [...variants.values()];
}

function fpbOffers(bundle: any): CheckoutOffer[] {
  const addonProducts = bundle?.personalizationData?.addonProducts;
  if (!addonProducts || addonProducts.isEnabled !== true) return [];
  return (Array.isArray(addonProducts.tiers) ? addonProducts.tiers : []).flatMap((tier: any, index: number) => {
    const tierId = String(tier?.tierId ?? `tier-${index + 1}`);
    const variants = collectVariants(Array.isArray(tier?.selectedAddonProducts) ? tier.selectedAddonProducts : []);
    if (variants.length === 0) return [];
    const discount = normalizeDiscount(tier?.discount ?? tier, tier?.displayFree === true);
    return [{
      key: `fpb:${tierId}`,
      groupKey: "fpb:addons",
      tierId,
      kind: discount?.value === 100 ? "gift" as const : "addon" as const,
      title: String(tier?.title ?? addonProducts.title ?? ""),
      maxQuantity: normalizeMaxQuantity(tier),
      eligibility: normalizeEligibility(tier?.eligibilityCondition ?? tier),
      discount,
      variants,
    }];
  });
}

function ppbOffers(bundle: any): CheckoutOffer[] {
  return (Array.isArray(bundle?.steps) ? bundle.steps : []).flatMap((step: any) => {
    if (step?.isFreeGift !== true || step?.enabled === false) return [];
    const products = [
      ...(Array.isArray(step?.StepProduct) ? step.StepProduct : []),
      ...(Array.isArray(step?.products) ? step.products : []),
    ];
    const variants = collectVariants(products);
    if (variants.length === 0) return [];
    const tiers = Array.isArray(step?.addonTiers) && step.addonTiers.length > 0
      ? step.addonTiers
      : [{ tierId: "default", displayFree: step?.addonDisplayFree === true }];
    return tiers.map((tier: any, index: number) => {
      const tierId = String(tier?.tierId ?? `tier-${index + 1}`);
      const discount = normalizeDiscount(tier?.discount ?? tier, tier?.displayFree === true || step?.addonDisplayFree === true);
      return {
        key: `ppb:${step.id}:${tierId}`,
        groupKey: `ppb:${step.id}`,
        tierId,
        kind: discount?.value === 100 ? "gift" as const : "addon" as const,
        title: String(tier?.title ?? step?.addonTitle ?? step?.freeGiftName ?? step?.name ?? ""),
        maxQuantity: normalizeMaxQuantity(tier, step?.maxQuantity),
        eligibility: normalizeEligibility(tier?.eligibilityCondition ?? {
          type: step?.conditionType,
          value: step?.conditionValue,
        }),
        discount,
        variants,
      };
    });
  });
}

export function buildCheckoutOfferRuntime(bundle: any): CheckoutOfferRuntime {
  if (String(bundle?.status ?? "").toUpperCase() !== "ACTIVE") return { offers: [] };
  const bundleType = String(bundle?.bundleType ?? "").toLowerCase();
  return { offers: bundleType === "full_page" ? fpbOffers(bundle) : ppbOffers(bundle) };
}

function cachedComponentProducts(bundle: any) {
  return (Array.isArray(bundle?.steps) ? bundle.steps : []).flatMap((step: any) => [
    ...(Array.isArray(step?.StepProduct) ? step.StepProduct : []),
    ...(Array.isArray(step?.products) ? step.products : []),
    ...(Array.isArray(step?.StepCategory) ? step.StepCategory : []).flatMap(
      (category: any) => Array.isArray(category?.products) ? category.products : [],
    ),
  ]);
}

export function calculateCheckoutOfferSelectionAmount(
  bundle: any,
  payload: Pick<RuntimeTokenPayload, "components">,
) {
  const prices = new Map<string, number>();
  for (const product of cachedComponentProducts(bundle)) {
    for (const variant of Array.isArray(product?.variants) ? product.variants : []) {
      const id = normalizeProductVariantGid(
        variant?.variantGraphqlId ?? variant?.graphqlId ?? variant?.id ?? variant?.variantId,
      );
      const price = variant?.priceCents !== undefined
        ? Number(variant.priceCents) / 100
        : Number(variant?.price);
      if (id && Number.isFinite(price) && price >= 0) prices.set(id, price);
    }
  }
  return payload.components.reduce(
    (sum, component) => sum + (prices.get(component.variantId) ?? 0) * component.quantity,
    0,
  );
}

export function resolveActiveCheckoutOffer(
  offers: CheckoutOffer[],
  requestedKey: string,
  payload: Pick<RuntimeTokenPayload, "components">,
  amount = 0,
) {
  const requested = offers.find((offer) => offer.key === requestedKey);
  if (!requested) return null;
  const componentQuantity = payload.components.reduce((sum, line) => sum + line.quantity, 0);
  const eligible = offers
    .filter((offer) => offer.groupKey === requested.groupKey)
    .filter((offer) => (offer.eligibility.type === "AMOUNT" ? amount : componentQuantity) >= offer.eligibility.value)
    .sort((a, b) => a.eligibility.value - b.eligibility.value);
  const active = eligible[eligible.length - 1];
  return active?.key === requestedKey ? active : null;
}
