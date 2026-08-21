import {
  resolvePpbModalCardPresentation,
  resolvePpbDetailsCommit,
  resolvePpbModalCardActivation,
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

describe('PPB modal card activation', () => {
  it.each([
    ['image', 'details'],
    ['add', 'add'],
    ['maximum-reached', 'remove-all'],
    ['title', 'none'],
    ['background', 'none'],
    ['variant', 'none'],
  ])('maps %s activation to %s', (target, expected) => {
    expect(resolvePpbModalCardActivation(target)).toBe(expected);
  });
});

describe('PPB product-details commit resolution', () => {
  it('adds a new selection to the originating step', () => {
    expect(resolvePpbDetailsCommit({
      stepIndex: 1,
      originalSelectionKey: '',
      nextSelectionKey: 'variant-2',
      quantity: 2,
    })).toEqual({
      stepIndex: 1,
      removeSelectionKey: '',
      nextSelectionKey: 'variant-2',
      quantity: 2,
      action: 'add',
    });
  });

  it('updates a changed variant in place without retaining the original selection', () => {
    expect(resolvePpbDetailsCommit({
      stepIndex: 0,
      originalSelectionKey: 'variant-1',
      nextSelectionKey: 'variant-2',
      quantity: 3,
    })).toEqual({
      stepIndex: 0,
      removeSelectionKey: 'variant-1',
      nextSelectionKey: 'variant-2',
      quantity: 3,
      action: 'update',
    });
  });
});
