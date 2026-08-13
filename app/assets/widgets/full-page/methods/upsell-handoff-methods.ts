import {
  consumeFpbUpsellHandoff,
  reconcileFpbUpsellHandoff,
} from '../../../../storefront/fpb-upsell-handoff.js';

export const fullPageUpsellHandoffMethods = {
  _initializeFpbUpsellHandoff() {
    const bundleId = String(this.selectedBundle?.id ?? this.container?.dataset?.bundleId ?? '');
    this._pendingFpbUpsellHandoff = bundleId && typeof window !== 'undefined'
      ? consumeFpbUpsellHandoff(window.sessionStorage, bundleId)
      : null;
    this._fpbUpsellHydratedStepIndexes = new Set();
  },

  _reconcileFpbUpsellHandoffAfterStepLoad(stepIndex) {
    const payload = this._pendingFpbUpsellHandoff;
    if (!payload) return;
    this._fpbUpsellHydratedStepIndexes ??= new Set();
    this._fpbUpsellHydratedStepIndexes.add(stepIndex);
    const result = reconcileFpbUpsellHandoff({
      bundleId: String(this.selectedBundle?.id ?? ''),
      payload,
      steps: this.selectedBundle?.steps ?? [],
      stepProductData: this.stepProductData,
      selectedProducts: this.selectedProducts,
    });
    if (result.matched) {
      this._pendingFpbUpsellHandoff = null;
      if (result.changed) {
        const sidePanel = this.container?.querySelector?.('.full-page-side-panel');
        if (sidePanel && typeof this.renderSidePanel === 'function') this.renderSidePanel(sidePanel);
        if (typeof this._renderMobileSummaryTray === 'function') this._renderMobileSummaryTray({ preserveOpen: true });
      }
      return;
    }
    const paidStepIndexes = (this.selectedBundle?.steps ?? [])
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step?.enabled !== false && step?.isFreeGift !== true)
      .map(({ index }) => index);
    if (paidStepIndexes.every((index) => this._fpbUpsellHydratedStepIndexes.has(index))) {
      this._pendingFpbUpsellHandoff = null;
    }
  },
};
