# Test Spec: PPB Place Widget and Container Targeting
**Spec ID:** ppb-place-widget-and-container-targeting  **Created:** 2026-09-04

## Purpose
Ensure that clicking "Place Widget" on Product Page Bundles uses the canonical "bundle-product-page" app block, and ensure BundleDataManager selects container bundles without being rejected by secondary upsell targeting rules.

## Test Cases
### BundleDataManagerContainerSelection
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Container product with targeted upsell config | Product matching container bundle ID where `displayConfiguration.selectedProducts` targets a different product | Returns the container bundle | Upsell targeting applies only to non-container products |
| 2 | Direct bundle ID with targeted upsell config | Request with explicit `bundleId` matching bundle where `displayConfiguration.selectedProducts` targets a different product | Returns the bundle | Explicit bundle ID takes precedence over upsell targeting |
| 3 | Matching shopifyProductId with targeted upsell config | Request with `currentProductId` matching bundle `shopifyProductId` where upsell targeting targets a different product | Returns the bundle | Product ID direct match takes precedence over upsell targeting |

### PpbPlacementBlockHandle
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Main PPB flow placement | `activeSection = "step_setup"` | `"bundle-product-page"` | Targets primary Bundle Builder block |
| 2 | Bundle Widget placement | `activeSection = "bundle_widget"` | `"bundle-upsell"` | Targets upsell anchor block |
| 3 | Bundle Embed placement | `activeSection = "bundle_embed"` | `"bundle-product-page-embed"` | Targets custom embed anchor block |

## Acceptance Criteria
- [ ] All listed test cases pass
