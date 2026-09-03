---
schema_version: 1
id: bundle-visibility-publishing-grid
title: "Test Spec: Shared Bundle Visibility Publishing Grid"
type: test-spec
status: active
summary: Verifies the shared publishing-practice content used by FPB and PPB bundle visibility flows.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - bundle-admin
systems:
  - configure-flow
source_paths:
  - app/routes/app/_shared/bundle-configure/CommonBundleVisibilityOverview.tsx
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - bundle-visibility
  - publishing
keywords:
  - publishing best practices
  - shared configure component
---

# Test Spec: Shared Bundle Visibility Publishing Grid

**Spec ID:** bundle-visibility-publishing-grid  **Created:** 2026-08-27

## Purpose

Ensure FPB and PPB consume one shared publishing-practices component with the four supported placement guides and working quick-guide disclosures.

## Test Cases

### PublishingBestPractices

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render shared publishing practices | Default component | Four placement cards with unique headings, descriptions, thumbnails, time estimates, and quick guides | Desktop cards use equal dimensions; layout is verified visually, not through CSS assertions |
| 2 | Open a quick guide | Activate a card disclosure | The placement-specific setup instructions are available | Shared behavior applies to FPB and PPB |

## Acceptance Criteria

- [x] One shared component owns all four publishing-practice cards.
- [x] Each card exposes its own placement guidance.
- [x] Grid appearance is verified in Chrome at desktop and mobile widths.
- [x] All four desktop cards render at the same dimensions.
