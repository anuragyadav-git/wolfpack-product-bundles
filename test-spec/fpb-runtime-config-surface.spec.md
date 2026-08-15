---
schema_version: 1
id: fpb-runtime-config-surface
title: FPB Runtime Config Surface Test Spec
type: test-spec
status: active
summary: Verifies that FPB configuration parsing exposes only supported storefront display settings.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - storefront
systems:
  - widget-runtime
source_paths:
  - app/assets/widgets/full-page/methods/analytics-config-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - configuration
keywords:
  - parseConfiguration
---

# Test Spec: FPB Runtime Config Surface

**Spec ID:** fpb-runtime-config-surface  **Created:** 2026-06-01

## Purpose
Ensure the full-page bundle runtime does not emit unsupported text-banner or modal quantity-selector config.

## Test Cases
### FpbRuntimeConfigSurface
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parse unsupported storefront display settings | Dataset contains unsupported text-banner, modal quantity, spacing, and card-count values | Parsed config omits every unsupported field | Verifies runtime behavior without asserting source structure or CSS |

## Acceptance Criteria
- [ ] Unsupported fields are absent from the parsed FPB runtime configuration.
