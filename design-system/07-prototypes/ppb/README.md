---
schema_version: 1
id: ppb-prototype-ownership
title: PPB Prototype Ownership
type: design-system-prototype
status: active
summary: Defines how PPB prototype evidence maps to the shared family contract and four template adapters.
last_audited: 2026-08-07
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - ppb
source_paths:
  - app/assets/widgets/shared/template-design-system.ts
related_docs:
  - design-system/04-ppb/family-contract.md
tags:
  - prototype
  - ppb
keywords:
  - grid
  - list
  - vertical-slots
  - horizontal-slots
---

# PPB Prototypes

Prototype evidence must cover Grid, List, Vertical Slots, and Horizontal Slots using canonical IDs. In-page and modal composition may differ, but product selection, pricing, validation, inventory, and cart semantics remain family-owned.

Approved browser captures belong under `08-qa/reports/`; investigative screenshots remain outside commits.
