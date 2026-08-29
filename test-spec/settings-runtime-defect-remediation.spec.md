---
schema_version: 1
id: settings-runtime-defect-remediation
title: "Test Spec: Settings Runtime Defect Remediation"
type: test-spec
status: active
summary: Verifies Language and Controls values from Admin persistence through owned storefront runtime consumers.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings
  - widgets
source_paths:
  - app/lib/settings-language-runtime.ts
  - app/lib/settings-controls-runtime.ts
  - app/routes/app/app.additional-configurations.tsx
  - app/assets/widgets/
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - tdd
  - runtime
keywords:
  - language-runtime
  - controls-runtime
---

# Test Spec: Settings Runtime Defect Remediation
**Spec ID:** settings-runtime-defect-remediation  **Created:** 2026-08-27

## Purpose

Verify the missing PPB language field and the confirmed Controls, collection, and add-on runtime defects.

## Test Cases

### SettingsRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB out-of-stock copy | Unique locale marker | Admin form, runtime, modal, and inline cards use marker | Seventy-first field |
| 2 | FPB compare-at configuration | FPB Controls inventory | No stale visibility field is exposed or serialized | Rendering remains product-driven |
| 3 | FPB CSS buckets | Three unique CSS markers | Each marker is consumed only by its owned surface | No scope leakage |
| 4 | Collection membership | One explicit product and one collection | Only owned, deduplicated products are returned | No cross-category products |
| 5 | Add-on save | Dirty add-on payload | One save request persists exact payload | Reload and runtime match |
| 6 | Additional Configurations direct load | Hard-loaded Controls route | Workspace receives the application store and renders | Matches the Settings entry path |
| 7 | Maximum Language snapshot | All 39 translated locale presets | PPB Shopify metafield stays within 128 KB | No repeated full language document per locale |
| 8 | Current Language schema completion | Saved canonical document missing a newly introduced field | Admin form and storefront runtime receive the current default without throwing | Prevents unrelated Controls saves from failing runtime sync |

## Acceptance Criteria

- [x] All 71 Language fields are editable and mapped to runtime.
- [x] PPB consumes active locale values in modal and inline modes.
- [x] Obsolete FPB compare-at configuration is absent.
- [x] CSS, collection, and add-on behavior matches ownership boundaries.
- [x] The direct Controls route renders with the same application context as Settings.
- [x] The maximum supported Language configuration fits Shopify's JSON metafield limit.
- [x] Current-schema completion prevents missing fields from breaking runtime synchronization.
