export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getRemainingSummarySkeletonCount } = require('../../../app/assets/widgets/full-page/methods/side-panel-methods.js');

describe('FPB Compact and Horizontal summary row skeleton count', () => {
  it.each(['COMPACT', 'HORIZONTAL'])(
    'keeps one remaining row for a partial %s summary when Product Slots is disabled',
    (designPreset) => {
      expect(getRemainingSummarySkeletonCount({
        designPreset,
        productSlotsEnabled: false,
        requiredQuantity: 2,
        selectedQuantity: 1,
      })).toBe(1);
    },
  );

  it('does not add row skeletons when Product Slots is enabled', () => {
    expect(getRemainingSummarySkeletonCount({
      designPreset: 'HORIZONTAL',
      productSlotsEnabled: true,
      requiredQuantity: 2,
      selectedQuantity: 1,
    })).toBe(0);
  });

  it.each(['STANDARD', 'CLASSIC'])(
    'does not change the existing %s summary branch',
    (designPreset) => {
      expect(getRemainingSummarySkeletonCount({
        designPreset,
        productSlotsEnabled: false,
        requiredQuantity: 2,
        selectedQuantity: 1,
      })).toBe(0);
    },
  );

  it('does not add rows after the required quantity is met or exceeded', () => {
    expect(getRemainingSummarySkeletonCount({
      designPreset: 'COMPACT',
      productSlotsEnabled: false,
      requiredQuantity: 2,
      selectedQuantity: 3,
    })).toBe(0);
  });
});
