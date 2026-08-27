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

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 8
Artifact status: complete

## Identity

- Job ID: ppb-bundle-picker-modal-redesign-20260821
- Revision: 8
- Product family: Product Page Bundle (PPB)
- Template or preset: Horizontal Slots and Vertical Slots
- Component: Shared bundle-picker modal and PPB-owned stacked product-details sheet
- Implementation mode: design-director

## Problem and goal

- User-provided problem: The PPB bundle builder modal needs another redesign, should take inspiration from EB, remain fully functional, and be responsive.
- Primary user action: Open a slot, choose or replace products directly or through editable product details, advance through bundle steps, and close/reopen without losing state.
- Design goal: Preserve the approved shared picker while using live EB as the sole visual authority for the Vertical filled row.
- Success signal: Horizontal and Vertical Slots share one responsive picker and stacked details flow with unobscured controls, correct quantity-validation states, stable selection identity, and zero horizontal overflow at all required viewports.

## Scope

- In scope: The approved shared PPB picker/details contract plus the live-EB Vertical filled row: full width, content-derived 64px normal height from 50px media with 5px padding and a 2px border, 60px minimum with no maximum, visible title wrapping, 10px radius, bold 16px identity, no price, and an inline 20px circular-cross Remove visual.
- Out of scope: Product List, Product Grid, FPB, Admin UI, APIs, persistence schemas, cart semantics, and merchant copy changes.
- Merchant-configurable values: Existing global/button/card/price/typography/discount design variables and localized text continue to own visual and copy values.
- Business logic constraints: Preserve pricing, validation, inventory, subscriptions, free gifts, session restoration, and cart behavior. Filled Vertical rows are inert except for their one-unit Remove control; Horizontal replacement remains unchanged.
- Accessibility constraints: Semantic labelled sheets, image-only details activation, visible or visually hidden native-selector labels, top-layer Escape/backdrop/swipe ownership, initial focus, topmost-only Tab containment, exact trigger restoration, and shared document scroll locking.
- Repository-observed ownership: PPB product-page render and modal-state methods, shared drawer-layer manager and variant helpers, and raw product-page CSS. Product List/Grid remain regression surfaces only.

## Evidence and approval

- User facts: PPB only; both modal templates; EB density with Wolfpack branding; cards retain separate variant, details, and Add actions; quantity validation owns modal-card presentation; product details is a second stacked PPB sheet; Product List/Grid are regression-only.
- Screenshot facts: Current WPB at 1280x800 and 390x844 opens at about 356-359px tall, clips the catalog into a shallow scroller, and lets the floating footer obscure lower card actions.
- Repository facts: Only `PDP_MODAL` templates use this picker; Product List/Grid are in-page paths. Existing accepted EB evidence records an 85% viewport picker, fixed controls, catalog-only scrolling, grouped native selectors, maximum-one `Added x1`, and relevant setup/help articles read before the fixture work.
- Assumptions: Existing merchant tokens remain visually authoritative; no new customer-facing copy is introduced.
- Open decisions: None.
- Scope status: Approved.
- Revision reason: The user rejected revision 7's remaining WPB height, overflow, flex, and cursor constraints and required the live EB design alone.
- Approved by and at: Aditya, 2026-08-21 through the explicit exact-EB instruction.
