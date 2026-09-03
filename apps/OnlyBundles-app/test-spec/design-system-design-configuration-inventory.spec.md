---
schema_version: 1
id: design-system-design-configuration-inventory
title: Design System Design Configuration Inventory Test Spec
type: test-spec
status: active
summary: Verifies that every Admin Design control generates a canonical configuration-registry entry.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
systems:
  - template-design-system
source_paths:
  - app/lib/admin-configuration-surfaces.ts
  - app/lib/settings-design-runtime.ts
  - design-system/scripts/extract-config-registry.mjs
related_docs:
  - wolfpack-bundle-template-design-system-plan.md
tags:
  - configuration
  - design-settings
keywords:
  - merchant-tokens
  - runtime-inventory
---

# Test Spec: Design System Design Configuration Inventory
**Spec ID:** design-system-design-configuration-inventory  **Created:** 2026-08-10

## Purpose
Keep every base and expert Admin Design control represented in the canonical configuration registry.

## Test Cases
### DesignConfigurationInventory
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Base Design controls | `DESIGN_CONFIGURATION` fields | Exact keys, labels, types, defaults, and options | Covers brand, typography, corners, and images |
| 2 | Expert controls | `EXPERT_COLOR_CONTROLS` fields | Exact expert keys and defaults | Covers component-specific merchant colors |
| 3 | Expert mode | Design contract | Synthetic canonical boolean entry | Controls expert-field applicability |
| 4 | Duplicate control key | Duplicate base/expert key | Extraction fails | Prevents ambiguous persistence |

## Acceptance Criteria
- [ ] Every Admin Design field is represented exactly once.
- [ ] Disabled loading placeholders are classified as non-editable design fields.
- [ ] Registry validation fails when a current Design control is absent.
