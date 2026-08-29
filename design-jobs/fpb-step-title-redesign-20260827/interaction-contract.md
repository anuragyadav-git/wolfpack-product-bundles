---
schema_version: 1
id: fpb-ppb-step-title-interaction-contract
title: FPB and PPB Step Title Interaction Contract
type: design-contract
status: complete
summary: Preserves existing step navigation and modal interactions while separating non-interactive Step Title headings from Step Name controls.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - interaction-design
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/component-anatomy.md
  - design-jobs/fpb-step-title-redesign-20260827/state-matrix.md
related_docs:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - keyboard
  - focus
  - heading
---

# Interaction Contract

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

| Control ID | Role | Accessible name | Pointer action | Keyboard action | State update | Focus behavior | Disabled or busy | Error recovery | Motion |
|---|---|---|---|---|---|---|---|---|---|
| FPB/PPB Step Title | Non-interactive contextual heading | Merchant-configured Step Title text | None | None | Re-renders with successful active-step change | Never receives focus | Not applicable | Existing navigation/validation recovery remains owner | None |
| FPB Step navigation | Existing native control | Step Name | Existing behavior | Existing native behavior | Changes active step and content heading | Existing focus behavior preserved | Existing gating preserved | Existing toast/validation behavior | Existing only |
| PPB Grid/Cascade navigation | Existing native button | Step Name, never Step Title | Existing behavior | Existing native behavior | Changes active step and content heading | Focus remains/restores through existing owner | Existing accessibility gating preserved | Existing validation toast | Existing only |
| PPB slot trigger | Existing native button | Existing product-slot name within Step Name group | Opens active-step picker | Existing native behavior | Picker body receives active Step Title | Existing modal initial-focus contract | Existing availability rules | Existing modal close/focus return | Existing only |

## State transitions

- A successful step change updates Step Name navigation state and the Step Title content heading in the same render pass.
- No `aria-live` region is added for the title. The user-initiated navigation state and newly rendered content provide sufficient context without duplicate announcements.
- Empty Step Title removes the heading node; Step Name remains exposed through navigation.

## Modal and overlay behavior

- PPB picker `aria-labelledby` continues to reference the dialog header containing Step Name.
- Step Title is a body heading above the product grid, not the dialog accessible name.
- Initial focus, focus trap, Escape, close controls, backdrop, scroll lock, and focus return remain unchanged.

## Responsive replacement and reduced motion

- Desktop and mobile use the same semantic heading node; layout reflow introduces no duplicate accessible content.
- Direction A adds no animation or transition, so reduced-motion behavior is unchanged.

## Business-rule invariants

- Navigation access, completion, validation, selection, pricing, summary, and cart behavior are untouched.
- Settings Design preview disables side effects as before and uses the same production interaction tree.
