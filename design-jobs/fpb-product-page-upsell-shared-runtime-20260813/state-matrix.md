---
schema_version: 1
id: fpb-upsell-state-matrix
title: FPB Upsell State Matrix
type: design-state-matrix
status: approved
summary: Defines all shared renderer and handoff states.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [storefront-design]
systems: [fpb-upsell]
source_paths: [app/storefront/app-embed.ts]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/component-anatomy.md]
tags: [fpb]
keywords: [states]
---

# State Matrix

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 1
Artifact status: approved

| ID | Trigger/precondition | Visible result | Interaction/accessibility | Desktop/mobile | Assertion |
|---|---|---|---|---|---|
| UP-01 | API loading | No shell | No focusable control | same | root absent |
| UP-02 | Empty/error | No shell | No orphan status | same | root absent |
| UP-03 | Button offer | CTA only | native activation, visible focus, 44px | same/reflow | one CTA per offer |
| UP-04 | Block offer | optional decorative image, title, optional description, CTA | logical order | horizontal when wide, stacked when narrow | DTO copy only |
| UP-05 | Multiple matches | all offers ordered by publicNumber | sequential focus order | content-driven list | stable order/dedupe |
| UP-06 | Custom anchor | first visible custom anchor owns list | no duplicate render | same | one mounted list |
| UP-07 | No custom anchor | insert once after primary product form | bounded retry only | same | no body fallback |
| UP-08 | CTA activated | clicked CTA disabled, aria-busy, non-text spinner | repeat activation blocked | same | state restores on pageshow |
| UP-09 | Variant changed | click captures current selected variant | exact variant in payload | same | latest source used |
| UP-10 | Valid handoff | exact selectable variant merges quantity 1 into first matching paid step | shared sidebar/mobile footer refresh | all presets | no duplicate selection |
| UP-11 | stale/wrong/invalid handoff | payload consumed, builder proceeds unchanged | no blocker or invented variant | all presets | storage cleared |
| UP-12 | delayed collection hydration | matching variant selected after step data arrives | active step unchanged | all presets | both summaries rerender |

Not applicable: modal, drag/reorder, quantity editing, pricing, and add-to-cart belong to the destination builder rather than this product-page offer.
