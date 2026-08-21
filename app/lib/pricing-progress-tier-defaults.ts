import {
  DiscountMethod,
  type PricingRule,
  type PricingRuleTierText,
} from "../types/pricing";

export const DEFAULT_PROGRESS_TIER_TEXT_TEMPLATES = {
  quantity: "{conditionValue} Pack",
  amount: "Spend {currencySymbol}{conditionValue}",
  buyXGetY: "Add {totalQuantity}",
} as const;

export const DEFAULT_PROGRESS_TIER_SUBTEXT_TEMPLATES = {
  percentage: "Save {discountValue}%",
  fixedAmount: "Save {currencySymbol}{discountValue}",
  fixedBundlePrice: "Save {currencySymbol}{discountValue}",
  buyXGetYPercentage:
    "{customerGets} Product(s) @ {discountValue}% off",
  buyXGetYFixedAmount:
    "{customerGets} Product(s) @ {currencySymbol}{discountValue} off",
} as const;

export type ProgressTierState = {
  tierTextByRuleId: Record<string, PricingRuleTierText>;
  tierTextByLocaleByRuleId: Record<
    string,
    Record<string, PricingRuleTierText>
  >;
};

function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]: any) =>
      result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function centsToCompactAmount(value: number): string {
  return String(Number(value || 0) / 100);
}

export function getBogoDiscountInputValue(
  storedValue: number,
  discountType: PricingRule["bxyDiscountType"],
): number {
  return discountType === "fixed_amount" ? storedValue / 100 : storedValue;
}

export function getBogoDiscountStoredValue(
  inputValue: number,
  discountType: PricingRule["bxyDiscountType"],
): number {
  return discountType === "fixed_amount"
    ? Math.round(inputValue * 100)
    : inputValue;
}

export function getShopCurrencySymbol(currencyCode: string): string {
  const currencyPart = new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .formatToParts(0)
    .find((part) => part.type === "currency");

  return currencyPart?.value ?? currencyCode;
}

export function getDefaultProgressTierText(
  rule: PricingRule,
  method: DiscountMethod,
  currencyCode: string,
): PricingRuleTierText {
  const currencySymbol = getShopCurrencySymbol(currencyCode);

  if (method === DiscountMethod.BUY_X_GET_Y) {
    const customerBuys = Number(rule.customerBuys ?? 0);
    const customerGets = Number(rule.customerGets ?? 0);
    const fixedAmount = rule.bxyDiscountType === "fixed_amount";
    return {
      tierText: fillTemplate(
        DEFAULT_PROGRESS_TIER_TEXT_TEMPLATES.buyXGetY,
        { totalQuantity: customerBuys + customerGets },
      ),
      tierSubtext: fillTemplate(
        fixedAmount
          ? DEFAULT_PROGRESS_TIER_SUBTEXT_TEMPLATES.buyXGetYFixedAmount
          : DEFAULT_PROGRESS_TIER_SUBTEXT_TEMPLATES.buyXGetYPercentage,
        {
          customerGets,
          currencySymbol,
          discountValue: fixedAmount
            ? centsToCompactAmount(rule.discountValue)
            : rule.discountValue,
        },
      ),
    };
  }

  const amountCondition = rule.conditionType === "amount";
  const tierText = fillTemplate(
    amountCondition
      ? DEFAULT_PROGRESS_TIER_TEXT_TEMPLATES.amount
      : DEFAULT_PROGRESS_TIER_TEXT_TEMPLATES.quantity,
    {
      currencySymbol,
      conditionValue: amountCondition
        ? centsToCompactAmount(rule.conditionValue)
        : rule.conditionValue,
    },
  );

  if (method === DiscountMethod.PERCENTAGE_OFF) {
    return {
      tierText,
      tierSubtext: fillTemplate(
        DEFAULT_PROGRESS_TIER_SUBTEXT_TEMPLATES.percentage,
        { discountValue: rule.discountValue },
      ),
    };
  }

  return {
    tierText,
    tierSubtext: fillTemplate(
      method === DiscountMethod.FIXED_BUNDLE_PRICE
        ? DEFAULT_PROGRESS_TIER_SUBTEXT_TEMPLATES.fixedBundlePrice
        : DEFAULT_PROGRESS_TIER_SUBTEXT_TEMPLATES.fixedAmount,
      {
        currencySymbol,
        discountValue: centsToCompactAmount(rule.discountValue),
      },
    ),
  };
}

export function ensureProgressTierDefaults(
  rules: PricingRule[],
  method: DiscountMethod,
  currencyCode: string,
  existing: Record<string, PricingRuleTierText>,
): Record<string, PricingRuleTierText> {
  const next = { ...existing };
  for (const rule of rules) {
    if (next[rule.id] === undefined) {
      next[rule.id] = getDefaultProgressTierText(rule, method, currencyCode);
    }
  }
  return next;
}

function getAffectedTierFields(
  method: DiscountMethod,
  updates: Partial<PricingRule>,
): Array<keyof PricingRuleTierText> {
  const fields = new Set<keyof PricingRuleTierText>();
  if (method === DiscountMethod.BUY_X_GET_Y) {
    if (updates.customerBuys !== undefined) fields.add("tierText");
    if (updates.customerGets !== undefined) {
      fields.add("tierText");
      fields.add("tierSubtext");
    }
    if (
      updates.discountValue !== undefined ||
      updates.bxyDiscountType !== undefined
    ) {
      fields.add("tierSubtext");
    }
    return [...fields];
  }

  if (
    updates.conditionType !== undefined ||
    updates.conditionValue !== undefined
  ) {
    fields.add("tierText");
  }
  if (updates.discountValue !== undefined) fields.add("tierSubtext");
  return [...fields];
}

export function applyProgressTierRuleUpdate({
  state,
  rule,
  updates,
  method,
  currencyCode,
}: {
  state: ProgressTierState;
  rule: PricingRule;
  updates: Partial<PricingRule>;
  method: DiscountMethod;
  currencyCode: string;
}): ProgressTierState {
  const affectedFields = getAffectedTierFields(method, updates);
  if (affectedFields.length === 0) return state;

  const defaults = getDefaultProgressTierText(rule, method, currencyCode);
  const current =
    state.tierTextByRuleId[rule.id] ??
    getDefaultProgressTierText(rule, method, currencyCode);
  const nextRuleText = { ...current };
  for (const field of affectedFields) nextRuleText[field] = defaults[field];

  const nextLocalized = Object.fromEntries(
    Object.entries(state.tierTextByLocaleByRuleId).map(
      ([locale, localizedRules]: any) => {
        const localizedRule = localizedRules[rule.id];
        if (!localizedRule) return [locale, localizedRules];
        const nextLocalizedRule = { ...localizedRule };
        for (const field of affectedFields) {
          nextLocalizedRule[field] = defaults[field];
        }
        return [
          locale,
          { ...localizedRules, [rule.id]: nextLocalizedRule },
        ];
      },
    ),
  );

  return {
    tierTextByRuleId: {
      ...state.tierTextByRuleId,
      [rule.id]: nextRuleText,
    },
    tierTextByLocaleByRuleId: nextLocalized,
  };
}

export function removeProgressTierRule(
  state: ProgressTierState,
  ruleId: string,
): ProgressTierState {
  const tierTextByRuleId = { ...state.tierTextByRuleId };
  delete tierTextByRuleId[ruleId];

  const tierTextByLocaleByRuleId = Object.fromEntries(
    Object.entries(state.tierTextByLocaleByRuleId).map(
      ([locale, localizedRules]: any) => {
        const nextRules = { ...localizedRules };
        delete nextRules[ruleId];
        return [locale, nextRules];
      },
    ),
  );

  return { tierTextByRuleId, tierTextByLocaleByRuleId };
}
