/**
 * Bundle Widget - Template Manager
 *
 * Handles dynamic message templating with variable replacement.
 * Used for discount messaging, progress text, and bundle information.
 *
 * @version 4.0.0
 */

'use strict';

import { BUNDLE_WIDGET } from './constants.js';
import { CurrencyManager } from './currency-manager.js';
import { PricingCalculator } from './pricing-calculator.js';
import { formatMessageSegments, type MessageSegment } from './message-segments.js';

export class TemplateManager {
  static getQualificationGap(currentValue: number, targetValue: number, operator: any, unitStep = 1) {
    const normalizedOp = PricingCalculator.normalizeCondition(operator);

    switch (normalizedOp) {
      case 'gt':
        return Math.max(0, (targetValue + unitStep) - currentValue);
      case 'lt':
        return Math.max(0, currentValue - (targetValue - unitStep));
      case 'lte':
        return Math.max(0, currentValue - targetValue);
      case 'eq':
      case 'gte':
      default:
        // For pricing rules, equal_to is treated as a threshold (>= target).
        return Math.max(0, targetValue - currentValue);
    }
  }

  static replaceVariables(template: string, variables: any) {
    return this.formatMessageSegments(template, variables)
      .map((segment) => segment.value)
      .join('');
  }

  static formatMessageSegments(template: string, variables: any): MessageSegment[] {
    return formatMessageSegments(template, variables);
  }

  static getDiscountMessageRule({
    bundle,
    totalQuantity = 0,
    totalPrice = 0,
    discountInfo = {},
    messageType = 'progress'
  }: any = {}) {
    const nextRule = PricingCalculator.getNextDiscountRule(bundle, totalQuantity, totalPrice);
    return messageType === 'success'
      ? (discountInfo.applicableRule || nextRule)
      : (nextRule || discountInfo.applicableRule);
  }

  static createDiscountVariables(bundle: any, totalPrice: number, totalQuantity: number, discountInfo: any, currencyInfo: any, options: any = {}) {
    const ruleToUse = options.rule || this.getDiscountMessageRule({
      bundle,
      totalQuantity,
      totalPrice,
      discountInfo,
      messageType: options.messageType || 'progress'
    });

    if (!ruleToUse) {
      return this.createEmptyVariables(bundle, totalPrice, totalQuantity, discountInfo, currencyInfo);
    }

    const discountMethod = PricingCalculator.getDiscountMethod(bundle);
    const conditionType = PricingCalculator.getRuleConditionType(ruleToUse);
    const targetValue = PricingCalculator.getRuleConditionValue(ruleToUse, discountMethod);
    const conditionOperator = PricingCalculator.getRuleConditionOperator(ruleToUse);
    const rawDiscountValue = PricingCalculator.getRuleDiscountValue(ruleToUse, discountMethod);
    const discountedItems = discountMethod === BUNDLE_WIDGET.DISCOUNT_METHODS.BUY_X_GET_Y
      ? String(Number(ruleToUse.customerGets || 0))
      : (conditionType === 'quantity' ? targetValue.toString() : '0');

    // Calculate condition-specific values
    const conditionData = this.calculateConditionData(conditionType, targetValue, conditionOperator, totalPrice, totalQuantity, currencyInfo);

    // Calculate discount-specific values
    let discountData = this.calculateDiscountData(discountMethod, rawDiscountValue, currencyInfo, ruleToUse);
    const dtoDiscountDisplay = this.getRuleDiscountDisplay(bundle, ruleToUse);
    if (
      dtoDiscountDisplay?.valueToken &&
      this.shouldUseDtoDiscountDisplay(discountMethod, ruleToUse) &&
      this.canUseSavedDiscountDisplayValue(discountMethod, dtoDiscountDisplay.valueToken, ruleToUse)
    ) {
      discountData = {
        ...discountData,
        discountText: dtoDiscountDisplay.text,
        discountValue: dtoDiscountDisplay.valueToken,
        discountValueUnit: ''
      };
    }

    // Calculate progress
    const currentProgress = conditionType === 'amount' ? totalPrice : totalQuantity;
    const progressPercentage = targetValue > 0 ? Math.min(100, (currentProgress / targetValue) * 100) : 0;

    const variables: any = {
      // Condition-specific variables
      amountNeeded: conditionData.amountNeeded,
      itemsNeeded: conditionData.itemsNeeded,
      conditionText: conditionData.conditionText,

      // Discount-specific variables
      discountText: discountData.discountText,
      discountConditionDiff: conditionType === 'amount' ? conditionData.amountNeeded : conditionData.itemsNeeded,
      discountUnit: '',
      discountValue: discountData.discountValue,
      discountValueUnit: discountData.discountValueUnit,
      discountedItems,

      // Qualification status
      alreadyQualified: conditionData.alreadyQualified || false,

      // Progress variables
      currentAmount: CurrencyManager.formatMoney(totalPrice, currencyInfo.display.code),
      currentQuantity: totalQuantity.toString(),
      targetAmount: conditionType === 'amount' ? CurrencyManager.formatMoney(targetValue, currencyInfo.display.code) : '0',
      targetQuantity: conditionType === 'quantity' ? targetValue.toString() : '0',
      progressPercentage: Math.round(progressPercentage).toString(),

      // Bundle information
      bundleName: bundle.name || 'Bundle',

      // Pricing information
      originalPrice: CurrencyManager.formatMoney(totalPrice, currencyInfo.display.code),
      finalPrice: CurrencyManager.formatMoney(discountInfo.finalPrice, currencyInfo.display.code),
      savingsAmount: CurrencyManager.formatMoney(discountInfo.discountAmount, currencyInfo.display.code),
      savingsPercentage: Math.round(discountInfo.discountPercentage).toString(),

      // Currency information
      currencySymbol: currencyInfo.display.symbol,
      currencyCode: currencyInfo.display.code,

      // Status
      isQualified: discountInfo.qualifiesForDiscount ? 'true' : 'false'
    };

    return variables;
  }

  static getRuleMessages(bundle: any, locale = '') {
    const pricingMessages = bundle?.pricing?.messages;
    const byLocale = pricingMessages?.ruleMessagesByLocale;
    const localeRuleMessages = locale && byLocale?.[locale];
    return localeRuleMessages || pricingMessages?.ruleMessages || {};
  }

  static getDiscountMessageTemplate({
    bundle,
    totalQuantity = 0,
    totalPrice = 0,
    discountInfo = {},
    messageType = 'progress',
    fallbackTemplate = '',
    locale = ''
  }: any) {
    const rule = this.getDiscountMessageRule({
      bundle,
      totalQuantity,
      totalPrice,
      discountInfo,
      messageType
    });

    if (!rule) return fallbackTemplate || '';

    const ruleId = rule?.id ? String(rule.id) : '';
    const ruleMessages = this.getRuleMessages(bundle, locale);
    const ruleMessage = ruleId ? ruleMessages?.[ruleId] : null;
    const template = messageType === 'success'
      ? ruleMessage?.successMessage
      : ruleMessage?.discountText;

    return (typeof template === 'string' && template.trim())
      ? template
      : (fallbackTemplate || '');
  }

  static formatOperatorText(operator: any, targetValue: number, unit: string) {
    const normalizedOp = PricingCalculator.normalizeCondition(operator);
    const label = targetValue === 1 ? unit : `${unit}s`;

    switch (normalizedOp) {
      case 'gt':
        return `more than ${targetValue} ${label}`;
      case 'lt':
        return `fewer than ${targetValue} ${label}`;
      case 'lte':
        return `${targetValue} or fewer ${label}`;
      case 'eq':
      case 'gte':
      default:
        // "equal_to" acts as a threshold (>= N) in discount rules,
        // and "greater_than_or_equal_to" is the most common default.
        // Both render as plain "N items" for natural-sounding text.
        return `${targetValue} ${label}`;
    }
  }

  static calculateConditionData(conditionType: string, targetValue: number, conditionOperator: any, totalPrice: any, totalQuantity: any, currencyInfo: any) {
    if (conditionType === 'amount') {
      // Amount-based condition - targetValue is already in cents
      const normalizedOp = PricingCalculator.normalizeCondition(conditionOperator);
      const alreadyQualified = PricingCalculator.checkCondition(totalPrice, conditionOperator, targetValue);
      const amountNeeded = this.getQualificationGap(totalPrice, targetValue, conditionOperator, 1);

      // The pricing calculator converts merchant-authored thresholds once before
      // calling this formatter. These values are already presentment minor units.
      const amountNeededFormatted = CurrencyManager.formatMoney(
        amountNeeded,
        currencyInfo.display.code,
        currencyInfo.locale,
      );
      const targetValueFormatted = CurrencyManager.formatMoney(
        targetValue,
        currencyInfo.display.code,
        currencyInfo.locale,
      );

      // Build operator-aware condition text for amount
      let conditionText;
      if (alreadyQualified) {
        if (normalizedOp === 'lt') {
          conditionText = `less than ${targetValueFormatted} met`;
        } else if (normalizedOp === 'lte') {
          conditionText = `at most ${targetValueFormatted} met`;
        } else {
          conditionText = `${targetValueFormatted} minimum met`;
        }
      } else if (normalizedOp === 'gt') {
        conditionText = `${amountNeededFormatted} more`;
      } else if (normalizedOp === 'lt') {
        conditionText = `less than ${targetValueFormatted}`;
      } else if (normalizedOp === 'lte') {
        conditionText = `at most ${targetValueFormatted}`;
      } else {
        conditionText = `${amountNeededFormatted} more`;
      }

      return {
        amountNeeded: amountNeededFormatted,
        itemsNeeded: '0',
        conditionText,
        alreadyQualified
      };
    } else {
      // Quantity-based condition
      const normalizedOp = PricingCalculator.normalizeCondition(conditionOperator);
      const alreadyQualified = PricingCalculator.checkCondition(totalQuantity, conditionOperator, targetValue);
      const itemsNeeded = this.getQualificationGap(totalQuantity, targetValue, conditionOperator, 1);

      // Build operator-aware condition text for quantity
      let conditionText;
      if (alreadyQualified) {
        if (
          normalizedOp === 'lt' ||
          normalizedOp === 'lte'
        ) {
          conditionText = `${this.formatOperatorText(conditionOperator, targetValue, 'item')} met`;
        } else {
          conditionText = `${targetValue} ${targetValue === 1 ? 'item' : 'items'} minimum met`;
        }
      } else if (
        normalizedOp === 'gt' ||
        normalizedOp === 'gte' ||
        normalizedOp === 'eq'
      ) {
        conditionText = `${itemsNeeded} more ${itemsNeeded === 1 ? 'item' : 'items'}`;
      } else {
        conditionText = this.formatOperatorText(conditionOperator, targetValue, 'item');
      }

      return {
        amountNeeded: '0',
        itemsNeeded: itemsNeeded.toString(),
        conditionText,
        alreadyQualified
      };
    }
  }

  static calculateDiscountData(discountMethod: any, rawDiscountValue: string|number|null, currencyInfo: any, rule: any = null) {
    if (rawDiscountValue == null) {
      console.warn('[BUNDLE_WIDGET] calculateDiscountData: rawDiscountValue is', rawDiscountValue);
    }
    const safeValue = parseFloat(String(rawDiscountValue ?? 0)) || 0;

    switch (discountMethod) {
      case BUNDLE_WIDGET.DISCOUNT_METHODS.PERCENTAGE_OFF:
        const percentage = Math.round(safeValue);
        return {
          discountText: `${percentage}% off`,
          discountValue: String(percentage),
          discountValueUnit: '%'
        };

      case BUNDLE_WIDGET.DISCOUNT_METHODS.FIXED_AMOUNT_OFF:
        // safeValue is already in presentment cents.
        const amountOff = CurrencyManager.formatMoney(
          safeValue,
          currencyInfo.display.code,
          currencyInfo.locale,
        );
        return {
          discountText: `${amountOff} off`,
          discountValue: amountOff,
          discountValueUnit: ''
        };

      case BUNDLE_WIDGET.DISCOUNT_METHODS.FIXED_BUNDLE_PRICE:
        // safeValue is already in presentment cents.
        const bundlePrice = CurrencyManager.formatMoney(
          safeValue,
          currencyInfo.display.code,
          currencyInfo.locale,
        );
        return {
          discountText: bundlePrice,
          discountValue: bundlePrice,
          discountValueUnit: ''
        };

      case BUNDLE_WIDGET.DISCOUNT_METHODS.BUY_X_GET_Y:
        if ((rule?.bxyDiscountType || rule?.discountType) === 'fixed_amount') {
          const convertedBxyAmount = CurrencyManager.convertMerchantAmountToPresentment(
            safeValue,
            currencyInfo,
          );
          const bxyAmountOff = CurrencyManager.formatMoney(
            convertedBxyAmount,
            currencyInfo.display.code,
            currencyInfo.locale,
          );
          return {
            discountText: `${bxyAmountOff} off`,
            discountValue: bxyAmountOff,
            discountValueUnit: ''
          };
        }
        const bxyPercentage = Math.round(safeValue);
        return {
          discountText: `${bxyPercentage}% off`,
          discountValue: String(bxyPercentage),
          discountValueUnit: '%'
        };

      default:
        return {
          discountText: 'discount',
          discountValue: String(safeValue),
          discountValueUnit: ''
        };
    }
  }

  static shouldUseDtoDiscountDisplay(discountMethod: string, rule: any = null) {
    if (discountMethod === BUNDLE_WIDGET.DISCOUNT_METHODS.FIXED_AMOUNT_OFF) {
      return true;
    }

    if (discountMethod === BUNDLE_WIDGET.DISCOUNT_METHODS.BUY_X_GET_Y) {
      return (rule?.bxyDiscountType || rule?.discountType) === 'fixed_amount';
    }

    return false;
  }

  static canUseSavedDiscountDisplayValue(discountMethod: string, valueToken: string|null, rule: any = null) {
    if (valueToken == null) return false;
    const token = String(valueToken).trim();
    if (!token) return false;

    const isFixedAmount =
      discountMethod === BUNDLE_WIDGET.DISCOUNT_METHODS.FIXED_AMOUNT_OFF ||
      (
        discountMethod === BUNDLE_WIDGET.DISCOUNT_METHODS.BUY_X_GET_Y &&
        (rule?.bxyDiscountType || rule?.discountType) === 'fixed_amount'
      );

    if (isFixedAmount && this.containsPercentageValue(token)) {
      return false;
    }

    return true;
  }

  static containsPercentageValue(value: string) {
    if (typeof value !== 'string') return false;
    const percentIndex = value.indexOf('%');
    if (percentIndex === -1) return false;

    return value
      .slice(0, percentIndex)
      .split('')
      .some(character => character >= '0' && character <= '9');
  }

  static getRuleDiscountDisplay(bundle: any, rule: any = null) {
    const messages = bundle?.pricing?.messages;
    const ruleId = rule?.id ? String(rule.id) : '';
    const bundleQuantityOptions = messages?.displayOptions?.bundleQuantityOptions || {};
    const optionsByRuleId = bundleQuantityOptions.optionsByRuleId || {};
    const tierTextByRuleId = messages?.tierTextByRuleId || {};
    const candidates: any[] = [];

    if (ruleId) {
      candidates.push(optionsByRuleId[ruleId]?.subtext);
      candidates.push(tierTextByRuleId[ruleId]?.tierSubtext);
    }

    const defaultRuleId = bundleQuantityOptions.defaultRuleId ? String(bundleQuantityOptions.defaultRuleId) : '';
    if (defaultRuleId && defaultRuleId !== ruleId) {
      candidates.push(optionsByRuleId[defaultRuleId]?.subtext);
      candidates.push(tierTextByRuleId[defaultRuleId]?.tierSubtext);
    }

    const text = candidates.find(value => typeof value === 'string' && value.trim());
    if (!text) return null;

    const valueToken = this.extractDiscountValueToken(text);
    if (!valueToken) return null;

    return {
      text: text.trim(),
      valueToken
    };
  }

  static extractDiscountValueToken(displayText: string) {
    if (typeof displayText !== 'string') return '';

    const token = displayText
      .trim()
      .replace(/^save\s+/i, '')
      .replace(/\s+discount$/i, '')
      .replace(/\s+off$/i, '')
      .trim();

    return /\d/.test(token) ? token : '';
  }

  static createEmptyVariables(bundle: any, totalPrice: any, totalQuantity: any, discountInfo: any, currencyInfo: any) {
    return {
      // Condition-specific variables
      amountNeeded: '0',
      itemsNeeded: '0',
      conditionText: '0 items',
      discountText: 'No discount',
      discountConditionDiff: '0',
      discountUnit: '',
      discountValue: '0',
      discountValueUnit: '',
      discountedItems: '0',

      // Progress variables
      currentAmount: CurrencyManager.formatMoney(totalPrice, currencyInfo.display.code),
      currentQuantity: totalQuantity.toString(),
      targetAmount: '0',
      targetQuantity: '0',
      progressPercentage: '0',

      // Bundle information
      bundleName: bundle.name || 'Bundle',

      // Pricing information
      originalPrice: CurrencyManager.formatMoney(totalPrice, currencyInfo.display.code),
      finalPrice: CurrencyManager.formatMoney(totalPrice, currencyInfo.display.code),
      savingsAmount: '0',
      savingsPercentage: '0',

      // Currency information
      currencySymbol: currencyInfo.display.symbol,
      currencyCode: currencyInfo.display.code,

      // Status
      isQualified: 'false'
    };
  }
}
