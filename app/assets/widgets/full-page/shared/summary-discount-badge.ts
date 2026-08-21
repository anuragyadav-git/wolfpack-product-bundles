export function getSummaryDiscountBadgeLabel(discountInfo: any = {}, formattedDiscountAmount = '') {
  if (discountInfo.hasDiscount !== true) return '';

  if (
    String(discountInfo.discountMethod || '').toLowerCase() === 'fixed_amount_off'
    && typeof formattedDiscountAmount === 'string'
    && formattedDiscountAmount.trim()
  ) {
    return `${formattedDiscountAmount.trim()} off`;
  }

  const discountPercentage = Number(discountInfo.discountPercentage);
  if (!Number.isFinite(discountPercentage)) return '';

  const roundedPercentage = Math.round(discountPercentage);
  return roundedPercentage > 0 ? `${roundedPercentage}% off` : '';
}
