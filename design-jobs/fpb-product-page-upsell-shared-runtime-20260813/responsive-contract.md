---
schema_version: 1
id: fpb-upsell-responsive-contract
title: FPB Upsell Responsive Contract
type: design-responsive-contract
status: approved
summary: Defines content-driven product-column behavior for the shared upsell.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [storefront-design]
systems: [fpb-upsell]
source_paths: [extensions/bundle-builder/assets]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/state-matrix.md]
tags: [responsive]
keywords: [container-query]
---

# Responsive Contract

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 2
Artifact status: approved

## Required viewports and container widths

| ID | Width | Height | Purpose |
|---|---:|---:|---|
| narrow | 320 | 720 | Minimum mobile stress |
| mobile | 390 | 844 | Primary mobile |
| desktop | 1280 | 800 | Desktop product page |
| constrained | 559 container | intrinsic | One below horizontal transformation |
| horizontal | 560 container | intrinsic | Horizontal layout threshold recommendation |

## Region transformations

| Region | Wide container | Narrow container | Overflow |
|---|---|---|---|
| Block offer | image, copy, CTA grid | stacked flow | none |
| CTA | intrinsic end track | full width | wraps label |
| Copy | flexible middle track | normal document flow | wraps |
| Image | bounded square | bounded square | cover crop |

- The offer list is always inline in its owning product-column anchor and never fixed or sticky.
- Block mode uses intrinsic grid tracks. At sufficient container width, image, copy, and CTA align horizontally; narrow containers stack with a full-width CTA.
- Button mode uses the same root and CTA sizing without empty image/copy columns.
- Image uses a bounded square intrinsic size and `object-fit: cover`; missing image removes the media region.
- Copy wraps without fixed height or line clamp. Long title/description may grow the offer.
- CTA has a minimum 44px block size and remains reachable at 320px, 390px, constrained desktop columns, and 1280px+ viewports.
- Spacing and shell widths use `clamp`, `minmax`, intrinsic tracks, and existing design variables. No preset selector or captured screenshot width is allowed.
- Required QA: 1280x800+, 390x844, a 320px narrow stress case, and a constrained desktop product column.
