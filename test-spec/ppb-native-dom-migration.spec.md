---
schema_version: 1
id: ppb-native-dom-migration
title: PPB Native DOM Migration Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for migrating product-page bundle and Admin preview rendering away from browser HTML injection sinks.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
systems:
  - ppb-widget
source_paths:
  - app/assets/widgets/product-page
  - app/routes/root/settings-design-preview-frame/route.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - native-dom
  - tdd
keywords:
  - PPB
  - admin-preview
---

# Test Spec: PPB Native DOM Migration
**Spec ID:** ppb-native-dom-migration  **Created:** 2026-08-27

## Purpose
Prove PPB in-page, modal, slot, footer, variant, and production-renderer preview behavior after native-DOM migration.

## Test Cases
### PpbNativeDomMigration
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Render in-page products | Product and variant data containing markup | Product text remains inert and actions retain behavior | List and Grid |
| 2 | Render modal products and states | Loading, products, empty, and failure states | The catalog swaps native children and preserves focus | Horizontal and Vertical Slots |
| 3 | Update footer and discount state | Quantity and discount transitions | Semantic totals, progress, and navigation update | No HTML messages |
| 4 | Render slot controls | Empty, selected, replace, and remove states | Data attributes, ARIA labels, and callbacks remain correct | Native nodes |
| 5 | Reuse production renderers in Admin | Eight preview templates and transient states | Preview behavior uses the migrated runtime contract | Browser verification required |
| 6 | Load the safe modal stylesheet for an unclassified PPB payload | Missing template type and preset, including template asset URLs published after widget initialization | Runtime retries the asset lookup and loads the modal stylesheet so inactive overlays remain hidden | Fail-closed storefront boundary |

## Acceptance Criteria
- [ ] All listed test cases pass
