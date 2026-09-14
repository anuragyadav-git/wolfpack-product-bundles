import type { PriceAdjustment } from "../types";
import { parsePricingRule } from "../../../../lib/pricing-rule-parser";
import type { PricingRule } from "../../../../types/pricing";

const BXY_METHOD = "buy_x_get_y";

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildPriceAdjustmentRule(method: string, rule: PricingRule): PriceAdjustment {
  const priceAdjustment: PriceAdjustment = {
    method,
    value: toNumber(rule.discountValue),
  };

  const customerBuys = toNumber(rule.customerBuys);
  const customerGets = toNumber(rule.customerGets);
  const isBxy = priceAdjustment.method === BXY_METHOD;

  if (isBxy) {
    if (customerBuys > 0) {
      priceAdjustment.customerBuys = customerBuys;
    }
    if (customerGets > 0) {
      priceAdjustment.customerGets = customerGets;
    }

    priceAdjustment.discountType = rule.bxyDiscountType ?? "percentage";
    priceAdjustment.applyDiscountTo = rule.bxyApplyMode ?? "lowest_priced";
  }

  const condType = isBxy && customerBuys > 0 && customerGets > 0
    ? "quantity"
    : rule.conditionType;
  const condValue = isBxy && customerBuys > 0 && customerGets > 0
    ? customerBuys + customerGets
    : toNumber(rule.conditionValue);

  if (condType && condValue > 0) {
    priceAdjustment.conditions = {
      type: condType,
      operator: rule.conditionOperator ?? "gte",
      value: condValue,
    };
  }

  return priceAdjustment;
}

export function buildPriceAdjustmentConfig(pricing: any): PriceAdjustment {
  const method = pricing?.method || "percentage_off";
  const priceAdjustment: PriceAdjustment = {
    method,
    value: 0,
  };

  if (!pricing?.enabled || !Array.isArray(pricing.rules) || pricing.rules.length === 0) {
    return priceAdjustment;
  }

  const rules = pricing.rules.map((pricingRule: unknown) => parsePricingRule(pricingRule));
  const rule = rules[0];
  const normalizedRules = rules.map((pricingRule: PricingRule) =>
    buildPriceAdjustmentRule(method, pricingRule)
  );
  Object.assign(
    priceAdjustment,
    buildPriceAdjustmentRule(method, rule),
  );

  if (normalizedRules.length > 0) {
    priceAdjustment.rules = normalizedRules;
  }

  return priceAdjustment;
}
