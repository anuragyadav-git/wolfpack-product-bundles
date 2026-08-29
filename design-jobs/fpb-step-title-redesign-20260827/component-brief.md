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

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

## Identity

- Job ID: fpb-step-title-redesign-20260827
- Revision: 2
- Product family: FPB and PPB
- Template or preset: All FPB and PPB storefront templates
- Component: Merchant-configurable storefront Step title
- Implementation mode: design-director

## Problem and goal

- User-provided problem: The Step title configured from the Configure Bundle Flow Step Config card is positioned poorly on the storefront and needs a good redesign.
- Primary user action: Understand the active bundle-building step and continue product selection.
- Design goal: Create a coherent, well-positioned Step-title hierarchy across FPB and PPB without changing configured content or step behavior.
- Success signal: The active Step title reads as the local heading for the current selection area at desktop and mobile sizes without competing with navigation, product content, or summary UI.

## Scope

- In scope: FPB and PPB Step-title hierarchy, placement, wrapping, spacing, responsive behavior, and all applicable template states; exact bundle-UI parity in the Settings > Design isolated production-renderer preview.
- Out of scope: Admin Step Config UI, persistence, translations, product cards, pricing, selection, validation, cart behavior, and the neutral general-store chrome used only as preview context.
- Merchant-configurable values: Existing Step title content and translations remain merchant controlled.
- Business logic constraints: Preserve step identity, active-step state, navigation, validation, selection, and cart semantics.
- Accessibility constraints: Preserve semantic heading order, visible focus behavior where applicable, text zoom, and long-title wrapping.
- Repository-observed ownership: Admin Step Config persists the merchant value as `step.pageTitle`. FPB renders it through the shared full-page content-header path before the two-column layout wrapper; PPB renders it through modal slot headings, in-page section headings, and step-flow navigation.
- Preview ownership: Settings > Design builds deterministic FPB/PPB fixtures and mounts the production controllers with the same base, responsive, and template CSS sources. Step Title parity therefore belongs to the shared storefront renderers and fixture semantics, not to preview-only visual overrides.

## Evidence and approval

- User facts: Design first; include both FPB and PPB; update and verify the Settings > Design bundle preview with no bundle-UI inconsistencies; exclude general store chrome from parity scope.
- Screenshot facts: On FPB desktop, the current title starts about 25 px left of the product-content track and is constrained independently from that track. On FPB mobile, it is centered in a detached band above the product cards. On PPB Vertical Slots, the title aligns with the slot card but remains a small 14 px label; long configured copy reads as a slot caption rather than a clear active-step heading.
- Repository facts: FPB preserves `step.name` for navigation and renders `step.pageTitle` as local content text. PPB commonly resolves `step.pageTitle || step.name`, so the configured title can replace the short step identity in grid/cascade navigation, modal headers, slot headings, and in-page headings. FPB template presets share one content-header owner, with responsive and Standard-specific overrides; PPB templates have separate modal-slot, in-page grid, in-page cascade, and modal-header owners.
- Assumptions: The redesign should use one shared hierarchy with family-specific placement where FPB and PPB structures differ.
- Locked decisions: Step Name remains the short navigation/progress label. Step Title becomes one visually prominent local heading for the active product-selection area.
- Open decisions: Select the preferred evidence-backed visual direction after current-state analysis.
- Scope status: Complete at revision 2. Styling, positioning, and semantic label ownership only; no merchant-data, persistence, navigation mechanics, validation, selection, or cart behavior changes. The isolated Settings > Design preview must inherit the same production-owned result.
- Approved by and at: Aditya Awasthi, 2026-08-27.
