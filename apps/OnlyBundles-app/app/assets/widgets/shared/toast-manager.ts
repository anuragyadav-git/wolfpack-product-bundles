/**
 * Bundle Widget - Toast Notification System
 *
 * Provides user notifications and feedback with support for
 * simple messages and undo actions.
 *
 * @version 4.0.0
 */

'use strict';

import { createCloseIcon } from './svg-icons.js';

export class ToastManager {
  /** Escape HTML to prevent XSS in toast messages */
  static _escapeHtml(str: any) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static _isEnterFromBottom() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--bundle-toast-enter-from-bottom')
      .trim() === '1';
  }

  static show(message: string, duration = 4000, options: any = {}) {
    // Remove any existing toast
    const existingToast = document.getElementById('bundle-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element - uses Settings design CSS variables
    const toast = document.createElement('div');
    toast.id = 'bundle-toast';
    toast.className = 'bundle-toast';
    if (options.className) {
      toast.classList.add(options.className);
    }
    if (this._isEnterFromBottom()) {
      toast.classList.add('bundle-toast-from-bottom');
    }
    if (options.role) toast.setAttribute('role', options.role);
    const messageElement = document.createElement('span');
    messageElement.textContent = String(message ?? '');
    toast.appendChild(messageElement);
    if (options.dismissible !== false) {
      const closeIcon = createCloseIcon(document, {
        size: 20,
        className: options.dismissButton === true ? '' : 'toast-close',
      });
      if (options.dismissButton === true) {
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'toast-close';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.appendChild(closeIcon);
        toast.appendChild(closeButton);
      } else {
        toast.appendChild(closeIcon);
      }
    }

    // Attach close listener (consistent with showWithUndo pattern)
    toast.querySelector('.toast-close')?.addEventListener('click', () => {
      toast.remove();
    });

    // Add to page (styles come from bundle-widget.css with Settings design CSS variables)
    const container = typeof Element !== 'undefined' && options.container instanceof Element
      ? options.container
      : document.body;
    container.appendChild(toast);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, duration);
    }
  }

  // Show toast with undo action button
  static showWithUndo(message: string, undoCallback: any, duration = 5000) {
    // Remove any existing toast
    const existingToast = document.getElementById('bundle-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element with undo button
    const toast = document.createElement('div');
    toast.id = 'bundle-toast';
    toast.className = 'bundle-toast bundle-toast-with-undo';
    if (this._isEnterFromBottom()) {
      toast.classList.add('bundle-toast-from-bottom');
    }
    const messageElement = document.createElement('span');
    messageElement.className = 'toast-message';
    messageElement.textContent = String(message ?? '');
    const undoButton = document.createElement('button');
    undoButton.className = 'toast-undo-btn';
    undoButton.type = 'button';
    undoButton.textContent = 'Undo';
    toast.appendChild(messageElement);
    toast.appendChild(undoButton);
    toast.appendChild(createCloseIcon(document, {
      size: 18,
      className: 'toast-close',
    }));

    // Attach event listeners
    const undoBtn = toast.querySelector<HTMLElement>('.toast-undo-btn');
    const closeBtn = toast.querySelector<HTMLElement>('.toast-close');
    let undoTriggered = false;

    undoBtn?.addEventListener('click', () => {
      if (!undoTriggered && typeof undoCallback === 'function') {
        undoTriggered = true;
        undoCallback();
        toast.remove();
      }
    });

    closeBtn?.addEventListener('click', () => {
      toast.remove();
    });

    // Add to page
    document.body.appendChild(toast);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, duration);
    }

    return toast;
  }
}
