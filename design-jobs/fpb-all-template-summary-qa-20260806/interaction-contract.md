---
schema_version: 1
id: storefront-design-director-interaction-contract-template
title: Interaction Contract Template
type: design-job-template
status: complete
summary: Defines pointer, keyboard, focus, disclosure, announcement, error-recovery, responsive replacement, and reduced-motion behavior for the all-template FPB summary system.
last_audited: 2026-08-05
owners:
  - Aditya Awasthi
domains:
  - interaction-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/interaction-contract.md
related_docs:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
tags:
  - template
keywords:
  - keyboard
  - focus
---

# Interaction Contract

Artifact job ID: fpb-all-template-summary-qa-20260806
Artifact revision: 3
Artifact status: approved

| Control ID | Role | Accessible name | Pointer action | Keyboard action | State update | Focus behavior | Disabled or busy | Error recovery | Motion |
|---|---|---|---|---|---|---|---|---|---|
| INT-01 | Mobile summary disclosure `button` | Stable localized equivalent of “Review your bundle”; quantity/status is supplementary, not the sole name | Tap toggles the same connected tray | Native Enter/Space | Toggles `aria-expanded`; review region toggles `inert` and `aria-hidden` | Focus stays on disclosure after toggle; collapsing while focus is inside first returns focus to disclosure | Never disabled; remains operable during empty, loading, error, and qualification states | If content cannot hydrate, disclosure remains stable and error status is exposed without trapping focus | Same DOM control persists; caret/tray animate only when motion allowed |
| INT-02 | Clear selections `button` | Localized Clear plus contextual bundle scope when required | Opens guarded confirmation when selections exist | Native Enter/Space | No selection mutation until confirm | Trigger keeps focus origin for restoration | Absent or disabled when there is nothing to clear; cannot fire twice while confirmation opens | Cancel/Escape restores trigger focus; confirm returns focus to the relevant empty summary or disclosure | No destructive transition before confirmation; reduced motion removes overlay animation |
| INT-03 | Selected-row remove `button` | Localized remove label plus product/variant identity | Removes one eligible selection | Native Enter/Space | Uses shared selection identity and updates count, totals, progress, validation, slots, and CTA once | After removal, focus moves to the next row’s remove control, previous row’s control, or summary heading when list becomes empty | Step-gated removal uses perceivable unavailable state and reason; if activation is needed to explain recovery, use guarded `aria-disabled` behavior rather than a silently inert native disabled control | Blocked action announces the owning step/recovery message and preserves selection | Row collapse must not move surrounding controls unexpectedly; reduced motion settles immediately |
| INT-04 | Product-slot removal, when a slot has an unambiguous selected-item owner | Same contextual label as INT-03 | Removes the represented item | Native Enter/Space | Same shared removal path as rows | Same deterministic focus fallback as INT-03 | Empty slots are not controls; filled slot is a control only when removal semantics are explicit | Same as INT-03 | Same as INT-03 |
| INT-05 | Bundle Quantity Option group | Merchant-configured box/tier label; each option exposes label, subtext, target, and selected state | Selects an allowed target | Native radio/selection keyboard behavior, including arrows when implemented as radios | Updates one active box target, slot/skeleton count, validation, totals, and CTA through existing state owner | Focus remains on selected option; no jump to catalog or CTA | A disallowed switch stays unselected and exposes why; no partial state mutation | Announces retained/reset selection outcome and the new target; invalid switch keeps prior option | Selection indicator may transition, but meaning is immediate and non-color-only |
| INT-06 | Back `button` | Localized Back | Moves to prior enabled paid step | Native Enter/Space | Changes active step once and preserves selections | Focus moves to the new step heading or first task control, not the document root | Hidden when not applicable; busy guard prevents duplicate navigation | Failure preserves current step/state and announces error | Page/summary transition respects reduced motion |
| INT-07 | Next `button` | Localized Next; tier copy remains adjacent descriptive content rather than replacing the core action name | Validates and advances one step | Native Enter/Space | Advances once only when current rule allows | On success focus moves to new step heading/first task control; on failure stays on action | When correction is possible, action remains operable enough to expose the unmet requirement; busy state sets `aria-busy` and blocks repeat activation | Unmet rule is exposed in text/status or toast and associated with the action; no state loss | No delayed availability under reduced motion |
| INT-08 | Add to Cart `button` | Localized Add to Cart; displayed price is supplementary | Validates then submits once | Native Enter/Space | Uses existing cart path; selected state remains stable until success navigation/cart result | On failure focus remains on action; on success follows existing cart destination | Busy state exposes `aria-busy`, disables repeat submission, and keeps label/price geometry stable | Rule, box, inventory, or network failure announces a useful message and preserves selections for correction/retry | Spinner/transition has reduced-motion form and never replaces the accessible name |
| INT-09 | Long review scroll region | Region label derived from configured summary title | Wheel/touch scrolls selected content only when overflow exists | Native reading/scroll keys after a descendant receives focus; region itself need not become a tab stop unless required | No data mutation | Focus ring on descendants stays visible and uncut | Never overlays totals, disclosure, or primary action | End of list does not trap scroll or keyboard | No scroll-linked decoration; programmatic focus uses minimal scroll |
| INT-10 | Clear confirmation dialog | Localized confirmation heading and description | Confirm clears; Cancel, close, or backdrop cancels according to current product contract | Tab/Shift+Tab contained; Escape cancels; Enter activates focused button | Confirm performs one clear operation | Initial focus on Cancel or least-destructive control; close restores INT-02 | Confirm busy guard prevents double clear | Error leaves dialog or returns to summary with message and selections intact | Opening/closing motion removed under reduced motion |
| INT-11 | Summary status announcer | No visible control; one concise polite live region owned by the summary | Not applicable | Not applicable | Announces meaningful selection count, qualification/tier, total, and failure changes after the originating action | Never receives focus | Coalesces rapid quantity updates; does not announce initial hydration noise or every animation frame | Error messages use assertive behavior only when immediate correction is required | Offer pulse text is announced once independent of its visual timer |

## State transitions

| Transition ID | From | Trigger | To | Required outcome |
|---|---|---|---|---|
| TR-01 | Mobile collapsed | INT-01 | Mobile expanded | Same tray/control remains connected; review becomes visible, non-inert, next in logical order; page scroll remains available. |
| TR-02 | Mobile expanded | INT-01 or responsive replacement | Mobile collapsed or desktop sidebar | If focus is inside disappearing content, move it to disclosure or the semantic desktop counterpart before hiding/removing; state data persists. |
| TR-03 | Desktop sidebar | Container crosses below 1024px | Mobile collapsed/previous disclosure state | Exactly one summary is exposed; selection, step, box, price, qualification, and add-on state persist; no duplicate listeners or repeated offer pulse. |
| TR-04 | Mobile tray | Container crosses to 1024px or above | Desktop sidebar | Same invariants as TR-03; if focus was on disclosure, move it to the desktop summary heading or primary action only when otherwise lost. |
| TR-05 | Partial selection | Eligible remove | Updated partial/empty | One item identity changes; count, totals, slots, progress, validation, and action update atomically; focus fallback follows INT-03. |
| TR-06 | Any nonempty selection | Confirm clear | Empty | All shared summary surfaces update once; confirmation closes; empty state is named and no stale focused node remains. |
| TR-07 | Under-qualified | Correct selection/tier | Qualified | Requirement/status and CTA state update together; one polite announcement reports the achieved state. |
| TR-08 | Qualified | Remove/switch/de-qualify | Under-qualified | CTA becomes guarded, requirement becomes perceivable, and no stale success status remains. |
| TR-09 | Ready | Submit | Busy | One request, stable button geometry, exposed busy state. |
| TR-10 | Busy | Failure | Recoverable ready/invalid | Preserve selections, clear busy state, expose failure, and retain focus at INT-08. |

## Modal and overlay behavior

- The mobile tray is not a modal, dialog, backdrop sheet, or focus trap. It is a sticky responsive replacement and leaves page scroll available.
- The clear confirmation is the only summary-owned dialog. It requires `role="dialog"`, `aria-modal="true"`, labelled heading, described consequence, a close path, Escape handling, contained Tab order, least-destructive initial focus, and trigger focus restoration.
- The dialog must not be nested inside an `aria-hidden` or inert collapsed tray. If Clear is invoked from mobile, the dialog is mounted in an exposed portal owner while preserving the disclosure as the restoration fallback.
- Toasts supplement but do not replace the accessible relationship between an invalid action and its recovery instruction. Repeated identical messages are coalesced.

## Responsive replacement and reduced motion

- Desktop and mobile are mutually exclusive in paint, accessibility tree, and tab order at RD-001. Hidden/replaced surfaces contain no focusable descendants.
- DOM/task order remains disclosure, expanded summary controls/content, then persistent primary action. Visual ordering must not reverse keyboard order.
- The mobile disclosure owns `aria-expanded` and a stable relationship to the collapsible review region. The selected count may update visually without rewriting the entire accessible name.
- Safe-area padding and sticky placement cannot clip focus indicators or make the persistent action overlap content at 320px, tablet portrait, landscape, 200% zoom, or after virtual-keyboard dismissal.
- `prefers-reduced-motion: reduce` removes tray height, caret rotation, offer-pulse, progress, skeleton, and dialog transitions while preserving immediate final states and announcements.
- Motion cancellation during rapid toggles settles to the last requested state, never leaves fixed inline height, and never changes `aria-expanded` out of sync.

## Business-rule invariants

- Interaction code delegates to existing selection, pricing, rule, box, add-on, navigation, inventory, and cart owners; presentation handlers do not recalculate business outcomes.
- Exactly one selection identity is added/removed per activation; quantity greater than one retains its existing unit-versus-line removal contract.
- Step-gated removal never removes an item from a different step and always explains the owning step.
- Box switching never leaves selected option, target count, slots, validation, total, and CTA out of sync.
- Discount message and progress toggles remain independent; accessible status does not reveal a disabled feature.
- Add-on/gift messages are absent on stages where the canonical matrix says they do not belong.
- Invalid defaults, unavailable items, missing images, slow hydration, and request failures never trap focus or fabricate a selectable item.
- Localized merchant copy is the name/source of truth; implementation introduces no new hard-coded merchant-facing fallback copy.
- The generic backdrop-driven mobile bottom bar remains out of the in-scope four-preset path.


Successor provenance: inherited unchanged from `fpb-all-template-summary-20260804` revision 2. The successor changes only the fresh browser-evidence coverage and any remediation directly found by that execution.
