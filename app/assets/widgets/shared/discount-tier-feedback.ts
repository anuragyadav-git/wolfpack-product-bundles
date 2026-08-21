'use strict';

import { PricingCalculator } from './pricing-calculator.js';

export const DISCOUNT_TIER_EVENT = 'wpb:discount-tier-reached';
export const SDK_DISCOUNT_TIER_EVENT = 'wbp:discount-tier-reached';
export const DISCOUNT_TIER_FEEDBACK_ATTRIBUTE = 'data-wpb-discount-feedback';
export const DISCOUNT_TIER_PILL_ATTRIBUTE = 'data-wpb-discount-feedback-pill';

const FEEDBACK_DURATIONS = Object.freeze({
  tier: 650,
  complete: 1200,
});

export type DiscountTierFeedbackState = 'tier' | 'complete';

export type DiscountTierReachedDetail = {
  bundleId: string;
  tierId: string;
  tierIndex: number;
  tierCount: number;
  feedbackState: DiscountTierFeedbackState;
};

export type DiscountTierState = {
  bundleId: string;
  tierId: string | null;
  tierIndex: number;
  tierCount: number;
};

type DiscountRule = Record<string, any>;

function getRuleConditionType(rule: DiscountRule) {
  return rule?.conditionType ?? rule?.condition?.type ?? null;
}

function getRuleConditionOperator(rule: DiscountRule) {
  return rule?.conditionOperator ?? rule?.condition?.operator ?? 'gte';
}

function getRuleConditionValue(rule: DiscountRule) {
  return Number(rule?.conditionValue ?? rule?.condition?.value ?? 0);
}

function getRuleId(rule: DiscountRule, index: number) {
  return String(rule?.id ?? rule?.ruleId ?? `tier-${index + 1}`);
}

function getEligibleRules(bundle: Record<string, any>) {
  const pricing = bundle?.pricing ?? bundle?.discountConfiguration;
  if (!pricing?.enabled || !Array.isArray(pricing.rules)) return [];

  return pricing.rules
    .filter((rule: DiscountRule) => {
      const conditionType = getRuleConditionType(rule);
      return (conditionType === 'quantity' || conditionType === 'amount')
        && Number.isFinite(getRuleConditionValue(rule));
    })
    .sort((left: DiscountRule, right: DiscountRule) => (
      getRuleConditionValue(left) - getRuleConditionValue(right)
    ));
}

export function captureDiscountTierState(controller: Record<string, any>): DiscountTierState {
  const bundle = controller?.selectedBundle ?? controller?.bundleData ?? {};
  const bundleId = String(bundle?.id ?? controller?.bundleId ?? '');
  const rules = getEligibleRules(bundle);

  if (!bundleId || rules.length === 0) {
    return { bundleId, tierId: null, tierIndex: -1, tierCount: rules.length };
  }

  const totals = PricingCalculator.calculateBundleTotal(
    Array.isArray(controller?.selectedProducts) ? controller.selectedProducts : [],
    Array.isArray(controller?.stepProductData) ? controller.stepProductData : [],
    Array.isArray(bundle?.steps) ? bundle.steps : null,
  );

  let tierIndex = -1;
  rules.forEach((rule: DiscountRule, index: number) => {
    const currentValue = getRuleConditionType(rule) === 'amount'
      ? totals.totalPrice
      : totals.totalQuantity;
    if (PricingCalculator.checkCondition(
      currentValue,
      getRuleConditionOperator(rule),
      getRuleConditionValue(rule),
    )) {
      tierIndex = index;
    }
  });

  return {
    bundleId,
    tierId: tierIndex >= 0 ? getRuleId(rules[tierIndex], tierIndex) : null,
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
}: any) {
  const detail = getDiscountTierTransition(before, after);
  if (!detail || !root?.dispatchEvent) return null;

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
