---
schema_version: 1
id: configure-bundle-action-icons
title: Configure Bundle Action Icons Test Spec
type: test-spec
status: active
summary: Defines semantic Polaris icon coverage for FPB and PPB Bundle Setup actions.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin-ui
systems:
  - bundle-configure
source_paths:
  - app/lib/bundle-config/configure-action-icons.ts
  - app/routes/app/_shared/bundle-configure
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - polaris
  - icons
keywords:
  - Multi Language
  - Bundle Setup
---

# Test Spec: Configure Bundle Action Icons
**Spec ID:** configure-bundle-action-icons  **Created:** 2026-08-27

## Purpose
Prove FPB and PPB Configure flows use one semantic Polaris icon contract for equivalent Bundle Setup actions.

## Test Cases
### ConfigureActionIcons
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Resolve translation action | `translate` | `language-translate` | Shared by every Multi Language button |
| 2 | Resolve resource actions | Add or browse products and collections | Product and collection-specific Polaris icons | Same mapping for FPB and PPB |
| 3 | Resolve setup actions | Setup, place, edit, replace, refresh, variables, and plan actions | Stable semantic Polaris icon for each action | Section CTAs only |
| 4 | Resolve navigation actions | Back, next, complete, preview, and create page | Directional or outcome-specific Polaris icon | Template and page flows |
| 5 | Reject an unsupported action | Unknown runtime value | No icon is returned | Prevents arbitrary icon injection |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Every visible Multi Language button uses `language-translate`
- [x] Equivalent FPB and PPB actions use the same icon
