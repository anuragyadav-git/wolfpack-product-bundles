---
schema_version: 1
id: fpb-upsell-interaction-contract
title: FPB Upsell Interaction Contract
type: design-interaction-contract
status: approved
summary: Defines activation, placement, busy state, and handoff behavior.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [accessibility]
systems: [fpb-upsell]
source_paths: [app/storefront/app-embed.ts]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/state-matrix.md]
tags: [interaction]
keywords: [handoff]
---

# Interaction Contract

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 1
Artifact status: approved

- Use an anchor for navigation. On activation, prevent duplicate navigation, set `aria-busy=true`, expose disabled semantics, and replace only decorative CTA content with a non-text spinner.
- Capture product and selected variant at activation time. Store the versioned bundle-scoped payload only when preselection is enabled and both exact IDs exist.
- Add source attribution matching the rendered mode. Navigate to the signed app-proxy FPB path.
- On `pageshow`, including back/forward cache restoration, clear busy state and restore CTA content.
- Placement is idempotent. The first visible custom anchor wins; otherwise a bounded observer waits for the primary product form and inserts one anchor after it. `shopify:section:load` may rerun discovery.
- Destination reconciliation consumes stale, malformed, wrong-bundle, unknown, unavailable, gift/add-on-only, or duplicate payloads without changing active step or blocking initialization.
- A successful reconciliation merges quantity one into existing defaults, then invokes the shared side panel and mobile summary renderers.
