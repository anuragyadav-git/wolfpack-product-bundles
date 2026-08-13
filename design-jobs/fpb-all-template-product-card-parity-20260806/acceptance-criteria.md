---
schema_version: 1
id: storefront-design-director-acceptance-template
title: Acceptance Criteria Template
type: design-job-template
status: active
summary: Defines independently testable behavioral, visual, responsive, accessibility, resource, and regression acceptance.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/acceptance-criteria.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/browser-test-plan.yaml
tags:
  - template
keywords:
  - acceptance
  - qa
---

# Acceptance Criteria

Artifact job ID: fpb-all-template-product-card-parity-20260806
Artifact revision: 1
Artifact status: draft

- [ ] Required states follow business rules without duplicate updates.
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
