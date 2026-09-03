---
schema_version: 1
id: fpb-native-dom-migration
title: FPB Native DOM Migration Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for migrating full-page bundle rendering away from browser HTML injection sinks.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/full-page
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - native-dom
  - tdd
keywords:
  - FPB
  - rendering
---

# Test Spec: FPB Native DOM Migration
**Spec ID:** fpb-native-dom-migration  **Created:** 2026-08-27

## Purpose
Prove FPB loading, catalog, selection, summary, variant, validation, messaging, modal, and error behavior after native-DOM migration.

## Test Cases
### FpbNativeDomMigration
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Render loading and errors | Pending and rejected product requests | Accessible status or error content replaces the previous state | No injected markup |
| 2 | Select and remove products | Product, variant, and quantity actions | State, attributes, focus recovery, and summaries remain correct | Hostile text stays inert |
| 3 | Render discount and validation messages | Merchant templates and calculated values | Owned emphasis survives and merchant values remain text | Segment renderer |
| 4 | Open and close modal paths | Product and confirmation actions | Delegation, ARIA state, and opener focus are preserved | Native children |
| 5 | Render all FPB template contracts | Standard, Classic, Compact, and Horizontal | Each template exposes its functional regions and actions | Visual proof is separate |

## Acceptance Criteria
- [ ] All listed test cases pass
