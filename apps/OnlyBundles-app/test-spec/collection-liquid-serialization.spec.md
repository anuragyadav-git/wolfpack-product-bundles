# Test Spec: Collection Liquid Serialization Deprecation Fix
**Spec ID:** collection-liquid-serialization  **Created:** 2026-09-15

## Purpose
Ensure that product collection context passed from theme Liquid to the storefront widget relies only on explicit collection properties (`id`, `handle`) rather than full collection object serialization (`{{ product.collections | json }}`), maintaining compatibility with collection targeting visibility rules after Shopify's October 5, 2026 deprecation.

## Test Cases

### BundleDataManager Collection Targeting
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Collection match by numeric ID | `currentProductCollections: [{ id: 12345, handle: "summer" }]`, `targeting: [12345]` | `true` | Matches numeric ID from new Liquid serialization |
| 2 | Collection match by string ID | `currentProductCollections: [{ id: "12345", handle: "summer" }]`, `targeting: ["gid://shopify/Collection/12345"]` | `true` | Normalizes ID to GID |
| 3 | Collection match by handle | `currentProductCollections: [{ id: 9999, handle: "featured" }]`, `targeting: ["featured"]` | `true` | Matches collection handle |
| 4 | No collection match | `currentProductCollections: [{ id: 1111, handle: "sale" }]`, `targeting: ["summer"]` | `false` | Non-matching collection hides widget |
| 5 | Empty collections array | `currentProductCollections: []`, `targeting: ["summer"]` | `false` | Safe handling of products with no collections |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] No occurrences of `collection | json` or `product.collections | json` in Liquid blocks
- [ ] ESLint passes with 0 errors on modified files
