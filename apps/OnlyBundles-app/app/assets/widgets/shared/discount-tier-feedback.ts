'use strict';

import { PricingCalculator } from './pricing-calculator.js';

const DISCOUNT_TIER_EVENT = 'wpb:discount-tier-reached';
export const SDK_DISCOUNT_TIER_EVENT = 'wbp:discount-tier-reached';
const DISCOUNT_TIER_FEEDBACK_ATTRIBUTE = 'data-wpb-discount-feedback';
const DISCOUNT_TIER_PILL_ATTRIBUTE = 'data-wpb-discount-feedback-pill';

const FEEDBACK_DURATIONS = Object.freeze({
  tier: 650,
  complete: 1200,
});

export type DiscountTierFeedbackState = 'tier' | 'complete';

type DiscountTierReachedDetail = {
  bundleId: string;
  tierId: string;
  tierIndex: number;
  tierCount: number;
  feedbackState: DiscountTierFeedbackState;
};

type DiscountTierState = {
  bundleId: string;
  tierId: string | null;
  tierIndex: number;
  tierCount: number;
};

type DiscountRule = {
  id?: unknown;
  conditionType?: unknown;
  conditionOperator?: unknown;
  conditionValue?: unknown;
  customerBuys?: unknown;
  customerGets?: unknown;
};

type EligibleDiscountRule = DiscountRule & {
  id: string;
  conditionType: 'quantity' | 'amount';
};

type DiscountTierBundle = {
  id?: unknown;
  pricing?: {
    enabled?: boolean;
    method?: string;
    rules?: DiscountRule[];
  };
  steps?: Array<Record<string, unknown>>;
};

type DiscountTierController = {
  selectedBundle?: DiscountTierBundle;
  selectedProducts?: Array<Record<string, number>>;
  stepProductData?: Array<Array<Record<string, unknown>>>;
};

function getEligibleRules(bundle: DiscountTierBundle): EligibleDiscountRule[] {
  const pricing = bundle?.pricing;
  if (!pricing?.enabled || !Array.isArray(pricing.rules)) return [];

  return pricing.rules
    .filter((rule: DiscountRule): rule is EligibleDiscountRule => {
      const conditionType = PricingCalculator.getRuleConditionType(rule);
      return (conditionType === 'quantity' || conditionType === 'amount')
        && typeof rule?.id === 'string'
        && rule.id.length > 0
        && Number.isFinite(Number(rule?.conditionValue));
    })
    .sort((left: DiscountRule, right: DiscountRule) => (
      PricingCalculator.getRuleConditionValue(left, pricing.method)
      - PricingCalculator.getRuleConditionValue(right, pricing.method)
    ));
}

export function captureDiscountTierState(controller: DiscountTierController): DiscountTierState {
  const bundle = controller?.selectedBundle ?? {};
  const bundleId = typeof bundle?.id === 'string' ? bundle.id : '';
  const pricingMethod = bundle.pricing?.method;
  const rules = getEligibleRules(bundle);

  if (!bundleId || rules.length === 0) {
    return { bundleId, tierId: null, tierIndex: -1, tierCount: rules.length };
  }

  const totals = PricingCalculator.calculateBundleTotal(
    Array.isArray(controller?.selectedProducts) ? controller.selectedProducts : [],
    Array.isArray(controller?.stepProductData) ? controller.stepProductData : [],
    bundle.steps ?? [],
  );

  let tierIndex = -1;
  rules.forEach((rule: DiscountRule, index: number) => {
    const currentValue = PricingCalculator.getRuleConditionType(rule) === 'amount'
      ? totals.totalPrice
      : totals.totalQuantity;
    if (PricingCalculator.checkCondition(
      currentValue,
      PricingCalculator.getRuleConditionOperator(rule),
      PricingCalculator.getRuleConditionValue(rule, pricingMethod),
    )) {
      tierIndex = index;
    }
  });

  return {
    bundleId,
    tierId: tierIndex >= 0 ? rules[tierIndex].id : null,
    tierIndex,
    tierCount: rules.length,
  };
}

export function getDiscountTierTransition(
  before: DiscountTierState,
  after: DiscountTierState,
): DiscountTierReachedDetail | null {
  if (
    !after.bundleId
    || before.bundleId !== after.bundleId
    || after.tierCount === 0
    || after.tierIndex <= before.tierIndex
    || !after.tierId
  ) {
    return null;
  }

  return {
    bundleId: after.bundleId,
    tierId: after.tierId,
    tierIndex: after.tierIndex,
    tierCount: after.tierCount,
    feedbackState: after.tierIndex === after.tierCount - 1 ? 'complete' : 'tier',
  };
}

export function dispatchDiscountTierTransition({
  root,
  before,
  after,
  eventName = DISCOUNT_TIER_EVENT,
}: {
  root?: EventTarget | null;
  before: DiscountTierState;
  after: DiscountTierState;
  eventName?: string;
}) {
  const detail = getDiscountTierTransition(before, after);
  if (!detail || !root) return null;

  root.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
  return detail;
}

export function installDiscountTierPillFeedback(root: Element) {
  const cleanupTimers = new Map<Element, ReturnType<typeof setTimeout>>();

  const replayFeedback = (event: Event) => {
    const detail = (event as CustomEvent<DiscountTierReachedDetail>).detail;
    if (detail?.feedbackState !== 'tier' && detail?.feedbackState !== 'complete') return;

    const pills = new Set<Element>(
      root.querySelectorAll(`[${DISCOUNT_TIER_PILL_ATTRIBUTE}]`),
    );
    root.ownerDocument
      ?.getElementById('bundle-builder-modal')
      ?.querySelectorAll(`[${DISCOUNT_TIER_PILL_ATTRIBUTE}]`)
      .forEach((pill) => pills.add(pill));

    pills.forEach((pill) => {
      const existingTimer = cleanupTimers.get(pill);
      if (existingTimer) clearTimeout(existingTimer);

      pill.removeAttribute(DISCOUNT_TIER_FEEDBACK_ATTRIBUTE);
      void (pill as HTMLElement).offsetWidth;
      pill.setAttribute(DISCOUNT_TIER_FEEDBACK_ATTRIBUTE, detail.feedbackState);

      const timer = setTimeout(() => {
        pill.removeAttribute(DISCOUNT_TIER_FEEDBACK_ATTRIBUTE);
        cleanupTimers.delete(pill);
      }, FEEDBACK_DURATIONS[detail.feedbackState]);
      cleanupTimers.set(pill, timer);
    });
  };

  root.addEventListener(DISCOUNT_TIER_EVENT, replayFeedback);

  return () => {
    root.removeEventListener(DISCOUNT_TIER_EVENT, replayFeedback);
    cleanupTimers.forEach((timer, pill) => {
      clearTimeout(timer);
      pill.removeAttribute(DISCOUNT_TIER_FEEDBACK_ATTRIBUTE);
    });
    cleanupTimers.clear();
  };
}
