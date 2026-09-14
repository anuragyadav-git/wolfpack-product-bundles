---
schema_version: 1
id: configure-tooltip-storefront-depictions
title: Configure Tooltip Storefront Depictions
type: test-spec
status: active
summary: Defines verified storefront-renderer provenance and text-only handling for Configure help popovers.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - bundle-configure
  - widget-runtime
source_paths:
  - apps/OnlyBundles-app/app/constants/help-tooltips.ts
  - apps/OnlyBundles-app/app/routes/app/_shared/bundle-configure/ConfigureHelpPopover.tsx
  - apps/OnlyBundles-app/public/tooltip-*.png
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tooltip
  - visual-evidence
keywords:
  - storefront capture
  - production renderer
---

# Test Spec: Configure Tooltip Storefront Depictions

**Spec ID:** configure-tooltip-storefront-depictions  **Created:** 2026-09-11

## Purpose

Prevent conceptual or invented artwork from being presented as a storefront
example. A Configure help image must come from the production widget renderer
or a hard-reloaded Agent-store storefront. Settings with no distinct visible
storefront treatment remain text-only.

## Test Cases

### HelpTooltipCatalog

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Verified visual help | Tooltip with an image | Catalog records production-renderer or Agent-store evidence | Metadata does not attempt pixel testing |
| 2 | Non-visual or theme-variable setting | Cart-line discount display, specific link, scheduling, or country targeting | Tooltip has localized text but no illustrative image | Avoids fabricated or theme-specific storefront states |
| 3 | Durable source | Verified AVIF image path | Matching canonical PNG exists | Optimized derivatives remain generated assets |
| 4 | Live Configure inventory | Every catalog key | Key belongs to a rendered Configure help trigger | Removes orphan help entries |
| 5 | Intrinsic image proportions | Wide, square, and tall evidence captures | Catalog supplies the capture ratio to Polaris `s-image` | Prevents square letterboxing without custom CSS |

### ConfigureHelpPopover

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Verified image entry | Visual tooltip key | Polaris popover renders the verified image and localized copy | Shopify owns overlay behavior |
| 2 | Text-only entry | Non-visual tooltip key | Polaris popover renders heading and description without an image | No empty media region |

## Acceptance Criteria

- [x] Every rendered Configure help entry is audited one by one.
- [x] Every retained image has verified renderer provenance.
- [x] Non-visual and theme-variable settings do not show invented diagrams.
- [x] Canonical PNGs and optimized AVIF/WebP derivatives are synchronized.
- [x] Focused tests, lint, build, and desktop/mobile hard-reloaded Chrome QA pass.
