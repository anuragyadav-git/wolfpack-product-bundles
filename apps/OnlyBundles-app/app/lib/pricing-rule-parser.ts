import type {
  PricingConditionOperator,
  PricingConfiguration,
  PricingMessages,
  PricingRule,
} from "../types/pricing";
import { parsePricingTierBadge } from "./pricing-tier-badge";

type BxyDiscountType = 'percentage' | 'fixed_amount';
type BxyApplyMode = 'lowest_priced' | 'latest_added';

const VALID_CONDITION_TYPES = new Set(['quantity', 'amount']);
const VALID_CONDITION_OPERATORS = new Set<PricingConditionOperator>([
  'gte',
  'gt',
  'lte',
  'lt',
  'eq',
]);
const VALID_BXY_DISCOUNT_TYPES = new Set<BxyDiscountType>(['percentage', 'fixed_amount']);
const VALID_BXY_APPLY_MODES = new Set<BxyApplyMode>(['lowest_priced', 'latest_added']);

/**
 * Parse a raw DB JSON value into a validated flat PricingRule.
 * Only accepts the flat canonical shape.
 * Throws if required fields are missing or invalid.
 */
export function parsePricingRule(raw: unknown): PricingRule {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error("parsePricingRule: input must be a non-null object");
  }

  const r = raw as Record<string, unknown>;

  if (typeof r.id !== 'string' || !r.id) {
    throw new Error("parsePricingRule: missing required field 'id'");
  }

  const conditionType = r.conditionType as string;
  if (!VALID_CONDITION_TYPES.has(conditionType)) {
    throw new Error(`parsePricingRule: invalid conditionType '${conditionType}' — must be 'quantity' or 'amount'`);
  }

  const conditionValue = Number(r.conditionValue);
  if (!isFinite(conditionValue) || conditionValue < 0) {
    throw new Error(`parsePricingRule: conditionValue must be a non-negative number, got ${r.conditionValue}`);
  }

  const discountValue = Number(r.discountValue);
  if (!isFinite(discountValue) || discountValue < 0) {
    throw new Error(`parsePricingRule: discountValue must be a non-negative number, got ${r.discountValue}`);
  }

  const conditionOperator =
    r.conditionOperator === undefined || r.conditionOperator === null || r.conditionOperator === ''
      ? 'gte'
      : r.conditionOperator;
  if (!VALID_CONDITION_OPERATORS.has(conditionOperator as PricingConditionOperator)) {
    throw new Error(
      `parsePricingRule: invalid conditionOperator '${conditionOperator}' — must be 'gte', 'gt', 'lte', 'lt', or 'eq'`,
    );
  }

  const rule: PricingRule = {
    id: r.id,
    conditionType: conditionType as 'quantity' | 'amount',
    conditionOperator: conditionOperator as PricingConditionOperator,
    conditionValue,
    discountValue,
  };

  if (typeof r.customerBuys === 'number' || typeof r.customerBuys === 'string') {
    rule.customerBuys = Number(r.customerBuys);
  }

  if (typeof r.customerGets === 'number' || typeof r.customerGets === 'string') {
    rule.customerGets = Number(r.customerGets);
  }

  if (r.bxyDiscountType !== undefined) {
    if (VALID_BXY_DISCOUNT_TYPES.has(r.bxyDiscountType as BxyDiscountType)) {
      rule.bxyDiscountType = r.bxyDiscountType as BxyDiscountType;
    }
  }

  if (r.bxyApplyMode !== undefined) {
    if (VALID_BXY_APPLY_MODES.has(r.bxyApplyMode as BxyApplyMode)) {
      rule.bxyApplyMode = r.bxyApplyMode as BxyApplyMode;
    }
  }

  try {
    const tierBadge = parsePricingTierBadge(r.tierBadge);
    if (tierBadge) rule.tierBadge = tierBadge;
  } catch (error) {
    throw new Error(`parsePricingRule: tierBadge invalid — ${(error as Error).message}`);
  }

  return rule;
}

/**
 * Parse a raw DB object into a validated PricingConfiguration.
 * Rules must already be in flat canonical format.
 */
export function parsePricingConfiguration(raw: unknown): PricingConfiguration {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error("parsePricingConfiguration: input must be a non-null object");
  }

  const c = raw as Record<string, unknown>;

  const enabled = Boolean(c.enabled);
  const method = (typeof c.method === 'string' ? c.method : 'percentage_off') as PricingConfiguration['method'];

  const rawRules = Array.isArray(c.rules) ? c.rules : [];
  const rules = rawRules.map((r, i) => {
    try {
      return parsePricingRule(r);
    } catch (err: any) {
      throw new Error(`parsePricingConfiguration: rule[${i}] invalid — ${(err as Error).message}`);
    }
  });

  const rawDisplay = (c.display as Record<string, unknown>) || {};
  const display: PricingConfiguration['display'] = {
    showFooter: rawDisplay.showFooter !== false,
    showDiscountProgressBar: rawDisplay.showDiscountProgressBar === true,
  };

  const rawMessages = (c.messages as Record<string, unknown>) || {};
  const messages = parseMessages(rawMessages);

  return { enabled, method, rules, display, messages };
}

function parseMessages(raw: Record<string, unknown>): PricingMessages {
  const messages: PricingMessages = {
    progress: typeof raw.progress === 'string' ? raw.progress : '',
    qualified: typeof raw.qualified === 'string' ? raw.qualified : '',
    showInCart: raw.showInCart !== false,
  };

  if (raw.tierTextByRuleId && typeof raw.tierTextByRuleId === 'object') {
    messages.tierTextByRuleId = raw.tierTextByRuleId as PricingMessages['tierTextByRuleId'];
  }

  if (raw.tierTextByLocaleByRuleId && typeof raw.tierTextByLocaleByRuleId === 'object') {
    messages.tierTextByLocaleByRuleId = raw.tierTextByLocaleByRuleId as PricingMessages['tierTextByLocaleByRuleId'];
  }

  return messages;
}
