import { ConditionValidator } from './condition-validator.js';

export function normalizePpbSelectionKey(value: unknown) {
  if (value === null || value === undefined || value === '') return '';
  const match = String(value).match(/gid:\/\/shopify\/\w+\/(\d+)/);
  return match ? match[1] : String(value).split('/').pop() || '';
}

export function findPpbProductBySelectionKey(products: any[], selectionKey: unknown) {
  const normalized = normalizePpbSelectionKey(selectionKey);
  if (!normalized) return null;
  return (products || []).find((product: any) => (
    normalizePpbSelectionKey(product?.selectionId || product?.variantId || product?.id) === normalized
    || (Array.isArray(product?.variants) && product.variants.some((variant: any) => (
      normalizePpbSelectionKey(variant?.selectionId || variant?.id) === normalized
    )))
  )) || null;
}

export function resolvePpbSelectionMetric(products: any[], selectionKey: unknown) {
  const normalized = normalizePpbSelectionKey(selectionKey);
  const product = findPpbProductBySelectionKey(products, normalized);
  const variant = product && Array.isArray(product.variants)
    ? product.variants.find((candidate: any) => (
      normalizePpbSelectionKey(candidate?.selectionId || candidate?.id) === normalized
    )) || null
    : null;
  return {
    product,
    metric: variant || product,
    selectionId: normalized,
    productId: normalizePpbSelectionKey(product?.parentProductId || product?.id || normalized),
  };
}

export function buildPpbConditionSelections(step: any, products: any[], selections: any) {
  const source = selections || {};
  if (!ConditionValidator.isCategoryRuleMode(step) && step?.conditionType !== 'amount' && step?.conditionType !== 'weight') {
    return { ...source };
  }

  const translated: Record<string, { quantity: number; amount: number; weight: number }> = {};
  for (const [selectionKey, rawQuantity] of Object.entries(source)) {
    const quantity = Number(rawQuantity) || 0;
    if (quantity <= 0) continue;
    const { metric, productId, selectionId } = resolvePpbSelectionMetric(products, selectionKey);
    if (!metric) continue;
    const key = ConditionValidator.isCategoryRuleMode(step) ? productId : selectionId;
    const current = translated[key] || { quantity: 0, amount: 0, weight: 0 };
    translated[key] = {
      quantity: current.quantity + quantity,
      amount: current.amount + (Number(metric.price || 0) * quantity),
      weight: current.weight + (Number(metric.weight || metric.weightInGrams || metric.grams || 0) * quantity),
    };
  }
  return translated;
}

function normalizeOperator(value: unknown) {
  const raw = String(value || '');
  return raw.includes('_') ? raw : raw.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function categoryRuleBreaksUpperBoundary(rule: any, total: number) {
  const operator = normalizeOperator(rule?.operator || rule?.condition);
  const rawLimit = Number(rule?.value);
  if (!Number.isFinite(rawLimit) || rawLimit <= 0) return false;
  const limit = (rule?.conditionType || rule?.type) === 'amount' ? rawLimit * 100 : rawLimit;
  if (operator === 'equal_to' || operator === 'less_than_or_equal_to') return total > limit;
  if (operator === 'less_than') return total >= limit;
  return false;
}

export function canIncreasePpbSelection({ step, products, selections, selectionKey, nextQuantity }: any) {
  const resolved = resolvePpbSelectionMetric(products, selectionKey);
  if (!resolved.metric) return { allowed: false, limitText: null };

  if (ConditionValidator.isCategoryRuleMode(step)) {
    const proposed = { ...(selections || {}), [resolved.selectionId]: nextQuantity };
    const translated = buildPpbConditionSelections(step, products, proposed);
    for (const category of (Array.isArray(step?.categories) ? step.categories : [])) {
      const categoryIds = new Set((category?.products || []).map((product: any) => (
        normalizePpbSelectionKey(product?.selectionId || product?.productId || product?.id)
      )));
      if (!categoryIds.has(resolved.productId)) continue;
      for (const rule of (Array.isArray(category?.conditions) ? category.conditions : [])) {
        const type = rule?.conditionType || rule?.type || 'quantity';
        const total = Object.entries(translated).reduce((sum, [productId, metric]: any) => {
          if (!categoryIds.has(normalizePpbSelectionKey(productId))) return sum;
          return sum + Number(metric?.[type] || 0);
        }, 0);
        if (categoryRuleBreaksUpperBoundary(rule, total)) {
          return { allowed: false, limitText: null };
        }
      }
    }
    return { allowed: true, limitText: null };
  }

  const conditionSelections = buildPpbConditionSelections(step, products, selections);
  return ConditionValidator.canUpdateQuantity(
    step,
    conditionSelections,
    resolved.selectionId,
    nextQuantity,
    {
      amount: Number(resolved.metric.price || 0),
      weight: Number(resolved.metric.weight || resolved.metric.weightInGrams || resolved.metric.grams || 0),
    },
  );
}

export function isPpbStepConditionSatisfied(step: any, products: any[], selections: any) {
  return ConditionValidator.isStepConditionSatisfied(
    step,
    buildPpbConditionSelections(step, products, selections),
  );
}
