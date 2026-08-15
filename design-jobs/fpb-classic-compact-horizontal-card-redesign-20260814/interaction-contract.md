---
schema_version: 1
id: fpb-three-preset-interaction-contract
title: FPB Classic Compact Horizontal Interaction Contract
type: design-job-artifact
status: complete
summary: Preserves shared FPB shopper interactions while constraining visual feedback to stable preset-owned geometry.
last_audited: 2026-08-14
owners:
  - Aditya Awasthi
domains:
  - interaction-design
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/shared/components/product-card.js
related_docs:
  - state-matrix.md
  - accessibility-checklist.md
tags:
  - fpb
  - interaction
keywords:
  - keyboard
  - focus
---

# Interaction Contract

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 3
Artifact status: complete

| Control ID | Role | Accessible name | Pointer action | Keyboard action | State update | Focus behavior | Disabled or busy | Error recovery | Motion |
|---|---|---|---|---|---|---|---|---|---|
| `product-details-trigger` | Existing details control/card affordance | Existing product-specific name | Opens product details | Enter/Space per existing semantic control | Shared modal/drawer opens | Visible focus; returns to trigger on close | Existing unavailable behavior | Close via existing desktop/mobile paths | No new motion |
| `add` | Existing button | Existing merchant/runtime label plus product context | Selects/adds once | Native Enter/Space | Replaced immediately by quantity controls | Focus remains logical and visible | No activation when disabled | Existing validation and recovery | No geometry or opacity animation |
| `decrement` | Existing button | Existing quantity decrease name with product context | Decreases once | Native Enter/Space | Quantity updates once; may return to add state | Visible inside stable action envelope | Disabled at existing limit if applicable | Existing summary/card state remains synchronized | No geometry animation |
| `increment` | Existing button | Existing quantity increase name with product context | Increases once | Native Enter/Space | Quantity updates once | Visible inside stable action envelope | Disabled at existing maximum | Existing validation remains authoritative | No geometry animation |
| `variant-trigger` | Existing combobox/button | Existing variant label | Opens shared options | Existing keyboard selector flow | Expanded state updates | Focus visible and options reachable | Unavailable options cannot select | Choose available option or dismiss | Existing overlay motion only |
| `variant-option` | Existing option | Variant value | Selects available variant | Existing arrow/Enter/Space behavior | Product price/media/availability update through shared runtime | Focus/active option remains exposed | Unavailable option remains perceivably disabled | Return to available option | No new motion |

## State transitions

- Default → selected: the add control swaps immediately to inline quantity controls inside the same action track. The card, media, text/title, variant, price/action row, and price border boxes must each retain the same x, y, width, and height. The action envelope must retain the same x, y, width, and height even though its contents change.
- Selected quantity changes: only quantity, price/summary values, and existing selected feedback update; no track, border, padding, media-size, component position, or component-size change.
- Hover/focus: feedback uses color, outline, or existing overlay within the card envelope and never raises or expands the card.
- Variant selection: existing runtime owns data and availability. Preset CSS only prevents wrapping or selector geometry from displacing the price/action track.

## Modal and overlay behavior

Product details modal/drawer, variant overlay, backdrop, Escape handling, focus containment/return, scroll lock, and mobile swipe dismissal are frozen shared contracts. The preset slices may not restyle or reimplement them.

## Responsive replacement and reduced motion

The shared desktop summary and mobile tray/drawer remain mutually exclusive at the 800px container boundary and keep one state owner. Card controls do not change semantics between widths. Existing reduced-motion behavior remains; new CSS must not add transitions or keyframes.

## Business-rule invariants

Selection limits, pricing, variants, unavailable state, validation, summary synchronization, and cart flow remain entirely owned by existing runtime code. No JavaScript, DOM, data, API, copy, or persistence change is permitted. One pointer or keyboard activation produces at most one mutation.
