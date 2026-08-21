---
schema_version: 1
id: storefront-design-director-direction-comparison-template
title: Direction Comparison Template
type: design-job-template
status: active
summary: Compares behavior-equivalent design directions and records an explicit selection.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/direction-comparison.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/locked-decisions.yaml
tags:
  - template
keywords:
  - direction
  - approval
---

# Direction Comparison

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 2
Artifact status: approved

## Shared functional requirements

Preserve PPB selection, validation, pricing, inventory, subscriptions, free gifts, session restoration, localized copy, merchant design variables, and Horizontal/Vertical slot parity. Product List and Product Grid remain regression surfaces only.

## Direction A

- Artifact and revision: Controlled Direction A refinement, revision 2
- Visual thesis: Compact EB interaction hierarchy with Wolfpack merchant branding and explicit, accessible action separation.
- Strengths: Clear header/catalog/footer ownership; native in-card variant selection; image-only details affordance; quantity-validation state clarity; one shared responsive implementation; editable stacked quick shop.
- Tradeoffs: Requires replacing the revision-1 modal-card state contract and PPB mobile variant drawer, plus a major widget version bump.
- Responsive and accessibility implications: 85dvh picker, 88dvh details ceiling, two-column mobile/tablet grid, intrinsic desktop grid, labelled native selectors, semantic stacked sheets, topmost-only focus containment, and exact trigger restoration.

## Direction B

- Artifact and revision: Revision-1 Direction A, preserved as superseded
- Visual thesis: Tall shared picker with separate nested mobile variant drawer and always-maximum-style selected cards.
- Strengths: Established shell and layer ownership.
- Tradeoffs: Conflicts with the newly verified native-selector and conditional quantity-state behavior; product-details ownership is too generic.
- Responsive and accessibility implications: Extra mobile overlay and reduced quantity editability.

## Additional directions

Record each additional direction with the same fields.

## Recommendation and decision

- Recommended direction and rationale: Controlled Direction A refinement because the user supplied a single approved revision with changed actions and component boundaries; additional concepts would re-open settled behavior.
- Assumptions and stress cases: Long categories, two-line titles, compare-at prices, grouped variants, inventory states, nested overlays, loading/error, and 360px width.
- Selected direction: Controlled Direction A refinement — compact cards, inline native selectors, conditional quantity controls, and stacked details.
- Approved by and at: Aditya, 2026-08-21 through the supplied revision-2 implementation plan.
- Evidence IDs: WPB-PICKER-DESKTOP-001, WPB-PICKER-MOBILE-001, EB-PICKER-DOC-001 through EB-PICKER-DOC-005, and user revision-2 plan.
- Rejections and reasons: Revision-1 nested mobile variant drawer and unconditional `Added xN` card treatment are superseded because they conflict with the revised live behavior.
