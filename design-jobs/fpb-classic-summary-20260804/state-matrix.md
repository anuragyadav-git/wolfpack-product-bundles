---
schema_version: 1
id: fpb-classic-summary-state-matrix
title: FPB Classic Summary State Matrix
type: design-contract
status: complete
summary: Defines the complete desktop sidebar and mobile tray state contract for the approved Calm Review Panel direction.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - design-jobs/fpb-classic-summary-20260804/component-anatomy.md
related_docs:
  - .agents/skills/storefront-design-director/references/state-coverage-catalog.md
tags:
  - fpb
  - classic
  - states
keywords:
  - states
  - assertions
---

# State Matrix

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: complete

| State ID | Trigger | Data precondition | Visible result | Available interaction | Accessibility | Desktop | Mobile | Screenshot | Automated assertion | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| desktop-empty | Initial render or Clear completes. | Zero selected; fixture hydrated. | Review header, zero count/total, configured empty slots or restrained empty guidance, disabled or validation-governed CTA. | Clear hidden when there is nothing to clear; selection remains available in grid. | Zero state is textually exposed; disabled reason remains perceivable. | Intrinsic sidebar; footer stays anchored after empty region. | Equivalent data appears in collapsed/expanded empty tray. | Required at 1440x900. | Zero selections produce zero total and no removable rows. | contracted |
| desktop-one-selected-product | Add first product. | One valid selected line. | One readable row with identity, optional variant, quantity, price, remove; total updates. | Remove, Clear, and condition-appropriate CTA. | Remove name includes product; total change is announced without duplicate chatter. | One row does not stretch to fill the panel. | Shared state powers collapsed count and expanded list. | Required at 1280x800. | Add mutates state once and recalculates total once. | contracted |
| desktop-partially-filled | Add products below completion threshold. | Valid nonzero selection; conditions unmet or more tiers available. | Calm row list, current total, progress/requirement only when configured. | Remove/Clear; CTA disabled or Next validation-governed according to existing logic. | Unmet requirement is not color-only and is associated with the blocked action. | Footer remains outside list scroll. | Collapsed bar shows concise partial status. | Existing 1440x900 reference plus QA rerun. | Existing condition validator decides availability. | approved evidence |
| desktop-minimum-reached | Selection reaches minimum valid condition. | Minimum condition satisfied. | Completion/next state becomes visually clear without layout jump. | CTA enables or advances under existing step logic. | Enabled state and any success message are programmatically exposed. | Footer geometry remains stable. | Collapsed and expanded CTA use the same decision. | Required. | Boundary quantity enables action exactly once. | contracted |
| desktop-between-discount-tiers | Selection is above a reached tier and below the next. | Pricing enabled with another reachable rule. | Applied saving plus next-tier progress; total remains primary. | Normal selection/removal and CTA. | Progress exposes current and target values in text. | Progress remains above list and does not compress footer. | Compact progress may appear above expanded content. | Required. | Pricing selector returns reached and next rule consistently. | contracted |
| desktop-discount-tier-reached | Selection lands on a discount threshold. | Qualifying tier reached. | Success/discount badge, original total when applicable, final total. | CTA remains available per validation. | Savings and total are readable without relying on strike-through/color. | No footer width shift. | Same calculated price in tray CTA and expanded details. | Required. | Exact threshold returns qualifying discount. | contracted |
| desktop-final-tier-reached | Highest configured tier is reached. | No next rule. | Final-tier success; no misleading next-tier prompt. | Normal selection/removal and CTA. | Completion is textual; progress final state is exposed. | Progress region may collapse when no longer informative. | Collapsed status remains concise. | Required. | Next-rule selector returns null and final discount remains. | contracted |
| desktop-discounted-total | Discount changes total. | Discount amount greater than zero. | Original and final totals are grouped; savings badge/message optional from configuration. | CTA uses final price. | Original versus final meaning is programmatic and legible. | Long currency strings wrap within the total block, never under CTA. | CTA price and expanded total agree. | Required. | Cart-display total equals PricingCalculator final price. | contracted |
| desktop-long-product-title | Select long-title product. | Product title exceeds one line. | Title wraps or clamps predictably; price, quantity, and remove stay reachable. | Remove retains full accessible name. | Full product name is available to assistive tech. | Row grows intrinsically within bounded list. | Expanded row supports wrapping at 320px. | Required. | Display title remains semantically unchanged. | contracted |
| desktop-product-with-variant | Select a variant-bearing product. | Variant selection valid. | Variant appears as secondary metadata distinct from title and price. | Remove and existing variant-change path remain. | Variant is included in accessible identity. | Metadata can wrap without moving remove off-screen. | Same metadata order in expanded tray. | Required. | Selected variant ID and display label remain correct. | contracted |
| desktop-quantity-greater-than-one | Increment selected quantity. | Quantity change allowed. | Quantity is explicit; row price and total update; optional badge does not duplicate meaning. | Increment/decrement and remove follow existing limits. | Unique control names and boundary-disabled state. | Numeric columns remain aligned for two-digit quantities. | Collapsed count reflects quantity, expanded row remains operable. | Required. | One increment causes one state/price update. | contracted |
| desktop-long-list-scroll | Select enough products to exceed available height. | Many rows or slots. | Header/progress and footer remain visible; selected list alone scrolls. | All rows, remove actions, and CTA remain reachable. | Keyboard focus scrolls into view; no focus trap. | Sticky shell does not exceed viewport; internal overscroll contained. | Expanded list owns scrolling without locking page. | Required. | List count and total include off-screen items. | contracted |
| desktop-loading-skeleton | Hydration or rerender pending. | Bundle or summary calculation unavailable temporarily. | Stable reserved summary geometry with non-content placeholders and busy action. | Duplicate submit disabled; safe navigation remains. | Polite loading status; skeletons are hidden from semantic content. | No footer jump after hydration. | Tray reservation avoids covering content. | Required. | Busy state prevents duplicate action and clears on completion/failure. | contracted |
| desktop-cta-disabled | Conditions or inventory block progress. | Existing validator returns false. | CTA remains visible but disabled; reason appears near action or in existing feedback. | Recovery interactions remain enabled. | Native disabled/aria state plus perceivable reason. | Footer retains full layout. | Same reason in expanded tray; collapsed action not falsely enabled. | Required. | Validator result controls disabled state. | contracted |
| desktop-cta-enabled | Conditions satisfied. | Existing validator returns true and not busy. | Primary action is visually dominant and stable. | Enter, Space, and pointer activate once. | Accessible name reflects Next or Add to cart. | Minimum 44px target; full label may wrap. | Persistent mobile action mirrors behavior. | Required. | One activation invokes the expected existing handler once. | contracted |
| desktop-remove-product | Activate a permitted row removal. | Non-default, removable current-step item. | Row leaves, count/total/progress update without stale gap. | Remaining controls preserve order; item can be re-added. | Focus returns to a logical nearby control; update announced. | Footer recalculates without jump. | Expanded tray remains open after removal unless empty policy closes it. | Required. | Correct selection ID is removed; blocked items remain. | contracted |
| desktop-clear-all | Confirm Clear. | At least one selected removable item. | Summary returns to empty state after confirmation. | Confirm/cancel in existing dialog. | Initial focus, Escape, containment, and focus return follow modal contract. | Sidebar stays mounted. | Tray returns to valid empty collapsed/expanded state. | Required. | Cancel preserves state; confirm clears once. | contracted |
| mobile-collapsed-empty | Mobile load with zero selection. | 320–414px viewport; no selected items. | Compact sticky bar with zero total and one disclosure control. | Disclosure and condition-governed action. | Toggle exposes aria-expanded=false; empty meaning is named. | Not applicable. | Safe-area padding; page content remains scrollable and unobscured. | Required at 390x844 and 320x720. | Toggle works with zero selections. | contracted |
| mobile-collapsed-partial | Select below completion. | Nonzero partial selection. | Count/progress summary and total/action fit one stable bar. | Toggle, recovery through expanded view, existing CTA logic. | Changes are announced once; action state has a reason. | Not applicable. | No title-row duplication; no horizontal overflow. | Existing 390x844 reference plus QA. | Quantity and final price match shared state. | approved evidence |
| mobile-collapsed-complete | Reach valid completion. | Conditions satisfied. | Compact completed status and enabled action without height jump. | CTA and disclosure. | Complete state is textual, not color-only. | Not applicable. | Action remains above safe area. | Required. | Same completion predicate as desktop. | contracted |
| mobile-expanded-empty | Expand at zero selection. | Empty state; disclosure opened. | Purpose/header, optional configured slots/guidance, and persistent action. | Collapse, selection outside tray, CTA validation path. | aria-expanded=true; empty content is not a fake list item. | Not applicable. | Page scroll remains enabled; tray owns only necessary overflow. | Required. | Expansion does not require a selected item. | contracted |
| mobile-expanded-partial | Expand with partial selection. | Nonzero selection; conditions unmet or more tiers available. | Header/Clear, feedback, selected list, and action ordered for review. | Remove/Clear, collapse, CTA according to validator. | Logical focus order follows task order. | Not applicable. | Internal list scroll starts only when needed. | Required at 390x844. | Expanded state does not mutate selection. | contracted |
| mobile-expanded-complete | Expand after completion. | Conditions satisfied. | Complete review with final total and enabled CTA. | Remove/Clear may return to partial; CTA submits. | State changes after removal are announced. | Not applicable. | CTA persists outside list scroll. | Required. | Removal recomputes completion and action state. | contracted |
| mobile-expanded-long-list | Expand with many selected lines. | Content exceeds dynamic viewport allowance. | Header and CTA persist; list scrolls; last item reachable. | Keyboard/touch scroll and row recovery. | Focused off-screen controls scroll into view; no hidden focus. | Not applicable. | Uses dynamic viewport and avoids nested page lock. | Required at 320x720 and 390x844. | Off-screen items remain counted and removable. | contracted |
| mobile-safe-area-inset | Emulate bottom safe area. | Mobile viewport with nonzero inset. | Action row clears the home indicator; no clipped focus ring. | All actions remain reachable. | Target and focus bounds stay inside visual viewport. | Not applicable. | Padding uses safe-area max with design spacing. | Required. | Browser geometry assertion confirms no CTA overlap. | contracted |
| mobile-narrow-width | Resize to 320x720. | Long title, quantity, and wide currency fixture. | Copy wraps; controls stay inside; no horizontal scroll. | Full keyboard/touch completion. | 200% zoom-equivalent reflow remains operable. | Not applicable. | Single-column row internals may reflow while product grid remains out of component scope. | Required. | document scrollWidth does not exceed clientWidth. | contracted |
| mobile-wide-width | Resize to 414x896. | Partial and complete states. | Bar and expanded tray use available width without over-stretching labels. | Same interaction set. | Logical order unchanged from narrow viewport. | Not applicable. | Content-driven max widths; safe-area retained. | Required. | State and totals match 390px run. | contracted |
| mobile-cta-disabled | Mobile validator blocks action. | Conditions unmet or submission unavailable. | Persistent disabled action with adjacent reason in expanded view. | Disclosure and recovery remain enabled. | Disabled state and reason perceivable. | Not applicable. | Collapsed bar must not hide the only recovery explanation. | Required. | Shared validator controls state. | contracted |
| mobile-cta-enabled | Mobile validator permits action. | Conditions met; not busy. | Persistent high-priority action with total. | Enter, Space, pointer/touch activate once. | Accessible name and busy transition remain stable. | Not applicable. | Minimum 44px target and safe-area clearance. | Required. | One activation invokes expected handler once. | contracted |
| mobile-backdrop-or-close | Expand then collapse. | Tray expanded in any selection state. | Same tray collapses; no second overlay or backdrop required. | Toggle again; Escape may collapse when focus is within tray if existing interaction supports it. | aria-expanded updates; focus remains on or returns to toggle. | Not applicable. | Page scroll never locks; reduced motion removes nonessential animation. | Required. | Toggle alternates state without duplicating controls. | contracted |

## Not applicable

| Catalog state | Reason |
|---|---|
| Product details modal image carousel | The scoped summary does not own product-modal media behavior. |
| Variant selection inside summary | Variants are displayed in the summary; selection remains owned by product cards/modal. |
| Out-of-stock selection | Inventory filtering and card availability precede summary entry; the summary must preserve existing failure feedback but does not create an unavailable line. |
| Reorder selected products | No existing reorder behavior is part of FPB summary semantics. |
| Modal open/close beyond Clear confirmation | Product modal is outside scope; only existing Clear confirmation behavior is preserved. |
| Separate mobile backdrop | Direction A uses the existing sticky disclosure tray and does not introduce a blocking overlay. |

## Coverage

- Required: 30 manifest states.
- Covered: 30.
- Missing: 0.
- Status: Complete for design handoff; browser execution remains deferred until implementation is returned.
