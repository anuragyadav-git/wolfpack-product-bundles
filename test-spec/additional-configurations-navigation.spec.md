---
schema_version: 1
id: additional-configurations-navigation
title: Additional Configurations Navigation Test Spec
type: test-spec
status: active
summary: Verifies dedicated-route layout, tab, and group deep-link state for Additional Configurations.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - admin-settings
systems:
  - additional-configurations
source_paths:
  - app/lib/additional-configurations-navigation.ts
  - app/routes/app/app.additional-configurations.tsx
related_docs:
  - docs/competitor-analysis/checkout-integrations-additional-configurations-parity-plan.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - settings
  - navigation
keywords:
  - deep-link
  - layout
  - tab
---

# Test Spec: Additional Configurations Navigation

**Spec ID:** additional-configurations-navigation  **Created:** 2026-07-30

## Purpose

Make Additional Configurations a dedicated route whose active layout, tab, and
nested group survive direct navigation and hard reload without duplicating the
existing persisted settings form.

## Test Cases

### AdditionalConfigurationsNavigation

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Default deep link | No query parameters | Landing Page, Configuration, first group | Stable entry state |
| 2 | Product-page deep link | Product layout and CSS tab | Product Page, CSS & Scripts, requested valid group | Reload-safe |
| 3 | Invalid tab | Product layout plus Advanced | Product Page Configuration | Advanced is landing-only |
| 4 | Invalid group | Valid tab plus unknown group | First valid group | No empty content |
| 5 | Serialize state | Valid layout, tab, group | Canonical query parameters | Shareable URL |
| 6 | Dirty nested navigation | Layout, tab, group, or Back while dirty | Shopify save-bar leave confirmation runs before navigation | No silent data loss |

## Acceptance Criteria

- [x] Dedicated route reuses the persisted controls action and loader.
- [x] Layout, tab, and group state are URL-addressable.
- [x] Invalid combinations resolve to valid visible content.
- [x] Settings Controls card navigates to the dedicated route.
- [x] Focused tests pass.
