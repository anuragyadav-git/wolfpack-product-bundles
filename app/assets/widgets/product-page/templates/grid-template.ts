export const gridTemplateMethods: Record<string, any> & ThisType<any> = {
  _isProductPageGridTemplate() {
    return this._getProductPageTemplateContract?.()?.id === 'GRID';
  },

  _usesCompactInpageProductCards() {
    return Boolean(this._isProductPageCascadeTemplate?.() || this._isProductPageGridTemplate());
  },

  _renderGridFooter(el) {
    this._renderCascadeFooter(el);
  },
};
