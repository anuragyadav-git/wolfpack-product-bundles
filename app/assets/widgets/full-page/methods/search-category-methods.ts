export const fullPageSearchCategoryMethods: Record<string, any> & ThisType<any> = {
createSearchInput() {
  const searchContainer = document.createElement('div');
  searchContainer.className = 'step-search-container';

  searchContainer.innerHTML = `
    <div class="step-search-input-wrapper">
      <svg class="step-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        class="step-search-input"
        placeholder="Search products..."
        value="${this.searchQuery}"
        autocomplete="off"
      />
      <button class="step-search-clear" type="button"${this.searchQuery ? '' : ' hidden'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;

  const input = searchContainer.querySelector<HTMLInputElement>('.step-search-input')!;
  const clearBtn = searchContainer.querySelector<HTMLButtonElement>('.step-search-clear')!;

  // Handle input with debounce
  input.addEventListener('input', (e: any) => {
    const value = e.target.value;

    // Show/hide clear button
    clearBtn.hidden = !value;

    // Debounce the search
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.searchQuery = value;
      this.updateProductGridWithSearch();
    }, 300);
  });

  // Handle clear button
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.hidden = true;
    this.searchQuery = '';
    this.updateProductGridWithSearch();
    input.focus();
  });

  // Handle escape key to clear
  input.addEventListener('keydown', (e: any) => {
    if (e.key === 'Escape') {
      input.value = '';
      clearBtn.hidden = true;
      this.searchQuery = '';
      this.updateProductGridWithSearch();
    }
  });

  return searchContainer;
},

// Update product grid when search query changes (without full re-render)
updateProductGridWithSearch() {
  const gridContainer = this.container.querySelector('.full-page-product-grid-container');
  if (!gridContainer) return;

  const productGrid = this.createFullPageProductGrid(this.currentStepIndex);
  gridContainer.innerHTML = '';
  gridContainer.appendChild(productGrid);
},

collectStepProductIds(step: any) {
  const productIds: any[] = [];
  const addProductId = (product: any) => {
    const id = product?.selectionId;
    if (id && !productIds.includes(id)) productIds.push(id);
  };

  (step.products || []).forEach(addProductId);
  (step.categories || []).forEach((category: any)  => {
    (category.products || []).forEach(addProductId);
  });

  return productIds;
},

collectStepCollectionHandles(step: any) {
  const handles: any[] = [];
  const addCollectionHandle = (collection: any) => {
    const handle = collection?.handle;
    if (handle && !handles.includes(handle)) handles.push(handle);
  };

  (step.collections || []).forEach(addCollectionHandle);
  (step.categories || []).forEach((category: any)  => {
    (category.collections || []).forEach(addCollectionHandle);
  });

  return handles;
},

getStepCategoryTabEntries(step: any) {
  if (!Array.isArray(step.categories)) return [];

  return step.categories
    .map((category: any, index: any) => {
      const id = category.id || `category-${index}`;
      const title = category.title || category.name;
      if (!id || !title) return null;

      const handles: any[] = [];
      const productIds: any[] = [];
      const addHandle = (collection: any) => {
        const handle = collection?.handle;
        if (handle && !handles.includes(handle)) handles.push(handle);
      };
      const addProductId = (product: any) => {
        const productId = product?.selectionId;
        if (productId && !productIds.includes(productId)) productIds.push(productId);
      };

      (category.collections || []).forEach(addHandle);
      (category.products || []).forEach(addProductId);

      return {
        id,
        title,
        handles,
        productIds,
        displayVariantsAsIndividualProducts: category.displayVariantsAsIndividualProducts === true,
        displayVariantsAsSwatches: category.displayVariantsAsSwatches === true,
      };
    })
    .filter(Boolean);
},

getActiveStepCategoryId(step: any) {
  const categoryEntries = this.getStepCategoryTabEntries(step);
  if (categoryEntries.length === 0) return this.activeCollectionId;
  if (this.activeCollectionId && categoryEntries.some((entry: any)  => entry.id === this.activeCollectionId)) {
    return this.activeCollectionId;
  }
  return categoryEntries[0].id;
},

getActiveStepCategoryEntry(step: any) {
  const categoryEntries = this.getStepCategoryTabEntries(step);
  const activeCategoryId = this.getActiveStepCategoryId(step);
  return categoryEntries.find((entry: any)  => entry.id === activeCategoryId) || null;
},

shouldDisplayVariantsAsIndividualForProductGrid(step: any, activeCategory: any) {
  const stepDisplaysVariantsAsIndividual =
    step?.displayVariantsAsIndividualProducts === true || step?.displayVariantsAsIndividual === true;

  if (activeCategory) {
    return activeCategory.displayVariantsAsIndividualProducts === true || stepDisplaysVariantsAsIndividual;
  }

  const hasCategoryEntries = this.getStepCategoryTabEntries(step).length > 0;
  if (hasCategoryEntries) {
    return false;
  }

  return stepDisplaysVariantsAsIndividual;
},

createActiveCategoryTitle(stepIndex: string|number) {
  if (!this.selectedBundle || !this.selectedBundle.steps || !this.selectedBundle.steps[stepIndex]) {
    return null;
  }

  const activeCategory = this.getActiveStepCategoryEntry(this.selectedBundle.steps[stepIndex]);
  if (!activeCategory?.title) return null;

  const title = document.createElement('div');
  title.className = 'fpb-step-category-title';
  title.textContent = activeCategory.title;
  return title;
},
};
