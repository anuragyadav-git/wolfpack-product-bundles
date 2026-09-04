# Test Spec: PPB Storefront Rendering and Draft Preview Support
**Spec ID:** ppb-storefront-rendering-and-preview  **Created:** 2026-09-04

## Purpose
Ensure Product Page Bundles (PPB) render clickable slot cards when steps have unconditioned or open-ended configurations, and allow merchants to preview draft PPB bundles on the storefront via signed preview token authorization.

## Test Cases
### PpbModalSlotEmptyCards
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Step without capacity condition | Step with `conditionValue: null`, `minQuantity: 0`, `operator: null` | Renders 1 empty slot card at `selectedCount: 0` | Ensures shopper has an operable slot |
| 2 | Step with zero condition value | Step with `conditionValue: 0`, `operator: null` | Renders 1 empty slot card at `selectedCount: 0` | Prevents 0-slot collapse |
| 3 | Step with minimum quantity | Step with `minQuantity: 2`, `conditionValue: null` | Renders 2 empty slot cards at `selectedCount: 0` | Reflects step min quantity requirement |
| 4 | Open-ended slot expansion | Step without upper bound condition | Keeps 1 empty slot open after each selection up to capacity | Allows adding additional products |

### ProductPageTemplateResolution

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Draft preview URL | Product URL contains `wpb_preview` token | Fetches config via `buildBundleConfigApiUrl` forwarding `wpb_preview` | Authorizes draft bundle on app proxy |
| 2 | Public un-synced URL | Public URL without `wpb_preview` and no valid schema-v3 snapshot | Fails closed without network fetch | Complies with outage-resilience contract |
| 3 | Shopify-hosted snapshot | Valid `schemaVersion: 3` snapshot and no preview token | Loads directly from dataset without network call | Outage-resilient fast path |
| 4 | Template type fallback | Bundle with `bundleDesignTemplate: null` | Defaults template type to `'PDP_MODAL'` and contract to `HORIZONTAL_SLOTS` | Prevents null contract breakdown |

### PpbProductHydrationFallback

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Missing Storefront Runtime | `storefrontRuntime` is null and not embed source | Falls back to embedded products from step categories | Prevents modal product loading error |
| 2 | SelectionId normalization | Products and variants carry `selectionId` without `id` | Extracts IDs and variant IDs properly from `selectionId` | Prevents deduplication collision on empty IDs |
| 3 | Swatch hydration guard | Products have complete option values | Skips redundant swatch hydration | Fast path |

## Acceptance Criteria
- [x] Steps with null or zero conditions render at least 1 clickable slot card in modal slot layout.
- [x] Product-page widget forwards `wpb_preview` from the page URL to the signed app-proxy config API.
- [x] Valid draft bundles hydrate and select successfully during preview.
- [x] Bundles without an explicit design template default gracefully to `PDP_MODAL`.
- [x] Unit tests pass, linter passes with zero errors, and widget bundle builds cleanly.
