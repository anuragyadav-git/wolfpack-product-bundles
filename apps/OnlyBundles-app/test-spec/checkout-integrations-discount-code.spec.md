# Test Spec: Checkout Integrations Discount Codes
**Spec ID:** checkout-integrations-discount-code  **Created:** 2026-07-02

## Purpose
Verify checkout integrations use a typed provider selection and short-lived app discount codes with the
current provider scope (`native`, `theme_cart_drawer`, `gokwik`, `shopflo`) and no non-whitelisted providers
flow into checkout-integration discount creation.

## Test Cases
### SettingsControlsRuntime
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Landing page checkout provider selected | Checkout Settings = Redirect to Checkout, Checkout Integration = GoKwik | Runtime checkout action is `checkout`, provider is `gokwik`, no execute script is exposed | Full-page only |
| 2 | Unknown provider value | Checkout Integration = unexpected value | Runtime provider falls back to `native` | Prevents unsafe callbacks |
| 3 | Theme cart provider selected | Checkout Integration = Theme cart drawer | Runtime provider is `theme_cart_drawer` | Side-cart providers are stored as typed IDs |

### CheckoutIntegrationProviderRegistry
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Provider options exposed | none | Options are Shopify checkout, Theme cart drawer, GoKwik, Shopflo | Active provider scope for checkout behavior |
| 2 | Discount-code provider classification | provider IDs | `gokwik`, `shopflo` return true; `native`, `theme_cart_drawer` return false | Keeps app-proxy endpoint closed |

### CheckoutIntegrationDiscountCodeService
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Supported provider creates code | admin, shop, provider `gokwik` | `discountCodeAppCreate` called with one-use `PRODUCT` code, app config metafield, startsAt and endsAt | Default TTL 30 minutes |
| 2 | Supported provider creates code | admin, shop, provider `shopflo` | `discountCodeAppCreate` title and metadata use `Shopflo` | Validates both handoff providers |
| 3 | Missing discount function | function lookup returns empty | Failure result without mutation | No hardcoded function ID |
| 4 | Shopify user error | mutation returns userErrors | Failure includes message | Surface setup issue |

### AppProxyRoute
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Signed storefront request | supported provider | JSON `{ ok: true, code, expiresAt }` | Uses unauthenticated Admin |
| 2 | Unsupported provider | provider outside discount-code provider set | 400 and no code creation | Closed provider list |
| 3 | Unsigned request | bad signature | 400 and no Admin call | App proxy guard |
| 4 | Handoff provider | provider `shopflo` | Code creation is allowed | Covers second handoff provider |

## Acceptance Criteria
- [ ] All listed unit and function tests pass.
- [ ] Admin exposes one Checkout card set and no external competitor URLs.
- [ ] Storefront creates and applies a short-lived discount code before invoking `gokwik` or `shopflo`.
- [ ] Storefront opens or refreshes cart drawer integrations without calling the discount-code endpoint.
- [ ] Native and theme-cart providers remain unchanged where applicable.
