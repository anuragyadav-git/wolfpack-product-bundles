export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getSummaryDiscountBadgeLabel } = require(
  '../../../app/assets/widgets/full-page/shared/summary-discount-badge.js'
);

describe('FPB summary discount badge', () => {
  it('renders the canonical rounded pricing percentage', () => {
    expect(getSummaryDiscountBadgeLabel({
      hasDiscount: true,
      discountPercentage: 13.812154696132596,
    })).toBe('14% off');
  });

  it.each([
    { hasDiscount: false, discountPercentage: 14 },
    { hasDiscount: true, discountPercentage: 0 },
    { hasDiscount: true },
  ])('does not render without a positive canonical discount percentage', (discountInfo) => {
    expect(getSummaryDiscountBadgeLabel(discountInfo)).toBe('');
  });
});
