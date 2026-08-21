import { resolveModalFooterSummaryState } from '../../../app/assets/widgets/product-page/methods/modal-state-methods';

describe('PPB modal footer summary state', () => {
  it('removes the summary pill when the last selected product is removed', () => {
    expect(resolveModalFooterSummaryState({ totalQuantity: 0 })).toEqual({
      hidden: true,
      quantityText: '',
    });
  });

  it('shows the selected quantity while the bundle has products', () => {
    expect(resolveModalFooterSummaryState({ totalQuantity: 3 })).toEqual({
      hidden: false,
      quantityText: '3',
    });
  });
});
