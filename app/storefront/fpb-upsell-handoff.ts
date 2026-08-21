export const FPB_UPSELL_HANDOFF_TTL_MS = 10 * 60 * 1000;

export type FpbUpsellHandoff = {
  version: 1;
  bundleId: string;
  productId: string;
  variantId: string;
  productHandle: string;
  collectionIds: string[];
  createdAt: number;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function fpbUpsellHandoffKey(bundleId: string) {
  return `wpb:fpb-upsell-handoff:${bundleId}`;
}

function transportId(value: unknown) {
  const raw = String(value ?? "").trim();
  return raw.includes("/") ? (raw.split("/").pop() ?? "") : raw;
}

export function createFpbUpsellHandoff(
  storage: StorageLike,
  input: Omit<FpbUpsellHandoff, "version" | "createdAt">,
  now = Date.now(),
) {
  const payload: FpbUpsellHandoff = { version: 1, ...input, createdAt: now };
  storage.setItem(fpbUpsellHandoffKey(input.bundleId), JSON.stringify(payload));
  return payload;
}

export function consumeFpbUpsellHandoff(storage: StorageLike, bundleId: string, now = Date.now()) {
  const key = fpbUpsellHandoffKey(bundleId);
  const raw = storage.getItem(key);
  storage.removeItem(key);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as FpbUpsellHandoff;
    if (payload.version !== 1 || payload.bundleId !== bundleId) return null;
    if (!payload.productId || !payload.variantId || !payload.productHandle) return null;
    if (!Number.isFinite(payload.createdAt) || now - payload.createdAt > FPB_UPSELL_HANDOFF_TTL_MS || payload.createdAt > now) return null;
    return payload;
  } catch {
    return null;
  }
}

function isSelectable(variant: Record<string, any>) {
  if (variant.available === false || variant.availableForSale === false) return false;
  if (variant.quantityAvailable === 0 && variant.currentlyNotInStock !== true) return false;
  return true;
}

function findExactVariant(products: Record<string, any>[], productId: string, variantId: string) {
  for (const product of products) {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const productMatches = [product.productId, product.parentProductId, product.graphqlId, product.id]
      .some((candidate) => transportId(candidate) === transportId(productId));
    const directSelectionMatches = transportId(product.selectionId ?? product.variantId) === transportId(variantId);
    if (productMatches && directSelectionMatches && isSelectable(product)) {
      return String(product.selectionId ?? product.variantId);
    }
    if (!productMatches) continue;
    const variant = variants.find((candidate: Record<string, any>) =>
      [candidate.selectionId, candidate.variantId, candidate.variantGraphqlId, candidate.graphqlId, candidate.id]
        .some((value) => transportId(value) === transportId(variantId)) && isSelectable(candidate),
    );
    if (variant) return String(variant.selectionId ?? variant.variantId ?? variant.variantGraphqlId ?? variant.graphqlId ?? variant.id);
  }
  return null;
}

export function reconcileFpbUpsellHandoff(input: {
  bundleId: string;
  payload: FpbUpsellHandoff | null;
  steps: Record<string, any>[];
  stepProductData: Record<string, any>[][];
  selectedProducts: Array<Record<string, number>>;
}) {
  if (!input.payload || input.payload.bundleId !== input.bundleId) return { matched: false, stepIndex: null, changed: false };
  const orderedIndexes = input.steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }: any) => step.enabled !== false && step.isFreeGift !== true)
    .sort((a, b) => Number(a.step.position ?? a.index) - Number(b.step.position ?? b.index));
  for (const { index } of orderedIndexes) {
    const selectionId = findExactVariant(input.stepProductData[index] ?? [], input.payload.productId, input.payload.variantId);
    if (!selectionId) continue;
    input.selectedProducts[index] ??= {};
    if ((input.selectedProducts[index][selectionId] ?? 0) > 0) return { matched: true, stepIndex: index, changed: false };
    input.selectedProducts[index][selectionId] = 1;
    return { matched: true, stepIndex: index, changed: true };
  }
  return { matched: false, stepIndex: null, changed: false };
}
