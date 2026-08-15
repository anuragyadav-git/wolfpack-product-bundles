---
schema_version: 1
id: fpb-prototype-ownership
title: FPB Prototype Ownership
type: design-system-prototype
status: active
summary: Defines how FPB prototype evidence maps to the shared family contract and four template adapters.
last_audited: 2026-08-07
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb
source_paths:
  - app/assets/widgets/shared/template-design-system.ts
related_docs:
  - design-system/03-fpb/family-contract.md
tags:
  - prototype
  - fpb
keywords:
  - standard
  - classic
  - compact
  - horizontal
---

# FPB Prototypes

Prototype evidence must cover Standard, Classic, Compact, and Horizontal using the same fixture and state identifiers as the registries. Prototypes may vary layout and density but cannot redefine selection, pricing, validation, inventory, or cart behavior.

Approved browser captures belong under `08-qa/reports/`; investigative screenshots remain outside commits.
