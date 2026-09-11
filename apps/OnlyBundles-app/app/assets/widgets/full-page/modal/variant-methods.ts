'use strict';

import { CurrencyManager } from '../../shared/currency-manager.js';
import { resolveCanonicalOptionValueSwatch } from '../../shared/variant-selector.js';

function resolveSwatchImageUrl(image: any) {
  return image?.previewImage?.url || image?.url || image?.src || null;
}

export const BundleModalVariantMethods: Record<string, any> & ThisType<any> = {
  resetVariantSelectionState() {
    this.selectedOptions = {};
    const summaryContainer = document.getElementById('modal-selection-summary');
    const summaryText = document.getElementById('modal-selection-text');
    if (summaryContainer) summaryContainer.hidden = true;
    if (summaryText) summaryText.textContent = '';
  },

  createVariantSelectors() {
    const variantsContainer = document.getElementById('modal-variants-container')!;
    const variants = this.currentProduct.variants || [];

    this.resetVariantSelectionState();

    // If only one variant (no options) or no variants, hide variant selectors
    if (variants.length <= 1) {
      variantsContainer.replaceChildren();
      this.selectedVariant = variants[0] || this.currentProduct;
      return;
    }

    // Extract option names (e.g., Size, Color)
    // Handle different data structures: options can be array of strings or array of objects
    let optionNames = this.currentProduct.options || [];

    // If options is array of objects with name property, extract names
    if (optionNames.length > 0 && typeof optionNames[0] === 'object' && optionNames[0].name) {
      optionNames = optionNames.map((opt: any)  => opt.name);
    }

    // If still no option names, try to infer from first variant
    if (optionNames.length === 0 && variants.length > 0) {
      const firstVariant = variants[0];
      // Check for option1, option2, option3 properties
      if (firstVariant.option1) optionNames.push('Option 1');
      if (firstVariant.option2) optionNames.push('Option 2');
      if (firstVariant.option3) optionNames.push('Option 3');
    }

    if (optionNames.length === 0) {
      // No variant options, use first variant
      this.selectedVariant = variants[0];
      variantsContainer.replaceChildren();
      return;
    }


    // Store selected options for tracking
    this.selectedOptions = {};

    // Find the current variant to pre-select its options
    const currentVariantId = this.currentProduct.variantId;
    const currentVariant = variants.find((v: any)  => String(v.id) === String(currentVariantId));

    // Create button-style selector for each option
    const selectorGroups = optionNames.map((optionName: any, optionIndex: number) => {
      // Get unique values for this option, filtering out undefined/null
      const optionValues: any[] = [...new Set(
        variants
          .map((v: any)  => v[`option${optionIndex + 1}`])
          .filter((val: string|null|undefined)  => val !== undefined && val !== null && val !== '')
      )];

      if (optionValues.length === 0) return null;

      // Pre-select current variant's option value, or fall back to first value
      const preSelectedValue = currentVariant?.[`option${optionIndex + 1}`] || optionValues[0];
      this.selectedOptions[optionIndex] = preSelectedValue;

      const group = document.createElement('div');
      group.className = 'bundle-modal-variant-group';
      group.setAttribute('role', 'radiogroup');
      const label = document.createElement('label');
      label.className = 'bundle-modal-variant-label';
      label.id = `bundle-modal-variant-label-${optionIndex}`;
      group.setAttribute('aria-labelledby', label.id);
      label.append(document.createTextNode(`${String(optionName)}: `));
      const selectedValue = document.createElement('span');
      selectedValue.className = 'bundle-modal-variant-selected-value';
      selectedValue.dataset.optionIndex = String(optionIndex);
      selectedValue.textContent = String(preSelectedValue);
      label.appendChild(selectedValue);

      const options = document.createElement('div');
      options.className = 'bundle-modal-variant-options';
      options.dataset.optionIndex = String(optionIndex);
      optionValues.forEach((value) => {
        const valueText = String(value);
        const swatch = resolveCanonicalOptionValueSwatch(
          this.currentProduct,
          optionName,
          valueText,
        );
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `bundle-modal-variant-btn${value === preSelectedValue ? ' selected' : ''}`;
        button.dataset.optionIndex = String(optionIndex);
        button.dataset.value = valueText;
        button.title = valueText;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-label', valueText);
        button.setAttribute('aria-checked', value === preSelectedValue ? 'true' : 'false');
        if (swatch?.color) {
          button.classList.add('color-swatch');
          button.style.setProperty('--bundle-modal-swatch-color', swatch.color);
        } else {
          const imageUrl = resolveSwatchImageUrl(swatch?.image);
          if (imageUrl) {
            button.classList.add('image-swatch');
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = '';
            button.append(image);
          } else {
            button.textContent = valueText;
          }
        }
        options.appendChild(button);
      });
      group.append(label, options);
      return group;
    }).filter((group: HTMLElement | null): group is HTMLElement => group !== null);
    variantsContainer.replaceChildren(...selectorGroups);

    // Add click handlers to variant buttons
    variantsContainer.querySelectorAll<HTMLButtonElement>('.bundle-modal-variant-btn').forEach((btn) => {
      btn.addEventListener('click', (e: any) => {
        e.preventDefault();
        const optionIndex = parseInt(btn.dataset.optionIndex || '0', 10);
        const value = btn.dataset.value;
        this.selectVariantOption(optionIndex, value);
      });
    });

    // Set initial variant
    this.updateSelectedVariant();
  },

  /**
   * Select a variant option
   * @param {number} optionIndex - Index of the option (0, 1, or 2)
   * @param {string} value - Selected value
   */
  selectVariantOption(optionIndex: string|number, value: string|null) {
    // Update selected options
    this.selectedOptions[optionIndex] = value;

    // Update button states
    const optionsContainer = document.querySelector(`.bundle-modal-variant-options[data-option-index="${optionIndex}"]`);
    if (optionsContainer) {
      optionsContainer.querySelectorAll<HTMLElement>('.bundle-modal-variant-btn').forEach((btn) => {
        const selected = btn.dataset.value === value;
        btn.classList.toggle('selected', selected);
        btn.setAttribute('aria-checked', selected ? 'true' : 'false');
      });
    }

    // Update selected value label
    const valueLabel = document.querySelector(`.bundle-modal-variant-selected-value[data-option-index="${optionIndex}"]`);
    if (valueLabel) {
      valueLabel.textContent = value;
    }

    // Update selected variant
    this.updateSelectedVariant();
  },

  /**
   * Update selected variant based on button selections
   */
  updateSelectedVariant() {
    const variants = this.currentProduct.variants || [];

    // Get selected option values from our stored selections
    const selectedOptionValues = Object.keys(this.selectedOptions || {})
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => this.selectedOptions[key]);


    // Find matching variant
    this.selectedVariant = variants.find((variant: any)  => {
      return selectedOptionValues.every((value, index) => {
        const variantValue = variant[`option${index + 1}`];
        return variantValue === value;
      });
    });

    // If no match found, use first variant
    if (!this.selectedVariant && variants.length > 0) {
      this.selectedVariant = variants[0];
    }


    // Update selection summary
    this.updateSelectionSummary();

    // Update price
    this.updatePrice();

    // Check availability
    this.updateAvailability();

    // Update variant image if available
    this.updateVariantImage();

    // Update unavailable option buttons
    this.updateOptionAvailability();
  },

  /**
   * Update selection summary display
   * Shows current selection like "Blue / Medium"
   */
  updateSelectionSummary() {
    const summaryContainer = document.getElementById('modal-selection-summary');
    const summaryText = document.getElementById('modal-selection-text');

    if (!summaryContainer || !summaryText) return;

    // Get selected option values
    const selectedValues = Object.keys(this.selectedOptions || {})
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => this.selectedOptions[key])
      .filter(value => value && value !== 'Default Title');

    if (selectedValues.length === 0) {
      summaryContainer.hidden = true;
      return;
    }

    // Show the summary
    summaryText.textContent = selectedValues.join(' / ');
    summaryContainer.hidden = false;
  },

  /**
   * Update availability state of variant option buttons
   * Marks options as unavailable if no variant exists with that combination
   */
  updateOptionAvailability() {
    const variants = this.currentProduct.variants || [];
    if (!this.selectedOptions) return;

    const optionIndices = Object.keys(this.selectedOptions).map(k => parseInt(k));

    optionIndices.forEach(optionIndex => {
      const optionsContainer = document.querySelector(`.bundle-modal-variant-options[data-option-index="${optionIndex}"]`);
      if (!optionsContainer) return;

      optionsContainer.querySelectorAll<HTMLButtonElement>('.bundle-modal-variant-btn').forEach(btn => {
        const testValue = btn.dataset.value;

        // Check if any variant exists with this option value + current other selections
        const hasAvailableVariant = variants.some((variant: any)  => {
          // Check if variant has this option value
          if (variant[`option${optionIndex + 1}`] !== testValue) return false;

          // Check if variant matches other selected options
          for (const [idx, value] of Object.entries(this.selectedOptions)) {
            if (parseInt(idx) === optionIndex) continue;
            if (variant[`option${parseInt(idx) + 1}`] !== value) return false;
          }

          // Check if variant is available
          return variant.available !== false && variant.availableForSale !== false;
        });

        btn.classList.toggle('unavailable', !hasAvailableVariant);
        btn.disabled = !hasAvailableVariant;
        btn.setAttribute('aria-disabled', hasAvailableVariant ? 'false' : 'true');
      });
    });
  },

  /**
   * Update main image when variant changes (if variant has specific image)
   */
  updateVariantImage() {
    if (!this.selectedVariant) return;

    // Check if variant has a specific image
    const variantImage = this.selectedVariant.image ||
                         this.selectedVariant.featured_image ||
                         this.selectedVariant.featuredImage;

    if (variantImage) {
      const imageUrl = typeof variantImage === 'string' ? variantImage :
                       variantImage.src || variantImage.url;

      if (imageUrl) {
        const mainImageEl = document.getElementById('modal-main-image') as HTMLImageElement | null;
        if (mainImageEl) {
          mainImageEl.src = imageUrl;
        }
      }
    }
  },

  /**
   * Update price display
   */
  updatePrice() {
    const priceEl = document.getElementById('modal-product-price')!;
    const variant = this.selectedVariant || this.currentProduct;

    const resolveCompareAtPrice = (candidate: any) => {
      const rawCompareAt = candidate?.compareAtPrice ?? candidate?.compare_at_price;
      if (rawCompareAt == null) return null;
      if (typeof rawCompareAt === 'object' && rawCompareAt !== null && typeof rawCompareAt.amount !== 'undefined') {
        return rawCompareAt.amount;
      }
      return rawCompareAt;
    };

    // Format price using widget's currency manager
    const originalPrice = variant.price || this.currentProduct.price || 0;
    const price = this.widget?.getSubscriptionProductCardPrice
      ? this.widget.getSubscriptionProductCardPrice(originalPrice)
      : originalPrice;
    const compareAtPrice = resolveCompareAtPrice(variant)
      || resolveCompareAtPrice(this.currentProduct);

    priceEl.replaceChildren();
    if (compareAtPrice && Number(compareAtPrice) > Number(price)) {
      const strike = document.createElement('span');
      strike.className = 'bundle-modal-price-strike';
      strike.textContent = this.formatPrice(compareAtPrice);
      const sale = document.createElement('span');
      sale.className = 'bundle-modal-price-sale';
      sale.textContent = this.formatPrice(price);
      priceEl.append(strike, sale);
    } else {
      priceEl.textContent = this.formatPrice(price);
    }
  },

  /**
   * Format price with currency
   * @param {number} price - Price in cents
   * @returns {string} Formatted price
   */
  formatPrice(price: number) {
    const variant = this.selectedVariant || this.currentProduct;
    const currencyCode = variant?.currencyCode || this.currentProduct?.currencyCode || '';
    return CurrencyManager.formatMoney(price, currencyCode);
  },

  /**
   * Update availability status
   */
  updateAvailability() {
    const addBtn = document.getElementById('modal-add-to-box') as HTMLButtonElement;
    const variant = this.selectedVariant || this.currentProduct;

    // Check if variant is available (handle different property names from Storefront API)
    const isAvailable = variant.available !== false &&
                        variant.availableForSale !== false;

    if (!isAvailable) {
      addBtn.disabled = true;
      addBtn.textContent = 'Out of Stock';
      addBtn.classList.add('out-of-stock');
    } else {
      addBtn.disabled = false;
      addBtn.textContent = 'Add To Box';
      addBtn.classList.remove('out-of-stock');
    }
  },

  /**
   * Update quantity
   * @param {number} quantity - New quantity
   */
};
