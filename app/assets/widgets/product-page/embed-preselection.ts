function normalize(value: unknown): string {
  const raw = String(value ?? "").trim();
  return raw.includes("/") ? raw.split("/").pop() ?? "" : raw;
}

export function applyBrowsedProductPreselection(
  controller: any,
  enabled: boolean,
  restoredSelections: boolean,
): boolean {
  if (!enabled || restoredSelections) {
    return false;
  }
  const productId = normalize(controller.config?.currentProductId);
  const variantId = normalize(controller.config?.selectedVariantId);
  if (!productId || !variantId) return false;
  for (let stepIndex = 0; stepIndex < (controller.selectedBundle?.steps?.length ?? 0); stepIndex += 1) {
    if (controller.selectedBundle.steps[stepIndex]?.enabled === false) continue;
    let matchedSelectionKey = "";
    const product = (controller.stepProductData?.[stepIndex] ?? []).find((candidate: any) => {
      const candidateProductId = normalize(
        candidate?.parentProductId ?? candidate?.productId ?? candidate?.id,
      );
      if (candidateProductId !== productId) return false;
      const variant = Array.isArray(candidate?.variants)
        ? candidate.variants.find(
            (item: any) =>
              normalize(item?.selectionId ?? item?.id) === variantId &&
              item?.available !== false,
          )
        : null;
      const directVariantId = normalize(
        candidate?.selectionId ?? candidate?.variantId ?? candidate?.id,
      );
      if (variant) {
        matchedSelectionKey = variantId;
        return true;
      }
      if (directVariantId === variantId && candidate?.available !== false) {
        matchedSelectionKey = variantId;
        return true;
      }
      return false;
    });
    if (!product) continue;
    const selectionKey = controller.normalizeSelectionKey(
      matchedSelectionKey || product.selectionId || product.variantId || variantId,
    );
    controller.setSelectedQuantity(stepIndex, selectionKey, 1);
    return true;
  }
  return false;
}
