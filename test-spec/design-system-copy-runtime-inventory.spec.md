---
schema_version: 1
id: design-system-copy-runtime-inventory
title: Design System Copy Runtime Inventory Test Spec
type: test-spec
status: active
summary: Verifies that storefront language fields generate the canonical design-system copy inventory.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
systems:
  - template-design-system
source_paths:
  - app/lib/settings-language-runtime.ts
  - design-system/scripts/extract-copy-registry.mjs
related_docs:
  - wolfpack-bundle-template-design-system-plan.md
tags:
  - copy
  - inventory
keywords:
  - runtime-copy
  - placeholders
---

# Test Spec: Design System Copy Runtime Inventory
**Spec ID:** design-system-copy-runtime-inventory  **Created:** 2026-08-10

## Purpose
Keep the design-system copy registry synchronized with the canonical storefront language runtime.

## Test Cases
### RuntimeCopyInventory
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB and PPB language fields | Runtime source with both builders | Canonical family-prefixed entries with exact labels, paths, and defaults | Prevents hand-maintained drift |
| 2 | Condition field | Runtime `conditionField` call | Stable ID derived by the same normalization as runtime | Covers generated IDs |
| 3 | Placeholder copy | Fallback containing placeholders | Allowed placeholders are extracted without duplicates | Supports validation |
| 4 | Duplicate runtime field | Same family and field ID twice | Extraction fails | Prevents ambiguous ownership |

## Acceptance Criteria
- [ ] Every runtime language field is represented exactly once.
- [ ] Defaults and placeholders match runtime source.
- [ ] FPB, PPB, and shared fields map to canonical templates and fixtures.
