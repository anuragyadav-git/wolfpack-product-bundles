---
schema_version: 1
id: design-system-duplicate-style-audit
title: Duplicate Style Audit
type: design-system
status: active
summary: Tracks CSS duplication risks and required cleanup candidates in template implementations.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/full-page-css
  - app/assets/widgets/product-page-css
  - design-system/01-foundations/design-tokens.json
related_docs:
  - design-system/README.md
  - design-system/design-system-manifest.yaml
tags:
  - duplicates
  - css
  - audit
keywords:
  - duplication
  - tokenization
  - cleanup
---

# Duplicate Style Audit

## Current status

- The shared template-contract refactor is in progress; duplicate template styling remains in:
  - `app/assets/widgets/full-page-css`
  - `app/assets/widgets/product-page-css`
- No final dedupe pass has been completed in this objective slice.

## Risk

- Per-template CSS drift can reintroduce unintended differences between shared runtime contracts.

## Next

- Reduce duplicate style logic by resolving family-level tokens first, then enforcing
  minimal adapter-specific diffs.
