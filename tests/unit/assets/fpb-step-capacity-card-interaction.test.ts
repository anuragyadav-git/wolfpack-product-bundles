export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageProductGridMethods } = require('../../../app/assets/widgets/full-page/methods/product-grid-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ConditionValidator } = require('../../../app/assets/widgets/shared/condition-validator.js');

class FakeGrid {
  className = '';
  innerHTML = '';
  children: unknown[] = [];

  appendChild(child: unknown) {
    this.children.push(child);
    return child;
  }
}

describe('FPB completed-step product card interaction', () => {
  beforeEach(() => {
    global.document = {
      createElement: () => new FakeGrid(),
    } as unknown as Document;
  });

  it('keeps every product card available when revisiting a step whose exact quantity is met', () => {
    const capacitySpy = jest.spyOn(ConditionValidator, 'canUpdateQuantity');
    const products = [
      { selectionId: 'product-a' },
      { selectionId: 'product-b' },
      { selectionId: 'product-c' },
    ];
    const createProductCard = jest.fn((product) => ({ product }));
    const context = {
      selectedBundle: {
        steps: [{
          conditionType: 'quantity',
          conditionOperator: 'equal_to',
          conditionValue: 2,
        }],
      },
      selectedProducts: [{ 'product-a': 1, 'product-b': 1 }],
      stepProductData: [products],
      activeCollectionId: null,
      searchQuery: '',
      getActiveStepCategoryEntry: () => null,
      shouldDisplayVariantsAsIndividualForProductGrid: () => false,
      expandProductsByVariant: (items) => items,
      createProductCard,
    };

    const grid = fullPageProductGridMethods.createFullPageProductGrid.call(context, 0) as FakeGrid;

    expect(createProductCard).toHaveBeenCalledTimes(3);
    expect(grid.children).toHaveLength(3);
    expect(capacitySpy).not.toHaveBeenCalled();

    capacitySpy.mockRestore();
  });
});
