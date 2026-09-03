---
schema_version: 1
id: foundation-color
title: Semantic Color Foundation
type: design-foundation
status: active
summary: Shared color tokens and contrast contracts for FPB and PPB templates.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - design-system/01-foundations/design-tokens.json
  - design-system/01-foundations/merchant-token-contract.json
related_docs:
  - design-system/01-foundations/accessibility-foundations.md
  - design-system/01-foundations/typography.md
tags:
  - color
  - tokens
  - accessibility
keywords:
  - color
  - contrast
  - token
  - semantic
---

# Color Foundation

## Token Families (active contract)

The following families are now the canonical shared palette contract for FPB and PPB.

- `canvas`, `surface`, `surface-elevated`
- `text.primary`, `text.secondary`, `text.muted`
- `border`, `divider`, `focus`
- `action.primary`, `action.secondary`, `action.destructive`
- `state.success`, `state.warning`, `state.error`, `state.disabled`
- `selection`, `overlay.backdrop`
- `badge`, `toast`, `progress`
- `discount`, `price.original`, `price.discount`, `price.free`
- `included-product`, `bundle-gift`

## Required Contract Fields

Each color token entry in this project must define:

- default/fallback value
- merchant-editable flag
- contrast pair (foreground/background relation)
- disabled / readonly transform
- high-contrast fallback mapping
- motion-safe behavior when used in animated state changes

## Canonical Behavior

- Use semantic names first (`state.success`, `bundle-gift`, etc.).
- Do not use template-local literal hex in adapters.
- Do not model tokens per template as raw copies; template-level values must resolve through the contract stack.
- Disabled and readonly are state-transform overlays, never replacement of semantic intent.
- Error, warning, success, and selection states require explicit non-color cues in component behavior.

## Current Evidence

- `design-system/01-foundations/design-tokens.json` now carries the active semantic base for color families and token behaviors.
- Existing storefront CSS already emits variables under the `--bundle-*` namespace; those should be progressively mapped into this contract in follow-up slices.
- Where evidence is incomplete, entries must remain `pending` and visible in registry gaps.

## Family Matrix

Token families and expected behavior:

- `canvas`:
  - role: page-level app background and outside-frame tone
  - contrast target: `text.primary`
  - disabled transform: reduce contrast by lowering alpha (state-layer transform)
- `surface`:
  - role: cards, panels, summary blocks
  - contrast target: `text.primary`
  - disabled transform: muted chroma with preserved legibility
- `surface-elevated`:
  - role: modal, drawer, and summary overlays
  - contrast target: `text.primary`
- `text.primary`:
  - role: normal content and labels
  - contrast target: `surface`
- `text.secondary`:
  - role: helper/supportive copy and metadata
  - contrast target: `surface`
  - disabled transform: tone down to the disabled baseline
- `text.muted`:
  - role: placeholders, hints, non-critical annotations
  - contrast target: `surface-elevated`
- `border`:
  - role: card borders, section separators, focus outlines when focus is not explicitly shown by motion
- `divider`:
  - role: grid/rule/section partition lines
- `focus`:
  - role: keyboard and assistive focus indication
  - disabled transform: not applicable
- `action.primary`:
  - role: primary CTAs
  - contrast target: `surface` + `text.primary`
- `action.secondary`:
  - role: secondary actions and navigation controls
  - contrast target: `surface-elevated`
- `action.destructive`:
  - role: remove/clear failure states
  - contrast target: `surface`
- `state.success`:
  - role: discount reach, eligible messaging, success toast
  - contrast target: `surface`
- `state.warning`:
  - role: progress warnings and limited-capacity alerts
  - contrast target: `surface`
- `state.error`:
  - role: blocking/recoverable validation and network faults
  - contrast target: `surface`
- `state.disabled`:
  - role: disabled surfaces and controls
  - contrast target: token-local disabled pairing
- `overlay.backdrop`:
  - role: modal/sheet backplates
  - transform: alpha-only fade overlays
- `badge`:
  - role: status and selected/discount markers
- `toast`:
  - role: transient feedback
- `progress`:
  - role: progress track and fill
- `discount`:
  - role: price and tier messaging emphasis
- `price.original`:
  - role: strike or line-through value states
- `price.discount`:
  - role: discounted value emphasis
- `price.free`:
  - role: free states and zero-cost messaging
- `included-product`:
  - role: locked/default selection chips
- `bundle-gift`:
  - role: gift cards, chips, and unlocked incentive state
