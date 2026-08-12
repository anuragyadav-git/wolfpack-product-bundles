---
schema_version: 1
id: fpb-shared-layout-composition
title: FPB Shared Layout Composition Test Spec
type: test-spec
status: active
summary: Verifies that shared FPB layout assets load once before the active template override asset.
last_audited: 2026-08-13
owners:
  - storefront
domains:
  - storefront
systems:
  - full-page-bundle
source_paths:
  - app/storefront/app-embed.ts
  - app/storefront/fpb-template-assets.ts
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - tdd
  - fpb
keywords:
  - shared-layout
  - stylesheet-order
  - template-overrides
---

# Test Spec: FPB Shared Layout Composition

**Spec ID:** fpb-shared-layout-composition **Created:** 2026-08-13

## Purpose

Ensure every FPB template composes the same base, mobile-summary, and responsive assets before its optional design-specific override asset.

## Test Cases

### FPB stylesheet composition

| #   | Scenario             | Input                                | Expected Output                               | Notes                                   |
| --- | -------------------- | ------------------------------------ | --------------------------------------------- | --------------------------------------- |
| 1   | Supported template   | Shared asset URLs and one preset URL | Base, mobile summary, responsive, then preset | Preset remains the final cascade layer. |
| 2   | Missing optional URL | One or more absent asset URLs        | Missing entries are omitted                   | Prevents empty stylesheet requests.     |

## Acceptance Criteria

- [x] Every supported FPB template receives the same ordered shared assets.
- [x] The active preset stylesheet loads last and may override shared visual defaults.
- [x] Missing URLs are omitted without changing the remaining order.
