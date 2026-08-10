---
schema_version: 1
id: design-system-changelog
title: Design System Changelog
type: changelog
status: active
summary: Tracks design-system implementation milestones for template-family contract work.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - template-design-system
source_paths:
  - design-system/README.md
related_docs:
  - wolfpack-bundle-template-design-system-plan.md
tags:
  - changelog
keywords:
  - fpb
  - ppb
  - contract
---

# Design System Changelog

## 2026-08-10

- Replaced the seeded storefront-copy inventory with source-backed extraction from `settings-language-runtime.ts`.
- Expanded canonical runtime copy coverage from 20 manually maintained rows to 88 FPB, PPB, and shared fields.
- Added deterministic default, placeholder, duplicate-ID, registry, JSON, and coverage generation checks.

## 2026-08-06

- Expanded foundation color token contract from placeholder seed into evidence-grounded semantic token families in `design-system/01-foundations/design-tokens.json`.
- Promoted merchant token controls into explicit contract fields and removed the open token-contract verification bucket.
- Added shared template contracts into widget build pipeline.
- Updated full-page and product-page registries to resolve via shared contract.
- Added shared resolver usage in FPB summary and responsive runtime methods.
- Added initial design-system inventory scaffold and registries.
- Added missing foundation and shared-component documentation artifacts to align with plan phase 1/2 requirements.
- Added FPB/PPB family state/config/copy/responsive matrices.
- Added missing 05-copy artifacts (localization, length guidance, copy preview fixtures).
- Added 00-inventory duplicate-style audit artifact for consolidation tracking.
