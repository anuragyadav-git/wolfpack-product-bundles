---
schema_version: 1
id: storefront-design-director-visual-audit-template
title: Visual Audit Template
type: design-job-template
status: active
summary: Records confidence-labeled current, target, and gap observations for a storefront component.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/visual-audit.md
related_docs:
  - .agents/skills/storefront-design-director/references/visual-analysis-rubric.md
tags:
  - template
keywords:
  - visual-audit
  - confidence
---

# Visual Audit

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 8
Artifact status: complete

## Conditions

- Job ID and revision: ppb-bundle-picker-modal-redesign-20260821, revision 2
- Reference IDs: WPB-PICKER-DESKTOP-001, WPB-PICKER-MOBILE-001, EB-PICKER-DOC-001 through EB-PICKER-DOC-005
- Viewports and states: Current loaded picker at 1280x800 and 390x844; accepted EB open/selected/validation evidence at desktop and mobile.
- Comparison limits: Committed EB evidence is historical and approved for structural and behavioral reference. The changed inline-selector, details-sheet, and quantity-state rules are user-provided live findings in the revision-2 plan. Exact acceptance geometry requires a fresh direct-Chrome pass.

## Observations

| ID | Region | Dimension | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| VA-01 | Sheet | Height | 355.91px at 1280x800; 358.67px at 390x844 | 85dvh with viewport-safe maximum | direct current plus accepted target | high | yes |
| VA-02 | Catalog | Scroll ownership | Body scrolls inside a shallow sheet | Catalog is the sole scroll owner between fixed header/footer | direct current plus accepted target | high | yes |
| VA-03 | Footer | Occlusion | Floating 270px dock overlaps lower mobile card actions | Reserved footer region; centered dock never covers catalog content | direct current | high | yes |
| VA-04 | Grid | Responsive columns | Two 165px mobile tracks; desktop intrinsic tracks | Preserve two mobile/tablet tracks and intrinsic four/five desktop tracks | direct and documented | high | yes |
| VA-05 | Header | Step hierarchy | Single-step title/progress works; multi-step hierarchy remains visually dense | Desktop rail; mobile current-step title only; categories/progress remain readable | repository evidence | medium | yes |
| VA-06 | Accessibility | Focus | Visible close receives focus; focus restores on close | Add complete Tab containment and labelled title without changing dismissal semantics | direct current and source | high | yes |
| VA-07 | Product card | Action hierarchy | Variant, details, and add affordances can compete or collapse into a card-wide action | Native selector changes context only; image opens details; Add mutates selection | user-provided live finding plus accepted grouped-variant evidence | high | yes |
| VA-08 | Selected card | Quantity state | Revision 1 always hid modal quantity controls | Disabled validation and below-maximum states show controls; maximum replaces controls with `Added xN` | user-provided live finding plus maximum-one evidence | high | yes |
| VA-09 | Details | Layer and density | Shared details overlay is centered desktop / bottom mobile and not explicitly PPB-stacked | Full-width PPB sheet above picker, constrained inner column, internal scroll, 88dvh ceiling | user-provided contract | high | yes |
| VA-10 | Magnifier | Discoverability | Details affordance is inconsistent across pointer, keyboard, and touch | Reuse FPB magnifier; reveal on hover/focus, persist subtly on touch | user-provided contract and repository reuse requirement | high | yes |
| VA-11 | Vertical filled row | Geometry and hierarchy | Revision 6 renders a 100px grid row with 72px media, filled-row price, and overlaid 44px badge | Live EB renders a full-width 64px flex row, 50px media, 5px padding/gap, 2px black border, 10px radius, bold 16px identity, no price, and inline 20px trailing circular-cross visual | fresh direct Chrome at 1280x800 and 390x844 | high | yes |
| VA-12 | Vertical filled row | Intrinsic sizing and overflow | Revision 7 fixes and caps the row at 64px, clips card/title overflow, stretches the identity, and retains a pointer cursor | Live EB has `height:auto`, `min-height:60px`, no maximum, visible card/title overflow, intrinsic flex sizing, normal wrapping, and an inert cursor; 50px media plus padding/border produces the normal 64px row | fresh direct computed-style comparison at 390x844 | high | yes |

## Layout, geometry, typography, and surfaces

The shallow current sheet is the root visual defect. It leaves less than 240px for the mobile catalog and about 196px on desktop, making the footer appear detached and causing products to continue behind it. The accepted target hierarchy uses a tall bottom sheet with a stationary header, a catalog-only scroller, and a stationary action region. Product cards already carry merchant-controlled colors and must not be restyled into competitor branding.

## Content, interaction, responsive, and accessibility

All existing selection, pricing, progress, inventory, persistence, slot, and cart semantics remain invariant. Variant selection updates card context without adding. Product details becomes the only nested modal surface for Horizontal/Vertical cards; the PPB custom mobile variant drawer is removed from these templates because native selectors remain inline at every width. The redesigned sheets retain stronger Wolfpack semantics, Escape/backdrop/swipe support, exact focus restoration, and topmost-only focus containment.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| GAP-01 | responsive | Tall viewport-relative sheet at every required width | Modal open/close lifecycle | bottom-sheet-modal.css | approved |
| GAP-02 | ownership | Header, catalog, and footer become separate flex regions | Render/update methods keep existing targets | DOM modal shell plus raw modal CSS | approved |
| GAP-03 | accessibility | Labelled title and focus containment | Layer-manager topmost dismissal and focus return | modal state methods | approved |
| GAP-04 | visual | Stable cards and non-overlapping dock | Product card data and actions | modal product grid and footer CSS | approved |
| GAP-05 | behavioral | Central three-state card-presentation resolution | Quantity validation remains the business-rule source | pure modal-card presentation helper | approved |
| GAP-06 | behavioral | Native selector updates variant image, price, and availability without Add | Variant identity and inventory rules | shared variant binding plus PPB card adapter | approved |
| GAP-07 | accessibility | Only image opens details; affordance remains discoverable for pointer, keyboard, and touch | Add and title remain independent | PPB card semantics plus reused magnifier markup | approved |
| GAP-08 | responsive | Product details is a stacked full-width sheet with 88dvh ceiling and safe-area handling | Editable Add/Update and originating-slot identity | PPB details renderer/state plus raw PPB CSS | approved |
| GAP-09 | visual | Replace only the Vertical filled-row presentation with measured live EB geometry | Selection, replacement, removal, focus, Horizontal, Product List, and Product Grid behavior | modal-slots.css | approved |
| GAP-10 | visual | Remove revision-7 WPB caps, clipping, flex fill, and pointer treatment from the Vertical filled row | Horizontal, Product List, and Product Grid presentation | modal-slots.css | approved |
