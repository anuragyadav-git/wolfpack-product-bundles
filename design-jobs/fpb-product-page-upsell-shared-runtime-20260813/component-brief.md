---
schema_version: 1
id: fpb-product-page-upsell-shared-runtime-brief
title: FPB Product Page Upsell Shared Runtime Brief
type: design-job-brief
status: approved
summary: Defines the FPB product-page upsell renderer, placement, targeting, and handoff scope.
last_audited: 2026-08-13
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - fpb-upsell
source_paths:
  - app/storefront/app-embed.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - fpb
  - upsell
keywords:
  - product-page
  - handoff
---

# Component Brief

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 1
Artifact status: approved

## Problem and goal

- User-provided fact: saved FPB upsell settings currently have no shared storefront renderer; two static Liquid blocks ignore the saved state.
- Primary user action: discover an eligible FPB on a product page and open it, optionally carrying the exact current product variant into the builder.
- Design goal: one template-neutral renderer owned by the global app embed, with one placement-only theme block and automatic placement below the primary product form.
- Success signal: every eligible offer renders once in deterministic order, adapts to its container, and hands off an exact variant without preset-specific branches.

## Scope

- In scope: FPB Admin configuration, signed offer API, shared product-page renderer, unified placement anchor, exact-variant handoff, shared FPB selection refresh, docs, tests, and generated assets.
- Out of scope: PPB behavior, new database columns, deployment, legacy block compatibility, arbitrary body placement, and FPB config loading priority.
- Merchant-configurable: mode, image, title, description, CTA, localization, target branch, and browsed-product preselection.
- Business constraints: CTA required in both modes; title required in Block; target branches are mutually exclusive; only active/unlisted FPBs with public numbers; enabled paid steps only; exact variants only.
- Accessibility: native CTA semantics, visible focus, 44px target, decorative image alt, exposed busy state, keyboard activation, no shell for empty/error.
- Repository-observed ownership: app embed owns global bootstrap; configure flow owns merchant state; signed app-proxy routes own public DTOs; shared FPB controller owns selections and both summary surfaces.

## Evidence and approval

- User facts: the supplied implementation plan is the approved contract.
- Repository facts: Widget Architecture still records two placement handles; the app embed already owns global FPB assets; Bundle columns and bundleUpsellConfig already exist.
- Assumptions: the connected theme exposes product.selected_or_first_available_variant and product.collections in Liquid.
- Open decisions: none.
- Scope status: approved by Aditya Awasthi through the implementation request on 2026-08-13.
