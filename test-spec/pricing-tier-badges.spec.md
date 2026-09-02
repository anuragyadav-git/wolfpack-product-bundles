# Test Spec: Pricing Tier Badges
**Spec ID:** pricing-tier-badges  **Created:** 2026-08-30

## Purpose
Verify per-pricing-rule tier badges persist through the canonical pricing contract, reject unsafe or unsupported configuration, interpolate only supported savings values, and render accessibly on PPB quantity pills and FPB progress milestones.

## Test Cases
### PricingTierBadge
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid badge | Enabled badge with supported shape, visibility, colors, and static copy | Normalized badge is returned | Canonical rule metadata |
| 2 | Supported variable | Percentage or fixed-amount badge template with the matching value | Variable is interpolated | No generated merchant copy |
| 3 | Unsupported variable | Template containing an unknown variable | Validation fails | Braces never leak to storefront |
| 4 | Invalid presentation | Unsupported shape, visibility, or color | Validation fails | Prevents unsafe runtime styling |
| 5 | Missing runtime value | Template needs a value not available in context | Badge is suppressed | Avoids false savings claims |

### ConfigureValidation
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Enabled badge missing copy | Valid pricing rule with empty badge text | Field error targets badge text | FPB and PPB share validator |
| 2 | Variable conflicts with method | `saved_total` on percentage pricing | Field error targets badge text | Method-aware truthfulness |

### StorefrontRendering
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB tier badge | Quantity pill with enabled badge | Visible badge text describes the pill | Selected-only visibility is honored |
| 2 | FPB tier badge | Stepped milestone with enabled badge | Visible badge text is included in milestone | Static copy and supported savings variables |
| 3 | Disabled or unresolved badge | Disabled badge or missing variable value | No badge element | No empty presentation |

## Acceptance Criteria
- [x] All listed behavior tests pass.
- [x] FPB and PPB save/load/runtime projection retain `tierBadge` without a fallback owner.
- [x] Admin uses Polaris web components and surfaces validation inline.
- [x] Raw widget syntax, widget build, CSS minification, and related regressions pass.
- [x] Direct Chrome QA passes after cache clear and hard reload on desktop and mobile.
