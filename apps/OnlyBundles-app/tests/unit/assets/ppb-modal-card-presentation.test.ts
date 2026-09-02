import {
  resolvePpbModalCardPresentation,
} from '../../../app/assets/widgets/product-page/ppb-modal-card-presentation';

describe('PPB modal card presentation', () => {
  it.each([
    [{ quantity: 0, validation: null }, { mode: 'add', quantity: 0 }],
    [{ quantity: 1, validation: { isEnabled: false, allowedQuantity: 1 } }, { mode: 'quantity', quantity: 1 }],
    [{ quantity: 1, validation: { isEnabled: true, allowedQuantity: 3 } }, { mode: 'quantity', quantity: 1 }],
    [{ quantity: 1, validation: { isEnabled: true, allowedQuantity: 1 } }, { mode: 'maximum-reached', quantity: 1 }],
    [{ quantity: 3, validation: { isEnabled: true, allowedQuantity: 3 } }, { mode: 'maximum-reached', quantity: 3 }],
  ])('resolves %o to %o', (input, expected) => {
    expect(resolvePpbModalCardPresentation(input)).toEqual(expected);
  });

  it('does not treat malformed or disabled limits as maximum-reached', () => {
    expect(resolvePpbModalCardPresentation({
      quantity: 2,
      validation: { isEnabled: true, allowedQuantity: 0 },
    })).toEqual({ mode: 'quantity', quantity: 2 });
  });
});
