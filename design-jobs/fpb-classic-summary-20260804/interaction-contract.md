---
schema_version: 1
id: fpb-classic-summary-interaction-contract
title: FPB Classic Summary Interaction Contract
type: design-contract
status: complete
summary: Defines pointer, keyboard, focus, state, recovery, announcement, and motion behavior for the Calm Review Panel.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - interaction-design
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
related_docs:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
tags:
  - fpb
  - classic
  - interaction
  - accessibility
keywords:
  - keyboard
  - focus
---

# Interaction Contract

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: complete

| Control ID | Role | Accessible name | Pointer action | Keyboard action | State update | Focus behavior | Disabled or busy | Error recovery | Motion |
|---|---|---|---|---|---|---|---|---|---|
| summary-clear | Native button | Visible “Clear” plus contextual summary purpose when needed. | Opens existing confirmation. | Enter/Space. | No selection changes before confirmation. | Confirmation receives initial focus; cancel/close returns to Clear. | Hidden when empty; never visually disabled without a reason. | Cancel preserves state; confirm clears exactly once. | Dialog transition is nonessential and removed under reduced motion. |
| row-remove | Native button per removable line | Existing product-specific removal label, including variant identity when needed. | Removes the selected identity once. | Enter/Space. | Recomputes count, progress, totals, CTA, and slots. | Move focus to the next row remove, previous row remove, Clear, or mobile toggle in that order. | `aria-disabled` and perceivable blocked reason for default/cross-step items; activation does nothing. | Product can be re-added through the normal picker; blocked removal explains the correct step. | Row removal may fade/reflow briefly; no focus-moving animation. |
| box-tier-option | Existing native control | Tier title plus subtext/requirement. | Selects existing box tier. | Native activation and arrow behavior if the current component already implements a grouped control. | Uses existing selected quantity and validation state. | Focus remains on the selected option. | Unavailable options expose disabled state and reason. | Shopper can choose another available tier. | Selection feedback is immediate; no geometry-dependent motion. |
| desktop-back | Native button when a prior step exists | Existing localized Back label. | Navigates one step back. | Enter/Space. | Preserves selections according to existing FPB rules. | New step heading or prior focused task target receives focus only if current behavior already moves it; otherwise retain logical document position. | Busy guard prevents duplicate navigation. | Failure leaves step and selections unchanged with feedback. | Existing step transition; reduced motion removes nonessential animation. |
| desktop-primary | Native button | Existing localized Next or Add to Cart label; tier subtext may supplement but not replace it. | Advances or submits exactly once. | Enter/Space. | Existing conditions, box validation, current step, pricing, and cart logic decide result. | Busy state retains focus; success follows existing cart/step focus behavior; validation focuses or associates the first recoverable reason. | Native disabled when no activation is allowed; `aria-busy` while submitting; label does not disappear behind spinner. | Validation keeps shopper in place; submit failure re-enables action and exposes retry-safe feedback. | Busy transition is immediate; spinner respects reduced motion. |
| mobile-disclosure | One native button | “Review your bundle” or equivalent localized purpose, with count exposed separately from the name. | Toggles the same tray between collapsed and expanded. | Enter/Space; Escape collapses only when focus is inside the expanded tray and no nested modal is active. | Updates `aria-expanded`; `aria-controls` identifies expanded content. | Focus remains on toggle when opening/closing; no automatic focus steal. | Never disabled solely because selection is empty. | Toggle remains available after render or content errors. | Chevron/tray transition at most the approved motion duration; state is immediate; reduced motion uses effectively zero duration. |
| mobile-clear | Native button in expanded header | Visible “Clear” and summary context. | Same confirmation path as desktop. | Enter/Space. | Same selection state owner. | Same confirmation and return behavior; tray expansion is preserved until clear completes. | Hidden when empty. | Cancel preserves tray and selections. | Same as desktop Clear. |
| mobile-primary | Native button | Existing localized Next or Add to Cart label plus displayed total as adjacent text, not a replacement name. | Advances/submits once. | Enter/Space. | Shares desktop validator, pricing, and cart state. | Remains reachable outside list scroll; busy retains focus. | Same disabled/busy semantics as desktop. | Expanded tray exposes the nearest recovery reason; submission failure is retry-safe. | No bar-height animation when enabled state changes. |
| clear-confirm-cancel | Native dialog button | Existing localized cancel label. | Closes without mutation. | Enter/Space; Escape has same outcome. | None. | Returns focus to invoking Clear control. | Available while dialog is active unless a confirm request is busy. | Always safe. | Reduced motion removes dialog transition. |
| clear-confirm | Native dialog button | Existing localized destructive confirmation label. | Clears once and closes. | Enter/Space. | Clears removable selections through existing owner. | Returns focus to a logical empty-summary control or product selection start. | Busy prevents duplicate confirmation. | Failure preserves state and leaves/reopens actionable feedback. | No celebratory or distracting motion. |

## State transitions

- Add product: selection state mutates once → row/slot appears → count, progress, total, and CTA recompute from the same snapshot → one concise polite announcement is queued.
- Remove product: permission checked before mutation → selected identity removed once → all derived summary values recompute → focus is repaired deterministically.
- Quantity change: enforce existing minimum/maximum before mutation → update row and total once → announce the resulting quantity and total, not every intermediate DOM change.
- Tier reached: existing pricing selector updates progress/savings → announce the newly reached tier or final saving once.
- CTA validation failure: retain selections and location → expose the existing recovery message adjacent or programmatically associated with the action → move focus only when the error would otherwise be missed.
- Submit: set busy atomically → ignore duplicate activation → on success follow existing navigation/cart behavior → on failure clear busy, preserve state, and expose retry feedback.
- Resize across 1024px: share the same state owner; expose only one summary representation; preserve expanded state when moving within tray widths, and collapse safely when moving to desktop.

## Modal and overlay behavior

- Direction A adds no summary overlay or backdrop. The mobile tray remains a nonmodal sticky disclosure and must not lock page scroll.
- The existing Clear confirmation remains the only scoped dialog. It requires a named close/cancel path, initial focus on the least destructive appropriate action, focus containment, Escape cancellation, background inertness while open, and focus return.
- Product quick-look/modal behavior is outside scope and must not be altered.

## Responsive replacement and reduced motion

- Desktop sidebar and mobile/tablet tray share business state but are mutually exclusive in accessibility and visual trees at the available-width boundary.
- Mobile disclosure owns `aria-expanded` and `aria-controls`; expanded content has a stable target ID. Hidden replacement content is neither focusable nor announced.
- Safe-area padding belongs to the persistent action edge. Virtual-keyboard appearance must keep the focused control and recovery message reachable.
- Motion tokens cover tray expansion, chevron rotation, row feedback, and busy indicators. With `prefers-reduced-motion: reduce`, transition/animation duration becomes effectively zero while state, focus, and announcements remain intact.

## Business-rule invariants

- Do not change selection keys, variant IDs, quantities, pricing calculations, discount qualification, box validation, inventory filtering, current-step removal rules, default products, add-ons/free gifts, cart properties, or cart submission format.
- Do not infer enabled/disabled presentation from color. Use the existing validator and native/ARIA state.
- Do not create a second event path for the target visual hierarchy. Existing side-panel and mobile handlers remain canonical.
- All merchant-configured copy and colors remain sourced from the existing text and design-setting contracts. No hardcoded replacement marketing copy enters runtime code.
