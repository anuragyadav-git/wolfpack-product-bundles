import { createCloseIcon, createTrashIcon } from '../../shared/svg-icons.js';

const CLEAR_CART_CONFIRMATION_COPY: any = {
  title: 'Are you sure?',
  description: 'Are you sure you want to clear all items from your cart? This action cannot be undone...',
  cancel: 'Cancel',
  confirm: 'Clear Cart',
  mobileTitle: 'Clear all items?',
  mobileDescription: 'This will remove all selected products from your bundle.',
  mobileCancel: 'Go Back',
  mobileConfirm: 'Clear All',
};

export const fullPageClearCartConfirmationMethods: Record<string, any> & ThisType<any> = {
showClearCartConfirmation() {
  this.hideClearCartConfirmation?.();
  this._clearCartConfirmationFocusOrigin = document.activeElement;
  const mobileSummaryDialog = document.querySelector<HTMLDialogElement>('.fpb-mobile-summary-dialog');
  const usesMobileConfirmation = mobileSummaryDialog?.open === true;

  const modal = this.createClearCartConfirmationModal({ mobile: usesMobileConfirmation });
  this._clearCartConfirmationModal = modal;
  document.body.appendChild(modal);
  document.body.classList?.add('wpb-clear-cart-confirmation-open');

  if (usesMobileConfirmation) {
    this._clearCartConfirmationMobileSummaryDialog = mobileSummaryDialog;
    this._clearCartConfirmationMobileSummaryWasInert = mobileSummaryDialog.inert === true;
    mobileSummaryDialog.inert = true;
    mobileSummaryDialog.classList?.add('fpb-mobile-summary-dialog--confirmation-disabled');
    modal.showModal?.();
  }

  const keydownHandler = (event: any) => {
    if (event.key === 'Escape') {
      event.preventDefault?.();
      this.hideClearCartConfirmation();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = [
        modal.querySelector('.wpb-clear-cart-confirmation__close'),
        modal.querySelector('.wpb-clear-cart-confirmation__cancel'),
        modal.querySelector('.wpb-clear-cart-confirmation__confirm'),
      ].filter(Boolean);
      const activeIndex = focusable.indexOf(document.activeElement);
      const wrapsBackward = event.shiftKey && activeIndex === 0;
      const wrapsForward = !event.shiftKey && activeIndex === focusable.length - 1;

      if (wrapsBackward || wrapsForward) {
        event.preventDefault();
        focusable[wrapsBackward ? focusable.length - 1 : 0]?.focus();
      }
    }
  };
  this._clearCartConfirmationKeydownHandler = keydownHandler;
  document.addEventListener('keydown', keydownHandler);

  const cancelButton = modal.querySelector('.wpb-clear-cart-confirmation__cancel');
  if (typeof cancelButton?.focus === 'function') {
    cancelButton.focus();
  }
},

hideClearCartConfirmation({ restoreFocus = true }: any = {}) {
  const focusOrigin = this._clearCartConfirmationFocusOrigin;

  if (this._clearCartConfirmationModal) {
    if (this._clearCartConfirmationModal.open) {
      this._clearCartConfirmationModal.close?.();
    }
    this._clearCartConfirmationModal.remove();
    this._clearCartConfirmationModal = null;
  }

  if (this._clearCartConfirmationMobileSummaryDialog) {
    this._clearCartConfirmationMobileSummaryDialog.inert = this._clearCartConfirmationMobileSummaryWasInert === true;
    this._clearCartConfirmationMobileSummaryDialog.classList?.remove('fpb-mobile-summary-dialog--confirmation-disabled');
    this._clearCartConfirmationMobileSummaryDialog = null;
    this._clearCartConfirmationMobileSummaryWasInert = false;
  }

  if (this._clearCartConfirmationKeydownHandler) {
    document.removeEventListener('keydown', this._clearCartConfirmationKeydownHandler);
    this._clearCartConfirmationKeydownHandler = null;
  }

  document.body.classList?.remove('wpb-clear-cart-confirmation-open');

  this._clearCartConfirmationFocusOrigin = null;
  if (restoreFocus && typeof focusOrigin?.focus === 'function') {
    focusOrigin.focus();
  }
},

confirmClearCartSelection() {
  const focusOrigin = this._clearCartConfirmationFocusOrigin;
  this.hideClearCartConfirmation({ restoreFocus: false });
  this.clearFullPageSelections();

  const restoreFocus = () => {
    const focusTarget = document.querySelector<HTMLElement>('.fpb-mobile-summary-count-badge')
      || document.querySelector<HTMLElement>('.side-panel-btn-next');
    if (typeof focusTarget?.focus === 'function') {
      focusTarget.focus();
    } else if (typeof focusOrigin?.focus === 'function') {
      focusOrigin.focus();
    }
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(restoreFocus));
  } else {
    restoreFocus();
  }
},

clearFullPageSelections() {
  const steps = Array.isArray(this.selectedBundle?.steps) ? this.selectedBundle.steps : [];
  this.selectedProducts = steps.map((_: any, stepIndex: any) => ({
    ...this._getDirectDefaultSelectionQuantities(stepIndex),
  }));
  this.currentStepIndex = 0;
  this.searchQuery = '';
  this.activeCollectionId = null;
  this.compactMobileSummaryTrayExpanded = false;

  if (typeof this.reRenderFullPage === 'function') {
    this.reRenderFullPage();
  }
},

createClearCartConfirmationModal({ mobile = false }: any = {}) {
  const modal = document.createElement(mobile ? 'dialog' : 'div');
  modal.className = mobile
    ? 'wpb-clear-cart-confirmation wpb-clear-cart-confirmation--mobile'
    : 'wpb-clear-cart-confirmation';
  modal.setAttribute('data-wpb-clear-cart-mode', mobile ? 'mobile' : 'desktop');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'wpb-clear-cart-confirmation-title');
  modal.setAttribute('aria-describedby', 'wpb-clear-cart-confirmation-description');

  const container = document.createElement('div');
  container.className = 'wpb-clear-cart-confirmation__container';

  let closeButton: any = null;
  if (!mobile) {
    closeButton = document.createElement('button');
    closeButton.className = 'wpb-clear-cart-confirmation__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.appendChild(createCloseIcon(document));
    closeButton.addEventListener('click', () => this.hideClearCartConfirmation());
  }

  const content = document.createElement('div');
  content.className = 'wpb-clear-cart-confirmation__content';

  const title = document.createElement('h2');
  title.id = 'wpb-clear-cart-confirmation-title';
  title.className = 'wpb-clear-cart-confirmation__title';
  title.textContent = mobile
    ? this._resolveText?.('clearCartModalTitle', CLEAR_CART_CONFIRMATION_COPY.mobileTitle) ?? CLEAR_CART_CONFIRMATION_COPY.mobileTitle
    : this._resolveText?.('clearCartModalTitle', CLEAR_CART_CONFIRMATION_COPY.title) ?? CLEAR_CART_CONFIRMATION_COPY.title;

  const description = document.createElement('p');
  description.id = 'wpb-clear-cart-confirmation-description';
  description.className = 'wpb-clear-cart-confirmation__description';
  description.textContent = mobile
    ? this._resolveText?.('clearCartModalDescription', CLEAR_CART_CONFIRMATION_COPY.mobileDescription) ?? CLEAR_CART_CONFIRMATION_COPY.mobileDescription
    : this._resolveText?.('clearCartModalDescription', CLEAR_CART_CONFIRMATION_COPY.description) ?? CLEAR_CART_CONFIRMATION_COPY.description;

  const footer = document.createElement('div');
  footer.className = 'wpb-clear-cart-confirmation__footer';

  const cancelButton = document.createElement('button');
  cancelButton.className = 'wpb-clear-cart-confirmation__cancel';
  cancelButton.type = 'button';
  cancelButton.textContent = mobile
    ? this._resolveText?.('clearCartCancelButtonText', CLEAR_CART_CONFIRMATION_COPY.mobileCancel) ?? CLEAR_CART_CONFIRMATION_COPY.mobileCancel
    : this._resolveText?.('clearCartCancelButtonText', CLEAR_CART_CONFIRMATION_COPY.cancel) ?? CLEAR_CART_CONFIRMATION_COPY.cancel;
  cancelButton.addEventListener('click', () => this.hideClearCartConfirmation());

  const confirmButton = document.createElement('button');
  confirmButton.className = 'wpb-clear-cart-confirmation__confirm';
  confirmButton.type = 'button';
  const confirmLabel = mobile
    ? this._resolveText?.('clearCartConfirmButtonText', CLEAR_CART_CONFIRMATION_COPY.mobileConfirm) ?? CLEAR_CART_CONFIRMATION_COPY.mobileConfirm
    : this._resolveText?.('clearCartConfirmButtonText', CLEAR_CART_CONFIRMATION_COPY.confirm) ?? CLEAR_CART_CONFIRMATION_COPY.confirm;
  const confirmText = document.createElement('span');
  confirmText.textContent = confirmLabel;
  confirmButton.append(createTrashIcon(document, 20), confirmText);
  confirmButton.addEventListener('click', () => this.confirmClearCartSelection());

  content.append(title, description);
  footer.append(cancelButton, confirmButton);
  if (closeButton) {
    container.append(closeButton, content, footer);
  } else {
    container.append(content, footer);
  }
  modal.appendChild(container);

  if (mobile) {
    modal.addEventListener('cancel', (event: any) => {
      event.preventDefault?.();
      this.hideClearCartConfirmation();
    });
    modal.addEventListener('click', (event: any) => {
      if (event.target === modal) this.hideClearCartConfirmation();
    });
  }

  return modal;
},
};
