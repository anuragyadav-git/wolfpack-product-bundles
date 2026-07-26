export function getSummaryDiscountBadgeLabel(discountInfo = {}) {
  if (discountInfo.hasDiscount !== true) return '';

  const discountPercentage = Number(discountInfo.discountPercentage);
  if (!Number.isFinite(discountPercentage)) return '';

  const roundedPercentage = Math.round(discountPercentage);
  return roundedPercentage > 0 ? `${roundedPercentage}% off` : '';
}
