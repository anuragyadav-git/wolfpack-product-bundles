---
schema_version: 1
id: fpb-title-flash
title: FPB Canonical DOM Setup
type: test-spec
status: active
summary: Verifies that canonical FPB setup creates no hidden legacy header or footer surface.
last_audited: 2026-08-11
owners:
  - Aditya Awasthi
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/full-page/methods/initial-render-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - tdd
keywords:
  - canonical DOM
  - title flash
---

# Test Spec: FPB Canonical DOM Setup

**Spec ID:** fpb-title-flash  **Created:** 2026-08-11

## Purpose

Verify that the app-proxy FPB runtime creates only its steps owner and product modal, without legacy Page-host title suppression or hidden header/footer elements.

## Test Cases

### CanonicalDomSetup

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Full-page setup | Canonical app-proxy container | Steps owner and modal are registered | No visual assertions. |
| 2 | Legacy header/footer creation | Canonical app-proxy container | Header and footer factories are not called | Promo and summary surfaces own visible copy. |

## Acceptance Criteria

- [ ] Canonical setup behavior test passes.
- [ ] No Page-host title or loading-node mutation remains.
