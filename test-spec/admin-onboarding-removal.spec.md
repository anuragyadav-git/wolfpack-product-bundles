---
schema_version: 1
id: admin-onboarding-removal
title: Test Spec - Admin Onboarding Removal
type: test-spec
status: active
summary: Removes the standalone onboarding route while preserving post-create guidance.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
systems:
  - remix-routes
source_paths:
  - app/routes/app/app._index.tsx
  - app/routes/app/app.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - onboarding
  - routing
keywords:
  - firstCreateTourEligible
  - first_load
---

# Test Spec: Admin Onboarding Removal
**Spec ID:** admin-onboarding-removal  **Created:** 2026-07-30

## Purpose
Remove the standalone onboarding page while preserving the first-successful-create guided tour.

## Test Cases
### AdminOnboardingRemoval
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Authenticated app entry | `/app` with Shopify auth parameters | Dashboard opens for every shop | No eligibility lookup or onboarding branch |
| 2 | Intentional app entry | `/app` without Shopify auth parameters | Existing app landing remains visible | Get Started opens bundle creation |
| 3 | Successful first creation | Eligible shop and valid FPB or PPB create request | Matching configure route includes `mode=create&first_load=true` | Eligibility remains create-owned |
| 4 | Failed required creation | Bundle or required parent-product creation fails | Eligibility remains available | Tour is not consumed |

## Acceptance Criteria
- [x] `/app/onboarding` is removed.
- [x] Authenticated `/app` requests always continue to `/app/dashboard`.
- [x] The shared `/app` loader does not query first-create eligibility.
- [x] The first successful FPB or PPB creation still opens the guided tour.
