# Test Spec: Analytics Route Readiness
**Spec ID:** analytics-route-readiness  **Created:** 2026-08-18

## Purpose
Ensure that `waitForAnalyticsRouteReady` in `app/routes/app/app.attribution/AttributionRouteShell.tsx` resolves immediately when both `analytics` and `pixelStatus` data promises resolve, without injecting artificial time delays.

## Test Cases
### AnalyticsRouteReadinessSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Both analytics and pixelStatus resolve | Resolved promises for analytics and pixelStatus | Resolves `[resolvedAnalytics, resolvedPixelStatus]` immediately | Fast path |
| 2 | Pixel status pending | Analytics resolves but pixelStatus is pending | Remains unsettled until pixelStatus resolves | Synchronization |
| 3 | Initial static rendering | Pending promises | Renders fallback progressbar with aria-label "Loading Analytics" | Suspense boundary |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] No artificial `setTimeout` delay is injected into the route readiness promise
