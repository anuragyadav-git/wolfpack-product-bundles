---
schema_version: 1
id: fpb-ppb-step-title-state-matrix
title: FPB and PPB Step Title State Matrix
type: design-contract
status: complete
summary: Defines populated, empty, long-content, step-change, modal, preview, and zoom states for the active Step Title.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/component-anatomy.md
  - app/assets/widgets/full-page/methods/responsive-layout-methods.ts
  - app/assets/widgets/product-page/methods/layout-shell-methods.ts
  - app/assets/widgets/product-page/methods/dom-methods.ts
  - app/routes/app/app.settings/storefront-preview-fixtures.ts
related_docs:
  - .agents/skills/storefront-design-director/references/state-coverage-catalog.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - states
  - assertions
  - preview-parity
---

# State Matrix

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

| State ID | Trigger | Data precondition | Visible result | Available interaction | Accessibility | Desktop | Mobile | Screenshot | Automated assertion | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| S-01 Populated | Initial active-step render | Trimmed `pageTitle` is non-empty | One content-aligned Direction A heading appears for the active selection body | None on heading; surrounding controls unchanged | Contextual heading semantics; no focus target | Left edge matches catalog/grid/slot body | Left edge matches mobile content padding | Required for FPB and PPB | Pure helper returns distinct navigation label and content title | Approved by D-002/D-003 |
| S-02 Empty | Initial render or step change | `pageTitle` is missing, blank, or whitespace | No content-title element and no residual title spacing/surface | Surrounding controls remain available | No empty heading enters the outline | Content closes naturally | Content closes naturally | Required for one family | Pure helper returns empty content title | Approved by D-003 |
| S-03 Long content | Merchant title exceeds one line | Long sentence or unbroken token | Natural-height wrapping; no clipping, ellipsis, overlap, or horizontal scroll | None on heading | Text remains readable at zoom | Readable measure within content owner | Wraps within narrow content inset | Required desktop/mobile | Helper preserves trimmed content; Chrome geometry verifies overflow | Approved by D-003 |
| S-04 Active step change | Existing timeline/flow navigation succeeds | Next step has a different Step Name and Step Title | Navigation label and content heading update independently to the active step | Existing navigation only | Existing `aria-current` remains on navigation; heading content updates | No layout ownership shift | No layout ownership shift | Required for PPB and FPB | Navigation/content resolver behavior tests | Approved by D-002 |
| S-05 PPB slot overview | Slot template renders multiple steps | Each step has distinct name and title | Slot groups show Step Name; no repeated Step Title on the overview | Existing slot triggers | Group identity is not confused with dialog body heading | Existing slot geometry | Existing slot geometry | Required | Resolver test confirms navigation/group identity ignores pageTitle | Approved by D-002 |
| S-06 PPB picker open | User opens a slot for a step | Active step has a non-empty Step Title | Dialog header/navigation shows Step Name; body shows Step Title once above products | Existing modal controls and product actions | Dialog name and body heading are distinct; focus flow unchanged | Grid-aligned body inset | Mobile grid-aligned body inset | Required desktop/mobile | Controller uses shared content-title resolver; Chrome confirms one body heading | Approved by D-002/D-003 |
| S-07 Settings preview | Preview initializes or template/viewport changes | Deterministic fixture has distinct Step Name and Step Title | Same production nodes and computed Step Title treatment as storefront; neutral store chrome ignored | Existing preview selectors only | Same production semantics | 1280 x 1136 logical render | 390 x 844 logical render | Required for all eight templates | Fixture test verifies distinct values; browser parity checks | Approved by D-004 |
| S-08 High zoom/narrow width | Browser zoom or 320 px content width | Populated or long title | Heading remains visible, wraps, and does not cover controls | Existing controls remain operable | Reflow without two-dimensional scrolling caused by title | Content-driven | Content-driven | Required at narrow mobile | Chrome geometry check | Approved by D-003 |

## Not applicable

| Catalog state | Reason |
|---|---|
| Hover, focus-visible, pressed, disabled | Step Title is non-interactive and creates no focus target. |
| Loading and error | Loading/error ownership belongs to the existing product region; title presentation does not create a separate state. |
| Missing image and slow image | Step Title has no media. |
| Reduced motion | Direction A introduces no motion. |
| Product-card, summary, tier, discount, and selection states | Their behavior and styling are outside this component boundary and remain invariant. |

## Coverage

- Required: S-01 through S-08.
- Covered: S-01 through S-08 in the contract; implementation and Chrome evidence remain pending.
- Missing: None at design-contract level.
- Status: Complete for handoff progression.
