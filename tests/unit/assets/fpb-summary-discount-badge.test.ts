export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

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

  it('renders the formatted savings amount for fixed amount discounts', () => {
    expect(getSummaryDiscountBadgeLabel({
      hasDiscount: true,
      discountMethod: 'fixed_amount_off',
      discountAmount: 1500,
      discountPercentage: 1.8094089264173703,
    }, '$15.00')).toBe('$15.00 off');
  });

  it.each([
    { hasDiscount: false, discountPercentage: 14 },
    { hasDiscount: true, discountPercentage: 0 },
    { hasDiscount: true },
  ])('does not render without a positive canonical discount percentage', (discountInfo) => {
    expect(getSummaryDiscountBadgeLabel(discountInfo)).toBe('');
  });

  it('ships the formatter in the generated full-page widget before its consumers', () => {
    const bundledSource = fs.readFileSync(
      path.join(
        process.cwd(),
        'extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js'
      ),
      'utf8'
    );
    const definitionIndex = bundledSource.indexOf(
      'function getSummaryDiscountBadgeLabel'
    );
    const firstUseIndex = bundledSource.indexOf(
      'getSummaryDiscountBadgeLabel('
    );

    expect(definitionIndex).toBeGreaterThanOrEqual(0);
    expect(firstUseIndex).toBeGreaterThan(definitionIndex);
  });
});
