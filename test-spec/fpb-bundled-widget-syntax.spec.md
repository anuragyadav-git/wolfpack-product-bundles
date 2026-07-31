---
schema_version: 1
id: fpb-bundled-widget-syntax
title: FPB Bundled Widget Syntax
type: test-spec
status: active
summary: Verifies that the generated Full Page Bundle widget parses without top-level declaration collisions.
last_audited: 2026-07-26
owners:
  - storefront
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/full-page/methods/footer-selection-methods.js
  - extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js
related_docs:
  - docs/competitor-analysis/fpb-feature-parity-goal.md
tags:
  - fpb
  - regression
keywords:
  - bundled-widget-syntax
  - declaration-collision
---

# Test Spec: FPB Bundled Widget Syntax

**Spec ID:** fpb-bundled-widget-syntax  **Created:** 2026-07-26

## Purpose

Prevent raw FPB method modules from producing duplicate top-level declarations when concatenated into the deploy-target widget.

## Test Cases

### GeneratedBundleSyntax

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parse generated FPB widget | `node --check` against the bundled asset | Process exits successfully | Covers declaration collisions introduced by concatenation |

## Acceptance Criteria

- [ ] The generated Full Page Bundle widget passes Node syntax validation.
