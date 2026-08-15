---
schema_version: 1
id: storefront-design-director-chrome-flow-recipes
title: Chrome DevTools Storefront Flow Recipes
type: skill-reference
status: active
summary: Defines reusable non-destructive Chrome DevTools MCP interaction recipes for common storefront components and states.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - browser-qa
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/chrome-flow-recipes.md
related_docs:
  - .agents/skills/storefront-design-director/references/chrome-devtools-test-protocol.md
tags:
  - interaction-recipes
keywords:
  - product-card
  - mobile-tray
  - modal
---

# Chrome DevTools Storefront Flow Recipes

Use these recipes only after preflight passes and the browser plan identifies deterministic fixture data, state setup, assertions, and cleanup. Take a fresh accessibility snapshot before every action, use the current UID, verify semantics before screenshots, and inspect console and network after each mutation. Select every recipe applicable to the approved contract; record a reason for each exclusion.

## Common evidence contract

Every recipe records case ID, viewport, state, precondition, snapshot, before and after screenshots, element and viewport screenshots, semantic result, DOM assertions, geometry assertions, focus result, console result, network result, cleanup, status, and retry history. Quantity, cart, submit, and modal actions must use test data and must not place an order or mutate production.

## Product card

| State or flow | Safe action | Required result and assertions | Evidence and cleanup |
|---|---|---|---|
| Hover | Hover the card or named action | Hover affordance appears without geometry jump; controls remain readable and pointer-only content is not required for use | Before and after element capture; compare geometry; move pointer away |
| Keyboard focus | Tab to every interactive control | Focus order follows DOM order; focus-visible style is not clipped; accessible name and role are correct | Snapshot, focus-visible result, viewport capture; move focus to neutral target |
| Add | Activate add once | Selection changes exactly once; summary and price update once; disabled or loading semantics are truthful | Console and mutation-request count; remove item during cleanup |
| Selected | Load or create selected fixture state | Selected state is exposed semantically and visually without changing unrelated card geometry | Element and contextual viewport capture; restore fixture |
| Quantity increase | Activate increase once | Quantity increments once; totals, limits, labels, and disabled state update consistently | DOM state, network call count, before and after; decrement in cleanup |
| Quantity decrease | Activate decrease once above minimum | Quantity decrements once; minimum behavior matches contract; totals update once | DOM state and request count; restore starting quantity |
| Maximum quantity | Reach deterministic maximum | Increase becomes disabled or constraint feedback appears; value never exceeds maximum | Disabled and ARIA state, console and network; restore quantity |
| Remove | Activate remove from a selected card | Item leaves selection once; summary, totals, and focus destination match contract | Focus restoration, snapshot, screenshots; re-add only if needed for later fixture |
| Variant selection | Open selector and choose another available variant | Name, price, media, selection key, and availability update once without duplicate IDs | Keyboard and pointer path, image status, network; restore variant |
| Unavailable variant | Choose or inspect deterministic unavailable option | Option is disabled or rejects selection with approved feedback; cart state does not mutate | Disabled semantics, feedback, zero mutation calls; restore selector |
| Out of stock | Load deterministic sold-out product | Add is unavailable with approved semantics and no fabricated fallback variant | Accessible state, zero mutation requests, contextual screenshot |
| Details modal | Open details action | Correct product opens; modal semantics, focus, variant, quantity, close, and restoration follow modal recipes | Run modal matrix, then close and restore card focus |

## Summary sidebar

| State or flow | Safe action or setup | Required result and assertions | Evidence and cleanup |
|---|---|---|---|
| Empty | Load empty deterministic selection | Empty semantics and CTA state match contract; no stale totals or rows remain | Element and viewport screenshots; no cleanup |
| Partial | Select fewer than completion requirement | Rows and progress match selected data; CTA is disabled when required | Snapshot, totals and state assertions; clear selection |
| Complete | Satisfy the bundle requirement | Completion, totals, discount, and enabled CTA match data exactly | DOM assertions, screenshot, no submission; clear selection |
| Discount tier reached | Reach a known tier boundary | Correct tier and savings appear once; currency and progress are correct | Before and after boundary captures; remove one item |
| Long list and scroll | Load stress list | Sidebar scrolls in its intended container; no horizontal overflow, clipping, or hidden CTA | Scroll metrics, sticky probe, viewport capture; restore scroll |
| Remove item | Remove one row | Correct row leaves once; focus lands predictably; totals and CTA recalculate | Snapshot, console and network; restore fixture if needed |
| Clear all | Activate clear-all once | All selectable rows clear once; empty state and CTA update; no duplicate calls | Dialog evidence if present, request count; no further cleanup |
| CTA disabled | Load incomplete or invalid state | CTA is truly disabled and cannot submit from pointer or keyboard | Disabled and ARIA state, zero submit request |
| CTA enabled | Load complete valid state | CTA is operable with correct accessible name; do not complete a real order | Focus and activation readiness only, or approved intercepted test action |
| Submit loading or error | Use an approved test hook or non-destructive mocked fixture | Loading prevents duplicate activation; error is announced and recoverable | Trace or interaction evidence, console and network; restore hook and state |

## Mobile tray or footer

| State or flow | Safe action or setup | Required result and assertions | Evidence and cleanup |
|---|---|---|---|
| Collapsed | Load mobile fixture with tray closed | Summary and CTA contract remain reachable; body is not unintentionally hidden | Mobile viewport and element screenshots; body scroll metrics |
| Expanded | Activate toggle | `aria-expanded`, focus destination, overlay geometry, and content state update once | Before and after captures; close tray |
| Focus and keyboard | Tab through toggle and expanded content | Order is logical; focus remains visible; no hidden content receives focus | Interactive-elements list and focus-visible results; close and restore focus |
| Backdrop | Activate approved backdrop target | Tray closes only when contract specifies; focus returns to toggle | Snapshot and ARIA state; reopen only for later cases |
| Long list scroll | Load stress list and scroll tray | Intended tray region scrolls; header or CTA behavior matches contract; body does not become the wrong scroller | Container overflow, sticky probe, screenshots; restore all scroll offsets |
| Safe-area space | Emulate approved mobile viewport | Bottom action clears the safe-area inset and remains visible | Geometry against viewport and footer; no fixed captured pixel assumptions |
| CTA reachability | Load maximum supported content | CTA remains reachable by scroll and keyboard and is not overlapped | Outside-viewport and overlap checks, focus proof |
| Close paths | Use toggle, backdrop, and Escape where specified | Each supported path closes once; unsupported paths do nothing; focus restores | Separate case per path; reset expanded state |
| Body scroll integrity | Exercise collapsed and expanded states | Body remains scrollable or intentionally locked exactly as contracted; lock is released on close | Document scroll metrics before, during, after; restore scroll |

## Steps, tabs, and progress

| State or flow | Safe action or setup | Required result and assertions | Evidence and cleanup |
|---|---|---|---|
| Inactive | Load a non-current step | Inactive semantics and affordance match contract; content is not falsely current | ARIA state and element capture |
| Active | Load current step | Exactly one current or selected step is exposed; associated panel is visible | Duplicate/current-state assertions and contextual capture |
| Completed | Complete prior deterministic step | Completed state and progress update once without losing prior selection | Before and after state, console and network |
| Locked | Load unmet prerequisite | Locked step cannot navigate and exposes disabled or constraint semantics | Keyboard and pointer attempt, zero navigation or mutation |
| Single tier | Load one-tier discount fixture | Progress text and geometry avoid empty segments or misleading thresholds | DOM and geometry assertions |
| Multiple tiers | Load known multi-tier fixture | Tier order, current tier, next threshold, and progress are data-correct | State assertions and viewport capture |
| Progress update | Add or remove one qualifying item | Progress changes once and matches the new total; no unexpected layout shift | Controlled layout-shift evidence, before and after |
| Navigation | Activate next, previous, or named step | Correct panel becomes current; focus and scroll behavior match contract | Fresh snapshots on both states; return to starting step |

## Modal

| State or flow | Safe action | Required result and assertions | Evidence and cleanup |
|---|---|---|---|
| Open | Activate the named trigger | One dialog opens with correct role, name, backdrop, and product context | Before and after viewport screenshots; close in cleanup |
| Focus moved inside | Inspect active element after open | Initial focus lands on the contracted control or dialog heading | Active-element and accessible-name evidence |
| Focus trap | Tab and Shift+Tab through all modal controls | Focus cycles within modal; background controls are not reachable | Interactive-elements order and repeated key evidence |
| Keyboard variant choice | Navigate and activate a variant by keyboard | One variant becomes selected; availability, media, and price update correctly | ARIA state, image status, console and network; restore variant |
| Quantity | Increase and decrease within modal | Quantity limits and totals match product-card contract with one update per action | DOM, request count, and before/after evidence |
| Carousel | Use next, previous, and keyboard controls where present | Active media, control names, disabled ends, and image load state are correct | Image status and screenshots; return to first media |
| Close button | Activate named close control | Dialog closes once and no backdrop remains | Snapshot, DOM existence, focus restoration |
| Escape | Press Escape from an inner control | Dialog closes only when specified; no underlying action fires | Console, snapshot, focus restoration |
| Focus restoration | Inspect active element after every close path | Focus returns to the trigger or the contract's safe successor | Focus-visible result and DOM order evidence |

## Recipe exclusion and failure handling

Mark a recipe not applicable only when the approved state contract excludes it. Record the reason in the browser plan. Infrastructure absence is blocked. A semantic, geometry, accessibility, console, network, or visual defect is failed. Map every product failure to the canonical owner, create measured remediation, preserve attempt history, run the affected fast case, then rerun the complete mandatory matrix.
