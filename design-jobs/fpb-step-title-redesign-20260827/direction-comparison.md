---
schema_version: 1
id: fpb-ppb-step-title-direction-comparison
title: FPB and PPB Step Title Direction Comparison
type: design-direction
status: complete
summary: Compares three behavior-equivalent styling directions for a content-aligned active Step Title across FPB and PPB.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/visual-audit.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/locked-decisions.yaml
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - direction
  - approval
  - storefront-heading
---

# Direction Comparison

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: approved

## Shared functional requirements

- User-provided fact: Focus the redesign on styling and positioning.
- Locked decision: Step Name remains the short navigation/progress label; Step Title appears once as the active product-selection heading.
- Recommendation: Align the title with the first edge of the product/slot content on desktop and mobile.
- Recommendation: Use responsive type, natural height, unrestricted wrapping, and no truncation.
- Repository-observed fact: Existing merchant/theme primary text color remains the color owner.
- Invariant: Empty Step Title leaves no shell, ornament, or vertical gap.
- Invariant: Navigation, selection, validation, summary, and cart behavior do not change.
- Preview parity: Settings > Design mounts the same production heading markup and CSS. Only deterministic fixture content is preview-specific; no Step Title styling or placement override is allowed in the preview route.

## Direction A

- Artifact and revision: Direction A in this comparison, revision 2
- Visual thesis: **Content Heading** — a strong, unboxed heading placed directly inside the active selection region.
- Styling: Responsive 18–24 px heading, weight 700, line-height about 1.25, existing primary text color, no border or background.
- Positioning: FPB aligns with the catalog track above its banners/tabs/products. PPB aligns with the active slot/grid body and appears once above that body.
- Strengths: Clear hierarchy with the least visual noise; highest compatibility with merchant themes; simplest shared contract across every template; no new color or surface ownership.
- Tradeoffs: Relies on spacing and typography alone, so surrounding template spacing must be normalized carefully.
- Responsive and accessibility implications: Left aligned at all widths; natural wrapping; no new contrast or focus risks; no redundant Step Name.

## Direction B

- Artifact and revision: Direction B in this comparison, revision 1
- Visual thesis: **Accent Rail** — the same content heading with a short leading rail that marks the start of the active task.
- Styling: Responsive 18–23 px heading with a 3 px vertical accent using an existing primary/accent token and 12 px inset.
- Positioning: Same content ownership as Direction A; the rail remains inside the heading block and never shifts the product-content alignment owner.
- Strengths: Stronger visual cue in dense PPB pages and clearer separation from theme product information.
- Tradeoffs: Adds decorative color ownership, can feel heavy in compact FPB presets, and creates more theme-contrast responsibility.
- Responsive and accessibility implications: Rail is decorative and hidden from assistive technology; text remains the only semantic signal; wrapping remains natural.

## Additional directions

### Direction C

- Artifact and revision: Direction C in this comparison, revision 1
- Visual thesis: **Soft Section Surface** — place the active title in a restrained tonal panel immediately above the selection content.
- Styling: Responsive 18–22 px heading inside a lightly bordered, rounded surface with content-driven padding.
- Positioning: Panel width matches the active content region; it never spans the FPB summary column or the full theme product section.
- Strengths: Creates the most separation from dense surrounding content and can make multi-step transitions conspicuous.
- Tradeoffs: Adds the most visual weight, competes with product cards/slot borders, and requires reliable merchant-theme surface and border tokens.
- Responsive and accessibility implications: Must maintain text/background contrast across themes; natural height and wrapping; empty titles remove the entire panel.

## Recommendation and decision

- Recommended direction and rationale: **Direction A — Content Heading.** It fixes the measured ownership and hierarchy problem directly, works across FPB and PPB without introducing a competing component surface, and carries the lowest theme-compatibility risk.
- Assumptions and stress cases: One-line, two-line, and long unbroken merchant titles; absent title; 320 px narrow viewport; desktop sidebar and mobile tray modes; PPB modal, Vertical/Horizontal Slots, Grid, and Cascade bodies.
- Selected direction: Direction A — Content Heading, including production-owned Settings Design preview parity.
- Approved by and at: Aditya Awasthi, 2026-08-27T12:51:12Z.
- Evidence IDs: CUR-FPB-DESKTOP-001, CUR-FPB-MOBILE-001, CUR-PPB-DESKTOP-001, CUR-PPB-MOBILE-001, O-01 through O-09.
- Rejections and reasons: Direction B was not selected because the accent rail adds theme-color and contrast ownership. Direction C was not selected because its panel competes with product cards and slot surfaces.
