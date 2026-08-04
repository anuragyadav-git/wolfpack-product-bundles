---
schema_version: 1
id: fpb-all-template-summary-visual-audit
title: FPB All-Template Summary Visual Audit
type: design-job-artifact
status: complete
summary: Compares current Wolfpack and target EB desktop sidebars and mobile summary trays across all FPB presets.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - full-page-bundle-widget
source_paths:
  - design-jobs/fpb-all-template-summary-20260804/references
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
related_docs:
  - design-jobs/fpb-all-template-summary-20260804/screenshot-inventory.yaml
  - design-jobs/fpb-all-template-summary-20260804/state-matrix.md
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

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 1
Artifact status: complete

## Conditions

- Reference IDs: all 25 items in `screenshot-inventory.yaml`.
- Viewports: desktop 1440 x 900 and mobile 390 x 844, both at browser zoom 100 percent and DPR 1.
- Stores: Agent is CURRENT; Yash-wolfpack EB bundle 2 is TARGET.
- Capture policy: storefront viewport only; Cache Storage cleared where available; every storefront was hard reloaded with cache bypass after a preset change.
- Runtime checks: Agent widget version `5.0.227`; EB body preset was directly confirmed as `DEFAULT_FBP`, `CLASSIC`, `COMPACT`, or `HORIZONTAL` before target capture.
- Comparison limit: theme, currency, merchant copy, and selection state differ. Target images therefore define structure, hierarchy, state treatment, and responsive behavior, not store-specific fixed pixels or hardcoded copy/colors.
- Requirement source: matrix rows M01-M12 plus every pricing, progress, add-on, gift, localization, loading, error, and quality row that changes sidebar content or action eligibility.

## Measured desktop shells

Computed-style values are evidence, not direct implementation constants. Responsive CSS must remain intrinsic and content-driven.

| Preset | Current panel | Target panel | Directly observed relationship | Confidence |
|---|---:|---:|---|---|
| Standard | 414.3px wide; 20px padding; 5px gap; 1px border; 10px radius | 413.9px wide; 20px padding; 5px gap; 1px border; 10px radius | Shell geometry already aligns; selected-content hierarchy and state coverage are the work | High, computed style |
| Classic | 408.3px wide; 20px padding; 15.84px internal gap; no border; 10px radius | 413.9px wide; 20px padding; 5px gap; no border; 10px radius | Approved Classic direction is intentionally airier while preserving the same summary anatomy | High, computed style and approved predecessor |
| Compact | 534px wide; 20px padding; 8px gap; no border; 0px radius | 527.5px wide; 20px padding; 5px gap; no border; 10px radius | Width is close, but current empty presentation lacks the target's coherent summary surface and edge treatment | High, computed style |
| Horizontal | 468.6px wide; 20px padding; 10px gap; 1px border; 10px radius | 466.8px wide; 20px padding; 5px gap; 1px border; 10px radius | Shell width and surface are close; shared content/state rendering must be aligned | High, computed style |

## Measured mobile tray

| Region | Current | Target | Confidence |
|---|---|---|---|
| Expanded partial outer tray | 390px x 301.8px for the shared Compact/Horizontal fluid branch; sticky; 5px padding | 370px x 308px inside the 390px viewport; sticky; 5px padding | High, computed style |
| Expanded partial content | 380px x 291.8px; 10px vertical padding | 360px x 265px; 10px vertical padding plus a separate 32px disclosure row | High, computed style |
| CTA | 380px x 40px; 8px padding; 5px radius | 360px x 38px; 8px padding; 5px radius | High, computed style |
| Empty expanded tray | 390px x 129.8px; content-driven | Target empty state was not separately captured | High for current; unavailable for target empty |
| Disclosure | Current exposes a semantic `button` with `aria-expanded`, but the count pill visually overlaps and the expanded state loses a readable disclosure label in Compact/Horizontal | Target keeps a visible centered "Review selected bundle products" row plus count badge | High, accessibility snapshot and screenshot |
| Preset consistency | Standard/Classic use an inset tray; Compact/Horizontal use edge-to-edge fluid footer treatment | All four target presets use the same inset mobile tray anatomy | High, four-preset screenshots |

## Observations

| ID | Region | Dimension | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| VA-01 | Desktop shell | Preset identity | Four distinct catalog layouts and sidebar widths are already dispatched by preset | Four distinct desktop layouts with a shared summary anatomy | Four-preset screenshots and computed styles | High | Preserve preset identity while sharing state rendering |
| VA-02 | Desktop header | Hierarchy | Title/subtitle/count exist, but spacing and labels vary by branch | Title, subtitle, clear, and count form one predictable header block | Screenshots | High | One semantic header anatomy with preset-owned presentation |
| VA-03 | Selected list | Row anatomy | Classic proves reusable image/title/price/quantity/remove rows; other empty captures do not prove every partial branch | Every target preset shows the same selected-row information hierarchy | Screenshots and runtime DOM | High | Reuse one data/state path; allow preset CSS only |
| VA-04 | Action cluster | Separation | Empty panels can read as sparse; Compact/Horizontal use a merchant purple action token in the current fixture | Target separates list and total/action with a divider and full-width primary action | Screenshots and computed styles | High | Preserve merchant action token; adopt coherent spacing/divider ownership |
| VA-05 | Empty state | Content economy | Current empty panels show title, count, total, and action without invented guidance | Target matrix requires coherent empty rows/slots, not fabricated marketing text | Screenshot and matrix M01/M03/M04 | High | Do not add fallback copy; render configured title/subtitle and the correct row/slot branch |
| VA-06 | Mobile disclosure | Visual affordance | Toggle semantics are better than target, but the label/count composition is visually incomplete in Compact/Horizontal | Visible label and count remain understandable when expanded or collapsed | Screenshot and accessibility snapshot | High | Keep one real button, readable label, count, and accurate `aria-expanded` |
| VA-07 | Mobile expanded content | Information reachability | Partial state supports selected rows and delete controls in the shared branch | Target rows, clear action, total, and CTA remain visible in a compact sheet | Live current partial and target partial | High | Keep every row and action keyboard/touch reachable; bound internal scrolling |
| VA-08 | Mobile preset consistency | Insets and edge ownership | Two mobile shell families are visible across the four presets | One inset tray family is visible across all four targets | Four-preset screenshots | High | Consolidate the mobile summary surface while retaining catalog preset identity |
| VA-09 | Mobile geometry | Height | Current and target partial trays are within roughly 6px of each other at 390px width | Content-driven height grows with selected rows and remains viewport-bounded | Computed styles | High | Avoid fixed captured heights; use intrinsic tracks and a bounded list scroll region |
| VA-10 | Colors | Merchant ownership | Current fixture primary CTA is black in Standard/Classic and purple in Compact/Horizontal | Target fixture CTA is black | Screenshots | High | Never hardcode target black; consume the existing merchant-configurable action token |
| VA-11 | Typography | Hierarchy | Current headings range by preset and approved Classic direction | Target uses clear 25px desktop title and compact 12-15px supporting text in this fixture | Computed styles | Medium | Map to repository tokens and preset scale; do not copy store font values literally |
| VA-12 | Long content | Overflow | Long localized copy, many rows, progress, gifts, and errors are not represented in the reference corpus | Matrix requires them in all presets | Matrix and acceptance criteria | High | Cover through state, responsive, and stress contracts before implementation |
| VA-13 | Qualification | State clarity | Current CTA remains present in empty states, with eligibility enforced by behavior | Target retains the action while validation and progress explain eligibility | Matrix M10-M12, N11, D01-D12 | High | Preserve business semantics and provide state-owned explanation without disabling recovery |
| VA-14 | Accessibility | Control semantics | Current disclosure and remove actions have operable button roles and names | Target visual reference does not reliably expose equivalent semantics | Accessibility tree | High | Preserve or improve current semantics even when target markup is weaker |
| VA-15 | Responsive | Storefront ownership | Both implementations are sticky within the widget/page flow, not browser chrome | Target tray remains storefront-only and the catalog continues behind it | Live DOM and screenshots | High | Exactly one summary surface; reserve safe-area/padding without page overflow |

## Layout, geometry, typography, and surfaces

The target is not one universal-width sidebar. Its shared contract is anatomical: header, optional configuration/progress region, selected rows or slots, messages, total/savings, and navigation/cart action. Standard and Classic use the narrowest desktop column. Horizontal uses an intermediate column because its catalog rows are wide and shallow. Compact uses the widest summary area because the catalog uses denser cards and the right column carries more visual weight.

The existing Wolfpack shell widths are already close to target evidence. A global fixed-width rewrite would reduce fidelity. The design work should instead normalize region ownership, spacing rhythm, dividers, selected-row density, and mobile transformation while leaving preset grids responsible for column sizing.

Target black, target font values, and target store spacing are not merchant defaults. Existing Wolfpack custom color, copy, typography, radius, and language sources remain authoritative. Exact measurements stay evidence; implementation uses existing tokens, intrinsic tracks, percentages, and preset-owned CSS.

## Content, interaction, responsive, and accessibility

The primary shopper task is to understand what is selected, whether the bundle qualifies, what it costs, and what action is available. The sidebar must preserve this order under every matrix state:

1. Configured title and subtitle plus clear action when meaningful.
2. Quantity-option/box target, discount progress, and qualification messages when configured.
3. Selected rows or product slots, including remove restrictions.
4. Add-on or gift state at the active-step-owned location.
5. Total, savings, validation feedback, and Back/Next/Add to Cart actions.

Mobile transforms this anatomy into one connected disclosure and action tray. Collapsed state keeps label, count, price/qualification, and primary action readable. Expanded state reveals the same selected rows/slots and messages in a bounded scroll region. Hidden content must be inert and `aria-hidden`; the control remains a button with an accurate accessible name and `aria-expanded`. The visual target never overrides these semantics.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| GAP-01 | Visual / ownership | Normalize shared header, row, message, total, divider, and action anatomy | Configured copy, currency, pricing, and validation | Shared side-panel methods plus preset CSS | Confirmed |
| GAP-02 | Responsive | Replace Compact/Horizontal edge-to-edge mobile treatment with the same inset tray family used across target presets | One active summary, sticky behavior, safe-area support | Shared mobile summary methods and full-page CSS | Confirmed |
| GAP-03 | Accessibility / visual | Keep one semantic disclosure while restoring a persistent readable label and count | Accurate `aria-expanded`; hidden content inert | Shared mobile summary methods | Confirmed |
| GAP-04 | Visual | Give Compact a coherent summary surface and edge treatment without shrinking its preset-owned column | Compact desktop grid and merchant radius token | Compact preset CSS/config | Confirmed |
| GAP-05 | State | Ensure every matrix-driven configuration occupies a stable region without reordering core actions | Business rules, selected identity, totals, add-on/gift semantics | Shared render methods with preset CSS adapters | Confirmed |
| GAP-06 | Responsive | Bound long selected lists, progress, messages, and localized copy without clipping CTA or causing page overflow | All content reachable; action remains available | Shared summary scroll region and responsive CSS | Confirmed |
| GAP-07 | Content | Remove any temptation to invent empty/help marketing copy | Only configured merchant copy | Shared renderer | Confirmed |
| GAP-08 | Data / behavior | Keep discount, box, gift, validation, loading, and error state semantics unchanged while redesigning presentation | Existing model and action pathways | Existing state/data owners; presentation-only adapters | Confirmed |

## Direction constraints from the audit

- Preserve the approved Classic baseline and its airier spacing.
- Keep Standard and Horizontal shell geometry because it already aligns closely.
- Correct Compact's summary surface ownership without copying a fixed screenshot width.
- Use one mobile summary anatomy for all four presets.
- Reuse shared render/state methods; presets own only layout and visual emphasis.
- Use merchant-configurable tokens and copy. No target-store hardcoding.
- Treat all unobserved matrix states as contract/test obligations, not visual facts inferred from screenshots.
