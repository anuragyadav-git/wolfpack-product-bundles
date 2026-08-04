---
schema_version: 1
id: fpb-all-template-summary-acceptance
title: FPB All-Template Summary Acceptance Criteria
type: design-acceptance
status: active
summary: Defines completion gates for the FPB all-template summary redesign and configurable-state verification.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - storefront-design-director
source_paths:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
  - design-jobs/fpb-all-template-summary-20260804/state-matrix.md
related_docs:
  - design-jobs/fpb-all-template-summary-20260804/component-brief.md
  - design-jobs/fpb-classic-summary-20260804/acceptance-criteria.md
tags:
  - template
keywords:
  - acceptance
  - qa
---

# Acceptance Criteria

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 2
Artifact status: complete

- [ ] Every `SUM-01` through `SUM-20` state is terminally proven at its required templates and viewports.
- [ ] Direction A reads as one calm review hierarchy while Standard, Classic, Compact, and Horizontal retain their approved desktop identities.
- [ ] Exactly one summary surface exists: desktop sidebar at measured widget-container widths of 1024px and above, shared tray below 1024px.
- [ ] The shared tray is non-modal, collapsed content is inert and hidden, its disclosure exposes `aria-expanded`, and page scroll never locks.
- [ ] Header and total/action regions remain outside the selected-list scroll owner in desktop and expanded tray modes.
- [ ] Standard, Classic, Compact, and Horizontal each retain a deliberate visual identity while sharing one coherent information hierarchy.
- [ ] Required states follow existing selection, pricing, inventory, navigation, add-on, validation, and cart rules without duplicate updates.
- [ ] Error and recovery paths work.
- [ ] Hierarchy, boundaries, spacing, type, surfaces, and indicators match within tolerance.
- [ ] No unexpected wrap, clip, overflow, or layout shift.
- [ ] Required viewports and critical boundaries follow the responsive contract.
- [ ] Responsive replacements do not overlap.
- [ ] Semantics, names, states, focus, keyboard, announcements, and reduced motion pass.
- [ ] No new uncaught errors, severe warnings, failed resources, or duplicate calls.
- [ ] Direct Chrome DevTools MCP preflight passes every mandatory check in the connected default profile.
- [ ] Before, after, element, and viewport PNGs, baselines, diffs, JSON summaries, and screenshot index are complete.
- [ ] Desktop and mobile Lighthouse findings distinguish pre-existing page issues from component-introduced issues.
- [ ] Performance trace shows no unapproved regression, or not-applicable has a reason.
- [ ] Every waiver has reason, approver, and timestamp; every retry remains in history.
- [ ] Affected siblings and control baselines pass.
- [ ] Cache Storage is cleared where available and every storefront pass starts with a cache-bypassed hard reload; the supplied dev server is never restarted.
- [ ] Raw screenshots, diffs, HARs, and browser investigation captures remain uncommitted; only durable non-sensitive reports and contracts are committed.
- [ ] Each verified implementation slice is committed with impact analysis after focused tests, syntax checks, lint, widget/CSS builds, and graph rebuild.
- [ ] No business contract, config-loading priority, PPB/Admin surface, legacy fallback, fabricated copy, runtime styling injection, or direct generated-asset edit is introduced.
