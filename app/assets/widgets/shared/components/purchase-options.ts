import { PricingCalculator } from '../pricing-calculator.js';
import {
  buildStorefrontPlanPresentation,
  resolveStorefrontSubscriptionPresentation,
} from '../engine/selling-plan-pricing.js';

type StorefrontSubscription = {
  enabled?: boolean;
  selectedPlanIds?: string[];
  selectedGroup?: { id: string; name: string; plans?: Array<{
    id: string;
    sourceName?: string;
    pricingPolicies?: Array<{ kind?: string; value?: number; afterCycle?: number }>;
  }> } | null;
  defaultPurchaseOption?: { kind?: string; sellingPlanId?: string };
  oneTimePurchase?: { enabled?: boolean; title?: string };
  copy?: { title?: string; subtitle?: string };
  planCopy?: Record<string, { displayName?: string; discountPill?: string; description?: string }>;
};

type PurchaseOptionsController = {
  selectedBundle?: { id?: string; subscription?: StorefrontSubscription };
  selectedSellingPlanId?: string | null;
  elements: {
    purchaseOptions?: HTMLElement[];
    purchaseOptionsMounts?: Record<string, Element | null | undefined>;
    stepsContainer: Element;
  };
  container: Element;
  updateAddToCartButton?: (...args: any[]) => any;
  selectedProducts?: Array<Record<string, number>>;
  stepProductData?: any[];
  _purchaseOptionsRefreshInstalled?: boolean;
  refreshSubscriptionProductCardPrices?: () => void;
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

export function getDisplayedSellingPlanId(
  selectedSellingPlanId: string | null | undefined,
  plans: Array<{ id: string }>,
) {
  return selectedSellingPlanId || plans[0]?.id || null;
}

export function isPurchaseOptionSelected(value: string, selectedSellingPlanId?: string | null) {
  return value === 'one_time' ? !selectedSellingPlanId : Boolean(selectedSellingPlanId);
}

export function resolveCompactPlanSupportingCopy(
  presentation: { displayName?: string; description?: string },
) {
  return presentation.description || presentation.displayName || '';
}

export function resolvePurchaseOptionsMounts(
  mounts: Record<string, Element | null | undefined> = {},
) {
  const availableMounts = Object.values(mounts).filter((mount): mount is Element => (
    Boolean(mount) && mount?.isConnected !== false
  ));
  return Array.from(new Set(availableMounts));
}

export function renderBundlePurchaseOptions(controller: PurchaseOptionsController) {
  if (
    !controller._purchaseOptionsRefreshInstalled &&
    typeof controller.updateAddToCartButton === 'function'
  ) {
    const updateAddToCartButton = controller.updateAddToCartButton.bind(controller);
    controller.updateAddToCartButton = (...args: any[]) => {
      const result = updateAddToCartButton(...args);
      renderBundlePurchaseOptions(controller);
      return result;
    };
    controller._purchaseOptionsRefreshInstalled = true;
  }
  const subscription = resolveStorefrontSubscriptionPresentation(
    controller?.selectedBundle?.subscription,
    document.documentElement.lang,
  );
  (controller.elements.purchaseOptions || []).forEach((element) => element.remove?.());
  controller.elements.purchaseOptions = [];
  if (!subscription?.enabled || !subscription.selectedGroup) return;

  const plans = selectedPlans(subscription);
  if (plans.length === 0) return;
  const bundleId = controller.selectedBundle?.id || 'bundle';
  if (controller.selectedSellingPlanId === undefined) {
    controller.selectedSellingPlanId = getDefaultSellingPlanId(subscription);
  }
  const displayedSellingPlanId = getDisplayedSellingPlanId(
    controller.selectedSellingPlanId,
    plans,
  );

  const registeredMounts = resolvePurchaseOptionsMounts(controller.elements.purchaseOptionsMounts);
  const mounts = registeredMounts.length > 0 ? registeredMounts : [controller.container];

  mounts.forEach((mount, mountIndex) => {
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
      label.dataset.purchaseType = value;
      const optionHeader = document.createElement('span');
      optionHeader.className = 'wpb-purchase-options__option-header';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `wpb-purchase-option-${bundleId}-${mountIndex}`;
      input.value = value;
      input.checked = isPurchaseOptionSelected(value, controller.selectedSellingPlanId);
      input.addEventListener('change', () => {
        controller.selectedSellingPlanId = value === 'one_time'
          ? null
          : (plans.length === 1 ? plans[0].id : controller.selectedSellingPlanId || plans[0].id);
        if (controller.updateAddToCartButton) controller.updateAddToCartButton();
        else renderBundlePurchaseOptions(controller);
        controller.refreshSubscriptionProductCardPrices?.();
      });
      const text = document.createElement('span');
      text.textContent = labelText;
      optionHeader.append(input, text);
      label.appendChild(optionHeader);
      root.appendChild(label);
      return label;
    };

    const subscriptionOption = addOption('subscription', subscription.selectedGroup.name);

    if (displayedSellingPlanId && plans.length > 1) {
      const select = document.createElement('select');
      select.className = 'wpb-purchase-options__plan-select';
      select.setAttribute('aria-label', subscription.selectedGroup.name);
      plans.forEach((plan: { id: string; sourceName?: string }) => {
        const option = document.createElement('option');
        option.value = plan.id;
        option.textContent = subscription.planCopy?.[plan.id]?.displayName || plan.sourceName || '';
        option.selected = plan.id === displayedSellingPlanId;
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        controller.selectedSellingPlanId = select.value;
        if (controller.updateAddToCartButton) controller.updateAddToCartButton();
        else renderBundlePurchaseOptions(controller);
        controller.refreshSubscriptionProductCardPrices?.();
      });
      subscriptionOption.appendChild(select);
    }

    if (displayedSellingPlanId) {
      const { totalPrice, unitPrices } = PricingCalculator.calculateBundleTotal(
        controller.selectedProducts ?? [],
        controller.stepProductData ?? [],
        (controller.selectedBundle as any)?.steps ?? null,
      );
      const presentation = buildStorefrontPlanPresentation(
        subscription,
        displayedSellingPlanId,
        totalPrice,
        unitPrices,
      );
      if (presentation) {
        const supportingCopy = resolveCompactPlanSupportingCopy(presentation);
        const details = document.createElement('div');
        details.className = 'wpb-purchase-options__plan-details';
        details.setAttribute('aria-live', 'polite');
        if (supportingCopy) {
          const supporting = document.createElement('span');
          supporting.className = 'wpb-purchase-options__supporting-copy';
          supporting.textContent = supportingCopy;
          details.appendChild(supporting);
        }
        if (presentation.discountPill) {
          const pill = document.createElement('span');
          pill.className = 'wpb-purchase-options__discount-pill';
          pill.textContent = presentation.discountPill;
          details.appendChild(pill);
        }
        subscriptionOption.appendChild(details);
      }
    }

    if (subscription.oneTimePurchase?.enabled) {
      addOption('one_time', subscription.oneTimePurchase.title || '');
    }

    if (registeredMounts.length > 0) mount.appendChild(root);
    else controller.container.insertBefore(root, controller.elements.stepsContainer);
    controller.elements.purchaseOptions?.push(root);
  });
}
