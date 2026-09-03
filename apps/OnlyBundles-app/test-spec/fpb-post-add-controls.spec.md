---
schema_version: 1
id: fpb-post-add-controls
title: FPB Post-Add Controls Test Spec
type: test-spec
status: active
summary: Verifies that FPB persists and executes the saved landing-page post-add script once.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/lib/settings-controls-runtime.ts
  - app/assets/widgets/full-page/methods/analytics-config-methods.js
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - cart
  - controls
keywords:
  - execute script
  - post add
---

# Test Spec: FPB Post-Add Controls

**Spec ID:** fpb-post-add-controls  **Created:** 2026-07-30

## Purpose

Keep the FPB landing-page post-add script aligned with the persisted Controls
setting and execute it exactly once before redirect or integration handoff.

## Test Cases

### FPBPostAddControls

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Runtime mapping | Landing Page `Execute Script` value | Script is present in `landingPage.checkout` | Uses the shared Controls runtime response |
| 2 | Post-add lifecycle | Qualified cart add with saved script | Script runs once before redirect handling | Script errors remain non-blocking |

## Acceptance Criteria

- [x] Runtime mapper includes the FPB execute script.
- [x] FPB executes the script once after cart success.
- [x] Focused tests pass.
- [x] Raw widget source passes `node --check`.
- [x] Widget bundles are rebuilt.
