# Test Spec: PPB Bundle Subscriptions
**Spec ID:** ppb-bundle-subscriptions  **Created:** 2026-08-14

## Purpose

Define the provider-neutral Shopify selling-plan contract for Product Page Bundles (PPB), including Admin discovery and persistence, signed storefront handoff, subscription cart lines, and Shopify Function safeguards. Full Page Bundles (FPB) and app-billing subscriptions are outside this contract.

## Test Cases

### SellingPlanDiscovery
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Direct products share a group and plan | Every selectable variant exposes the same group and plan | Common group includes normalized plans, options, positions, and pricing policies | Deterministic ordering |
| 2 | Collection spans multiple pages | Collection has more than one Admin API page | Every page and every selectable variant is validated | No 250-product truncation |
| 3 | Variant lacks group allocation | Product has group membership but one selectable variant does not | No common group | Variant-level fail closed |
| 4 | Multiple common groups | All variants share multiple groups | Groups and plans are returned in position then ID order | Stable Admin rendering |
| 5 | Wrong shop or bundle type | Foreign-shop, FPB, or missing bundle | 404 | PPB isolation |
| 6 | Provider assigns the whole product | Selling-plan group applies to a product rather than explicit variants | Every selectable variant of that product is eligible | Shopify Subscriptions compatibility |

### SubscriptionConfig
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid enabled config | Group, selected plans, valid default, required copy | Normalized V1 config persists atomically | JSON column |
| 2 | Disabled config with draft values | `enabled=false` and populated draft | Draft persists but public runtime omits subscriptions | Preserve merchant work |
| 3 | Missing selected plan | Enabled config with no plan IDs | Save blocked with field error | No storefront sync |
| 4 | Invalid default | Default plan is not selected | Save blocked with field error | One-time default valid only when enabled |
| 5 | Missing required copy | Missing title, selected-plan display name, or one-time label | Save blocked with field errors | Translations remain optional |
| 6 | Unsupported feature branch | BXGY, enabled gift/add-on, or personalization | Save blocked while subscriptions are enabled | Initial release boundary |

### RuntimeToken
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Canonical one-time request | No `subscription` object | Existing token payload and merged flow remain unchanged | No legacy fallback |
| 2 | Valid subscription request | Saved group/plan and exact selected variants | Signed token contains group, plan, and recurring flag | Provider-neutral |
| 3 | Stale or tampered plan | Unsaved/removed plan, mixed plan, wrong shop, or unsupported variant | Token endpoint returns 400 | Fail closed |

### StorefrontCart
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | One-time default | Buyer keeps one-time selected | Existing PPB cart items omit `selling_plan` | Existing merge path |
| 2 | Subscription default | Buyer selects an enabled plan | Every component line carries the same `selling_plan` | Separate lines |
| 3 | Multiple plans | Buyer changes dropdown | Prices and handoff update to selected plan | Percentage, amount, fixed price, two-stage |
| 4 | Localized copy | Exact locale, language-only locale, then base | First saved match renders | No fabricated copy |

### ShopifyFunctions
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Selling-plan group reaches Cart Transform | Grouped component lines have selling-plan allocations | No merge, expand, or update operation is emitted for the group | Shopify constraint |
| 2 | Valid first-order subscription bundle | Exact signed token, lines, plan, variants, and quantities | Subscription-role Discount Function candidate is emitted once | `recurringCycleLimit=1` |
| 3 | Invalid subscription group | Tampered token, mixed plan, stale plan, or partial lines | No candidate | Fail closed |
| 4 | One-time bundle | Existing valid token and no selling-plan allocation | Existing merge and discount behavior remains unchanged | Regression guard |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Prisma schema validates and client generation succeeds
- [ ] Focused Jest and Rust suites pass
- [ ] Generated widget assets and GraphQL schemas validate
- [ ] Modified files have zero ESLint errors
- [ ] Widget, CSS, development, and graph builds succeed
- [x] Live development-store proof confirms `/cart/add`, `/cart.js`, checkout cadence, pricing, and absence of Cart Transform rejection
- [ ] No deployment or dev-tunnel restart is performed by the implementation agent
