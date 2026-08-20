---
schema_version: 1
id: ppb-selected-slot-redesign-acceptance
title: PPB Selected Slot Redesign Acceptance Criteria
type: quality-contract
status: complete
summary: Defines independently testable completion criteria for the PPB selected-slot redesign.
last_audited: 2026-08-21
owners:
  - wolfpack
domains:
  - quality-assurance
systems:
  - product-page-bundle
source_paths:
  - design-jobs/ppb-selected-slot-redesign-20260821/state-matrix.md
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/browser-test-plan.yaml
tags:
  - ppb
  - acceptance
keywords:
  - selected-slot
  - qa
---

# Acceptance Criteria

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 2
Artifact status: approved

- [ ] Horizontal selected slots render readable product-led tiles; Vertical selected slots render compact full-width rows.
- [ ] Empty and filled slots have equal outer geometry within each orientation and cause no same-row layout shift.
- [ ] Title, meaningful variant, payable price, and available compare-at price render from existing data without a new PPB setting.
- [ ] Compare-at is absent when unavailable or not greater than payable price.
- [ ] Exact replacement changes only the activated instance.
- [ ] Remove changes only the activated instance and does not open the picker.
- [ ] Minimum rules retain one reachable empty slot; exact rules expose no overflow slot.
- [ ] Hard-reload restoration, unavailable recovery, and other-step selections remain unchanged.
- [ ] No inline quantity selector is added to selected slots.
- [ ] Long title, variant, currency, missing image, loading, and high zoom do not hide price/actions or cause horizontal overflow.
- [ ] Every action is keyboard-operable, has a distinct accessible name, visible focus, valid semantics, and a minimum 44px target.
- [ ] Picker dismissal and removal restore focus according to interaction-contract.md.
- [ ] Selection, availability, focus, and included status are not communicated by color alone.
- [ ] No fixed 200px card height, viewport-specific column patch, runtime style injection, important declaration, or copied competitor measurement is introduced.
- [ ] Product Grid, Product List, picker cards, PPB quantity validation, and FPB smoke checks show no regression.
- [ ] document.scrollWidth equals document.clientWidth at 320x700, 390x844, 767x900, 768x900, and 1280x800.
- [ ] First and last slots remain reachable and no card content overlaps the surrounding CTA.
- [ ] Behavior-focused tests, ESLint, raw syntax checks, widget build, CSS minification, Graphify rebuild, and git diff --check pass.
- [ ] Live served version and asset URL match the intended build after the user-controlled deployment/sync step.
- [ ] Direct Chrome DevTools MCP preflight, semantic checks, viewport/element screenshots, console, network, accessibility, Lighthouse, performance, visual comparison, and non-regression gates pass.
- [ ] Agent-store fixture is restored to Product Grid after the fixture group.
