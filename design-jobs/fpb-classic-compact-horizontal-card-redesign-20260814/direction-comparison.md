---
schema_version: 1
id: fpb-three-preset-card-directions
title: FPB Four-Template Alignment Direction
type: design-job-artifact
status: approved
summary: Defines the contract-led placement remediation direction for all four FPB templates.
last_audited: 2026-09-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page-css/templates/classic
  - app/assets/widgets/full-page-css/templates/standard/overrides.css
  - app/assets/widgets/full-page-css/templates/compact/overrides.css
  - app/assets/widgets/full-page-css/templates/horizontal/overrides.css
related_docs:
  - visual-audit.md
  - screenshot-inventory.yaml
tags:
  - fpb
  - design-direction
keywords:
  - Classic
  - Compact
  - Horizontal
---

# Direction Comparison

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 4
Artifact status: approved

## Shared functional requirements

Preserve C01-C15 behavior; equal row heights; stable default, focus, hover, selected, quantity, sale, variant, unavailable, and disabled states; 44px Wolfpack control targets; merchant-owned colors/copy; existing DOM; active-preset stylesheet composition; and existing summary/modal/timeline behavior unless a measured alignment defect is reproduced.

The user selected the established Wolfpack contract as the baseline, so no alternate visual system is proposed.

## Direction ST-R4 — Stable Standard action track

- Preserve Standard's current card anatomy, media, typography, and compact add control.
- In icon CTA mode, reserve the quantity selector's responsive width for the action column in both default and selected states.
- Align the smaller default Add button to the action track's inline end; replace it with quantity controls without changing the price column or surrounding rows.
- Keep text CTA mode stacked and full-width.

## Direction CL-A — Framed Classic

- Visual thesis: keep Classic roomy and image-led, but remove the current empty body space and reconnect title, price, and action inside one calm card frame.
- Card treatment: white/merchant surface, restrained neutral outline, existing radius and padding tokens, contained square-biased media, left-readable title, compact price/action baseline, and non-expanding selected outline.
- Grid: retain the four-column desktop cap and two-column phone grid; allow intrinsic transitional columns at tablet widths rather than hard-code viewport pixels.
- Strengths: largest density improvement; closer hierarchy to the live reference; preserves Classic’s generous product emphasis.
- Tradeoffs: the 44px Wolfpack action keeps the card slightly taller than EB, intentionally favoring accessibility.
- Responsive and accessibility implications: reserve title and action tracks so long titles and quantity swaps do not grow a row; focus uses a visible outline with offset owned inside the existing card envelope.

## Direction CO-A — Structured Compact

- Visual thesis: keep Compact dense and quick-scanning while making each product read as a deliberate card instead of loose media and floating controls.
- Card treatment: subtle frame/surface, restrained radius, slightly stronger media presence on desktop, left-readable two-line title, price and compact action on one stable baseline; on phones retain two columns and replace the oversized floating-circle feel with the same contained control language used by the card.
- Grid: retain three desktop columns and two phone columns with token-owned gaps.
- Strengths: minimal geometry change; improves grouping and consistency; retains Compact’s speed and density.
- Tradeoffs: less dramatic than Classic by design.
- Responsive and accessibility implications: control remains at the existing hit-target size; no centered text or shadow is needed to communicate interactivity.

## Direction HO-A — Bounded Horizontal

- Visual thesis: preserve the 30/70 row anatomy, but make each row a clearly bounded product card with tighter vertical rhythm.
- Card treatment: neutral one-pixel frame, existing radius/padding tokens, contained media, title/variant at the top, price/action at the bottom, and non-expanding selected/focus outline.
- Grid: two columns at desktop; one column below the shared 800px summary boundary, matching the live reference’s mobile/tablet row-card behavior.
- Strengths: restores grouping, improves scanning, and removes the present disconnected divider treatment while keeping the established orientation.
- Tradeoffs: one-column tablet uses more vertical space than the current two-column 768px Wolfpack layout, but gives controls and long titles materially safer width.
- Responsive and accessibility implications: retain 44px actions, ensure title/price tracks shrink safely, and prevent the mobile summary from covering the final card action.

## Recommendation and decision

- Recommended direction: retain CL-A, CO-A, and HO-A, add ST-R4, and verify Standard → Classic → Compact → Horizontal. Implement only the measured price/action stability slice now; treat other widget-owned surfaces as audit-only until a defect is reproduced.
- Rationale: explicit two-track card footers remove the measured state shift without changing product behavior, DOM, copy, or the visual identity of any preset.
- Assumptions and stress cases: C01-C15 remains the behavioral ledger; current DOM supports every treatment; captured values guide relationships rather than becoming fixed layout constants.
- Selected direction: ST-R4 Stable Standard action track, CL-A Framed Classic, CO-A Structured Compact, and HO-A Bounded Horizontal.
- Approved by and at: Aditya Awasthi at 2026-09-03 through the explicit instruction to begin implementation after selecting the Wolfpack-contract baseline and all-template audit scope.
- Evidence IDs: `VA-ST-*`, `VA-CL-*`, `VA-CO-*`, `VA-HO-*`, `VA-ALL-*`, and all approved `REF-*` items.
- Rejections and reasons: no alternative direction generated because the user explicitly requested one controlled Wolfpack direction per preset.
