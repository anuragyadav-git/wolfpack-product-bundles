---
schema_version: 1
id: storefront-design-director-component-brief-template
title: Component Brief Template
type: design-job-template
status: active
summary: Captures the problem, scope, constraints, and success criteria for one storefront component design job.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/component-brief.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - template
keywords:
  - scope
  - component-brief
---

# Component Brief

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 2
Artifact status: complete

## Identity

- Job ID: ppb-selected-slot-redesign-20260821
- Revision: 1
- Product family: Product Page Bundle
- Template or preset: Horizontal Slots and Vertical Slots
- Component: Selected product slot
- Implementation mode: design-director

## Problem and goal

- User-provided problem: The selected state of PPB product slots should be redesigned.
- Primary user action: Review a selected product, then replace or remove that exact slot.
- Design goal: Produce an EB-inspired, product-led selected-slot contract that is compact, responsive, visually stable, and shared across both slot templates.
- Success signal: Selected slots are immediately legible, preserve exact targeting and capacity behavior, remain equal in geometry to their empty counterparts, and pass the required responsive Chrome matrix after implementation.

## Scope

- In scope: Filled-slot anatomy, hierarchy, selected emphasis, image/title/variant/price metadata decision, remove and replace affordances, horizontal and vertical transformations, focus and keyboard states, empty/selected geometry parity, and stress-content behavior.
- Out of scope: Product Grid/List cards, picker-card redesign, drawer shell redesign, pricing/discount calculations, selection capacity logic, persistence, cart payloads, Admin settings, public APIs, and FPB visuals.
- Merchant-configurable values: Existing labels, merchant colors, slot numbering, and configured empty-slot icon remain authoritative.
- Business logic constraints: Exact slot replacement and removal targeting; minimum-rule one-ahead capacity; exact-rule capped capacity; restored selections; unchanged quantities, variants, prices, validation, persistence, and cart behavior.
- Accessibility constraints: Every replace/remove action remains keyboard operable with an accessible name; focus styling must be visible; no gesture-only action; selected state cannot rely on color alone; target size remains at least 44px where controls are exposed.
- Repository-observed ownership: Horizontal and Vertical Slots share the PPB bottom-sheet picker runtime. Orientation changes presentation only; filled and empty slots reserve equal geometry. Production ownership will be mapped after reference approval.

## Evidence and approval

- User facts: The design must be inspired by EB. The wider redesign program requires responsive, content-driven CSS and no overengineering.
- Screenshot facts: None captured for this job yet.
- Repository facts: PPB has four templates; this job targets Horizontal Slots and Vertical Slots. Existing architecture requires shared runtime behavior, exact replacement targeting, responsive equal-height tiles/rows, and unchanged persistence/capacity rules.
- Assumptions: No new merchant-facing copy or persistent setting is needed.
- Open decisions: Evidence must determine the appropriate information density for horizontal tiles versus vertical rows.
- Scope status: Complete for reference intake; visual direction remains unapproved.
- Approved by and at: Scope authorized by the user on 2026-08-21; design direction not yet approved.
