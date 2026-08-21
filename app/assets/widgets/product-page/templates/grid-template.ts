export const gridTemplateMethods: Record<string, any> & ThisType<any> = {
  _isProductPageGridTemplate() {
    return this._getProductPageTemplateContract?.()?.id === 'GRID';
  },

  _usesCompactInpageProductCards() {
    return Boolean(this._isProductPageCascadeTemplate?.() || this._isProductPageGridTemplate());
  },

  _renderGridFooter(el: any) {
    this._renderCascadeFooter(el);
  },
};
