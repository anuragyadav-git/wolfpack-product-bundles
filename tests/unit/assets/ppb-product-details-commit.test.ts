import {
  BundleProductModal,
  resolveBundleProductModalActionText,
} from '../../../app/assets/bundle-modal-component';
import { JSDOM } from 'jsdom';

describe('PPB product-details commit', () => {
  it('creates the PPB-owned details surface as a labelled modal dialog', () => {
    const modal = Object.create(BundleProductModal.prototype) as any;
    modal.isPpbOwned = true;
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const originalDocument = global.document;
    global.document = dom.window.document;

    try {
      modal.createModalHTML();
    } finally {
      global.document = originalDocument;
    }

    const rendered = dom.window.document.getElementById('bundle-product-modal');
    expect(rendered?.getAttribute('role')).toBe('dialog');
    expect(rendered?.getAttribute('aria-modal')).toBe('true');
    expect(rendered?.getAttribute('aria-labelledby')).toBe('modal-product-title');
    expect(rendered?.textContent).toContain('Quantity');
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
