---
schema_version: 1
id: ppb-selected-slot-redesign-direction-comparison
title: PPB Selected Slot Direction Comparison
type: design-job-artifact
status: draft
summary: Compares three behavior-equivalent visual directions for selected PPB slots.
last_audited: 2026-08-21
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - design-jobs/ppb-selected-slot-redesign-20260821/visual-audit.md
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - ppb
  - design-direction
keywords:
  - selected-slot
  - direction-approval
---

# Direction Comparison

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 1
Artifact status: approved

## Shared functional requirements

- Horizontal remains a responsive equal-height tile grid; Vertical remains a compact full-width row list.
- Both orientations use the same selection, replacement, removal, capacity, persistence, and cart runtime.
- The whole slot owns exact replacement; one separate semantic remove control owns removal.
- Title, optional variant, current price, and available compare-at price have bounded content regions.
- Empty and selected states reserve identical outer geometry within an orientation.
- Responsive values use existing tokens, intrinsic sizing, `clamp()`, `minmax()`, percentages, and flexible tracks. Fixed values are limited to primitives such as hairlines, icons, and 44px hit targets.
- No new storefront copy, configuration, runtime styling, `!important`, or competitor identifiers.

## Direction A — Quiet Product Tile (recommended)

- Visual thesis: A product-led neutral card with a stable media region and compact identity block. Horizontal uses a calm tile; Vertical translates the same anatomy into a row.
- Horizontal anatomy: media; two-line title/variant stack; price line; remove control in the media corner. The tile surface opens exact replacement.
- Vertical anatomy: media; title/variant stack; price in the text flow; trailing remove control. The row surface opens exact replacement.
- Selection signal: neutral hairline plus a restrained merchant-color inset/focus treatment; no added badge.
- Strengths: Closest to EB’s compact hierarchy, handles compare-at and variants, and requires the least visual machinery.
- Tradeoffs: Horizontal becomes slightly less image-dominant; very narrow owners may resolve to fewer columns.
- Responsive and accessibility implications: Intrinsic tracks preserve legibility; text clamps; remove remains a 44px target; state is not communicated by color alone.

## Direction B — Framed Slot Label

- Visual thesis: Keep the slot number or saved label as a small structural eyebrow above identity, making position more prominent.
- Horizontal anatomy: slot label; compact media; title/variant; price; remove.
- Vertical anatomy: slot label at the start of the text column; media; identity/price; remove.
- Selection signal: stronger framed border and subtle neutral fill.
- Strengths: Strongest replacement-position clarity for multi-slot rules and restored sessions.
- Tradeoffs: Adds vertical density, competes with product identity, and can feel more form-like.
- Responsive and accessibility implications: Saved labels must wrap or clamp; layout needs more reserved height; semantics remain unchanged.

## Direction C — Media-forward Minimal

- Visual thesis: Preserve the current image-first character while simplifying borders and placing identity in a compact footer.
- Horizontal anatomy: large media; title footer; compact price line; remove overlay.
- Vertical anatomy: larger thumbnail; single-line title/price; trailing remove.
- Selection signal: image treatment and quiet outline.
- Strengths: Lowest visual departure and strongest thumbnail scanning.
- Tradeoffs: Weakest long-title and variant resilience; compare-at pricing is most likely to crowd.
- Responsive and accessibility implications: More aggressive clamping is required; content-loss risk is higher even though action targets can remain compliant.

## Recommendation and decision

- Recommended direction and rationale: **Direction A — Quiet Product Tile.** It adopts EB’s useful hierarchy without copying measurements, resolves the measured Horizontal truncation, and reuses the proven Vertical compact-row foundation with the smallest responsive CSS surface.
- Assumptions and stress cases: long title plus variant; current and compare-at price; unavailable restored item; minimum-rule trailing empty slot; exact-rule full capacity; 320px owner; keyboard focus and nested remove action.
- Selected direction: **Direction A — Quiet Product Tile**
- Approved by and at: user, 2026-08-20T20:42:05Z
- Evidence IDs: `EB-DOC-HS-001`, `EB-DOC-VS-001`, `WPB-HS-MOBILE-001`, `WPB-HS-DESKTOP-001`, `WPB-VS-MOBILE-001`, `WPB-VS-DESKTOP-001`
- Rejections and reasons: Direction B rejected because slot-label emphasis adds avoidable density; Direction C rejected because it is less resilient to long titles, variants, and compare-at pricing.
