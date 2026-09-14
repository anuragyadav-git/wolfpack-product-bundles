# Test Spec: Bundle Preview Offer Authorization
**Spec ID:** bundle-preview-offer-authorization  **Created:** 2026-09-15

## Purpose
Allow authenticated merchants to preview active or draft bundles with offer policies (specific link, country targeting, schedule) via signed `wpb_preview` token without being blocked by storefront offer eligibility.

## Test Cases
### ApiBundleStatusFilter
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Active bundle with preview token | Active bundle with country targeting + valid `wpb_preview` token | 200, `private, no-store` | Bypasses offer eligibility |
| 2 | Active bundle with specific link and preview token | Active bundle with specific link policy + valid `wpb_preview` token | 200, `private, no-store` | Bypasses specific link check |
| 3 | Public active bundle without country param | Active bundle with country targeting, no country param | 200 | Omitted country context does not fail closed |
| 4 | Public active bundle with mismatched country | Active bundle with CA only, country=US | 404 | Enforces country targeting |

### WpbProxyDraftAccessControl
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Active FPB with preview token | Active FPB with specific link policy + valid `wpb_preview` token | 200, `no-store` | Bypasses offer eligibility and Liquid guard |

## Acceptance Criteria
- [ ] All listed test cases pass.
