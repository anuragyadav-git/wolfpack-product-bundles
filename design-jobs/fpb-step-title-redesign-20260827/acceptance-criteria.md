---
schema_version: 1
id: fpb-ppb-step-title-acceptance-criteria
title: FPB and PPB Step Title Acceptance Criteria
type: acceptance-criteria
status: complete
summary: Defines production and Settings Design parity acceptance for approved Step Title Direction A.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/implementation-handoff.md
  - design-jobs/fpb-step-title-redesign-20260827/browser-test-plan.yaml
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/browser-test-plan.yaml
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - acceptance
  - qa
  - preview-parity
---

# Acceptance Criteria

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

- [ ] FPB renders non-empty Step Title once as a content-aligned heading before categories/banner/search/products in all four templates.
- [ ] PPB Grid/List navigation uses Step Name and the active body renders Step Title once in both templates.
- [ ] PPB Horizontal/Vertical Slots use Step Name for slot groups and dialog identity; the active picker body renders Step Title once.
- [ ] Blank Step Title emits no heading and leaves no residual spacing or surface.
- [ ] Direction A uses responsive 18–24 px type, weight 700, line-height 1.25, existing merchant text colors, left alignment, and natural wrapping.
- [ ] Long, localized, and unbroken titles do not clip, overlap, truncate, or create horizontal scrolling.
- [ ] FPB 799/800/801 and PPB 767/768/769 boundaries preserve content alignment.
- [ ] Settings Design's eight template previews use the same production markup/computed Step Title treatment at 1280 x 1136 and 390 x 844; no preview-only Step Title rule exists.
- [ ] Neutral general-store preview chrome is excluded from comparison.
- [ ] Navigation, validation, selection, pricing, summary, cart, modal focus, and preview side-effect blocking remain unchanged.
- [ ] Semantic headings, navigation names, dialog label, keyboard order, focus, zoom, and reduced-motion requirements pass.
- [ ] Focused behavior tests, widget build, CSS minification, syntax checks, changed-file ESLint, `git diff --check`, and Graphify rebuild pass.
- [ ] No new uncaught errors, severe warnings, required-resource failures, or unexpected requests occur in tested paths.
- [ ] Direct Chrome DevTools MCP preflight passes every mandatory check in the connected default profile.
- [ ] Before, after, element, and viewport PNGs, baselines, diffs, JSON summaries, and screenshot index are complete.
- [ ] Desktop and mobile Lighthouse findings distinguish pre-existing page issues from component-introduced issues.
- [ ] Performance trace shows no unapproved regression, or not-applicable has a reason.
- [ ] Every waiver has reason, approver, and timestamp; every retry remains in history.
- [ ] FPB summary/sidebar/tray and PPB product-picker focus are named non-regression cases.
