---
schema_version: 1
id: settings-design-brand-colors-banner-dismissal
title: Settings Design Brand Colors Banner Dismissal
type: test-spec
status: active
summary: Verifies that the Design workspace brand-colors information banner can be dismissed without changing merchant settings.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - admin
systems:
  - settings-design
source_paths:
  - app/routes/app/app.settings/DesignSettingsView.tsx
related_docs:
  - internal docs/Shopify Integration/Polaris Web Components Reference.md
tags:
  - settings
  - design
  - banner
keywords:
  - brand colors
  - dismissible banner
---

# Test Spec: Settings Design Brand Colors Banner Dismissal

**Spec ID:** settings-design-brand-colors-banner-dismissal  **Created:** 2026-08-30

## Purpose

Ensure the informational Growth design banner that describes editable brand
colors exposes the native Polaris dismissal control without participating in
Design settings persistence.

## Test Cases

### DesignSettingsView

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Free-plan Design inspector renders its informational banner | `advancedDesignAvailable=false` | The Growth/brand-colors `s-banner` is rendered with native dismissal enabled | Dismissal is page-local and does not dirty settings |

## Acceptance Criteria

- [x] The Growth/brand-colors information banner exposes Polaris native dismissal.
- [x] No Design field or persistence contract changes.
- [x] Focused tests, TypeScript, lint, and build pass.
