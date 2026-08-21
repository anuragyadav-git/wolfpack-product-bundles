import {
  createProductPageProductModal,
} from '../../../app/assets/bundle-widget-product-page';

describe('PPB product-details ownership', () => {
  it('constructs the shared product-details owner with the PPB widget instance', () => {
    const widget = { container: {} };
    const Modal = jest.fn(function Modal(this: any, receivedWidget: any) {
      this.widget = receivedWidget;
    });

    const modal = createProductPageProductModal(widget, Modal as any);

    expect(Modal).toHaveBeenCalledWith(widget, { drawerOwner: 'ppb' });
    expect(modal.widget).toBe(widget);
  });
});
