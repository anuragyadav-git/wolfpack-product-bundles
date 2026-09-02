/**
 * Wolfpack Bundles SDK — TypeScript Definitions
 *
 * Usage: add to your tsconfig.json `include` or reference with:
 *   /// <reference path="path/to/wolfpack-bundles.d.ts" />
 *
 * Global: window.WolfpackBundles
 */

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Step {
  readonly id: string;
  readonly name: string;
  readonly conditionType: 'quantity' | 'amount' | 'weight' | null;
  readonly conditionOperator: string | null;
  readonly conditionValue: number | null;
  readonly conditionOperator2?: string | null;
  readonly conditionValue2?: number | null;
  readonly isFreeGift: boolean;
  readonly isDefault: boolean;
  readonly products: readonly Product[];
  readonly categories?: readonly unknown[];
}

export interface Product {
  readonly id: string;
  readonly selectionId: string;
  readonly variantId: string;
  readonly parentProductId?: string;
  readonly title: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly compareAtPrice: number | null;
  readonly available: boolean;
  readonly quantityAvailable: number | null;
  readonly currentlyNotInStock: boolean;
  readonly weight: number;
  readonly weightUnit: 'GRAMS';
  readonly description: string;
  readonly descriptionHtml: string;
  readonly images: readonly { readonly src: string }[];
  readonly options: readonly ProductOption[];
  readonly variants: readonly Variant[];
}

export interface Variant {
  readonly id: string;
  readonly selectionId: string;
  readonly title?: string;
  readonly price: number;
  readonly compareAtPrice: number | null;
  readonly available: boolean;
  readonly quantityAvailable: number | null;
  readonly currentlyNotInStock: boolean;
  readonly weight: number;
  readonly weightUnit: 'GRAMS';
  readonly option1: string | null;
  readonly option2: string | null;
  readonly option3: string | null;
  readonly selectedOptions: readonly { readonly name: string; readonly value: string }[];
  readonly image: { readonly src: string } | null;
}

export interface ProductOption {
  readonly id?: string;
  readonly name: string;
  readonly optionValues: readonly {
    readonly id?: string;
    readonly name: string;
    readonly swatch: {
      readonly color: string | null;
      readonly image: { readonly src: string; readonly altText: string | null } | null;
    } | null;
  }[];
}

export interface DiscountRule {
  readonly id?: string;
  readonly conditionType: 'quantity' | 'amount';
  readonly conditionOperator: 'gte' | 'gt' | 'lte' | 'lt' | 'eq' | 'equal_to' | 'greater_than' | 'less_than' | 'greater_than_or_equal_to' | 'less_than_or_equal_to';
  readonly conditionValue: number;
  readonly discountValue: number;
  readonly customerBuys?: number;
  readonly customerGets?: number;
  readonly bxyDiscountType?: 'percentage' | 'fixed_amount';
  readonly bxyApplyMode?: 'lowest_priced' | 'latest_added';
}

export interface DiscountConfiguration {
  readonly enabled: boolean;
  readonly method: 'percentage_off' | 'fixed_amount_off' | 'fixed_bundle_price' | 'buy_x_get_y';
  readonly rules: readonly DiscountRule[];
}

// ─── SDK State ────────────────────────────────────────────────────────────────

/** Read-only snapshot of the current bundle state. */
export interface WolfpackBundleState {
  /** True once eligibility checks and Shopify product hydration have completed. */
  readonly isReady: boolean;
  readonly bundleId: string | null;
  readonly bundleName: string | null;
  /** All steps configured for this bundle in the App Admin. */
  readonly steps: readonly Step[];
  /**
   * Current selections: stepId → variantId (string) → quantity.
   * Example: { "step_abc": { "12345678": 2 } }
   */
  readonly selections: Record<string, Record<string, number>>;
  readonly discountConfiguration: Readonly<DiscountConfiguration> | null;
}

// ─── Return Types ─────────────────────────────────────────────────────────────

export interface AddRemoveResult {
  success: boolean;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  /** Human-readable message explaining why the step is invalid. Empty string when valid. */
  message: string;
}

export interface BundleValidationResult {
  valid: boolean;
  /** Map of stepId → error message for every failing step. Empty object when valid. */
  errors: Record<string, string>;
}

export interface DisplayPrice {
  /** Raw subtotal before discount, in cents. */
  original: number;
  /** Discounted total, in cents. Equals `original` when no discount applies. */
  discounted: number;
  /** Amount saved, in cents. */
  savings: number;
  /** Savings as a percentage of the original price, rounded to 1 decimal place. */
  savingsPercent: number;
  /** Locale-aware formatted string of the discounted price (e.g. "$80.00"). */
  formatted: string;
}

// ─── SDK Interface ────────────────────────────────────────────────────────────

export interface WolfpackBundleSDK {
  /** Live read-only state snapshot. Always reflects the latest selections. */
  readonly state: WolfpackBundleState;

  /**
   * Add `quantity` units of `variantId` to `stepId`.
   * Validates against the step's min/max condition before mutating state.
   * Fires `wbp:item-added` on success.
   */
  addItem(stepId: string, variantId: string | number, quantity: number): AddRemoveResult;

  /**
   * Remove `quantity` units of `variantId` from `stepId`.
   * If quantity reaches 0, the variant is removed from selections entirely.
   * Fires `wbp:item-removed` on success.
   */
  removeItem(stepId: string, variantId: string | number, quantity: number): AddRemoveResult;

  /**
   * Clear all selections in `stepId`.
   * Fires `wbp:step-cleared` on success.
   */
  clearStep(stepId: string): { success: boolean; error?: string };

  /**
   * Async AJAX add-to-cart via Shopify's `/cart/add.js`.
   * Validates the bundle first; fires `wbp:cart-failed` if invalid.
   * Fires `wbp:cart-success` on success, `wbp:cart-failed` on network/cart error.
   * Does NOT redirect the customer — handle redirect/drawer in your event listener.
   */
  addBundleToCart(): Promise<void>;

  /**
   * Validate a single step's current selections against its configured condition.
   * Use to gate "Next" buttons or show per-step progress indicators.
   */
  validateStep(stepId: string): ValidationResult;

  /**
   * Validate all required steps (skips free-gift and default steps).
   * Use to gate the "Add to Cart" button.
   */
  validateBundle(): BundleValidationResult;

  /**
   * Calculate display prices for the current selections, applying any configured discount.
   * All numeric values are in cents. Use `formatted` for display.
   * Note: actual checkout discount is applied by the App's Cart Transform — this is for UI display only.
   */
  getDisplayPrice(): DisplayPrice;
}

// ─── Window Events ────────────────────────────────────────────────────────────

export interface WbpReadyDetail {
  bundleId: string;
  steps: readonly Step[];
}

export interface WbpInitFailedDetail {
  code: 'INVALID_CONFIGURATION' | 'MISSING_STOREFRONT_RUNTIME' | 'PRODUCT_HYDRATION_FAILED';
  message: string;
}

export interface WbpItemAddedDetail {
  stepId: string;
  variantId: string;
  quantity: number;
}

export interface WbpItemRemovedDetail {
  stepId: string;
  variantId: string;
  quantity: number;
}

export interface WbpStepClearedDetail {
  stepId: string;
}

export interface WbpCartSuccessDetail {
  bundleId: string;
}

export interface WbpCartFailedDetail {
  error: string;
}

export interface DiscountTierReachedDetail {
  bundleId: string;
  tierId: string;
  /** Zero-based index in the effective pricing-rule tier order. */
  tierIndex: number;
  tierCount: number;
  feedbackState: 'tier' | 'complete';
}

// ─── Global Augmentation ─────────────────────────────────────────────────────

declare global {
  interface Window {
    /** Wolfpack Bundles SDK. Available after the `wbp:ready` event fires. */
    WolfpackBundles: WolfpackBundleSDK | undefined;
  }

  interface WindowEventMap {
    'wbp:ready': CustomEvent<WbpReadyDetail>;
    'wbp:init-failed': CustomEvent<WbpInitFailedDetail>;
    'wbp:item-added': CustomEvent<WbpItemAddedDetail>;
    'wbp:item-removed': CustomEvent<WbpItemRemovedDetail>;
    'wbp:step-cleared': CustomEvent<WbpStepClearedDetail>;
    'wbp:cart-success': CustomEvent<WbpCartSuccessDetail>;
    'wbp:cart-failed': CustomEvent<WbpCartFailedDetail>;
    'wbp:discount-tier-reached': CustomEvent<DiscountTierReachedDetail>;
    'wpb:discount-tier-reached': CustomEvent<DiscountTierReachedDetail>;
  }
}
