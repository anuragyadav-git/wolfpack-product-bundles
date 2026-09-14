export {};

const {
  ProductPageSelectionMethods,
} = require('../../../app/assets/widgets/product-page/methods/selection-methods.js');
describe('PPB demand-driven product hydration', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('hydrates only the destination step during automatic progression', async () => {
    jest.useFakeTimers();
    const loadStepProducts = jest.fn().mockResolvedValue(undefined);
    const context = {
      ...ProductPageSelectionMethods,
      currentStepIndex: 0,
      selectedBundle: { steps: [{}, {}, {}] },
      selectedProducts: [{ selected: 1 }, {}, {}],
      elements: {
        modal: {
          querySelector: () => ({ textContent: '' }),
        },
      },
      validateStep: (stepIndex: number) => stepIndex === 0,
      renderModalTabs: jest.fn(),
      renderModalProductsLoading: jest.fn(),
      updateModalNavigation: jest.fn(),
      renderModalProducts: jest.fn(),
      updateModalFooterMessaging: jest.fn(),
      getFormattedHeaderText: () => 'Step 2',
      loadStepProducts,
    } as any;

    ProductPageSelectionMethods._autoProgressBottomSheet.call(context, 0);
    await jest.advanceTimersByTimeAsync(300);

    expect(context.currentStepIndex).toBe(1);
    expect(loadStepProducts).toHaveBeenCalledTimes(1);
    expect(loadStepProducts).toHaveBeenCalledWith(1);
  });
});
