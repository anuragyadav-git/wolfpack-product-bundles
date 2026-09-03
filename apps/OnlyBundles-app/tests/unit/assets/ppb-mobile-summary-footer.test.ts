// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getCascadeSummaryPillContent } = require('../../../app/assets/widgets/product-page/templates/cascade-summary.js');

describe('PPB mobile summary footer content', () => {
  it('shows a zero quantity and payable total for an empty selection', () => {
    expect(getCascadeSummaryPillContent({
      selectedQuantity: 0,
      totalPriceText: '$0.00',
      finalPriceText: '$0.00',
      hasDiscount: false,
    })).toEqual({
      selectedQuantity: 0,
      finalPriceText: '$0.00',
      compareAtPriceText: '',
    });
  });

  it('preserves summed selected quantity without a redundant compare-at total', () => {
    expect(getCascadeSummaryPillContent({
      selectedQuantity: 3,
      totalPriceText: '$1,158.00',
      finalPriceText: '$1,158.00',
      hasDiscount: false,
    })).toEqual({
      selectedQuantity: 3,
      finalPriceText: '$1,158.00',
      compareAtPriceText: '',
    });
  });

  it('returns the retail total as compare-at content when a discount changes the payable total', () => {
    expect(getCascadeSummaryPillContent({
      selectedQuantity: 2,
      totalPriceText: '₹1,448',
      finalPriceText: '₹1,375.60',
      hasDiscount: true,
    })).toEqual({
      selectedQuantity: 2,
      finalPriceText: '₹1,375.60',
      compareAtPriceText: '₹1,448',
    });
  });

  it('omits compare-at content when rounded formatted totals are identical', () => {
    expect(getCascadeSummaryPillContent({
      selectedQuantity: 2,
      totalPriceText: '$10.00',
      finalPriceText: '$10.00',
      hasDiscount: true,
    }).compareAtPriceText).toBe('');
  });
});
