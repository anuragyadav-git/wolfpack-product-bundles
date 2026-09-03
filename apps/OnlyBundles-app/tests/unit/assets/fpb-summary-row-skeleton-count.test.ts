export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getRemainingSummarySkeletonCount } = require('../../../app/assets/widgets/full-page/methods/side-panel-methods.js');

describe('FPB shared summary row skeleton count', () => {
  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
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

  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'uses two baseline rows for a new %s bundle without a quantity rule',
    (designPreset) => {
      expect(getRemainingSummarySkeletonCount({
        designPreset,
        productSlotsEnabled: false,
        requiredQuantity: 0,
        selectedQuantity: 0,
      })).toBe(2);
    },
  );

  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'does not add %s skeleton rows when Product Slots is enabled',
    (designPreset) => {
      expect(getRemainingSummarySkeletonCount({
        designPreset,
        productSlotsEnabled: true,
        requiredQuantity: 4,
        selectedQuantity: 1,
      })).toBe(0);
    },
  );

  it('uses a larger explicit quantity requirement as the target', () => {
    expect(getRemainingSummarySkeletonCount({
      designPreset: 'STANDARD',
      productSlotsEnabled: false,
      requiredQuantity: 4,
      selectedQuantity: 1,
    })).toBe(3);
  });

  it('does not add rows after the required quantity is met or exceeded', () => {
    expect(getRemainingSummarySkeletonCount({
      designPreset: 'COMPACT',
      productSlotsEnabled: false,
      requiredQuantity: 2,
      selectedQuantity: 3,
    })).toBe(0);
  });

  it('does not add rows for an unsupported template', () => {
    expect(getRemainingSummarySkeletonCount({
      designPreset: 'UNKNOWN',
      productSlotsEnabled: false,
      requiredQuantity: 0,
      selectedQuantity: 0,
    })).toBe(0);
  });
});
