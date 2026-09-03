---
schema_version: 1
id: admin-onboarding-flow
title: Test Spec - Admin First Create Flow
type: test-spec
status: active
summary: Preserves atomic first-create eligibility and the post-create configure tour without a standalone onboarding page.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-create
  - bundle-configure
source_paths:
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
  - app/components/bundle-configure/BundleGuidedTour.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - first-create
  - guided-tour
keywords:
  - firstCreateTourEligible
  - first_load
---

# Test Spec: Admin First Create Flow
**Spec ID:** admin-onboarding-flow  **Created:** 2026-07-30

## Purpose
Preserve the guided configure-tour contract while keeping eligibility consumption atomic and removing the standalone onboarding page.

## Test Cases
### AdminOnboardingFlow
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Auth destination | Eligible and returning authenticated shops | Both open the dashboard | Intentional `/app` visit remains a landing page |
| 2 | Bundle-type handoff | Product-page or full-page create selection | Create route receives the validated `bundleType` query | Both bundle types supported |
| 3 | Successful first creation | Eligible shop and valid create request | Matching configure redirect includes `mode=create&first_load=true` | Eligibility is consumed after required creation succeeds |
| 4 | Noncritical widget check fails | Required bundle and parent product already created | Create still succeeds and redirects; widget status reports unchecked | Must not turn creation into a 500 |
| 5 | Failed required creation | Bundle or parent-product creation fails | Eligibility remains available and response is an error | Tour is not silently consumed |
| 6 | Guided-tour keyboard and focus | Escape, Next, Got it, dismiss, lazy or missing target | Persistence, focus restoration, body-scroll cleanup, and fallback all work | Section changes precede target lookup |

## Acceptance Criteria
- [x] PPB and FPB create selections reach the matching configure routes.
- [x] Duplicate submission remains disabled while navigation is submitting.
- [x] Required creation failures preserve eligibility.
- [x] Widget-status failures are noncritical after successful creation.
- [x] Tour completion and dismissal remain shop-keyed.
- [x] Escape closes the tour, restores focus, persists dismissal, and cleans body overflow.
