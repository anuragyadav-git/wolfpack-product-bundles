# Test Spec: Storefront Proxy Routes
**Spec ID:** storefront-proxy-routes  **Created:** 2026-08-13

## Purpose

Keep storefront document and API URLs rooted in one shared app-proxy configuration instead of repeating the installed proxy path throughout runtime sources.

## Test Cases

### StorefrontProxyRoutes

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Read proxy root | None | `/apps/product-bundles` | Matches the installed Shopify app-proxy contract |
| 2 | Build an API path | `cart-bundle-details` | `/apps/product-bundles/api/cart-bundle-details` | Endpoint remains caller-owned |
| 3 | Build a nested API path | `bundle/id.json` | `/apps/product-bundles/api/bundle/id.json` | Dynamic segments may be pre-encoded by the caller |
| 4 | Build an FPB document path | `wpb/12` | `/apps/product-bundles/wpb/12` | Uses the same root as API requests |

## Acceptance Criteria

- [ ] Storefront document and API URL builders share one proxy-root constant.
- [ ] Callers provide route-specific path segments without proxy-root duplication.
- [ ] Production and SIT TOML subpaths remain `product-bundles`.
