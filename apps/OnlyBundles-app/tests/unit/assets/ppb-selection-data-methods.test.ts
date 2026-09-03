export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageSelectionDataMethods } = require(
  '../../../app/assets/widgets/product-page/methods/selection-data-methods.js'
);

describe('PPB selection data methods', () => {
  it('deletes a zero-quantity selection and its category ownership before persisting', () => {
    const persistSessionSelections = jest.fn();
    const context = {
      selectedProducts: [{ '48720141091075': 1 }],
      selectedProductCategoryIndexes: [{ '48720141091075': 0 }],
      activeInpageCategoryIndexes: { 0: 0 },
      extractId: ProductPageSelectionDataMethods.extractId,
      normalizeSelectionKey: ProductPageSelectionDataMethods.normalizeSelectionKey,
      _persistSessionSelections: persistSessionSelections,
    };

    ProductPageSelectionDataMethods.setSelectedQuantity.call(
      context,
      0,
      'gid://shopify/ProductVariant/48720141091075',
      0,
    );

    expect(context.selectedProducts).toEqual([{}]);
    expect(context.selectedProductCategoryIndexes).toEqual([{}]);
    expect(persistSessionSelections).toHaveBeenCalledTimes(1);
  });
});
