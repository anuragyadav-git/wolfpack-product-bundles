import { ConditionValidator } from '../../shared/condition-validator.js';

const getFooterSelectionId = (value = {}) => String(value?.selectionId || '');

const findProductBySelectionId = (products = [], selectionId = '') => {
  const normalized = String(selectionId || '');
  return products.find(product => getFooterSelectionId(product) === normalized);
};

const findVariantBySelectionId = (product, selectionId = '') => {
  const normalized = String(selectionId || '');
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.find(variant => String(variant?.selectionId || '') === normalized);
};

export const fullPageFooterSelectionMethods: Record<string, any> & ThisType<any> = {
truncateTitle(title, maxLength) {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
},

getAllSelectedProductsData() {
  const allProducts = [];

  this.selectedBundle.steps.forEach((step, stepIndex) => {
    const stepSelections = this.selectedProducts[stepIndex] || {};
    const productsInStep = this.stepProductData[stepIndex] || [];

    Object.entries(stepSelections).forEach(([variantId, quantity]) => {
      if (quantity <= 0) return;

      let product = findProductBySelectionId(productsInStep, variantId);
      let matchedVariant = null;
      if (!product) {
        for (const candidate of productsInStep) {
          const variant = findVariantBySelectionId(candidate, variantId);
          if (!variant) continue;
          product = candidate;
          matchedVariant = variant;
          break;
        }
      } else {
        matchedVariant = findVariantBySelectionId(product, variantId);
      }

      if (!product) return;

      let variantTitle = '';
      if (matchedVariant?.title && matchedVariant.title !== 'Default Title') {
        variantTitle = matchedVariant.title;
      } else if (product.variantTitle && product.variantTitle !== 'Default Title') {
        variantTitle = product.variantTitle;
      }

      const imageUrl = matchedVariant
        ? (matchedVariant.image?.src || matchedVariant.image || product.imageUrl || product.image?.src || '')
        : (product.imageUrl || product.image?.src || '');
      const price = matchedVariant
        ? (typeof matchedVariant.price === 'number'
            ? matchedVariant.price
            : parseFloat(matchedVariant.price || '0') * 100)
        : (product.price || 0);
      const selectionId = String(variantId || '');

      allProducts.push({
        stepIndex,
        selectionId,
        variantId: selectionId,
        quantity,
        title: matchedVariant
          ? (variantTitle ? `${product.title} - ${variantTitle}` : product.title)
          : (product.title || 'Untitled Product'),
        parentTitle: product.parentTitle || product.title || 'Untitled Product',
        variantTitle,
        imageUrl,
        image: imageUrl,
        price,
        isDefault: step.isDefault ?? false,
        isFreeGift: step.isFreeGift ?? false,
        addonDisplayFree: step.addonDisplayFree === true,
      });
    });
  });

  return allProducts;
},

isStepCompleted(stepIndex) {
  const step = this.selectedBundle.steps[stepIndex];
  const stepSelections = this.selectedProducts[stepIndex] || {};
  if (typeof this.validateStep === 'function') {
    return this.validateStep(stepIndex);
  }

  return ConditionValidator.isStepConditionSatisfied(step, stepSelections);
},

reRenderFullPage() {
  return this.renderFullPageLayout();
},
};
