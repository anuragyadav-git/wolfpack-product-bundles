export interface CascadeSummaryPillInput {
  selectedQuantity: number;
  totalPriceText: string;
  finalPriceText: string;
  hasDiscount: boolean;
}

export interface CascadeSummaryPillContent {
  selectedQuantity: number;
  finalPriceText: string;
  compareAtPriceText: string;
}

export function getCascadeSummaryPillContent({
  selectedQuantity,
  totalPriceText,
  finalPriceText,
  hasDiscount,
}: CascadeSummaryPillInput): CascadeSummaryPillContent {
  const normalizedQuantity = Math.max(0, Math.floor(Number(selectedQuantity) || 0));
  const normalizedFinalPrice = String(finalPriceText || totalPriceText || '');
  const normalizedTotalPrice = String(totalPriceText || '');
  const compareAtPriceText = hasDiscount
    && normalizedTotalPrice
    && normalizedTotalPrice !== normalizedFinalPrice
    ? normalizedTotalPrice
    : '';

  return {
    selectedQuantity: normalizedQuantity,
    finalPriceText: normalizedFinalPrice,
    compareAtPriceText,
  };
}
