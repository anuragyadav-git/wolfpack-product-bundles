---
schema_version: 1
id: fpb-upsell-visual-audit
title: FPB Upsell Visual Audit
type: design-visual-audit
status: approved
summary: Records the evidence-backed product-page upsell visual and ownership gaps.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [storefront-design]
systems: [fpb-upsell]
source_paths: [internal docs/EB Implementation Reference.md]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/component-brief.md]
tags: [fpb, upsell]
keywords: [responsive, placement]
---

# Visual Audit

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 1
Artifact status: approved

| ID | Region | Finding | Source | Confidence | Classification |
|---|---|---|---|---|---|
| VA-01 | Offer root | Existing Liquid blocks own static copy and styling instead of saved bundle state. | Repository-observed | High | ownership |
| VA-02 | Placement | Two mode-specific blocks create duplicate placement contracts. | Repository-observed | High | behavioral |
| VA-03 | Block | Image, title, description, and CTA must form one content-driven unit. | User-provided | High | visual |
| VA-04 | Button | CTA-only mode must retain the same runtime, targeting, and busy behavior. | User-provided | High | behavioral |
| VA-05 | Responsive | Available product-column width, not FPB preset, determines horizontal versus stacked layout. | User-provided | High | responsive |
| VA-06 | Empty/error | No storefront shell is visible when zero offers or an API failure occurs. | User-provided | High | state |

No exact pixel claims are approved before post-deploy Chrome evidence. Geometry is token- and content-driven.
