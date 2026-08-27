---
schema_version: 1
id: storefront-design-director-acceptance-template
title: Acceptance Criteria Template
type: design-job-template
status: active
summary: Defines independently testable behavioral, visual, responsive, accessibility, resource, and regression acceptance.
last_audited: 2026-08-21
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

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 8
Artifact status: approved

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

## Feature-specific gates

- [ ] Horizontal Slots and Vertical Slots use the same redesigned picker.
- [ ] The sheet is 85dvh at all five required viewports.
- [ ] Header and footer remain visible while only the catalog scrolls.
- [ ] Horizontal filled slots retain their approved bounded tile presentation.
- [ ] Vertical filled slots follow live EB only: responsive full width, content-derived 64px normal height, 60px minimum, no maximum, visible normal title wrapping/overflow, intrinsic flex sizing, 50px media, 5px padding and gap, 2px black border, 10px radius, bold 16px identity, no price, and a 20px inline trailing circular-cross visual.
- [ ] The Vertical filled row surface is inert; its cross removes exactly one represented unit. Horizontal filled-slot replacement remains unchanged.
- [ ] The complete product name remains available in the slot's programmatic names.
- [ ] Each Remove control retains its localized product-specific accessible name, removes exactly that selection, and preserves same-index focus restoration; the 20px exact-EB visual exception applies only to Vertical.
- [ ] The footer summary shrink-wraps icon/count/price content, keeps the icon and count aligned, grows for longer values, and remains inside the footer without page overflow.
- [ ] Product actions and focus rings are never covered by the footer.
- [ ] Desktop provides intrinsic four/five-column capacity; tablet and mobile use two columns.
- [ ] Sparse desktop rows keep intended card-track width instead of stretching.
- [ ] Every grouped multi-variant modal card exposes one labelled native selector at desktop and mobile; changing it performs no add mutation.
- [ ] Only the product image opens details; title, background, selector, and Add retain independent behavior.
- [ ] Validation disabled and below-maximum selected cards show quantity controls; maximum shows localized check/`Added xN` and activation removes all.
- [ ] Product details is a full-width, internally scrolling sheet with an 88dvh ceiling and gallery, price, compare-at, description, native variant, quantity, and localized Add/Update.
- [ ] Details Update modifies the originating slot exactly once; cancel makes no mutation.
- [ ] Dialog naming, initial focus, Tab containment, Escape, backdrop, nested-layer ownership, and exact focus restoration work.
- [ ] Existing selection, quantity, pricing, validation, inventory, subscription, capacity, cart, and restoration behavior is preserved outside the specified modal-card changes.
- [ ] Product List and Product Grid regressions pass.
- [ ] Served widget version is 14.0.0 before live Chrome verification is accepted.
