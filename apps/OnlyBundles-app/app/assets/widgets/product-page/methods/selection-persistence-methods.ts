const PRODUCT_PAGE_SELECTION_STORAGE_VERSION = 2;

function normalizeStepSelections(stepSelections: any) {
  if (
    !stepSelections ||
    typeof stepSelections !== "object" ||
    Array.isArray(stepSelections)
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(stepSelections).flatMap(([selectionKey, rawQuantity]: any) => {
      const quantity = Math.floor(Number(rawQuantity));
      if (!selectionKey || !Number.isFinite(quantity) || quantity <= 0)
        return [];
      return [[String(selectionKey), quantity]];
    })
  );
}

export function getProductPageSelectionStorageKey(bundle: any = {}) {
  const bundleKey = bundle.offerId || bundle.id;
  return bundleKey ? `wpbPpb-cart-${String(bundleKey)}` : null;
}

export function normalizeProductPageSessionSelections(payload: any, stepCount: any) {
  if (
    !payload ||
    payload.v !== PRODUCT_PAGE_SELECTION_STORAGE_VERSION ||
    !Array.isArray(payload.selectedProducts)
  ) {
    return null;
  }

  const count = Math.max(0, Math.floor(Number(stepCount) || 0));
  return Array.from({ length: count }, (_, stepIndex) =>
    normalizeStepSelections(payload.selectedProducts[stepIndex])
  );
}

export function normalizeProductPageSessionSelectionCategories(
  payload: any,
  normalizedSelections: {}[],
  stepCount: any,
) {
  if (
    !payload
    || payload.v !== PRODUCT_PAGE_SELECTION_STORAGE_VERSION
    || !Array.isArray(payload.selectedProductCategoryIndexes)
  ) {
    return null;
  }

  const count = Math.max(0, Math.floor(Number(stepCount) || 0));
  return Array.from({ length: count }, (_, stepIndex) => {
    const stepSelections = normalizedSelections?.[stepIndex] || {};
    const categoryIndexes = payload.selectedProductCategoryIndexes[stepIndex];
    if (!categoryIndexes || typeof categoryIndexes !== 'object' || Array.isArray(categoryIndexes)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(categoryIndexes).flatMap(([selectionKey, rawCategoryIndex]: any) => {
        const categoryIndex = Number(rawCategoryIndex);
        if (
          !Object.prototype.hasOwnProperty.call(stepSelections, selectionKey)
          || !Number.isInteger(categoryIndex)
          || categoryIndex < 0
        ) {
          return [];
        }
        return [[selectionKey, categoryIndex]];
      }),
    );
  });
}

export function createProductPageSessionSelectionPayload(
  selectedProducts: any[] = [],
  selectedProductCategoryIndexes: any[] = [],
) {
  return {
    v: PRODUCT_PAGE_SELECTION_STORAGE_VERSION,
    selectedProducts: Array.isArray(selectedProducts)
      ? selectedProducts.map(normalizeStepSelections)
      : [],
    selectedProductCategoryIndexes: Array.isArray(selectedProductCategoryIndexes)
      ? selectedProductCategoryIndexes.map((categoryIndexes, stepIndex) => {
        const stepSelections = normalizeStepSelections(selectedProducts?.[stepIndex]);
        if (!categoryIndexes || typeof categoryIndexes !== 'object' || Array.isArray(categoryIndexes)) {
          return {};
        }
        return Object.fromEntries(
          Object.entries(categoryIndexes).flatMap(([selectionKey, rawCategoryIndex]: any) => {
            const categoryIndex = Number(rawCategoryIndex);
            if (
              !Object.prototype.hasOwnProperty.call(stepSelections, selectionKey)
              || !Number.isInteger(categoryIndex)
              || categoryIndex < 0
            ) {
              return [];
            }
            return [[selectionKey, categoryIndex]];
          }),
        );
      })
      : [],
  };
}

export const ProductPageSelectionPersistenceMethods: Record<string, any> & ThisType<any> = {
  _getProductPageSelectionStorage() {
    try {
      return window.sessionStorage;
    } catch (_error: any) {
      return null;
    }
  },

  _getProductPageSelectionStorageKey() {
    return getProductPageSelectionStorageKey(this.selectedBundle);
  },

  _restoreSessionSelections() {
    let restoredSelections: any = null;
    let parsedPayload: any = null;

    try {
      const storage = this._getProductPageSelectionStorage();
      const storageKey = this._getProductPageSelectionStorageKey();
      const rawValue =
        storage && storageKey ? storage.getItem(storageKey) : null;
      if (rawValue) {
        parsedPayload = JSON.parse(rawValue);
        restoredSelections = normalizeProductPageSessionSelections(
          parsedPayload,
          this.selectedBundle?.steps?.length
        );
      }
    } catch (_error: any) {
      restoredSelections = null;
    }

    if (restoredSelections) {
      const restoredCategoryIndexes = normalizeProductPageSessionSelectionCategories(
        parsedPayload,
        restoredSelections,
        this.selectedBundle?.steps?.length,
      ) || restoredSelections.map(() => ({}));
      this.selectedProducts = restoredSelections.map(
        (stepSelections: any, stepIndex: string|number) => ({
          ...(this.selectedProducts?.[stepIndex] || {}),
          ...stepSelections,
        })
      );
      this.selectedProductCategoryIndexes = restoredCategoryIndexes.map(
        (categoryIndexes: any, stepIndex: string|number) => ({
          ...(this.selectedProductCategoryIndexes?.[stepIndex] || {}),
          ...categoryIndexes,
        }),
      );
    }

    this._selectionPersistenceReady = true;
    return restoredSelections !== null;
  },

  _persistSessionSelections() {
    if (!this._selectionPersistenceReady) return false;

    try {
      const storage = this._getProductPageSelectionStorage();
      const storageKey = this._getProductPageSelectionStorageKey();
      if (!storage || !storageKey) return false;

      storage.setItem(
        storageKey,
        JSON.stringify(
          createProductPageSessionSelectionPayload(
            this.selectedProducts,
            this.selectedProductCategoryIndexes,
          )
        )
      );
      return true;
    } catch (_error: any) {
      return false;
    }
  },

  async _preloadRestoredSelectionProducts() {
    const stepIndexes = (this.selectedProducts || []).flatMap(
      (stepSelections: any, stepIndex: any) =>
        Object.keys(stepSelections || {}).length > 0 ? [stepIndex] : []
    );
    await Promise.all(
      stepIndexes.map((stepIndex: any) =>
        this.loadStepProducts(stepIndex).catch(() => {})
      )
    );
  },
};
