---
schema_version: 1
id: fpb-upsell-implementation-handoff
title: FPB Upsell Implementation Handoff
type: implementation-handoff
status: approved
summary: Hands the approved unified upsell contract to production implementation.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [storefront-design]
systems: [fpb-upsell]
source_paths: [app/storefront/app-embed.ts, app/assets/widgets/full-page]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/acceptance-criteria.md]
tags: [handoff]
keywords: [implementation]
---

# Implementation Handoff

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 2
Artifact status: approved

## Source-of-truth priority

Business semantics, repository instructions, approved state/responsive/accessibility contracts, existing design tokens, then post-deploy visual evidence.

## Current architecture map

Implement the approved user plan end to end. Canonical owners are: FPB configure state/save boundary for merchant configuration; a signed app-proxy route and pure query/DTO helpers for eligible offers; app-embed Liquid plus a template-neutral module for product-page runtime; one shared CSS asset; one placement-only Liquid block; and a shared FPB controller method for destination handoff.

## Required states

UP-01 through UP-12 in `state-matrix.md` are mandatory, including loading-without-shell, both modes, multiple offers, both placement paths, busy restoration, and valid/invalid/delayed handoff.

## Responsive transformations

Use the component-width transformation in `responsive-contract.md`; wide Block offers use image/copy/CTA tracks and narrow offers stack with a full-width CTA.

## Accessibility contract

Native link semantics, merchant-authored name, visible focus, 44px target, decorative image, `aria-busy`, one-shot activation, and reduced-motion behavior are mandatory.

## Allowed production areas

- FPB configure route, shared configure helpers only where FPB behavior remains isolated.
- Signed API route and focused server helpers.
- App embed source/Liquid/build manifest and one new shared upsell CSS source/output.
- Shared FPB controller method and its direct load-step hook.
- Extension status/navigation contracts required for the unified block.
- Focused tests, test spec, internal docs, navigation map, generated assets, and widget version.

## Prohibited changes

- PPB behavior, Prisma schema, deployment-general-sync, cart logic, FPB config load priority, preset-specific upsell branches, runtime CSS generation, fabricated fallback copy, or compatibility shims.

## Chrome DevTools QA plan

Run focused Jest suites, modified-file ESLint, raw/generated JS syntax checks, widget build, CSS minification, extension/app validation when available, diff check, and graph rebuild. Stop before deploy. Post-deploy Chrome QA remains manual/SIT because this request forbids autonomous deployment.

## Rollback guidance

Main risks are cross-shop query leakage, incorrect paid-step matching, duplicate initialization, theme form discovery, and stale/incorrect variant selection. Roll back by reverting the unified runtime/API/anchor as one versioned storefront slice; do not restore obsolete handles as a shim.
