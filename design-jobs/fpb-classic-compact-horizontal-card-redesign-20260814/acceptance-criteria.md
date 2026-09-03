---
schema_version: 1
id: fpb-three-preset-acceptance-criteria
title: FPB Four-Template Alignment Acceptance Criteria
type: design-job-artifact
status: complete
summary: Defines blocking CSS, behavior, responsive, accessibility, and asset checks for all four FPB templates.
last_audited: 2026-09-03
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page-css/templates
related_docs:
  - browser-test-plan.yaml
  - implementation-handoff.md
tags:
  - fpb
  - acceptance
keywords:
  - regression
  - asset size
---

# Acceptance Criteria

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 4
Artifact status: complete

- [ ] Standard icon CTA price and action tracks retain identical x, y, width, and height between default and selected-quantity states.
- [ ] Classic reads as CL-A: restrained frame, roomy image-first hierarchy, compact body rhythm, four desktop columns and two phone columns.
- [ ] Compact reads as CO-A: subtle bounded card, dense image-first hierarchy, contained action, three desktop columns and two phone columns.
- [ ] Horizontal reads as HO-A: bounded 30/70 row, two columns at/above 800px and one below 800px.
- [ ] Required states follow existing business rules with no duplicate updates, errors recover through existing flows, and C01-C15 remains passing.
- [ ] Every same-row card has equal height and hover, focus, selected, quantity, or variant changes produce zero outer-card height delta.
- [ ] No unexpected wrapping, clipping, horizontal overflow, sticky overlap, or final-card obstruction at 1440x900, 1280x800, 768x1024, 390x844, or 360x800.
- [ ] 799/800/801 container widths follow the shared summary boundary and approved Horizontal transition.
- [ ] Mouse, touch, and keyboard card operation works with visible unclipped focus and existing 44px targets.
- [ ] Shared desktop summary, mobile tray/drawer, product modal/drawer, timeline, selection, pricing, variants, validation, and cart flow remain unchanged.
- [ ] No new app-owned console error, repeated warning, failed required widget request, duplicate mutation, or missing asset is introduced.
- [ ] Direct Chrome DevTools MCP strict preflight and all planned cases pass in the connected default profile.
- [ ] Required PNG, computed-style, geometry, accessibility, console, network, Lighthouse, trace, and comparison evidence is complete and sanitized.
- [ ] `npm run minify:assets css` passes, including Shopify's 100,000-byte asset gate; `git diff --check` and `npm run graphify:rebuild` pass per slice.
- [ ] Standard, Classic, Compact, and Horizontal desktop/mobile regression passes after the implementation slice.
- [ ] No commit is created unless requested; unrelated and hook-generated changes remain excluded.
- [ ] `WIDGET_VERSION` is not bumped until the eventual deploy preparation, then receives one PATCH bump; no deployment is run autonomously.
