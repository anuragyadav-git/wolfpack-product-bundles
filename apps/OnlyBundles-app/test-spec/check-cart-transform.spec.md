# Test Spec: Check Cart Transform Status
**Spec ID:** check-cart-transform  **Created:** 2026-08-18

## Purpose
Verify that `app/routes/api/api.check-cart-transform.tsx` checks the active CartTransform object registered in the Shopify shop using Admin GraphQL.

## Test Cases
### CheckCartTransformSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Active CartTransform present for function | GraphQL returns matching `shopifyFunctions` and `cartTransforms` | Returns `{ activated: true, cartTransformId: "gid://...", rustFunctionId: "gid://...", totalTransforms: 1, staleTransforms: [] }` | Active state |
| 2 | No CartTransform registered | GraphQL returns functions but empty `cartTransforms` | Returns `{ activated: false, cartTransformId: null, rustFunctionId: "gid://...", totalTransforms: 0, staleTransforms: [] }` | Inactive state |
| 3 | Stale CartTransform registered for other function | GraphQL returns `cartTransforms` with mismatched functionId | Returns `{ activated: false, staleTransforms: ["gid://..."] }` | Stale transform detection |
| 4 | GraphQL failure | GraphQL throws Error | Returns `{ error: "Failed to check cart transform status", activated: false }` | Error handling |

## Acceptance Criteria
- [ ] All listed test cases pass
