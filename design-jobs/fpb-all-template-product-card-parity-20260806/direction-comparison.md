---
schema_version: 1
id: fpb-all-template-product-card-direction-comparison
title: FPB All-Template Product Card Direction Comparison
type: design-decision
status: complete
summary: Compares three behavior-equivalent directions for one coherent summary system across all four FPB presets.
last_audited: 2026-08-06
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - full-page-bundle-widget
source_paths:
  - design-jobs/fpb-all-template-product-card-parity-20260806/visual-audit.md
  - design-jobs/fpb-all-template-product-card-parity-20260806/screenshot-inventory.yaml
related_docs:
  - design-jobs/fpb-classic-summary-20260804/direction-comparison.md
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - direction
  - summary-sidebar
keywords:
  - Standard
  - Classic
  - Compact
  - Horizontal
---

# Direction Comparison

Artifact job ID: fpb-all-template-product-card-parity-20260806
Artifact revision: 1
Artifact status: draft

## Shared functional requirements

- Preserve selected-product identity, variant, quantity, inventory, rules, discount, pricing, box selection, add-on, gift, clear, remove, navigation, and cart semantics.
- Cover every sidebar-affecting state in the canonical FPB matrix for Standard, Classic, Compact, and Horizontal.
- Preserve the approved Classic Calm Review Panel and its semantic controls.
- Keep preset-owned desktop catalog layouts and responsive, content-driven column sizing.
- Use one connected, semantic mobile disclosure with a collapsed and expanded state.
- Use configured merchant copy, colors, typography, radius, locale, and currency; never copy target-store literals.
- Keep selected lists bounded and reachable under long content; avoid fixed screenshot heights and viewport-specific overfitting.
- Keep presentation in CSS and shared business/state behavior in existing render methods.

## Direction A - Unified Calm Review System

- Artifact and revision: Direction A, revision 1.
- Visual thesis: Extend the approved Classic Calm Review Panel into a shared summary anatomy while allowing each desktop preset to retain its own column width, surface emphasis, and catalog relationship.
- Desktop expression: Standard keeps its narrow bordered card; Classic keeps its airy borderless review panel; Compact gains a coherent wide summary surface; Horizontal keeps its intermediate bordered card. All use the same ordered regions: configured header, configuration/progress, selected rows or slots, messages, total/savings, and action cluster.
- Mobile expression: All four presets transform to the same inset summary tray with one readable disclosure label, count, collapsed price/qualification/CTA, and an expanded bounded review sheet.
- Strengths: Reuses the shared state path; preserves preset identity; directly addresses the measured gaps; smallest behavior risk; strongest consistency under the full matrix.
- Tradeoffs: Requires careful CSS ownership so shared anatomy does not erase legitimate preset spacing. Compact needs a deliberate surface treatment instead of inheriting the current edge-to-edge emptiness.
- Responsive and accessibility implications: One actual disclosure button with persistent label/count, accurate `aria-expanded`, inert hidden content, bounded row scrolling, safe-area padding, and full keyboard/touch reachability.

## Direction B - Preset-Pure Target Mirroring

- Artifact and revision: Direction B, revision 1.
- Visual thesis: Treat each preset sidebar and mobile tray as its own design, matching the corresponding target screenshot as closely as merchant tokens allow.
- Desktop expression: Four independently tuned sidebars, including preset-specific row density, header spacing, dividers, and action composition.
- Mobile expression: Each mobile tray inherits the exact desktop preset's visual language, even where target mobile anatomy appears shared.
- Strengths: Maximum screenshot-specific control; makes subtle preset distinctions easy to tune; local changes can be visually isolated.
- Tradeoffs: Encourages duplicate markup or branching; multiplies matrix permutations; risks behavior drift; conflicts with repository-observed shared render ownership; makes accessibility fixes uneven.
- Responsive and accessibility implications: Four disclosure variants require four complete keyboard, focus, hidden-content, safe-area, and overflow audits.

## Direction C - Guided Qualification System

- Artifact and revision: Direction C, revision 1.
- Visual thesis: Make box target, rule eligibility, discount progress, gifts, and validation the primary organizer; selected products become supporting evidence beneath qualification.
- Desktop expression: Status/progress first, selected rows second, total and action last in every preset.
- Mobile expression: Collapsed tray prioritizes unmet requirement or achieved discount; expanded state opens directly into status before selected items.
- Strengths: Strongest for complex Bundle Quantity Options, tiered discounts, add-on, and gift configurations; makes blocked actions easier to explain.
- Tradeoffs: Overemphasizes configuration for simple/no-rule bundles; introduces hierarchy not demonstrated by baseline screenshots; can make the summary feel like a status dashboard instead of a review surface.
- Responsive and accessibility implications: More live status and announcement ownership; long localized validation copy competes with selected rows and CTA at narrow widths.

## Recommendation and decision

- Recommended direction and rationale: Direction A - Unified Calm Review System. It extends the explicitly approved Classic direction, matches evidence that desktop widths vary but summary anatomy is shared, and minimizes the risk of inconsistent behavior across all presets.
- Assumptions and stress cases: Long merchant title/subtitle, 320px viewport, safe areas, 10+ selected rows, Product Slots, switched box target, progress and messages independently toggled, compare-at and savings, add-on/gift rows, unavailable items, missing image, delayed hydration, long locale, large currency values, and disabled/recoverable actions.
- Selected direction: Direction A - Unified Calm Review System for Standard, Classic, Compact, Horizontal, and the shared mobile system.
- Approved by and at: Pending for this successor job.
- Evidence IDs: VA-01 through VA-15; GAP-01 through GAP-08; comparison cohorts in `screenshot-inventory.yaml`.
- Rejections and reasons: Direction B was not selected because it duplicates presentation and accessibility ownership across presets. Direction C was not selected because it overemphasizes qualification for simple bundles.
