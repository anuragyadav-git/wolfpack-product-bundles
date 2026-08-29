export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  fullPageProductGridMethods,
} = require('../../../app/assets/widgets/full-page/methods/product-grid-methods.js');

describe('FPB product loading screen behavior', () => {
  function createContainer() {
    return {
      innerHTML: 'stale',
      replaceChildren() {
        this.innerHTML = '';
      },
    };
  }

  function createWidget(preset: string) {
    return {
      getFullPageDesignPreset: jest.fn(() => preset),
      showLoadingOverlay: jest.fn(),
      shouldUseProductGridSpinnerOnly: fullPageProductGridMethods.shouldUseProductGridSpinnerOnly,
      createProductGridLoadingState: fullPageProductGridMethods.createProductGridLoadingState,
      renderProductGridLoadingState: fullPageProductGridMethods.renderProductGridLoadingState,
    };
  }

  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'keeps %s product loading screen-only until product data is populated',
    (preset) => {
    const widget = createWidget(preset);
    const container = createContainer();

    widget.renderProductGridLoadingState.call(widget, container);

    expect(container.innerHTML.length).toBe(0);
    expect(widget.showLoadingOverlay).toHaveBeenCalledWith();
    },
  );
});
