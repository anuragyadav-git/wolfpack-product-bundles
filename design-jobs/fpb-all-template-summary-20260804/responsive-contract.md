---
schema_version: 1
id: storefront-design-director-responsive-contract-template
title: Responsive Contract Template
type: design-job-template
status: complete
summary: Defines the Direction-A sidebar-to-tray transformation, overflow, safe-area, content-stress, zoom, and opposite-viewport behavior for every required FPB width.
last_audited: 2026-08-05
owners:
  - Aditya Awasthi
domains:
  - responsive-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/responsive-contract.md
related_docs:
  - .agents/skills/storefront-design-director/references/responsive-design-contract.md
tags:
  - template
keywords:
  - breakpoint
  - safe-area
---

# Responsive Contract

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 2
Artifact status: complete

## Required viewports and container widths

| ID | Width | Height | Placement width | Purpose | Required states |
|---|---|---|---|---|---|
| VP-01 | 320 | 720 | Full widget container | Narrow mobile and long-copy stress | SUM-01, 02, 03, 05, 07, 09, 10, 12, 17, 18, 19, 20 |
| VP-02 | 360 | 800 | Full widget container | Baseline mobile | SUM-01 through SUM-20 where mobile applies |
| VP-03 | 390 | 844 | Full widget container | Primary observed mobile comparison | Collapsed and expanded for every preset; empty, partial, exact, discount, box, add-on |
| VP-04 | 414 | 896 | Full widget container | Wide mobile | Long review list, safe area, persistent action |
| VP-05 | 768 | 1024 | Full widget container | Tablet portrait and current conflicting CSS boundary | Shared tray, expanded review, keyboard, 200% zoom |
| VP-06 | 1024 | 768 | Full widget container | Small desktop/tablet landscape | Desktop sidebar, long list, actions reachable |
| VP-07 | 1280 | 800 | Full widget container | Baseline desktop | Empty, partial, exact, overflow, discount, add-on, box |
| VP-08 | 1440 | 900 | Full widget container | Primary observed desktop comparison | Every preset baseline and representative matrix states |
| VP-09 | 1536 | 960 | Full widget container | Wide desktop | Preset width identity and no overexpansion |
| CW-01 | Any viewport | Any | 600 CSS px constrained host | Container-driven replacement stress | Exactly one tray, no page overflow |
| ZM-01 | 1280 x 800 | 200% browser zoom | Effective constrained content width | Reflow and WCAG zoom stress | SUM-07, 12, 17, 19 |

## Region transformations

| Region | Range | Size | Layout | Order | Visibility or replacement | Scroll | Sticky or fixed | Text and image | Controls and spacing | Safe area | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| SUM-ROOT | Container >= 1024 CSS px | Intrinsic full width | Preset catalog plus sidebar grid | Timeline/header, catalog, summary | Desktop SUM-DESKTOP active; mobile tray absent from accessibility tree and paint | Page owns outer scroll | None added by summary | Merchant copy wraps at its region; media contained | Content-driven gaps and grid tracks | Theme/page owner | No horizontal page overflow |
| SUM-ROOT | Container < 1024 CSS px (recommended decision RD-001) | Intrinsic full width | Catalog single-column/reflow plus tray | Store content first; persistent tray remains last in task flow | SUM-DESKTOP hidden; exactly one SUM-MOBILE-TRAY active | Page scroll remains available | Tray sticky to viewport bottom | Long copy stays within tray; images use contained/cropped summary media contract | Touch controls preserve usable hit area without fixed screenshot widths | Tray pads `env(safe-area-inset-bottom)` | No horizontal page overflow; no competing generic sheet |
| SUM-DESKTOP | >= 1024 | Standard narrow bordered; Classic airy borderless; Compact wide coherent surface; Horizontal intermediate bordered | Same ordered shared regions in each preset-owned column | Header, qualification, review, total, actions | Visible | Review list becomes internal vertical scroll only after intrinsic content budget is exceeded | Align/start in grid; not viewport-fixed | Titles/messages wrap; prices preserve readable numeric cluster; row media maintains aspect ratio | Shared rhythm; preset CSS may tune density and surface, not semantics/order | Not applicable | List overflow cannot cover totals/actions |
| SUM-HEADER | All ranges | Intrinsic block | Copy group plus clear action | First in expanded review | Desktop always; mobile only inside expanded review | No independent scroll | None | Title and subtitle wrap; no hard line clamp unless localized owner documents it | Clear remains reachable without overlapping copy | Inherits tray inset | Overflow-wrap long unbroken strings |
| SUM-QUALIFICATION | All ranges when configured | Intrinsic height | Message then progress; box selector/tier controls before review | Before selections | Desktop visible; mobile persistent discount status may stay above CTA while full box details remain expanded | No independent scroll | None | Variables and currency wrap without truncating meaning | Controls reflow to one column when needed | Inherits tray inset | Progress never causes horizontal overflow |
| SUM-REVIEW | Desktop >= 1024 | Intrinsic until bounded maximum | Row list or slot grid | Between qualification and totals | Visible | Owns vertical overflow when long | Not sticky | Rows wrap product/variant identity; slot media covers/contains consistently | Slot grid uses intrinsic `minmax`/auto-fit behavior | Not applicable | No horizontal scroll; every selected item remains reachable |
| SUM-REVIEW | Container < 1024 collapsed | Zero visual/interactive height | Collapsed grid track | Hidden between persistent status and action | `inert` and `aria-hidden`; no focusable descendants | None | None | Not painted | No hidden control consumes space | Not applicable | Clipped without page jump |
| SUM-REVIEW | Container < 1024 expanded | Bounded by remaining dynamic viewport space | One-column review; slots auto-fit | Opens between status and persistent action | Visible and operable | Tray review becomes the internal scroll owner only when needed | Tray remains sticky; review itself not fixed | Long product/variant copy wraps; media remains bounded | Rows and slots use shared mobile spacing; no per-preset geometry branch | Top/bottom inset preserved | Overscroll contained in review; page remains scrollable outside interaction |
| SUM-DISCLOSURE | Container < 1024 | Intrinsic pill/button within inset shell | Connected icon plus count/status label | First persistent tray control | Always visible in collapsed and expanded states | None | Part of sticky tray | Label remains readable; transient offer message may grow but wraps/clamps without covering CTA | Minimum hit target; visible focus; same control persists during animation | Inset from viewport edges | No overlap with qualification or action |
| SUM-TOTAL | >= 1024 | Intrinsic | Savings/original/final price cluster | Immediately before actions | Full detail visible | None | Action region remains reachable | Numeric cluster wraps as a unit where possible | Tabular/numeric alignment preferred | Not applicable | Large currency value does not escape panel |
| SUM-TOTAL | < 1024 | Intrinsic within CTA plus expanded detail when required | Action label, separator, final price | Persistent bottom action | Final price always visible; original/savings reachable expanded | None | Part of sticky tray action | Large price may wrap within button without clipping | CTA fills available inner width | Bottom safe-area padding | No collision with disclosure/count |
| SUM-NAV | >= 1024 | Full sidebar inner width | Back plus primary action when applicable | Last | Visible | None | Reachable after review scroll | Merchant labels wrap, not ellipsize critical action | Buttons use content-driven tracks; primary remains dominant | Not applicable | No button overflow |
| SUM-NAV | < 1024 | Full tray inner width | One persistent primary action; Back remains in page flow or expanded review per existing step contract | Last persistent tray row | Visible in both tray states | None | Sticky with tray | Label and price remain distinguishable at 320px | Full-width primary, usable target, focus inset | Bottom safe area included | Virtual keyboard cannot permanently obscure the action after dismissal |
| SUM-SLOT | All ranges | Token-owned square, auto-fit count | Responsive grid | Selection order | Same state branch on desktop/mobile | Parent review owns scroll | None | Filled image has stable crop; merchant empty icon contained | Gap/size use named tokens and available width | Inherits parent | Grid reduces columns before overflowing |
| SUM-ROW | All ranges | Intrinsic height | Media, identity, price/quantity, removal | Selection order | Same identity and removal predicate across replacements | Parent review owns scroll | None | Identity wraps; price/action stay reachable | Tracks use `minmax(0, 1fr)` behavior | Inherits parent | No row causes page-level horizontal scroll |

## Critical boundaries

Record one pixel below, at, and one pixel above.

| Boundary ID | Widths | Contract |
|---|---|---|
| B-01 | Container 1023 / 1024 / 1025 | Direction-A replacement boundary proposed by RD-001: 1023 uses one shared tray; 1024 and 1025 use the preset desktop sidebar. No frame may show both or neither. |
| B-02 | Viewport 767 / 768 / 769 | Existing CSS conflict audit: summary presentation must remain one shared tray throughout this range when container is below 1024; product-grid changes may occur independently without rebuilding summary semantics. |
| B-03 | Viewport 319 / 320 / 321 | 320 is the minimum supported proof width; 319 is a diagnostic overflow probe and must fail gracefully without hiding the primary action. |
| B-04 | Constrained container 599 / 600 / 601 | Container width, not a wide outer viewport, controls replacement. A 600px host inside a desktop theme still uses the tray. |

Approved RD-001: use the measured FPB widget container width, with desktop sidebar at `>= 1024px` and shared tray below `1024px`. Rationale: this preserves the current Standard/Classic usable boundary, resolves the present 768/1024 conflict, supports constrained themes and 200% zoom, and avoids forcing a two-column sidebar into tablet portrait. Aditya Awasthi approved this screenshot-unobserved responsive default at 2026-08-04T19:15:56Z.

## Orientation, high zoom, and opposite-viewport non-regression

- Portrait/landscape: recompute from the current widget container after orientation change. Preserve selection, disclosure, step, pricing, box target, and add-on eligibility state; only the presentation owner changes.
- Focus during replacement: if the focused control disappears at the boundary, move focus to the semantic counterpart only when the resize was user-driven and focus would otherwise be lost; do not steal focus during passive page load.
- 200% zoom: the effective container may cross RD-001 and use the tray. This is valid responsive reflow, not a desktop regression.
- Safe area: mobile inset applies to the shell and persistent action, including when expanded; never rely on a fixed bottom margin.
- Virtual keyboard: the tray remains reachable after keyboard dismissal and must not lock the page or create a second scroll trap.
- Reduced motion: transformation and disclosure settle immediately while preserving final expanded/collapsed state.
- Desktop non-regression: shared mobile rules must not alter desktop widths, preset surface identity, list overflow, totals, or action order at 1024 and above.
- Mobile non-regression: preset desktop CSS must not override shared tray geometry below the approved boundary. Preset identity can flow through merchant tokens and a bounded preset marker, never through a separate mobile anatomy.
- State preservation: crossing either direction never clears selections, changes price, changes the active step, resets the box, repeats add-on pulses, or duplicates event listeners.
