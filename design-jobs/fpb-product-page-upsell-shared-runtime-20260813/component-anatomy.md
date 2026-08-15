---
schema_version: 1
id: fpb-upsell-anatomy
title: FPB Upsell Component Anatomy
type: design-component-anatomy
status: approved
summary: Assigns one owner to every FPB upsell region and interaction.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [storefront-design]
systems: [fpb-upsell]
source_paths: [app/storefront/app-embed.ts, app/assets/widgets/full-page]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/locked-decisions.yaml]
tags: [fpb]
keywords: [ownership]
---

# Component Anatomy

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 1
Artifact status: approved

| Region | Render owner | State/event owner | Style owner | Responsive owner |
|---|---|---|---|---|
| Product context | App-embed Liquid marker | Product page/theme variant source | none | theme |
| Offer list | Shared app-embed upsell module | Signed FPB offer DTO | Shared upsell CSS | offer container |
| Offer image/copy | Shared renderer | DTO/localized copy | Shared upsell CSS and design variables | container query |
| CTA | Shared renderer | busy/handoff/navigation controller | Shared upsell CSS | container query |
| Custom anchor | bundle-upsell Liquid block | none | no presentation | theme placement |
| Default anchor | Shared renderer | bounded observer and section-load retry | no presentation | product form |
| Destination selection | Shared FPB controller method | selectedProducts | existing shared sidebar/mobile summary | existing summary mode |

No FPB preset owns any upsell or handoff branch.
