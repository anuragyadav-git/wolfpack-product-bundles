---
schema_version: 1
id: fpb-upsell-widget-admin-and-carousel-test-spec
title: FPB Upsell Widget Admin and Product Carousel Test Spec
type: test-spec
status: verified-chrome
summary: Covers full-gallery hydration for compact direct products and the requested Polaris upsell controls and illustrations.
last_audited: 2026-08-13
owners:
  - Aditya Awasthi
domains:
  - admin
  - storefront
systems:
  - fpb-upsell
  - product-modal
source_paths:
  - app/assets/widgets/full-page/methods/product-processing-methods.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleWidgetSection.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
keywords:
  - product carousel
  - upsell illustration
---

# Test Spec: FPB Upsell Admin and Mobile Product Carousel
**Spec ID:** fpb-upsell-widget-admin-and-carousel  **Created:** 2026-08-13

## Purpose

Prove that compact direct products hydrate their full Shopify image gallery, duplicate hydrated products retain richer data, and the FPB Admin surface uses the requested Polaris semantics and mode-specific illustration.

## Test Cases

### ProductHydration
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Poor duplicate precedes rich collection product | same selection with one image then four images | one merged product with four images | preserves first record business fields |
| 2 | Duplicate has richer description and variant data | partial and hydrated records | missing fields are enriched | no duplicate card |
| 3 | Compact direct product has one cached image | product GID in `id` and four-image API payload | full gallery reaches the drawer | matches live FPB payload shape |

### AdminControls
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Placement action | enabled widget | external icon inside Embed Upsell button | Polaris icon |
| 2 | Visibility tip | enabled widget | slim banner with `s-text`, no heading | Polaris banner |
| 3 | Browsed product | either mode | checkbox control | not a switch |
| 4 | Mode illustration | Block or Button mode | matching public illustration source | existing assets only |

## Acceptance Criteria

- [x] Focused behavior tests pass.
- [x] No CSS, class-name, source-grep, or placement unit tests are added.
- [x] Mobile Chrome proof cycles the multi-image Pendant product drawer.
