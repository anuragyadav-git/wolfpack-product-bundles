import { ProductPageSelectionMethods } from '../../../app/assets/widgets/product-page/methods/selection-methods.js';

describe('PPB modal slot selection refresh', () => {
  it('refreshes the shared slot shell immediately after a modal selection changes', () => {
    const context = {
      ...ProductPageSelectionMethods,
      selectedBundle: {
        validateQuantityPerProduct: null,
        steps: [{}],
      },
      selectedProducts: [{}],
      stepProductData: [[{
        id: 'gid://shopify/Product/9001',
        parentProductId: 'gid://shopify/Product/9001',
        variantId: 'gid://shopify/ProductVariant/7001',
      }]],
      normalizeSelectionKey: jest.fn((value: string) => value),
      _getDirectDefaultRequiredQuantity: jest.fn(() => null),
      getVariantAvailable: jest.fn(() => ({ available: null, outOfStock: false })),
      getSelectedQuantity: jest.fn(() => 0),
      validateStepCondition: jest.fn(() => true),
      setSelectedQuantity: jest.fn(function setSelectedQuantity(stepIndex: number, selectionKey: string, quantity: number) {
        this.selectedProducts[stepIndex][selectionKey] = quantity;
      }),
      updateProductQuantityDisplay: jest.fn(),
      _isProductPageModalSlotTemplate: jest.fn(() => true),
      renderSteps: jest.fn(),
      _renderDirectDefaultProducts: jest.fn(),
      renderModalTabs: jest.fn(),
      updateModalNavigation: jest.fn(),
      updateModalFooterMessaging: jest.fn(),
      updateAddToCartButton: jest.fn(),
      updateFooterMessaging: jest.fn(),
      _syncFreeGiftSlotCard: jest.fn(),
      findProductBySelectionKey: jest.fn(() => ({
        parentProductId: 'gid://shopify/Product/9001',
      })),
      _usesCascadeStepFlow: jest.fn(() => false),
      _autoProgressBottomSheet: jest.fn(),
      _maybeAutoAddAfterLastStep: jest.fn(),
    } as any;

    context.updateProductSelection(0, 'gid://shopify/ProductVariant/7001', 1);

    expect(context.renderSteps).toHaveBeenCalledTimes(1);
  });
});
