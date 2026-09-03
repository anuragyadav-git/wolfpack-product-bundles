---
schema_version: 1
id: product-page-admin-navigation
title: Product Page Admin Navigation
type: test-spec
status: active
summary: Verifies that Product Page Bundle Admin actions use Remix navigation without losing the embedded Shopify session.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - bundles
systems:
  - admin-configure
source_paths:
  - app/lib/bundle-config/product-page-admin-sections.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.discount.tsx
related_docs: []
tags:
  - navigation
  - embedded-admin
keywords:
  - edit defaults
  - auth query
---

# Test Spec: Product Page Admin Navigation
**Spec ID:** product-page-admin-navigation  **Created:** 2026-08-29

## Purpose

Prevent embedded Admin navigation from producing malformed Remix routes or losing the authenticated Shopify app context.

## Test Cases

### navigateToProductPageDefaults

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Save Bar permits navigation | leave confirmation resolves | Remix navigate receives `/app/settings` | Remix retains the embedded app context. |
| 2 | Navigation ordering | pending leave confirmation | no navigation until confirmation resolves | Prevent leaving behind unsaved changes. |

## Acceptance Criteria

- [x] Edit Defaults opens the valid Settings route inside the embedded app.
- [x] Navigation remains inside the authenticated embedded app.
- [x] All listed test cases pass.
