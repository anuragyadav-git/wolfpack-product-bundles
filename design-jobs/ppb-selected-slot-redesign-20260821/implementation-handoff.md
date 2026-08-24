---
schema_version: 1
id: ppb-selected-slot-redesign-implementation-handoff
title: PPB Vertical Slot Redesign Implementation Handoff
type: implementation-handoff
status: complete
summary: Provides the Revision 4 live-EB parity contract for PPB Vertical Slots empty and filled rows.
last_audited: 2026-08-24
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
  - app/assets/widgets/product-page-css/templates/modal-slots.css
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/direction-comparison.md
tags:
  - ppb
  - handoff
keywords:
  - vertical-slots
  - implementation
---

# Implementation Handoff

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: complete

## Source-of-truth priority

Revision 4 copies the visible live EB Vertical Slots row treatment measured at 1280x800 and 390x844. Source priority is: Wolfpack business semantics; repository architecture and AGENTS.md; approved Revision 4 contracts; live EB visual evidence; current Wolfpack tokens. Copy geometry and hierarchy, never competitor code, selectors, or identifiers.

## Goal

Make PPB Vertical Slots empty and filled rows visually match the live EB target while retaining Wolfpack exact replacement, removal, capacity, persistence, accessibility, and cart behavior.

## Exact visual contract

- Filled row: full owner width; 64px target height; 5px padding; 50px square media; 5px internal gap; one bold product-title line in a flexible track; compact trailing remove affordance; white/surface background; 2px solid foreground border; 10px radius; no shadow.
- Empty row: full owner width; 60px target height; saved label at start; plus affordance at end; white/surface background; 2px dashed foreground border; 10px radius.
- Lists: one column; 14px row gap at the 390px target, 16px at the 1280px target, and 26px between step groups.
- Content: no price, compare-at price, variant, quantity, badge, or new merchant-facing copy inside the row.
- Accessibility: fixed target heights may grow for zoom/localization; full accessible product name remains when the visual title truncates; compact icons retain valid semantic owners and visible focus.

## Current architecture map

- Rendering and exact action owner: `app/assets/widgets/product-page/methods/inpage-render-methods.ts`.
- Empty-slot/orientation owner: `app/assets/widgets/product-page/templates/modal-slot-template.ts`.
- Canonical template presentation owner: `app/assets/widgets/product-page-css/templates/modal-slots.css`.
- Shared primitive CSS is inspected only if the canonical template owner cannot express the result without duplication.
- Widget source changes require `npm run build:widgets`; CSS source changes require `npm run minify:assets css`.

## Required states

- Filled-row activation replaces the exact activated instance.
- Remove affects only that instance and never opens the picker.
- Empty activation opens the picker without a replacement target.
- Minimum rules retain reachable empty capacity; exact rules expose no overflow slot.
- Picker dismissal and removal follow `interaction-contract.md` focus recovery.
- Hard-reload restoration, unavailable recovery, other-step selection, pricing, discounts, and cart payloads remain unchanged.

## Allowed production areas

- Canonical Vertical Slots presentation in `modal-slots.css`.
- Existing selected-slot renderer only when semantic replacement/remove separation or accessible naming needs a minimal markup change.
- Focused behavior tests and a mandatory TDD test spec when JavaScript behavior changes.
- Required widget version bump and generated assets when storefront source changes.

## Prohibited changes

- Horizontal Slots, Product Grid, Product List, picker cards, FPB, selection rules, quantities, replacement keys, persistence, pricing, discounts, cart payloads, public APIs, Prisma, Liquid config, or merchant settings.
- Runtime style injection, inline presentation styles, `!important`, fallback chains, compatibility shims, hardcoded merchant colors, competitor identifiers, or new storefront copy.
- Unit tests that inspect CSS, class names, selector order, or layout. Visual parity is Chrome-only.

## Responsive transformations

Use `responsive-contract.md` as the implementation contract: one full-width Vertical column, 64px filled and 60px empty target rows, stable 50px media, measured mobile/desktop rhythm, accessible vertical growth, and zero horizontal overflow.

## Accessibility contract

Use `interaction-contract.md` and `accessibility-checklist.md`: distinct semantic action owners, complete accessible names, native keyboard activation, visible focus, deterministic focus return, non-color state, reduced motion, and high-zoom reflow are mandatory.

## Chrome DevTools QA plan

1. Add/update `test-spec/ppb-selected-slot-redesign.spec.md` before behavior code.
2. Run focused selected-slot behavior tests; add tests only for Wolfpack behavior, not CSS.
3. Run ESLint on modified source/test files and raw JS syntax checks when applicable.
4. Run `npm run build:widgets` and `npm run minify:assets css` for touched storefront sources.
5. Run `npm run graphify:rebuild` and `git diff --check`.
6. After the user-controlled SIT deploy/sync, hard reload with cache bypass and prove the served widget version/asset URL.
7. Use direct Chrome DevTools MCP only at 320x700, 390x844, 767x900, 768x900, and 1280x800.
8. Compare the 390 and 1280 Vertical states to `EB-VS-MOBILE-R4` and `EB-VS-DESKTOP-R4`; test empty, filled, long title, remove/replace, capacity, hard reload, keyboard focus, overflow, console, and network.
9. Smoke Horizontal Slots and the other PPB templates for non-regression.

## Stopping criteria

Stop if parity requires changing business semantics, adding row content absent from EB, touching an out-of-scope template, using a non-canonical style owner, deploying without user action, or proceeding without direct Chrome access.

## Rollback guidance

The shared renderer is high blast radius; prefer the template CSS owner and scope any markup change to the existing Vertical presentation signal. Roll back the source CSS, minimal renderer change if any, version bump, tests, and generated assets as one coherent batch while preserving unrelated work.
