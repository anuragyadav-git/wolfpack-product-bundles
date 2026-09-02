---
schema_version: 1
id: admin-route-loading-bar
title: Admin Route Loading Bar - Superseded
type: test-spec
status: superseded
summary: Records the retired custom loading-bar contract replaced by Shopify-native progressive loading.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - settings
  - analytics
source_paths:
  - app/routes/app/app.tsx
related_docs:
  - test-spec/admin-progressive-loading.spec.md
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - loading
keywords:
  - retired loading bar
---

# Test Spec: Admin Route Loading Bar - Superseded

**Spec ID:** admin-route-loading-bar  **Created:** 2026-08-13

## Purpose

The custom app-owned top-edge loading bar and its 800 ms readiness timer have
been removed. Current behavior and acceptance criteria live in
`test-spec/admin-progressive-loading.spec.md`.
