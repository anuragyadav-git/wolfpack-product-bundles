import { CurrencyManager } from './currency-manager.js';
import {
  drawerLayerManager,
  shouldDismissDrawerSwipe,
} from './drawer-layer-manager.js';
import { createChevronIcon, createCloseIcon } from './svg-icons.js';

let standardMobileDrawerCleanup: (() => void) | null = null;
const selectorInstanceCounts = new WeakMap<Document, number>();

export function resolveCanonicalOptionValueSwatch(
  product: any,
  optionName: unknown,
  value: unknown,
) {
  const option = (Array.isArray(product?.options) ? product.options : []).find(
    (candidate: any) => (
      candidate
      && typeof candidate === 'object'
      && String(candidate.name ?? '') === String(optionName ?? '')
    ),
  );
  const optionValue = (Array.isArray(option?.optionValues) ? option.optionValues : []).find(
    (candidate: any) => String(candidate?.name ?? '') === String(value ?? ''),
  );
  const color = optionValue?.swatch?.color ?? null;
  const image = optionValue?.swatch?.image ?? null;
  if (!color && !image) return null;

  return {
    color,
    image,
    label: String(optionValue?.name ?? value ?? ''),
  };
}

function nextSelectorInstanceId(runtimeDocument: Document, productId: unknown) {
  const count = (selectorInstanceCounts.get(runtimeDocument) || 0) + 1;
  selectorInstanceCounts.set(runtimeDocument, count);
  const stableProductId = String(productId ?? 'product').replace(/[^a-zA-Z0-9_-]+/g, '-');
  return `fpb-variant-${stableProductId}-${count}`;
}

export function getStandardMobileDrawerContract({ isPpbOwned = false }: any = {}) {
  return {
    closeControl: isPpbOwned ? 'handle' : 'cross',
    dismissOnBackdrop: true,
    dismissOnEscape: true,
    dismissOnSelection: true,
    showApplyAction: false,
  };
}

/**
 * VariantSelectorComponent
 *
 * Renders an inline variant selector on FPB product cards.
 * Every Shopify option dimension is a labeled radio group whose values remain
 * directly reachable in source order. Layout and wrapping belong to CSS.
 *
 * Usage:
 *   const selector = VariantSelectorComponent.createElement(product, primaryOptionName);
 *   VariantSelectorComponent.attachListeners(cardEl, product, onVariantChange);
 *
 *   onVariantChange(newVariantId, oldVariantId) is called after product is mutated.
 */

class VariantSelectorComponent {

  static createConfiguredElement(
    product: any,
    primaryOptionName: any,
    configuration: any = {},
    runtimeDocument: Document = document,
  ) {
    const mode = configuration.variantSelectorMode || 'dropdown';
    if (mode === 'dropdown') {
      return VariantSelectorComponent.createDropdownElement(product, primaryOptionName, {
        ...configuration,
        document: runtimeDocument,
      });
    }

    const variants = product.variants || [];
    const options = product.options || [];
    if (variants.length <= 1 || options.length === 0) return null;

    const optionIndexes = options.map((_: unknown, index: number) => index + 1);
    const primaryIdx = VariantSelectorComponent._primaryIdx(options, primaryOptionName);
    const hasExplicitPrimary = typeof primaryOptionName === 'string'
      && options.some((option: unknown) => (
        VariantSelectorComponent._optionName(option).toLowerCase()
          === primaryOptionName.toLowerCase()
      ));
    const swatchKind = mode === 'color_swatch'
      ? 'color'
      : mode === 'image_swatch'
        ? 'image'
        : null;
    const mappedIndexes = swatchKind
      ? optionIndexes.filter((optionIndex: number) => (
        VariantSelectorComponent._uniqueValues(variants, optionIndex).some((value: unknown) => {
          const swatch = resolveCanonicalOptionValueSwatch(
            product,
            VariantSelectorComponent._optionName(options[optionIndex - 1]),
            value,
          );
          return swatchKind === 'color' ? Boolean(swatch?.color) : Boolean(swatch?.image);
        })
      ))
      : [];
    const compactPillIndex = mode === 'pill' && !hasExplicitPrimary
      ? optionIndexes.reduce((bestIndex: number, candidateIndex: number) => (
        VariantSelectorComponent._uniqueValues(variants, candidateIndex).length
          < VariantSelectorComponent._uniqueValues(variants, bestIndex).length
          ? candidateIndex
          : bestIndex
      ), primaryIdx)
      : primaryIdx;
    const visualIndex = mappedIndexes.includes(primaryIdx)
      ? primaryIdx
      : mappedIndexes[0] || compactPillIndex;
    const selectedVariant = variants.find((variant: any) => (
      String(variant.id) === String(product.variantId)
    )) || variants[0];
    const instanceId = nextSelectorInstanceId(
      runtimeDocument,
      product.id || product.productId || product.variantId,
    );
    const root = runtimeDocument.createElement('div');
    root.className = `vs-wrapper vs-wrapper--configured vs-wrapper--${mode}`;
    root.dataset.vsProductId = String(product.id || product.variantId || '');

    [visualIndex, ...optionIndexes.filter((index: number) => index !== visualIndex)]
      .forEach((optionIndex: number) => {
        const optionName = VariantSelectorComponent._optionName(options[optionIndex - 1]);
        const values = VariantSelectorComponent._uniqueValues(variants, optionIndex);
        if (values.length === 0) return;
        if (optionIndex !== visualIndex) {
          root.append(VariantSelectorComponent._createNativeOptionSelect({
            instanceId,
            optionIndex,
            optionName,
            selectedVariant,
            values,
            variants,
            runtimeDocument,
          }));
          return;
        }
        root.append(VariantSelectorComponent._createVisualOptionGroup({
          instanceId,
          mode,
          optionIndex,
          optionName,
          product,
          selectedVariant,
          swatchKind,
          swatchTooltipEnabled: configuration.swatchTooltipEnabled === true,
          values,
          variants,
          runtimeDocument,
        }));
      });

    return root;
  }

  static _createVisualOptionGroup(options: any) {
    const {
      instanceId, mode, optionIndex, optionName, product, selectedVariant,
      swatchKind, swatchTooltipEnabled, values, variants, runtimeDocument,
    } = options;
    const group = runtimeDocument.createElement('div');
    group.className = 'vs-option-group';
    group.setAttribute('role', 'radiogroup');
    group.dataset.optionIndex = String(optionIndex);
    const label = runtimeDocument.createElement('span');
    label.id = `${instanceId}-label-${optionIndex}`;
    label.className = 'vs-option-group-label';
    label.textContent = optionName;
    group.setAttribute('aria-label', optionName);
    group.setAttribute('aria-labelledby', label.id);
    const valuesElement = runtimeDocument.createElement('div');
    valuesElement.className = 'vs-btn-group';
    const groupName = `${instanceId}-option-${optionIndex}`;

    values.forEach((value: unknown, valueIndex: number) => {
      const selectable = VariantSelectorComponent._hasSelectableVariant(variants, optionIndex, value);
      const swatch = swatchKind
        ? resolveCanonicalOptionValueSwatch(product, optionName, value)
        : null;
      const hasRequestedSwatch = swatchKind === 'color'
        ? Boolean(swatch?.color)
        : swatchKind === 'image'
          ? Boolean(swatch?.image)
          : false;
      const control = runtimeDocument.createElement('label');
      control.className = `vs-radio-control${hasRequestedSwatch ? ' vs-radio-control--swatch' : ''}`;
      control.dataset.unavailable = selectable ? 'false' : 'true';
      const input = runtimeDocument.createElement('input');
      input.type = 'radio';
      input.id = `${groupName}-value-${valueIndex + 1}`;
      input.name = groupName;
      input.value = String(value);
      input.className = 'vs-input';
      input.dataset.optionIndex = String(optionIndex);
      input.checked = String(selectedVariant?.[`option${optionIndex}`] ?? '') === String(value);
      input.disabled = !selectable;
      input.setAttribute('aria-label', selectable ? String(value) : `${String(value)} — unavailable`);
      const visual = runtimeDocument.createElement('span');
      visual.className = 'vs-btn';
      if (hasRequestedSwatch && swatchKind === 'color') {
        visual.dataset.swatchKind = 'color';
        visual.style.setProperty('--vs-swatch-color', String(swatch?.color));
      } else if (hasRequestedSwatch && swatchKind === 'image') {
        visual.dataset.swatchKind = 'image';
        const imageUrl = VariantSelectorComponent._swatchImageUrl(swatch?.image);
        if (imageUrl) {
          const image = runtimeDocument.createElement('img');
          image.src = imageUrl;
          image.alt = '';
          visual.append(image);
        }
      }
      if (!hasRequestedSwatch || mode === 'pill') {
        const text = runtimeDocument.createElement('span');
        text.className = 'vs-btn-label';
        text.textContent = String(value);
        visual.append(text);
      }
      if (swatchTooltipEnabled && hasRequestedSwatch) control.title = String(value);
      control.append(input, visual);
      valuesElement.append(control);
    });

    group.append(label, valuesElement);
    return group;
  }

  static _createNativeOptionSelect(options: any) {
    const {
      instanceId, optionIndex, optionName, selectedVariant, values, variants, runtimeDocument,
    } = options;
    const group = runtimeDocument.createElement('div');
    group.className = 'vs-option-group vs-option-group--select';
    const label = runtimeDocument.createElement('label');
    label.className = 'vs-option-group-label';
    label.htmlFor = `${instanceId}-select-${optionIndex}`;
    label.textContent = optionName;
    const select = runtimeDocument.createElement('select');
    select.id = label.htmlFor;
    select.className = 'vs-native-select';
    select.dataset.optionIndex = String(optionIndex);
    select.setAttribute('aria-label', optionName);
    values.forEach((value: unknown) => {
      const option = runtimeDocument.createElement('option');
      option.value = String(value);
      option.textContent = String(value);
      option.selected = String(selectedVariant?.[`option${optionIndex}`] ?? '') === String(value);
      option.disabled = !VariantSelectorComponent._hasSelectableVariant(variants, optionIndex, value);
      select.append(option);
    });
    group.append(label, select);
    return group;
  }

  /**
   * Render the variant selector HTML for a product card.
   *
   * @param {Object} product - Product with .variants[], .options[], .variantId
   * @param {string|null} primaryOptionName - Merchant-configured primary dimension (e.g. "Size")
   * @returns {string} HTML string, or '' if no selector needed
   */
  static createElement(product: any, primaryOptionName: any, runtimeDocument: Document = document) {
    const variants = product.variants || [];
    const options = product.options || [];

    if (variants.length <= 1 || options.length === 0) return null;

    const primaryIdx = VariantSelectorComponent._primaryIdx(options, primaryOptionName);
    const selectedVariant = variants.find((variant: any) => (
      String(variant.id) === String(product.variantId)
    )) || variants[0];
    const orderedOptionIndexes = [
      primaryIdx,
      ...options.map((_: unknown, index: number) => index + 1).filter((index: number) => index !== primaryIdx),
    ];
    const instanceId = nextSelectorInstanceId(
      runtimeDocument,
      product.id || product.productId || product.variantId,
    );

    const root = runtimeDocument.createElement('div');
    root.className = 'vs-wrapper';
    root.dataset.vsProductId = String(product.id || product.variantId || '');
    orderedOptionIndexes.forEach((optionIndex) => {
      const values = VariantSelectorComponent._uniqueValues(variants, optionIndex);
      if (values.length === 0) return;
      const optionName = options[optionIndex - 1] || `Option ${optionIndex}`;
      const group = runtimeDocument.createElement('div');
      group.className = 'vs-option-group';
      group.setAttribute('role', 'radiogroup');
      const label = runtimeDocument.createElement('span');
      label.id = `${instanceId}-label-${optionIndex}`;
      label.className = 'vs-option-group-label';
      label.textContent = String(optionName);
      group.setAttribute('aria-label', String(optionName));
      group.setAttribute('aria-labelledby', label.id);
      group.dataset.optionIndex = String(optionIndex);
      const valuesElement = runtimeDocument.createElement('div');
      valuesElement.className = 'vs-btn-group';
      const groupName = `${instanceId}-option-${optionIndex}`;

      values.forEach((value: unknown, valueIndex: number) => {
        const selectable = VariantSelectorComponent._hasSelectableVariant(
          variants,
          optionIndex,
          value,
        );
        const control = runtimeDocument.createElement('label');
        control.className = 'vs-radio-control';
        control.dataset.unavailable = selectable ? 'false' : 'true';
        const input = runtimeDocument.createElement('input');
        input.type = 'radio';
        input.id = `${groupName}-value-${valueIndex + 1}`;
        input.name = groupName;
        input.value = String(value);
        input.className = 'vs-input';
        input.dataset.optionIndex = String(optionIndex);
        input.checked = String(selectedVariant?.[`option${optionIndex}`] ?? '') === String(value);
        input.disabled = !selectable;
        input.setAttribute(
          'aria-label',
          selectable ? String(value) : `${String(value)} — unavailable`,
        );
        const visual = runtimeDocument.createElement('span');
        visual.className = 'vs-btn';
        visual.textContent = String(value);
        control.append(input, visual);
        valuesElement.append(control);
      });

      group.append(label, valuesElement);
      root.append(group);
    });
    return root;
  }

  static createDropdownElement(product: any, primaryOptionName: any, options: any = {}) {
    const runtimeDocument: Document = options.document || document;
    const variants = product.variants || [];
    const optionNames = product.options || [];

    if (variants.length <= 1 || optionNames.length === 0) return null;

    const primaryIdx = VariantSelectorComponent._primaryIdx(optionNames, primaryOptionName);
    const selectedVariant = variants.find((variant: any)  => String(variant.id) === String(product.variantId)) || variants[0];
    const selectedPrimaryValue = selectedVariant?.[`option${primaryIdx}`] || selectedVariant?.title || '';
    const selectedLabel = options.placeholder || selectedPrimaryValue;
    const productId = product.id || product.variantId;
    const mobileMode = options.mobileMode === 'inline' ? 'inline' : 'drawer';
    const instanceId = nextSelectorInstanceId(runtimeDocument, productId);

    const dropdownVariants = variants;
    const root = runtimeDocument.createElement('div');
    root.className = 'vs-wrapper vs-wrapper--standard';
    Object.assign(root.dataset, {
      vsProductId: String(productId || ''),
      vsPrimaryIdx: String(primaryIdx),
      vsPlaceholder: String(selectedLabel),
      vsMobileMode: mobileMode,
    });
    const selected = runtimeDocument.createElement('button');
    selected.type = 'button';
    selected.className = 'vs-selected';
    selected.setAttribute('aria-expanded', 'false');
    selected.setAttribute('aria-haspopup', 'listbox');
    selected.setAttribute('aria-controls', `${instanceId}-options`);
    const selectedText = runtimeDocument.createElement('span');
    selectedText.className = 'vs-selected-label';
    selectedText.textContent = String(selectedLabel);
    const selectedIcon = runtimeDocument.createElement('span');
    selectedIcon.className = 'vs-selected-icon';
    selectedIcon.setAttribute('aria-hidden', 'true');
    selectedIcon.append(createChevronIcon(runtimeDocument));
    selected.append(selectedText, selectedIcon);
    const list = runtimeDocument.createElement('ul');
    list.id = `${instanceId}-options`;
    list.className = 'vs-options';
    list.hidden = true;
    dropdownVariants.forEach((variant: any) => {
      const primaryValue = variant[`option${primaryIdx}`] || variant.title || '';
      const value = optionNames.length > 1 && variant.title ? variant.title : primaryValue;
      const imageUrl = VariantSelectorComponent._variantImageUrl(variant);
      const isAvailable = variant.available !== false;
      const item = runtimeDocument.createElement('li');
      const control = runtimeDocument.createElement('button');
      control.type = 'button';
      control.className = 'vs-option';
      control.dataset.variantId = String(variant.id ?? '');
      control.dataset.primaryValue = String(value);
      control.disabled = !isAvailable;
      if (!isAvailable) control.setAttribute('aria-disabled', 'true');
      if (imageUrl) {
        const image = runtimeDocument.createElement('img');
        image.className = 'vs-option-image';
        image.src = imageUrl;
        image.alt = '';
        control.append(image);
      }
      const label = runtimeDocument.createElement('span');
      label.className = 'vs-option-label';
      label.textContent = String(value);
      control.append(label);
      item.append(control);
      list.append(item);
    });
    root.append(selected, list);
    return root;
  }

  static createStandardMobileDrawerElement(product: any, options: any = {}) {
    const runtimeDocument: Document = options.document || document;
    const variants = product.variants || [];
    const optionNames = product.options || [];
    const primaryIdx = options.primaryIdx || VariantSelectorComponent._primaryIdx(optionNames, options.primaryOptionName);
    const selectedVariant = variants.find((v: any)  => String(v.id) === String(product.variantId)) || variants[0] || product;
    const productImageUrl = VariantSelectorComponent._variantImageUrl(selectedVariant) || product.imageUrl || '';
    const productTitle = product.title || selectedVariant.productTitle || '';
    const placeholder = options.placeholder || '';
    const formatPrice = typeof options.formatPrice === 'function'
      ? options.formatPrice
      : (value: any) => VariantSelectorComponent.formatDrawerPrice(value);
    const productPrice = selectedVariant.price ?? product.price ?? 0;
    const isPpbDrawer = options.drawerOwner === 'ppb';
    const drawerContract = getStandardMobileDrawerContract({ isPpbOwned: isPpbDrawer });

    const drawer = runtimeDocument.createElement('div');
    drawer.className = 'vs-mobile-drawer vs-mobile-drawer--standard';
    drawer.dataset.vsMobileDrawer = '';
    if (isPpbDrawer) drawer.dataset.ppbDrawerSurface = 'variant-selector';
    const sheet = runtimeDocument.createElement('div');
    sheet.className = 'vs-mobile-drawer-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    if (drawerContract.closeControl === 'handle') {
      const handle = runtimeDocument.createElement('button');
      handle.type = 'button';
      handle.className = 'vs-mobile-drawer-handle';
      handle.dataset.vsDrawerHandle = '';
      handle.setAttribute('aria-label', 'Close variant selector');
      const grip = runtimeDocument.createElement('span');
      grip.className = 'vs-mobile-drawer-grip';
      grip.setAttribute('aria-hidden', 'true');
      handle.append(grip);
      sheet.append(handle);
    } else {
      const close = runtimeDocument.createElement('button');
      close.type = 'button';
      close.className = 'vs-mobile-drawer-close';
      close.setAttribute('aria-label', 'Close variant selector');
      close.append(createCloseIcon(runtimeDocument));
      sheet.append(close);
    }
    const header = runtimeDocument.createElement('div');
    header.className = 'vs-mobile-drawer-header';
    if (productImageUrl) {
      const image = runtimeDocument.createElement('img');
      image.className = 'vs-mobile-drawer-product-image';
      image.src = productImageUrl;
      image.alt = '';
      header.append(image);
    }
    const info = runtimeDocument.createElement('div');
    info.className = 'vs-mobile-drawer-product-info';
    const title = runtimeDocument.createElement('p');
    title.className = 'vs-mobile-drawer-product-title';
    title.textContent = String(productTitle);
    const price = runtimeDocument.createElement('p');
    price.className = 'vs-mobile-drawer-product-price';
    price.textContent = String(formatPrice(productPrice));
    info.append(title, price);
    header.append(info);
    sheet.append(header);
    const body = runtimeDocument.createElement('div');
    body.className = 'vs-mobile-drawer-body';
    const drawerTitle = runtimeDocument.createElement('div');
    drawerTitle.className = 'vs-mobile-drawer-title';
    drawerTitle.textContent = String(placeholder);
    const optionList = runtimeDocument.createElement('div');
    optionList.className = 'vs-mobile-options';
    variants.forEach((variant: any) => {
      const label = VariantSelectorComponent.getStandardVariantLabel(variant, optionNames, primaryIdx);
      const imageUrl = VariantSelectorComponent._variantImageUrl(variant) || productImageUrl;
      const isAvailable = variant.available !== false;
      const isSelected = String(variant.id) === String(selectedVariant.id);
      const button = runtimeDocument.createElement('button');
      button.type = 'button';
      button.className = `vs-mobile-option${isSelected ? ' vs-mobile-option--selected' : ''}`;
      button.dataset.variantId = String(variant.id ?? '');
      button.setAttribute('aria-disabled', isAvailable ? 'false' : 'true');
      if (imageUrl) {
        const image = runtimeDocument.createElement('img');
        image.className = 'vs-mobile-option-image';
        image.src = imageUrl;
        image.alt = '';
        button.append(image);
      } else {
        const imagePlaceholder = runtimeDocument.createElement('span');
        imagePlaceholder.className = 'vs-mobile-option-image vs-mobile-option-image--empty';
        imagePlaceholder.setAttribute('aria-hidden', 'true');
        button.append(imagePlaceholder);
      }
      const optionLabel = runtimeDocument.createElement('span');
      optionLabel.className = 'vs-mobile-option-label';
      optionLabel.textContent = String(label);
      const optionPrice = runtimeDocument.createElement('span');
      optionPrice.className = 'vs-mobile-option-price';
      optionPrice.textContent = String(formatPrice(variant.price ?? 0));
      button.append(optionLabel, optionPrice);
      optionList.append(button);
    });
    body.append(drawerTitle, optionList);
    sheet.append(body);
    drawer.append(sheet);
    return drawer;
  }

  /**
   * Attach event listeners for the variant selector on a card element.
   * Must be called after the card HTML is in the DOM.
   *
   * @param {HTMLElement} cardEl - The .product-card element
   * @param {Object} product - Product object (mutated on variant change)
   * @param {Function} onVariantChange - Called with (newVariantId, oldVariantId) after mutation
   */
  static attachListeners(cardEl: any, product: any, onVariantChange: any) {
    cardEl.addEventListener('click', (e: any) => {
      if (!e.target.closest('.vs-radio-control')) return;
      e.stopPropagation();
    });

    cardEl.addEventListener('change', (e: any) => {
      const input = e.target.closest('.vs-input, .vs-native-select');
      if (!input || input.disabled) return;
      e.stopPropagation();
      VariantSelectorComponent._selectPrimary(
        cardEl,
        product,
        Number.parseInt(input.dataset.optionIndex, 10),
        input.value,
        onVariantChange,
      );
    });

    cardEl.addEventListener('click', (e: any) => {
      const selected = e.target.closest('.vs-selected');
      if (selected) {
        e.stopPropagation();
        VariantSelectorComponent.handleStandardSelectorClick(selected, cardEl, product, onVariantChange);
        return;
      }

      const option = e.target.closest('.vs-option');
      if (!option || option.disabled || option.getAttribute('aria-disabled') === 'true') return;
      e.stopPropagation();
      VariantSelectorComponent._selectStandardOption(cardEl, product, option, onVariantChange);
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  static _primaryIdx(options: any[], primaryOptionName: string) {
    if (!primaryOptionName) return 1;
    const idx = options.findIndex((option: unknown) => (
      VariantSelectorComponent._optionName(option).toLowerCase() === primaryOptionName.toLowerCase()
    ));
    return idx >= 0 ? idx + 1 : 1;
  }

  static _optionName(option: unknown) {
    if (option && typeof option === 'object' && 'name' in option) {
      return String((option as { name?: unknown }).name ?? '');
    }
    return String(option ?? '');
  }

  static _swatchImageUrl(image: any) {
    return image?.previewImage?.url || image?.url || image?.src || '';
  }

  static _uniqueValues(variants: any[], optIdx: number) {
    const seen = new Set();
    const out: any[] = [];
    variants.forEach((v: any)  => {
      const val = v[`option${optIdx}`];
      if (val && !seen.has(val)) { seen.add(val); out.push(val); }
    });
    return out;
  }

  static _uniqueSelectableValues(variants: any, optIdx: number) {
    return VariantSelectorComponent._uniqueValues(
      (variants || []).filter(VariantSelectorComponent._isSelectableVariant),
      optIdx
    );
  }

  static _isSelectableVariant(variant: any) {
    return variant?.available !== false;
  }

  static _hasSelectableVariant(variants: any[], optionIndex: number, value: unknown) {
    return variants.some((variant: any) => (
      String(variant?.[`option${optionIndex}`] ?? '') === String(value)
      && VariantSelectorComponent._isSelectableVariant(variant)
    ));
  }

  static _esc(str: string|null|undefined) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  static _findBestVariant(variants: any[], primaryOptIdx: number, primaryValue: any, currentVariantId: any) {
    const current = variants.find((v: any)  => v.id === currentVariantId);
    const candidates = variants.filter((v: any)  =>
      v[`option${primaryOptIdx}`] === primaryValue && VariantSelectorComponent._isSelectableVariant(v)
    );
    if (candidates.length === 0) return null;
    if (candidates.length === 1 || !current) return candidates[0];
    // Prefer candidate that preserves other option values
    for (let i = 1; i <= 3; i++) {
      if (i === primaryOptIdx) continue;
      const curVal = current[`option${i}`];
      if (!curVal) continue;
      const match = candidates.find((v: any)  => v[`option${i}`] === curVal);
      if (match) return match;
    }
    return candidates[0];
  }

  static _resolveCompareAtPrice(variant: any) {
    if (!variant) return null;
    const rawCompareAt = variant.compareAtPrice ?? variant.compare_at_price;
    if (rawCompareAt == null) return null;
    const resolved = typeof rawCompareAt === 'object' && rawCompareAt !== null && typeof rawCompareAt.amount !== 'undefined'
      ? rawCompareAt.amount
      : rawCompareAt;
    const parsed = Number.parseFloat(resolved);
    return Number.isFinite(parsed) ? parsed : null;
  }

  static _selectPrimary(cardEl: any, product: any, primaryOptIdx: number, val: any, onVariantChange: (arg0: any,arg1: any) => void) {
    const oldVariantId = product.variantId;
    const newVariant = VariantSelectorComponent._findBestVariant(
      product.variants || [], primaryOptIdx, val, oldVariantId
    );
    if (!newVariant) return;

    // Keep every dimension synchronized with the resolved variant.
    const wrapper = cardEl.querySelector('.vs-wrapper');
    if (wrapper) {
      wrapper.querySelectorAll('.vs-input').forEach((input: any) => {
        const optionIndex = Number.parseInt(input.dataset.optionIndex, 10);
        input.checked = String(newVariant[`option${optionIndex}`] ?? '') === String(input.value);
      });
      wrapper.querySelectorAll('.vs-native-select').forEach((select: any) => {
        const optionIndex = Number.parseInt(select.dataset.optionIndex, 10);
        select.value = String(newVariant[`option${optionIndex}`] ?? '');
      });
    }

    // Mutate product
    product.variantId = newVariant.id;
    product.price = newVariant.price;
    product.compareAtPrice = VariantSelectorComponent._resolveCompareAtPrice(newVariant);
    product.imageUrl = VariantSelectorComponent._variantImageUrl(newVariant) || product.imageUrl;
    product.available = newVariant.available === true;
    product.quantityAvailable = typeof newVariant.quantityAvailable === 'number' ? newVariant.quantityAvailable : null;
    product.currentlyNotInStock = newVariant.currentlyNotInStock === true;

    onVariantChange(newVariant.id, oldVariantId);
  }


  static handleStandardSelectorClick(selected: any, cardEl: any, product: any, onVariantChange: any) {
    const wrapper = selected.closest('.vs-wrapper--standard');
    const opensInlineOnMobile = wrapper?.dataset.vsMobileMode === 'inline';
    if (VariantSelectorComponent.isMobileViewport() && !opensInlineOnMobile) {
      VariantSelectorComponent.openStandardMobileDrawer(selected, cardEl, product, onVariantChange);
      return;
    }

    VariantSelectorComponent._toggleStandardDropdown(selected, cardEl);
  }

  static isMobileViewport() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(max-width: 767px)').matches || window.innerWidth <= 767;
  }

  static openStandardMobileDrawer(selected: any, cardEl: any, product: any, onVariantChange: any) {
    const wrapper = selected.closest('.vs-wrapper--standard');
    if (!wrapper || typeof document === 'undefined') return;

    VariantSelectorComponent.closeStandardMobileDrawer();

    const panel = wrapper.querySelector('.vs-options');
    const primaryIdx = parseInt(wrapper.dataset.vsPrimaryIdx || '1', 10);
    const placeholder = wrapper.dataset.vsPlaceholder || selected.querySelector('.vs-selected-label')?.textContent?.trim() || '';

    const ppbOwner = cardEl.closest?.('#bundle-builder-app[data-ppb-template-type], [data-ppb-template-type="PDP_INPAGE"], [data-ppb-template-type="PDP_MODAL"]');
    const isPpbDrawer = Boolean(ppbOwner);
    document.body.append(VariantSelectorComponent.createStandardMobileDrawerElement(product, {
      placeholder,
      primaryIdx,
      drawerOwner: isPpbDrawer ? 'ppb' : 'shared',
    }));
    selected.setAttribute('aria-expanded', 'true');

    const drawer = document.body.querySelector('[data-vs-mobile-drawer]');
    if (!drawer) return;

    const documentRoot = document.documentElement;
    const documentBody = document.body;
    const previousRootOverflow = documentRoot.style.overflow;
    const previousBodyOverflow = documentBody.style.overflow;
    let isClosed = false;
    let drawerLayer: any = null;

    if (!isPpbDrawer) {
      documentRoot.style.overflow = 'hidden';
      documentBody.style.overflow = 'hidden';
    }

    const close = () => {
      if (isClosed) return;
      isClosed = true;
      if (!isPpbDrawer) document.removeEventListener('keydown', handleKeyDown);
      drawer.remove();
      if (drawerLayer) {
        drawerLayerManager.close(drawerLayer);
      } else {
        documentRoot.style.overflow = previousRootOverflow;
        documentBody.style.overflow = previousBodyOverflow;
      }
      selected.setAttribute('aria-expanded', 'false');
      const currentTrigger = selected.isConnected
        ? selected
        : cardEl.querySelector('.vs-selected');
      currentTrigger?.focus?.({ preventScroll: true });
      if (standardMobileDrawerCleanup === close) {
        standardMobileDrawerCleanup = null;
      }
    };

    const handleKeyDown = (event: any) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };

    standardMobileDrawerCleanup = close;
    if (isPpbDrawer) {
      drawerLayer = drawerLayerManager.open({
        id: 'variant-selector',
        requestClose: close,
        trigger: selected,
      });
    } else {
      document.addEventListener('keydown', handleKeyDown);
    }
    drawer.querySelector('.vs-mobile-drawer-close')?.addEventListener('click', (event: any) => {
      event.stopPropagation();
      close();
    });
    const handle = drawer.querySelector('[data-vs-drawer-handle]');
    handle?.addEventListener('click', (event: any) => {
      event.stopPropagation();
      close();
    });
    if (handle) {
      const sheet = drawer.querySelector<HTMLElement>('.vs-mobile-drawer-sheet')!;
      let gesture: any = null;
      const reset = () => {
        sheet.style.transform = '';
        sheet.style.transition = '';
      };
      handle.addEventListener('pointerdown', (event: any) => {
        gesture = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startedAt: performance.now(),
        };
        sheet.style.transition = 'none';
        handle.setPointerCapture?.(event.pointerId);
      });
      handle.addEventListener('pointermove', (event: any) => {
        if (!gesture || event.pointerId !== gesture.pointerId) return;
        const distanceY = Math.max(0, event.clientY - gesture.startY);
        const distanceX = event.clientX - gesture.startX;
        if (Math.abs(distanceX) > distanceY) return;
        sheet.style.transform = `translateY(${distanceY}px)`;
      });
      handle.addEventListener('pointerup', (event: any) => {
        if (!gesture || event.pointerId !== gesture.pointerId) return;
        const elapsed = Math.max(1, performance.now() - gesture.startedAt);
        const distanceY = event.clientY - gesture.startY;
        const distanceX = event.clientX - gesture.startX;
        gesture = null;
        if (shouldDismissDrawerSwipe({ distanceY, distanceX, velocityY: distanceY / elapsed })) {
          close();
          return;
        }
        reset();
      });
      handle.addEventListener('pointercancel', () => {
        gesture = null;
        reset();
      });
    }

    const initialFocus = drawer.querySelector<HTMLElement>(
      '.vs-mobile-option--selected:not([aria-disabled="true"]), .vs-mobile-option:not([aria-disabled="true"])'
    );
    initialFocus?.focus?.({ preventScroll: true });

    drawer.addEventListener('click', (event: any) => {
      if (event.target === drawer) {
        event.stopPropagation();
        close();
        return;
      }

      const optionButton = event.target.closest('.vs-mobile-option');
      if (!optionButton) return;

      event.stopPropagation();
      if (optionButton.getAttribute('aria-disabled') === 'true') return;

      const sourceOption = (Array.from(panel?.querySelectorAll('.vs-option') || []) as HTMLElement[])
        .find(option => String(option.dataset.variantId) === String(optionButton.dataset.variantId));
      if (sourceOption) {
        VariantSelectorComponent._selectStandardOption(cardEl, product, sourceOption, onVariantChange);
      }
      close();
    });
  }

  static closeStandardMobileDrawer() {
    if (typeof document === 'undefined') return;
    if (standardMobileDrawerCleanup) {
      standardMobileDrawerCleanup();
      return;
    }
    document.querySelector('[data-vs-mobile-drawer]')?.remove();
  }

  static getStandardVariantLabel(variant: any, optionNames: string|any[], primaryIdx: any) {
    const primaryValue = variant[`option${primaryIdx}`] || variant.title || '';
    return optionNames.length > 1 && variant.title ? variant.title : primaryValue;
  }

  static formatDrawerPrice(value: any) {
    if (typeof CurrencyManager !== 'undefined') {
      return CurrencyManager.convertAndFormat(value || 0, CurrencyManager.getCurrencyInfo());
    }

    return String(value || 0);
  }

  static _toggleStandardDropdown(selected: any, cardEl: any) {
    const wrapper = selected.closest('.vs-wrapper--standard');
    const panel = wrapper?.querySelector('.vs-options');
    if (!wrapper || !panel) return;

    const willOpen = panel.hidden === true;
    cardEl.querySelectorAll('.vs-wrapper--standard .vs-options').forEach((otherPanel: any) => {
      if (otherPanel !== panel) {
        otherPanel.hidden = true;
        otherPanel.closest('.vs-wrapper--standard')?.querySelector('.vs-selected')?.setAttribute('aria-expanded', 'false');
      }
    });

    panel.hidden = !willOpen;
    selected.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen) {
      VariantSelectorComponent._bindStandardOutsideClose(panel, selected);
      VariantSelectorComponent._bindStandardKeyboard(panel, selected);
      const firstOption = panel.querySelector('.vs-option:not(:disabled)') as HTMLElement | null;
      firstOption?.focus?.({ preventScroll: true });
    }
  }

  static _selectStandardOption(cardEl: any, product: any, option: any, onVariantChange: (arg0: any,arg1: any) => void) {
    const wrapper = option.closest('.vs-wrapper--standard');
    const selected = wrapper?.querySelector('.vs-selected');
    const panel = wrapper?.querySelector('.vs-options');
    const variantId = option.dataset.variantId;
    const candidate = (product.variants || []).find((v: any)  => String(v.id) === String(variantId));
    if (!candidate) return;

    const oldVariantId = product.variantId;
    product.variantId = candidate.id;
    product.price = candidate.price;
    product.compareAtPrice = VariantSelectorComponent._resolveCompareAtPrice(candidate);
    product.imageUrl = VariantSelectorComponent._variantImageUrl(candidate) || product.imageUrl;
    product.available = candidate.available === true;
    product.quantityAvailable = typeof candidate.quantityAvailable === 'number' ? candidate.quantityAvailable : null;
    product.currentlyNotInStock = candidate.currentlyNotInStock === true;

    if (selected) {
      const label = selected.querySelector('.vs-selected-label');
      if (label) label.textContent = option.dataset.primaryValue || option.textContent.trim();
      selected.setAttribute('aria-expanded', 'false');
    }
    if (panel) panel.hidden = true;

    onVariantChange(candidate.id, oldVariantId);
    selected?.focus?.({ preventScroll: true });
  }

  static _bindStandardKeyboard(panel: HTMLElement, selected: HTMLElement) {
    panel.onkeydown = (event: KeyboardEvent) => {
      const controls = Array.from(
        panel.querySelectorAll<HTMLElement>('.vs-option:not(:disabled)'),
      );
      if (event.key === 'Escape') {
        event.preventDefault();
        panel.hidden = true;
        selected.setAttribute('aria-expanded', 'false');
        selected.focus({ preventScroll: true });
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || controls.length === 0) {
        return;
      }
      event.preventDefault();
      const currentIndex = controls.indexOf(panel.ownerDocument.activeElement as HTMLElement);
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? controls.length - 1
          : event.key === 'ArrowUp'
            ? (currentIndex - 1 + controls.length) % controls.length
            : (currentIndex + 1) % controls.length;
      controls[nextIndex]?.focus({ preventScroll: true });
    };
  }

  static _bindStandardOutsideClose(panel: any, selected: any) {
    setTimeout(() => {
      const close = (e: any) => {
        if (!panel.contains(e.target) && !selected.contains(e.target)) {
          panel.hidden = true;
          selected.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', close);
        }
      };
      document.addEventListener('click', close);
    }, 0);
  }

  static _variantImageUrl(variant: any) {
    return variant?.image?.src
      || variant?.image?.url
      || (typeof variant?.image === 'string' ? variant.image : null)
      || variant?.imageUrl
      || null;
  }

}

export { VariantSelectorComponent };
