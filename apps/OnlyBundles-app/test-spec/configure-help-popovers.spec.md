---
schema_version: 1
id: configure-help-popovers
title: Configure Help Popovers
type: test-spec
status: active
summary: Defines the Shopify-native rich visual help contract and curated coverage for FPB and PPB Configure pages.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/ConfigureHelpPopover.tsx
  - app/constants/help-tooltips.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tooltip
  - popover
keywords:
  - configure help
  - tooltip assets
---

# Test Spec: Configure Help Popovers

**Spec ID:** configure-help-popovers  **Created:** 2026-09-01

## Purpose

Preserve every existing Configure rich-help entry while replacing custom
overlay positioning with Shopify's Polaris popover and extending visual help
only to non-obvious storefront behavior.

## Test Cases

### ConfigureHelpPopover

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Accessible native trigger | Existing tooltip key | Non-submitting Polaris info button targets a Polaris popover | No manual positioning |
| 2 | Repeated help entry | Two instances of one key | Each trigger targets a distinct popover ID | Supports repeated rule cards |
| 3 | Localized rich content | Tooltip key | Catalog image, localized title, description, and image alt render | No hardcoded copy fallback |

### HelpTooltipCatalog

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Existing coverage | Original tooltip keys | Every key remains in the catalog | Existing tooltips are not removed |
| 2 | Curated coverage | Approved new keys | Every key has localized copy and an image | Self-explanatory controls remain excluded |
| 3 | Durable asset source | Rich-help image path | Matching `public/tooltip-*.png` exists | AVIF/WebP are generated derivatives |

## Acceptance Criteria

- [x] Shared rich help uses validated Polaris web components.
- [x] Existing tooltip keys and placements remain available.
- [x] Curated FPB/PPB coverage is complete.
- [x] Canonical PNG assets use the `public/tooltip-*` convention.
- [x] Focused tests, lint, build, and hard-reloaded SIT Chrome QA pass.
