---
schema_version: 1
id: storefront-design-director-state-coverage
title: State Coverage Catalog
type: skill-reference
status: active
summary: Defines selectable ecommerce states and the evidence contract required for every applicable state.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - ecommerce
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/state-coverage-catalog.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/state-matrix.md
tags:
  - states
keywords:
  - state-matrix
  - edge-case
---

# State Coverage Catalog

Select applicable states and explicitly mark others not-applicable with reason. Every selected state records trigger, data precondition, visible result, interaction availability, accessibility requirement, desktop behavior, mobile behavior, screenshot requirement, automated assertion, and approval status.

## Universal

Default, hover, focus-visible, pressed, disabled, loading, error, empty, populated, long content, missing image, slow image, high zoom, and reduced motion.

## Product card

Unselected, selected, quantity one, quantity greater than one, maximum quantity, variant required, variant selected, multiple variants, unavailable variant, out of stock, discounted price, compare-at price, free gift, default included, locked step, dimmed, and details modal available.

## Bundle summary, sidebar, or footer

No selections, partial, minimum reached, between tiers, tier reached, final tier reached, discount applied, original and final total, long list, scrollable list, product removed, clear all, CTA disabled, CTA enabled, submitting, submit failure, expanded, and collapsed.

## Tabs, progress, or steps

Inactive, active, completed, locked, included, overflow, one tier, multiple tiers, zero progress, partial progress, and complete progress.

## Modal

Closed, opening, open, variant selection, quantity change, image carousel, out of stock, add success, add error, closing, focus trap, and Escape close.

Include ordinary, boundary, failure, and recovery states. A missing required state blocks handoff and final approval.
