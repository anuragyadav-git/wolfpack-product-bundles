// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  VariantSelectorComponent,
  getStandardMobileDrawerContract,
} = require('../../../app/assets/widgets/shared/variant-selector.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  dispatchProductPageVariantSelection,
} = require('../../../app/assets/widgets/product-page/methods/modal-methods.js');

describe('PPB mobile variant drawer behavior', () => {
  it('uses the PPB gesture-led dismissal contract without an Apply action', () => {
    expect(getStandardMobileDrawerContract({ isPpbOwned: true })).toEqual({
      closeControl: 'handle',
      dismissOnBackdrop: true,
      dismissOnEscape: true,
      dismissOnSelection: true,
      showApplyAction: false,
    });
  });

  it('keeps the shared non-PPB close-control contract unchanged', () => {
    expect(getStandardMobileDrawerContract({ isPpbOwned: false }).closeControl).toBe('cross');
  });

  it('commits an available variant immediately', () => {
    const selected = {
      setAttribute: jest.fn(),
      querySelector: jest.fn(() => ({ textContent: '' })),
    };
    const panel = { hidden: false };
    const wrapper = {
      querySelector: jest.fn((selector: string) => (
        selector === '.vs-selected' ? selected : panel
      )),
    };
    const option = {
      closest: jest.fn(() => wrapper),
      dataset: { variantId: 'variant-2', primaryValue: 'Large' },
      textContent: 'Large',
    };
    const product = {
      variantId: 'variant-1',
      price: 2500,
      variants: [
        { id: 'variant-1', title: 'Small', price: 2500, available: true },
        { id: 'variant-2', title: 'Large', price: 2700, available: true },
      ],
    };
    const onVariantChange = jest.fn();

    VariantSelectorComponent._selectStandardOption({}, product, option, onVariantChange);

    expect(product.variantId).toBe('variant-2');
    expect(product.price).toBe(2700);
    expect(onVariantChange).toHaveBeenCalledWith('variant-2', 'variant-1');
  });

  it('routes a mobile choice through the existing PPB variant-change owner', () => {
    const product = { variantId: 'variant-2' };
    const select = { value: '', dispatchEvent: jest.fn() };

    dispatchProductPageVariantSelection({
      product,
      select,
      oldVariantId: 'variant-1',
      newVariantId: 'variant-2',
      createEvent: () => ({ type: 'change' }),
    });

    expect(product.variantId).toBe('variant-1');
    expect(select.value).toBe('variant-2');
    expect(select.dispatchEvent).toHaveBeenCalledWith({ type: 'change' });
  });
});
