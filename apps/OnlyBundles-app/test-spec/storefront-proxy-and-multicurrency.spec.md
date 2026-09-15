# Test Spec: Storefront Proxy Root Resolution & Multi-Currency Product Card Pricing
**Spec ID:** storefront-proxy-and-multicurrency  **Created:** 2026-09-15

## Purpose
Ensure that:
1. `resolveStorefrontProxyRoot` prioritizes the active browser FPB URL pathname (ground truth) over stale configured roots or window globals when `configuredRoot` is not explicitly passed.
2. `formatProductCardPrice` correctly converts merchant base currency amounts to presentment currency when `isMultiCurrency` is active and the product card price has no explicit currency code or matches the base currency (e.g. unhydrated snapshot prices).
3. `syncFullPageBundleFromDb` invokes `syncPpbStorefrontRuntime` so that saving/syncing an FPB bundle updates the store's `ppb_storefront_runtime` metafield with the correct production proxy root.

## Test Cases
### StorefrontProxyRoutes
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Explicit configuredRoot provided | `{ configuredRoot: "/apps/custom-proxy" }` | `"/apps/custom-proxy"` | Explicit input always wins |
| 2 | Browser pathname matches FPB pattern | `pathname: "/apps/product-bundles/wpb/4"`, window.__WOLFPACK_STOREFRONT_PROXY_ROOT__ = `"/apps/product-bundles-sit"` | `"/apps/product-bundles"` | URL pathname is ground truth for FPB page, overriding stale global |
| 3 | Browser pathname on non-FPB page | `pathname: "/products/my-bundle"`, window.__WOLFPACK_STOREFRONT_PROXY_ROOT__ = `"/apps/product-bundles"` | `"/apps/product-bundles"` | Fallback to configured global on non-FPB pages |
| 4 | No window and no configured root | `{}` | `"/apps/product-bundles"` | Default constant returned |

### ProductCardPricing
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Hydrated product in presentment currency | `value: 140000`, `currencyCode: "INR"`, `currencyInfo: { calculation: { code: "AUD" }, display: { code: "INR", rate: 69.695988 }, isMultiCurrency: true }` | `"₹1,400.00"` | No conversion needed since already in INR |
| 2 | Unhydrated snapshot in base currency with multi-currency active | `value: 2000`, `currencyCode: null`, `currencyInfo: { calculation: { code: "AUD" }, display: { code: "INR", rate: 69.695988 }, isMultiCurrency: true }` | Converted amount formatted in INR (`₹1,393.92`) | Base currency amount converted via rate, prevents ₹20.00 regression |
| 3 | Single currency store (AUD to AUD) | `value: 2000`, `currencyCode: null`, `currencyInfo: { calculation: { code: "AUD" }, display: { code: "AUD", rate: 1 }, isMultiCurrency: false }` | `"$20.00"` | Formats in base currency AUD |
| 4 | Empty or null value | `value: null` | `""` | Returns empty string safely |

### StorefrontSync
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | syncFullPageBundleFromDb calls syncPpbStorefrontRuntime | Full Page Bundle with shopifyProductId | `syncPpbStorefrontRuntime` called with admin and shopDomain | Ensures runtime metafield has current proxy root |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Lint passes with zero errors on modified files
