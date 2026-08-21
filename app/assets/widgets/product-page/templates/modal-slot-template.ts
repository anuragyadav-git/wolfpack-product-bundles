import { renderSelectedProductSlots } from '../../shared/components/selected-product-slots.js';

function parseBoolean(value: string) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (['true', 'checked', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', 'unchecked', '0', 'off', 'no'].includes(normalized)) return false;
  return undefined;
}

export const modalSlotTemplateMethods: Record<string, any> & ThisType<any> = {
  _isProductPageModalSlotTemplate() {
    const config = this._getProductPageTemplateContract?.();
    return config?.templateType === 'PDP_MODAL';
  },

  _usesVerticalModalSlotLayout() {
    return this._getProductPageTemplateContract?.()?.slots?.orientation === 'vertical';
  },

  syncProductPagePrimaryCtaStyle() {
    const button = this.elements?.addToCartButton;
    if (!button) return;

    const templateContract = this._getProductPageTemplateContract?.();

    button.classList.toggle(
      'bw-ppb-primary-cta--modal-vertical',
      templateContract?.templateType === 'PDP_MODAL' && this._usesVerticalModalSlotLayout()
    );
  },

  _createModalSlotStepSection(step: any) {
    const section = document.createElement('div');
    const isVertical = this._usesVerticalModalSlotLayout();

    section.className = `bw-ppb-modal-slot-section${isVertical ? ' bw-ppb-modal-slot-section--simplified' : ''}`;

    const title = document.createElement('div');
    title.className = 'bw-ppb-modal-slot-title';
    title.textContent = step.pageTitle || step.name || '';
    section.appendChild(title);

    const gridHost = document.createElement('div');
    gridHost.innerHTML = renderSelectedProductSlots([], {
      mode: isVertical ? 'vertical' : 'horizontal',
      className: `bw-ppb-modal-slot-grid${isVertical ? ' bw-ppb-modal-slot-grid--simplified' : ''}`,
    }).trim();
    const grid = gridHost.firstElementChild;
    if (grid?.matches('[data-bw-selected-slots="true"]')) {
      section.appendChild(grid);
    }

    return section;
  },

  // Create an empty state card for a step (shown when no products selected)
  createEmptyStateCard(step: any, stepIndex: number, instanceIndex = 0) {
    const stepBox = document.createElement('button');
    stepBox.type = 'button';
    stepBox.dataset.stepIndex = String(stepIndex);
    stepBox.dataset.cardIndex = String(instanceIndex);

    stepBox.className = 'step-box bw-slot-card bw-slot-card--empty';

    const imgUrl = step.categoryImageUrl || null;
    const isModalSlotTemplate = this._isProductPageModalSlotTemplate();
    if (imgUrl && !isModalSlotTemplate) {
      stepBox.style.backgroundImage = `url('${imgUrl}')`;
      stepBox.style.backgroundSize = 'contain';
      stepBox.style.backgroundRepeat = 'no-repeat';
      stepBox.style.backgroundPosition = 'center';
    }

    if (isModalSlotTemplate) {
      const visual = document.createElement('div');
      visual.className = 'bw-slot-card__empty-visual';
      if (imgUrl) {
        visual.style.backgroundImage = `url('${imgUrl}')`;
      }
      stepBox.appendChild(visual);
    } else {
      // Circular background wrapper for the plus icon
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'bw-slot-card__plus-icon';
      const primaryColor = globalThis.getComputedStyle?.(document.documentElement)
        .getPropertyValue('--bundle-global-primary-button').trim() || '#1e3a8a';
      iconWrapper.style.setProperty('--bw-slot-icon-color', primaryColor);
      this._appendSlotIcon(iconWrapper);
      stepBox.appendChild(iconWrapper);
    }

    // Step name label below icon
    const slotNumber = instanceIndex + 1;
    const label = document.createElement('p');
    label.className = 'step-name bw-slot-card__label';
    label.textContent = isModalSlotTemplate ? `Product ${slotNumber}` : step.name || `Step ${stepIndex + 1}`;
    stepBox.appendChild(label);

    // Click handler to open modal
    stepBox.addEventListener('click', (event: any) => {
      this._modalSlotReplacementTarget = null;
      this.openModal(stepIndex, event.currentTarget);
    });

    return stepBox;
  },

  _appendModalSlotEmptyCards(target: any, step: any, stepIndex: string|number, selectedCount = 0) {
    const controls = typeof this._getProductPageControls === 'function'
      ? this._getProductPageControls()
      : this.config?.controlsSettings?.activeControls
        || this.config?.controlsSettings?.settingsControls?.productPage
        || null;
    const renderSlotsBasedOnCondition = parseBoolean(
      controls?.displayEmptyStateBoxesBasedOnBundleCondition
        ?? controls?.renderSlotsBasedOnCondition
        ?? this.selectedBundle?.renderSlotsBasedOnCondition
    );
    if (renderSlotsBasedOnCondition === false) {
      const emptyCount = selectedCount > 0 ? 0 : 1;
      for (let offset = 0; offset < emptyCount; offset += 1) {
        target.appendChild(this.createEmptyStateCard(
          step,
          stepIndex,
          selectedCount + offset
        ));
      }
      return;
    }

    const parsedRequired = Number.parseFloat(step?.conditionValue);
    const hasRequiredCount = Number.isFinite(parsedRequired) && parsedRequired >= 0;
    const rawRequired = hasRequiredCount ? parsedRequired : 1;
    const operator = String(step?.conditionOperator || '').toLowerCase();
    const requiredCount = ['greater_than', 'gt', '>'].includes(operator)
      ? rawRequired + 1
      : rawRequired;
    const isOpenEnded = [
      'greater_than',
      'gt',
      '>',
      'greater_than_or_equal_to',
      'greater_than_equal_to',
      'gte',
      '>=',
    ].includes(operator);
    let emptyCount = Math.max(0, requiredCount - selectedCount);

    if (isOpenEnded) {
      this._modalSlotCapacityByStep ||= {};
      const capacity = Math.max(
        this._modalSlotCapacityByStep[stepIndex] || 0,
        requiredCount,
        selectedCount + 1
      );
      this._modalSlotCapacityByStep[stepIndex] = capacity;
      emptyCount = capacity - selectedCount;
    }

    for (let offset = 0; offset < emptyCount; offset += 1) {
      target.appendChild(this.createEmptyStateCard(
        step,
        stepIndex,
        selectedCount + offset
      ));
    }
  },

  _appendSlotIcon(iconWrapper: any) {
    iconWrapper.innerHTML = `<svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.202 3.06152V37.0082M37.1753 20.0348H3.22864" stroke="currentColor" stroke-width="5.09199" stroke-linecap="square" stroke-linejoin="round"/>
    </svg>`;
  },
};
