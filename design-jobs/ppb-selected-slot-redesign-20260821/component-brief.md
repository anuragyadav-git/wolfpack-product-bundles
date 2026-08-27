---
schema_version: 1
id: storefront-design-director-component-brief-template
title: Component Brief Template
type: design-job-template
status: active
summary: Defines Revision 4 scope for exact EB-reference parity of PPB Vertical Slots empty and filled rows.
last_audited: 2026-08-24
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
Artifact revision: 4
Artifact status: complete

## Identity

- Job ID: ppb-selected-slot-redesign-20260821
- Revision: 4
- Product family: Product Page Bundle
- Template or preset: Vertical Slots
- Component: Empty and filled product slot rows
- Implementation mode: design-director

## Problem and goal

- User-provided problem: Revision 4 must redesign Vertical Slots product slots to copy the observed EB presentation.
- Primary user action: Review a selected product, then replace or remove that exact slot.
- Design goal: Match the live EB Vertical Slots empty and filled row anatomy, hierarchy, and responsive behavior while preserving Wolfpack business semantics and accessibility.
- Success signal: At desktop and mobile, filled rows reproduce the EB hierarchy of 50px media, one bold product-title line, and a trailing remove affordance inside a compact solid-border row; empty rows use the matching compact dashed-border treatment with the saved slot label and add affordance.

## Scope

- In scope: Vertical Slots filled-row and empty-row anatomy, spacing, borders, radius, media, title, remove/add affordances, exact replacement/removal behavior, keyboard/focus requirements, and desktop/mobile responsiveness.
- Out of scope: Horizontal Slots, Product Grid/List cards, picker-card redesign, drawer shell redesign, inline variant or price content, pricing/discount calculations, capacity logic, persistence, cart payloads, Admin settings, public APIs, and FPB visuals.
- Merchant-configurable values: Existing labels, merchant colors, slot numbering, and configured empty-slot icon remain authoritative.
- Business logic constraints: Exact slot replacement and removal targeting; minimum-rule one-ahead capacity; exact-rule capped capacity; restored selections; unchanged quantities, variants, prices, validation, persistence, and cart behavior.
- Accessibility constraints: Every replace/remove action remains keyboard operable with an accessible name; focus styling must be visible; no gesture-only action; selected state cannot rely on color alone; target size remains at least 44px where controls are exposed.
- Repository-observed ownership: Vertical Slots uses the shared PPB modal-slot renderer and its template CSS. The revision remains presentation-only and must not fork selection or picker behavior.

## Evidence and approval

- User facts: The design must be inspired by EB. The wider redesign program requires responsive, content-driven CSS and no overengineering.
- Screenshot facts: Live EB was measured at 1280x800 and 390x844. Filled rows are 64px high with 50px media, 5px padding, a 2px solid border, 10px radius, one bold title line, and a trailing remove icon. Empty rows are 60px high with a 2px dashed border and 10px radius. The Vertical stack remains one column with no horizontal overflow.
- Repository facts: PPB has four templates; Revision 4 targets Vertical Slots only. Exact replacement, removal, persistence, and capacity remain owned by the current shared runtime.
- Assumptions: No new merchant-facing copy or persistent setting is needed.
- Open decisions: None at scope. Exact copy means visual parity with the observed EB row structure, translated through Wolfpack-owned selectors and semantics.
- Scope status: Complete for reference intake.
- Approved by and at: User requested Revision 4 and specified EB as the copy target on 2026-08-24.
