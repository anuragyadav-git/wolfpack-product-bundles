# Test Spec: Admin All Routes LCP
**Spec ID:** admin-all-routes-lcp  **Created:** 2026-07-30

## Purpose
Keep the authenticated Admin shell lightweight and enforce the strict app-owned LCP target across route-keyed diagnostics.

## Test Cases
### AdminAllRoutesLcp
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Strict LCP pass boundary | Route samples with p75 values of 2499ms and 2500ms | 2499ms passes; 2500ms fails | Target is strictly below 2500ms |
| 2 | Shared Admin shell dependencies | Production Admin layout | No legacy Polaris React provider, stylesheet, translations, or global Redux provider | App Bridge and `polaris.js` load from the document head |
| 3 | Route-scoped onboarding lookup | `/app` and `/app/dashboard` loader requests | Eligibility is queried only for `/app` | Child routes do not pay for destination-only data |
| 4 | Route-owned state | Dashboard, Billing, FPB configure, PPB configure | Each state consumer owns its Redux provider | Non-state routes avoid `vendor-state` |
| 5 | Production chunk isolation | Vite production manifest | Non-state routes cannot reach `vendor-state`; non-Analytics routes cannot reach `vendor-charts` | Analytics code and CSS remain atomic |

## Acceptance Criteria
- [x] Route-keyed LCP p75 passes only when it is below 2500ms.
- [x] Embedded Admin routes do not load legacy Polaris React CSS.
- [x] The shared `/app` layout does not own Redux or React Polaris.
- [x] Only `/app` reads `firstCreateTourEligible`.
- [x] Production manifest checks pass.
