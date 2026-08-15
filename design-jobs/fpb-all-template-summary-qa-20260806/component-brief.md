---
schema_version: 1
id: fpb-all-template-summary-component-brief
title: FPB All-Template Summary Component Brief
type: design-brief
status: active
summary: Defines the shared and preset-specific summary sidebar and mobile tray redesign scope for all FPB templates.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - app/assets/widgets/full-page-css/templates
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
  - design-jobs/fpb-classic-summary-20260804/component-brief.md
tags:
  - fpb
  - summary
keywords:
  - summary sidebar
  - mobile tray
---

# Component Brief

Artifact job ID: fpb-all-template-summary-qa-20260806
Artifact revision: 3
Artifact status: approved

## Identity

- Job ID: `fpb-all-template-summary-qa-20260806`
- Revision: 1
- Product family: Full Page Bundle (FPB)
- Template or preset: Standard, Classic, Compact, Horizontal
- Component: Desktop summary sidebar and responsive mobile summary tray/footer
- Implementation mode: design-director

## Problem and goal

- User-provided problem: Design and implement every FPB summary sidebar and every configurable sidebar state across all four templates, using the earlier feature matrices.
- Primary user action: Review selected products, progress, pricing, bundle quantity, eligibility, and completion state before navigating or adding the bundle to cart.
- Design goal: Produce one coherent shared summary system with deliberate preset identities, complete configurable-state coverage, and responsive parity on desktop and mobile.
- Success signal: Every required matrix state is freshly proven for Standard, Classic, Compact, and Horizontal after the redesign, with no sibling-template regression.

## Scope

- In scope: Shared summary structure and behavior; preset-specific desktop/mobile presentation; empty, partial, full, and overflow selections; Product Slots off/on; custom slot icon when EB exposes it; collapsed/expanded mobile disclosure; Bundle Quantity Options; discount, add-on, gift, title/subtitle, totals, navigation, remove/clear, loading, error, and responsive states.
- Out of scope: Product-card redesign, unrelated Admin UI, PPB, deployment, Shopify theme changes, and changes to FPB configuration-loading priority.
- Merchant-configurable values: Bundle summary title/subtitle, Product Slots and slot icon, Bundle Quantity Options, pricing/progress/messages, add-ons/free gifts, locale/currency, and existing design tokens.
- Business logic constraints: Preserve selection identity, default-product rules, pricing, inventory, validation, navigation, cart, and add-on semantics. Presentation must remain content-driven and responsive. Do not add legacy fallbacks.
- Accessibility constraints: One operable disclosure control path, accurate expanded/disabled state, inert hidden tray content, keyboard-operable clear/remove/navigation controls, usable names, visible focus, and reduced-motion support.
- Repository-observed ownership: `side-panel-methods.js` owns shared desktop DOM and state branching; `mobile-summary-methods.js` owns shared mobile disclosure/content; `validation-addons-methods.js` owns required count and slots-vs-rows mode; shared CSS owns common layout; four preset CSS files own visual identity.

## Evidence and approval

- User facts: All four templates and all configurable states are required; earlier matrices are the coverage source; commit between verified slices; never restart the supplied dev server; hard reload before storefront verification; the user controls and authorizes fixture mutation.
- Screenshot facts: The approved Classic Calm Review Panel job remains the Classic design baseline. Earlier EB/WPB parity captures remain historical evidence only and are not fresh post-redesign proof.
- Repository facts: All four presets use the shared `footer_side` renderer. Standard and Horizontal default to row summaries; Classic and Compact use slot-oriented design contracts, while Product Slots can switch every preset to image slots.
- Assumptions: Existing shopper-facing semantics remain unchanged unless fresh EB evidence contradicts them.
- Open decisions: None. The user authorized design, implementation, fixture mutation, handoff, testing, and intermediate commits.
- Scope status: Locked for revision 1.
- Approved by and at: Aditya Awasthi through the active all-template implementation request on 2026-08-04.


Successor provenance: inherited unchanged from `fpb-all-template-summary-20260804` revision 2. The successor changes only the fresh browser-evidence coverage and any remediation directly found by that execution.
