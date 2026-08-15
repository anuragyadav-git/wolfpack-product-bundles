---
schema_version: 1
id: storefront-design-director-component-catalog
title: Ecommerce Component Catalog
type: skill-reference
status: active
summary: Catalogs interactive storefront component slices and their common ownership boundaries.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - ecommerce
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/ecommerce-component-catalog.md
related_docs:
  - .agents/skills/storefront-design-director/references/state-coverage-catalog.md
tags:
  - components
keywords:
  - product-card
  - bundle-builder
---

# Ecommerce Component Catalog

Select only components present in scope. For each, identify rendering owner, state owner, event owner, style owner, merchant token owner, and responsive replacement.

## Product discovery and selection

- Product card: media, badges, title, price, variant summary, quantity, selection action, unavailable state.
- Product list or grid: container, filters, pagination or loading, empty and error feedback.
- Variant selector: option groups, unavailable combinations, current selection, reset and validation.
- Quantity control: decrement, count, increment, limits, disabled and busy states.
- Product details modal: trigger, dialog, media, variants, quantity, submit, close, focus return.

## Bundle composition

- Step or category navigation: current, complete, locked, included, overflow.
- Progress or tier indicator: threshold labels, track, marker, current value, reached state.
- Summary sidebar: selected rows, discounts, totals, remove and clear, CTA, internal scroll.
- Mobile summary tray or footer: collapsed summary, expanded list, fixed CTA, safe area.
- Slot builder: empty slot, filled slot, required slot, gift slot, reorder when applicable.

## Merchandising and feedback

- Promotional banner, discount messaging, free gifts, default-included items, tabs, accordions, primary CTA, inline validation, loading, empty, and error feedback.

Do not create a parallel component only to reproduce presentation. Prefer one semantic tree with responsive reflow or a documented replacement when interaction ownership truly differs.
