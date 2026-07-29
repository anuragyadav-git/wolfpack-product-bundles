---
schema_version: 1
id: bfs-dashboard-homepage
title: BFS Dashboard Homepage Test Spec
type: test-spec
status: active
summary: Behavior gates for dashboard metrics, storefront extension status, onboarding, and support access.
last_audited: 2026-07-29
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
source_paths:
  - app/routes/app/app._index.tsx
  - app/routes/app/app.dashboard/DashboardTopCards.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - bfs
  - dashboard
keywords:
  - onboarding
  - setup-guidance
---

# Test Spec: BFS Dashboard Homepage
**Spec ID:** bfs-dashboard-homepage  **Created:** 2026-07-20

## Purpose
Expose useful bundle metrics and complete published-theme extension status alongside onboarding and direct support access.

## Test Cases
### ExistingDashboardSurfaces
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | New install | Auth flow and first-create eligibility | Existing `/app/onboarding` route opens | Immediately visible onboarding |
| 2 | Returning shop | Auth flow without eligibility | Dashboard opens | No repeated onboarding |
| 3 | Existing secondary card | Merchant has a feature, storefront, design, analytics, or uninstall issue | Founder-aligned hero/body dimensions, five issue prompts, and a bottom-aligned direct support CTA are visible | CTA opens existing support chat |
| 4 | Existing bundles | Bundle records exist | Active bundle count is visible on the homepage | Metric is useful to merchants |
| 5 | Theme setup | Published theme exposes extension blocks/embeds | All five Wolfpack resources show Active, Available, or Unavailable status | Theme Editor action appears when the embed is not active |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Homepage includes metrics and complete theme extension status
