---
schema_version: 1
id: app-embed-template-stylesheet
title: App Embed Template Stylesheet Test Spec
type: test-spec
status: active
summary: Verifies that every FPB preset resolves its dedicated app-embed stylesheet URL.
last_audited: 2026-08-10
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
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - fpb
keywords:
  - app-embed
  - template-stylesheet
---

# Test Spec: App Embed Template Stylesheet
**Spec ID:** app-embed-template-stylesheet  **Created:** 2026-08-10

## Purpose

Ensure the app embed resolves the dedicated stylesheet URL for every FPB design preset.

## Test Cases

### FPB app-embed template assets
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Resolve every supported preset | `STANDARD`, `CLASSIC`, `COMPACT`, `HORIZONTAL` | Matching `data-preset-*` URL | Prevents case-sensitive `DOMStringMap` lookup failures |

## Acceptance Criteria
- [ ] Every FPB preset resolves its dedicated stylesheet URL.
- [ ] Missing preset asset data produces no URL.
