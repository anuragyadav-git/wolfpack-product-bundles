import {
  BundleProductModal,
  resolveBundleProductModalActionText,
} from '../../../app/assets/bundle-modal-component';

describe('PPB product-details commit', () => {
  it('creates the PPB-owned details surface as a labelled modal dialog', () => {
    const modal = Object.create(BundleProductModal.prototype) as any;
    modal.isPpbOwned = true;
    let renderedHtml = '';
    const originalDocument = global.document;
    global.document = {
      body: {
        insertAdjacentHTML: (_position: string, html: string) => {
          renderedHtml = html;
        },
      },
      getElementById: () => ({}),
    } as unknown as Document;

    try {
      modal.createModalHTML();
    } finally {
      global.document = originalDocument;
    }

    expect(renderedHtml).toContain('role="dialog"');
    expect(renderedHtml).toContain('aria-modal="true"');
    expect(renderedHtml).toContain('aria-labelledby="modal-product-title"');
    expect(renderedHtml).toContain('<span class="bundle-modal-quantity-label">Quantity</span>');
  });

  it('uses the localized product-details action for add and update states', () => {
    const resolveText = jest.fn((key: string) => ({
      productCardAddButton: 'Pick product',
      productDetailsUpdateButton: 'Update selection',
    }[key]));

    expect(resolveBundleProductModalActionText({
      originalSelectionKey: '',
      resolveText,
    })).toEqual({ action: 'add', text: 'Pick product' });
    expect(resolveBundleProductModalActionText({
      originalSelectionKey: 'variant-1',
      resolveText,
    })).toEqual({ action: 'update', text: 'Update selection' });
  });

  it('updates a changed variant through the originating selection target in one mutation', () => {
    const updateProductSelection = jest.fn();
    const modal = Object.create(BundleProductModal.prototype) as any;
    modal.isPpbOwned = true;
    modal.readOnly = false;
    modal.currentProduct = { id: 'product-1', variantId: 'variant-1', available: true };
    modal.currentStep = { id: 'step-1' };
    modal.selectedVariant = { id: 'variant-2', available: true };
    modal.selectedQuantity = 3;
    modal.originalSelectionKey = 'variant-1';
    modal.widget = {
      selectedBundle: { steps: [{ id: 'step-1' }] },
      updateProductSelection,
      _modalSlotReplacementTarget: null,
    };
    modal.close = jest.fn();
    modal.showSuccessFeedback = jest.fn();

    modal.addToBundle();

    expect(modal.widget._modalSlotReplacementTarget).toEqual({
      stepIndex: 0,
      selectionKey: 'variant-1',
    });
    expect(updateProductSelection).toHaveBeenCalledTimes(1);
    expect(updateProductSelection).toHaveBeenCalledWith(0, 'variant-2', 3);
  });
});
