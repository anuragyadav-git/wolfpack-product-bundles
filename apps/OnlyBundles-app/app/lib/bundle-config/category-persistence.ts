import { parseVariantSelectorConfiguration } from "./variant-selector-config";

function asObjectArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function buildStepCategoryCreateInput(category: Record<string, unknown>, index: number) {
  const categoryId = stringValue(category.id);
  const sortOrder = numberValue(category.sortOrder) ?? index;
  const products = asObjectArray(category.products);
  const collections = asObjectArray(category.collections);
  const variantSelector = parseVariantSelectorConfiguration(category);

  return {
    ...(categoryId ? { id: categoryId } : {}),
    name: stringValue(category.name) ?? stringValue(category.title) ?? "",
    title: stringValue(category.title),
    subTitle: stringValue(category.subTitle),
    sortOrder,
    products,
    collections,
    conditions: asObjectArray(category.conditions),
    categoryBanner: stringValue(category.categoryBanner),
    categoryImg: stringValue(category.categoryImg),
    autoNextStepOnConditionMet: category.autoNextStepOnConditionMet === true,
    displayVariantsAsIndividualProducts: category.displayVariantsAsIndividualProducts === true,
    ...variantSelector,
    multiLangData: objectRecord(category.multiLangData),
  };
}
