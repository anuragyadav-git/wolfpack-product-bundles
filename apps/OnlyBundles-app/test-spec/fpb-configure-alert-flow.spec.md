---
schema_version: 1
id: fpb-configure-alert-flow
title: FPB Configure Alert Flow
type: test-spec
status: active
summary: Verifies that shared Admin operation-alert state reaches the FPB save and rendering controllers.
last_audited: 2026-08-29
owners:
  - wolfpack-engineering
domains:
  - admin
systems:
  - full-page-bundle
source_paths:
  - app/hooks/useBundleConfigurationState.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleController.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - alerts
  - tdd
keywords:
  - clearOperationAlert
  - save controller
---

# Test Spec: FPB Configure Alert Flow

**Spec ID:** fpb-configure-alert-flow  **Created:** 2026-08-29

## Purpose

Prevent FPB save completion from crashing when it clears a previous contextual operation alert.

## Test Cases

### FpbConfigureController

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shared alert state is initialized | Alert value plus set and clear callbacks | Controller exposes all three values unchanged | Save, retry, success, and dismiss paths consume these controls |

## Acceptance Criteria

- [x] The FPB controller propagates `operationAlert`, `setOperationAlert`, and `clearOperationAlert`.
- [x] A successful FPB save no longer throws because an alert callback is missing.
- [x] The focused controller test and TypeScript check pass.
