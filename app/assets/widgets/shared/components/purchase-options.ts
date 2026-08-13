type StorefrontSubscription = {
  enabled?: boolean;
  selectedPlanIds?: string[];
  selectedGroup?: { id: string; name: string; plans?: Array<{ id: string; sourceName?: string }> } | null;
  defaultPurchaseOption?: { kind?: string; sellingPlanId?: string };
  oneTimePurchase?: { enabled?: boolean; title?: string };
  copy?: { title?: string; subtitle?: string };
  planCopy?: Record<string, { displayName?: string }>;
};

type PurchaseOptionsController = {
  selectedBundle?: { id?: string; subscription?: StorefrontSubscription };
  selectedSellingPlanId?: string | null;
  elements: { purchaseOptions?: HTMLElement | null; stepsContainer: Element };
  container: Element;
  updateAddToCartButton?: () => void;
};

function selectedPlans(subscription: StorefrontSubscription) {
  const ids = new Set(Array.isArray(subscription?.selectedPlanIds) ? subscription.selectedPlanIds : []);
  return (subscription?.selectedGroup?.plans || []).filter((plan: { id: string }) => ids.has(plan.id));
}

export function getDefaultSellingPlanId(subscription: StorefrontSubscription) {
  if (subscription?.defaultPurchaseOption?.kind === 'selling_plan') {
    return subscription.defaultPurchaseOption.sellingPlanId || null;
  }
  return null;
}

export function isPurchaseOptionSelected(value: string, selectedSellingPlanId?: string | null) {
  return value === 'one_time' ? !selectedSellingPlanId : Boolean(selectedSellingPlanId);
}

export function renderPpbPurchaseOptions(controller: PurchaseOptionsController) {
  const subscription = controller?.selectedBundle?.subscription;
  controller.elements.purchaseOptions?.remove?.();
  controller.elements.purchaseOptions = null;
  if (!subscription?.enabled || !subscription.selectedGroup) return;

  const plans = selectedPlans(subscription);
  if (plans.length === 0) return;
  const bundleId = controller.selectedBundle?.id || 'bundle';
  if (controller.selectedSellingPlanId === undefined) {
    controller.selectedSellingPlanId = getDefaultSellingPlanId(subscription);
  }

  const root = document.createElement('fieldset');
  root.className = 'wpb-purchase-options';
  const legend = document.createElement('legend');
  legend.className = 'wpb-purchase-options__title';
  legend.textContent = subscription.copy?.title || '';
  root.appendChild(legend);

  if (subscription.copy?.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'wpb-purchase-options__subtitle';
    subtitle.textContent = subscription.copy.subtitle;
    root.appendChild(subtitle);
  }

  const addOption = (value: string, labelText: string) => {
    const label = document.createElement('label');
    label.className = 'wpb-purchase-options__option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `wpb-purchase-option-${bundleId}`;
    input.value = value;
    input.checked = isPurchaseOptionSelected(value, controller.selectedSellingPlanId);
    input.addEventListener('change', () => {
      controller.selectedSellingPlanId = value === 'one_time'
        ? null
        : (plans.length === 1 ? plans[0].id : controller.selectedSellingPlanId || plans[0].id);
      renderPpbPurchaseOptions(controller);
      controller.updateAddToCartButton?.();
    });
    const text = document.createElement('span');
    text.textContent = labelText;
    label.append(input, text);
    root.appendChild(label);
  };

  if (subscription.oneTimePurchase?.enabled) {
    addOption('one_time', subscription.oneTimePurchase.title || '');
  }
  addOption('subscription', subscription.selectedGroup.name);

  if (controller.selectedSellingPlanId && plans.length > 1) {
    const select = document.createElement('select');
    select.className = 'wpb-purchase-options__plan-select';
    select.setAttribute('aria-label', subscription.selectedGroup.name);
    plans.forEach((plan: { id: string; sourceName?: string }) => {
      const option = document.createElement('option');
      option.value = plan.id;
      option.textContent = subscription.planCopy?.[plan.id]?.displayName || plan.sourceName || '';
      option.selected = plan.id === controller.selectedSellingPlanId;
      select.appendChild(option);
    });
    select.addEventListener('change', () => {
      controller.selectedSellingPlanId = select.value;
      controller.updateAddToCartButton?.();
    });
    root.appendChild(select);
  }

  const groupName = document.createElement('p');
  groupName.className = 'wpb-purchase-options__group';
  groupName.textContent = subscription.selectedGroup.name;
  root.appendChild(groupName);

  controller.container.insertBefore(root, controller.elements.stepsContainer);
  controller.elements.purchaseOptions = root;
}
