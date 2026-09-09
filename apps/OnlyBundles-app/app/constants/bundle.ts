/**
 * Bundle Domain Constants
 *
 * Centralized enums and form select options for bundle configuration.
 * Import these instead of using inline string literals or duplicated arrays.
 */

import { DiscountMethod } from "../types/pricing";

// ============================================
// ENUMS
// ============================================

export enum BundleStatus {
  ACTIVE = "active",
  DRAFT = "draft",
  ARCHIVED = "archived",
  UNLISTED = "unlisted",
}

export enum BundleType {
  PRODUCT_PAGE = "product_page",
  FULL_PAGE = "full_page",
}

// ============================================
// FORM SELECT OPTIONS
// ============================================

/** Status options for bundle configuration forms */
export const BUNDLE_STATUS_OPTIONS = [
  { label: "Active", value: BundleStatus.ACTIVE },
  { label: "Draft", value: BundleStatus.DRAFT },
  { label: "Archived", value: BundleStatus.ARCHIVED },
  { label: "Unlisted (Ad Campaigns)", value: BundleStatus.UNLISTED },
] as const;

// ============================================
// STEP CONDITION OPTIONS
// ============================================

/** Condition type options for step condition rules */
export const STEP_CONDITION_TYPE_OPTIONS = [
  { label: "Quantity", value: "quantity" },
  { label: "Amount", value: "amount" },
  { label: "Weight", value: "weight" },
] as const;

/** Operator options for step condition rules */
export const STEP_CONDITION_OPERATOR_OPTIONS = [
  { label: "is equal to", value: "equal_to" },
  { label: "is greater than or equal to", value: "greater_than_or_equal_to" },
  { label: "is less than or equal to", value: "less_than_or_equal_to" },
] as const;

/** Operator options for category condition rules */
export const CATEGORY_CONDITION_OPERATOR_OPTIONS = [
  { label: "is equal to", value: "equalTo" },
  { label: "is greater than or equal to", value: "greaterThanOrEqualTo" },
  { label: "is less than or equal to", value: "lessThanOrEqualTo" },
] as const;

// ============================================
// DISCOUNT RULE OPTIONS
// ============================================

/** Discount method options for pricing rules */
export const DISCOUNT_METHOD_OPTIONS = [
  { label: "Fixed Amount Off", value: DiscountMethod.FIXED_AMOUNT_OFF },
  { label: "Percentage Off", value: DiscountMethod.PERCENTAGE_OFF },
  { label: "Fixed Bundle Price", value: DiscountMethod.FIXED_BUNDLE_PRICE },
  { label: "Buy X, get Y", value: DiscountMethod.BUY_X_GET_Y },
] as const;
