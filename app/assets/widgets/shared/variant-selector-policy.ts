import { TemplateDesignSystem } from './template-design-system.js';

export function shouldRenderInlineVariantSelector({
  bundleVariantSelectorEnabled = true,
  product,
  displayVariantsAsIndividualProducts = false,
} = {}) {
  if (bundleVariantSelectorEnabled === false) return false;
  if (!product || !Array.isArray(product.variants) || product.variants.length <= 1) return false;
  if (displayVariantsAsIndividualProducts === true) return false;
  if (product.parentProductId && product.variants.length === 0) return false;
  return true;
}

export function getInlineVariantSelectorPresentation(designPreset) {
  const templateSystem = TemplateDesignSystem;

  if (typeof templateSystem?.fpb?.resolveContract !== 'function') {
    return { type: 'buttons', mobileMode: null };
  }

  const contract = templateSystem.fpb.resolveContract(designPreset);
  if (contract?.id === 'COMPACT') {
    return { type: 'buttons', mobileMode: null };
  }
  const cardMode = contract?.productCard?.mode;
  if (cardMode === 'row') {
    return { type: 'dropdown', mobileMode: 'inline' };
  }
  if (cardMode === 'grid' || cardMode === 'compact') {
    return { type: 'dropdown', mobileMode: 'drawer' };
  }

  return { type: 'buttons', mobileMode: null };
}
