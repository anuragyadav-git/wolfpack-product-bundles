---
schema_version: 1
id: fpb-all-template-product-card-visual-audit
title: FPB All-Template Product Card Visual Audit
type: design-job-artifact
status: complete
summary: Compares current Wolfpack and target EB desktop sidebars and mobile summary trays across all FPB presets.
last_audited: 2026-08-06
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - full-page-bundle-widget
source_paths:
  - design-jobs/fpb-all-template-product-card-parity-20260806/references
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
related_docs:
  - design-jobs/fpb-all-template-product-card-parity-20260806/screenshot-inventory.yaml
  - design-jobs/fpb-all-template-product-card-parity-20260806/state-matrix.md
tags:
  - fpb
  - summary-sidebar
  - mobile-tray
keywords:
  - Standard
  - Classic
  - Compact
  - Horizontal
---

# Visual Audit

Artifact job ID: fpb-all-template-product-card-parity-20260806
Artifact revision: 1
Artifact status: draft

## Conditions

- Reference IDs: all 25 items in `screenshot-inventory.yaml`.
- Viewports: desktop 1440 x 900 and mobile 390 x 844, both at browser zoom 100 percent and DPR 1.
- Stores: Agent is CURRENT; Yash-wolfpack EB bundle is TARGET.
- Capture policy: storefront viewport only; cache cleared where available; every storefront was hard reloaded with cache bypass after preset changes.
- Runtime checks: widget version and active assets captured from target and current pages.
- Comparison limit: theme, currency, merchant copy, and selection state differ. Target images therefore define structure, hierarchy, state treatment, and responsive behavior, not store-specific fixed pixels or hardcoded copy/colors.
- Requirement source: matrix rows and every pricing, progress, add-on, gift, localization, loading, error, and quality row that changes summary content or action eligibility.

## Measured desktop shells

Computed-style values are evidence, not direct implementation constants. Responsive CSS must remain intrinsic and content-driven.

| Preset | Current panel | Target panel | Directly observed relationship | Confidence |
|---|---:|---:|---|---|
| Standard | 414.3px wide; 20px padding; 5px gap; 1px border; 10px radius | 413.9px wide; 20px padding; 5px gap; 1px border; 10px radius | Shell geometry already aligns; selected-content hierarchy and state coverage are the work | High, computed style |
| Classic | 408.3px wide; 20px padding; 15.84px internal gap; no border; 10px radius | 413.9px wide; 20px padding; 5px gap; no border; 10px radius | Classic direction is already coherent while preserving the same summary anatomy | High, computed style and predecessor |
| Compact | 534px wide; 20px padding; 8px gap; no border; 0px radius | 527.5px wide; 20px padding; 5px gap; no border; 10px radius | Width is close, but current empty presentation lacks coherent surface treatment and edge continuity | High, computed style |
| Horizontal | 468.6px wide; 20px padding; 10px gap; 1px border; 10px radius | 466.8px wide; 20px padding; 5px gap; 1px border; 10px radius | Shell width and surface are close; shared content/state rendering must be aligned | High, computed style |

## Measured mobile tray

| Region | Current | Target | Confidence |
|---|---|---|---|
| Expanded partial tray | 390px x 301.8px for the shared compact/expanded mobile branch; sticky; 5px padding | 370px x 308px inside the 390px viewport; sticky; 5px padding | High, computed style |
| Expanded partial content | 380px x 291.8px; 10px vertical padding | 360px x 265px; 10px vertical padding plus separate 32px disclosure row | High, computed style |
| CTA | 380px x 40px; 8px padding; 5px radius | 360px x 38px; 8px padding; 5px radius | High, computed style |
| Empty expanded tray | 390px x 129.8px; content-driven | Target empty state not separately captured | High for current; unavailable for target empty |
| Disclosure | Current exposes a semantic `button` with `aria-expanded`; label/readout can be more explicit in one preset pair | Target keeps visible centered label and count with readable state | High, accessibility snapshot and screenshot |
| Preset consistency | Standard/Classic use an inset tray; Compact/Horizontal had fluid branch behavior | All four target presets use a shared inset mobile tray anatomy | High, four-preset screenshots |

## Observations

| ID | Region | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| VA-01 | Desktop shell | Preset identity is already dispatched by existing runtime branches | Four distinct desktop layouts with a shared summary anatomy | Four-preset screenshots and computed styles | High | Preserve preset identity while sharing state rendering |
| VA-02 | Desktop header | Title/subtitle/count exists, but spacing/labels vary by branch | Header includes title, subtitle, clear, and count in a predictable block | Screenshots | High | One semantic header anatomy with preset-owned presentation |
| VA-03 | Selected list | Classic proves reusable image/title/price/quantity/remove rows; some states still incomplete | Every target preset shows the same selected-row information hierarchy | Screenshots and runtime DOM | High | Reuse one data/state path; allow preset CSS only |
| VA-04 | Action cluster | Current action cluster can read as sparse | Target separates list and total/action with a divider and clear primary action | Screenshots and computed styles | High | Preserve merchant action token; adopt coherent spacing and divider ownership |
| VA-05 | Empty state | Current empty panels show title, count, total, and action without invented guidance | Target matrix requires coherent empty rows/slots, not fabricated marketing text | Screenshot and matrix M01/M03/M04 | High | Do not add fallback copy; render configured title/subtitle and the correct row/slot branch |
| VA-06 | Mobile disclosure | Better than target in some states, but label count composition inconsistent in non-classic presets | Visible label and count remain understandable when collapsed or expanded | Screenshot and accessibility snapshot | High | Keep one real button, readable label, count, and accurate `aria-expanded` |
| VA-07 | Mobile expanded content | Partial state supports selected rows and delete controls in shared branch | Expanded targets keep selected rows, clear action, total, and CTA visible in compact tray | Current partial and target partial | High | Keep every row and action keyboard/touch reachable; bound internal scrolling |
| VA-08 | Mobile preset consistency | Two mobile shell families are visible across four presets | One inset tray family is visible across all four targets | Four-preset screenshots | High | Consolidate mobile summary surface while retaining catalog preset identity |
| VA-09 | Mobile geometry | Current and target partial trays are roughly aligned at 390px width | Content-driven height grows with selected rows and remains viewport-bounded | Computed styles | High | Avoid fixed captured heights; use intrinsic tracks and bounded scroll region |
| VA-10 | Colors | Merchant and target primary action tokens vary | Existing merchant token remains source of truth | Screenshots | High | Never hardcode target token values; consume existing merchant/configured values |
| VA-11 | Typography | Current headings vary by preset and already align with approved Classic baseline | Target uses clear 25px desktop title and supporting body text in this fixture | Computed styles | Medium | Map to repository tokens and preset scale; avoid literal target fonts |
| VA-12 | Long content | Long localized copy, many rows, progress, gifts, and errors are not represented in the reference corpus | Matrix requires these cases in all presets | Matrix and acceptance criteria | High | Cover through state, responsive, and stress contracts before implementation |
| VA-13 | Qualification | Current CTA remains visible in empty states with behavior-driven enforcement | Target retains action while validation and progress explain eligibility | Matrix M10-M12, N11-N12 | High | Preserve business semantics and provide state-owned explanation without disabling recovery |
| VA-14 | Accessibility | Disclosure and remove actions remain operable controls | Target references not always explicit in computed output | Accessibility tree | High | Preserve or improve current semantics even when target markup is weaker |
| VA-15 | Responsive | Both implementations are sticky and storefront-owned, not chrome-owned | Target tray remains page-owned with catalog visible behind it | Live DOM and screenshots | High | Exactly one summary surface; reserve safe-area/padding without page overflow |

## Layout, geometry, typography, and surfaces

The target across presets is an anatomical contract: header, optional configuration/progress, selected rows or slots, messages, total/savings, and navigation/cart action. Standard and Classic use the narrowest desktop column. Horizontal uses an intermediate width. Compact uses a wider summary area because the catalog is denser and the right column carries more weight.

Existing Wolfpack shell widths are already close to target evidence. A global fixed-width rewrite would reduce fidelity. The design work should normalize region ownership, spacing rhythm, divider treatment, selected-row density, and mobile transformation while leaving preset grids responsible for column sizing.

Target black and target store copy are not merchant defaults. Existing Wolfpack custom color, copy, typography, radius, and language sources remain authoritative. Exact measurements stay evidence; implementation uses existing tokens, intrinsic tracks, percentages, and preset-owned CSS.

## Content, interaction, responsive, and accessibility

The shopper task is to understand what is selected, whether the bundle qualifies, what it costs, and what action is available. Sidebar order must remain:

1. Configured title and subtitle plus clear action when meaningful.
2. Quantity-option/box target, discount progress, and qualification messages when configured.
3. Selected rows or product slots, including remove restrictions.
4. Add-on or gift status at the active-step-owned location.
5. Total, savings, validation feedback, and Back/Next/Add to Cart actions.

Mobile transforms this anatomy into one connected disclosure and action tray. Collapsed state keeps label, count, price/qualification, and primary action readable. Expanded state reveals the same selected rows/slots and messages in a bounded scroll region. Hidden content must be inert and `aria-hidden`; the control remains a button with an accurate accessible name and `aria-expanded`. The visual target never overrides these semantics.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| GAP-01 | Visual / ownership | Normalize shared header, row, message, total, divider, and action anatomy | Configured copy, currency, pricing, validation | Shared side-panel methods plus preset CSS | Confirmed |
| GAP-02 | Responsive | Replace Compact/Horizontal mobile edge-to-edge treatment with shared inset tray family used across target presets | One active summary, sticky behavior, safe-area support | Shared mobile summary methods and full-page CSS | Confirmed |
| GAP-03 | Accessibility / visual | Keep one semantic disclosure with a persistent readable label and count | Accurate `aria-expanded`; hidden content inert | Shared mobile summary methods | Confirmed |
| GAP-04 | Visual | Give Compact a coherent summary surface without shrinking its preset-owned column | Compact desktop grid and merchant radius token | Compact preset CSS/config | Confirmed |
| GAP-05 | State | Keep every matrix-driven configuration occupying a stable region without reordering core actions | Business rules, selected identity, totals, add-on/gift semantics | Shared render methods with preset CSS adapters | Confirmed |
| GAP-06 | Responsive | Bound long selected lists, progress, messages, and localized copy without clipping CTA or causing page overflow | All content reachable; action remains available | Shared summary scroll region and responsive CSS | Confirmed |
| GAP-07 | Content | Remove any temptation to invent empty/help marketing copy | Only configured merchant copy | Shared renderer | Confirmed |
| GAP-08 | Data / behavior | Keep discount, box, gift, validation, loading, and error semantics unchanged while redesigning presentation | Existing model and action pathways | Existing state/data owners; presentation-only adapters | Confirmed |
