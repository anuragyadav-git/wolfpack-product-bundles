---
schema_version: 1
id: fpb-classic-summary-direction-comparison
title: FPB Classic Summary Direction Comparison
type: design-decision
status: approved
summary: Compares three behavior-equivalent directions for the FPB Classic desktop summary and mobile tray.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-classic-summary-20260804/visual-audit.md
  - design-jobs/fpb-classic-summary-20260804/screenshot-inventory.yaml
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/locked-decisions.yaml
tags:
  - fpb
  - classic
  - direction
keywords:
  - direction
  - approval
---

# Direction Comparison

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: approved

## Shared functional requirements

- Preserve selected-product, quantity, variant, inventory, rule, discount, pricing, clear, remove, and cart semantics.
- Keep a sticky desktop summary and a collapsed/expanded mobile replacement.
- Keep semantic buttons, explicit accessible names, focus-visible treatment, and non-color selection state.
- Support empty, loading, partial, complete, disabled, discounted, variant, quantity, long-title, and long-list states.
- Use content-driven sizing, a bounded internal list, safe-area padding, and no horizontal overflow.
- Change Classic presentation only unless the later ownership map proves a shared semantic correction is required.

## Direction A

- Artifact and revision: Calm Review Panel, revision 1.
- Visual thesis: Give review and completion equal status with product selection. Use a quiet sticky surface, a compact summary-purpose header, low-chrome selected rows, and a clearly separated total/action footer.
- Strengths: Closest to the target's hierarchy without copying fixed geometry; resolves current total/CTA collision; scales naturally to long lists; retains current shell and tokens; limits sibling-template risk.
- Tradeoffs: Uses slightly more vertical space than the current summary. The selected list must own bounded scrolling once the viewport is constrained.
- Responsive and accessibility implications: Mobile becomes a two-level disclosure: a compact collapsed bar with item/progress and total, then an expanded review sheet with named close/collapse, internally scrolling rows, and a persistent CTA. Semantic controls remain unchanged.

## Direction B

- Artifact and revision: Compact Utility Panel, revision 1.
- Visual thesis: Keep the current density and anatomy but normalize spacing, truncation, and the footer grid.
- Strengths: Smallest implementation blast radius; maximum visible product-grid area; easiest sibling isolation.
- Tradeoffs: Does not fully address the target's calmer review hierarchy; long merchant titles still compete with recovery; long selected lists feel transactional and cramped.
- Responsive and accessibility implications: Mobile remains a short tray with a denser expanded state. It is efficient but gives less room for large text, long localized copy, and 44px touch targets.

## Additional directions

### Direction C

- Artifact and revision: Guided Completion Panel, revision 1.
- Visual thesis: Organize the summary around progress and requirements first, selected products second, and price/completion last.
- Strengths: Best when rules, quantity minimums, and discount tiers are the dominant merchant experience; disabled CTA reasons become highly visible.
- Tradeoffs: Adds hierarchy not demonstrated by the no-rules fixture; can overemphasize progress for simple bundles; risks expanding the component boundary into rule messaging.
- Responsive and accessibility implications: Mobile disclosure prioritizes status and unmet requirements. Live announcements and color-independent progress semantics become more complex.

## Recommendation and decision

- Recommended direction and rationale: Direction A, Calm Review Panel. It captures the target's strongest lesson—review deserves a stable, calm surface—while preserving Wolfpack's better semantic controls and existing desktop/mobile behavior. It is materially stronger than a spacing-only cleanup and more proportionate than making progress the primary organizer for a no-rules fixture.
- Assumptions and stress cases: Merchant title may be long; selected product titles may wrap; variants and quantity may add metadata; discounts may add compare-at and savings; list length may exceed the viewport; CTA may be disabled; localization may expand labels; mobile must honor safe areas and 320px width.
- Selected direction: Direction A — Calm Review Panel.
- Approved by and at: Aditya Awasthi, 2026-08-04T09:33:44Z.
- Evidence IDs: VA-001 through VA-012 and GAP-001 through GAP-006.
- Rejections and reasons: Direction B rejected because a density-only cleanup would not sufficiently improve review hierarchy. Direction C rejected because progress-first hierarchy is disproportionate for simple and no-rules bundles.
