---
schema_version: 1
id: fpb-three-preset-state-matrix
title: FPB Classic Compact Horizontal State Matrix
type: design-job-artifact
status: complete
summary: Defines shopper-state visual stability and evidence requirements for the three FPB card presets.
last_audited: 2026-08-14
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/shared/components/product-card.js
related_docs:
  - component-anatomy.md
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - fpb
  - states
keywords:
  - selection
  - layout stability
---

# State Matrix

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 1
Artifact status: complete

| State ID | Trigger | Data precondition | Visible result | Available interaction | Accessibility | Desktop | Mobile | Screenshot | Automated assertion | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| default | Initial populated render | Available simple product | Media, title, price, and add action inside preset frame | Details and add | Existing names and semantics remain exposed | Required | Required | Before each preset | Card bounds, grid count, no overflow | CL-A/CO-A/HO-A |
| hover-focus | Pointer hover or keyboard focus | Interactive card/action | Non-expanding affordance and visible focus; magnifier remains pointer-only | Details/add/variant/quantity as applicable | Focus visible and not color-only | Required | Focus required; hover N/A on touch | Required | Card height delta 0; focus not clipped | CL-A/CO-A/HO-A |
| selected-quantity | Add product, then increment | Selectable product | Add swaps immediately to inline quantity controls within same row | Decrement/increment/remove | Unique control names and exposed disabled limits | Required | Required | Before and after selection | Card and row height delta 0; exactly one state update per action | CL-A/CO-A/HO-A |
| sale-price | Render discounted product | Compare-at price greater than current price | Current and strike price remain readable without displacing action | Same as default | Meaning not conveyed by color alone | Required | Required | Required | Price/action stay inside card bounds | CL-A/CO-A/HO-A |
| long-title | Render long merchant title | Title wraps beyond one line | Title uses reserved readable track; no card-row instability | Same as default | Full accessible name remains available | Required | Required | Required | No overlap, clipping, or horizontal overflow | CL-A/CO-A/HO-A |
| mixed-media | Render portrait and landscape media in same row | Different source aspect ratios | Images remain contained in equal media envelopes | Details/add | Existing alt policy unchanged | Required | Required | Required | Equal row heights and consistent media bounds | CL-A/CO-A/HO-A |
| variant | Open selector and choose variant | Grouped product with multiple variants | Selector fits reserved content track; selected label updates | Open, navigate, select | Existing expanded, selected, and disabled states exposed | Required | Required | Open and selected | No card growth after selection; no clipped options | CL-A/CO-A/HO-A |
| unavailable | Choose unavailable variant or product | Unavailable inventory state | Existing unavailable treatment stays legible within frame | Recovery via available option/details as existing | Unavailability is perceivable beyond color | Required | Required | Required | No enabled add action for unavailable state | CL-A/CO-A/HO-A |
| disabled | Reach business-rule/control limit | Existing runtime disables action | Disabled control retains stable geometry | No activation; recovery remains available where existing | Native/ARIA disabled state exposed | Required | Required | Required | Pointer and keyboard do not mutate quantity | CL-A/CO-A/HO-A |

## Not applicable

| Catalog state | Reason |
|---|---|
| Loading, error, empty, slow image | Product loading and failure presentation are shared runtime concerns and outside this CSS-only card slice; regression-check only. |
| Pressed animation | No new motion or pressed geometry is introduced; native/shared control feedback remains authoritative. |
| Maximum quantity | Covered by `disabled` using the existing business-rule limit. |
| Free gift, default included, locked step, dimmed | No fixture requirement or presentation change is authorized; existing behavior is regression-only under C01-C15. |
| Summary, progress, modal, and drawer catalog states | These shared components are frozen and receive smoke regression only. |
| High zoom and reduced motion | Covered in responsive and accessibility contracts rather than a new visual state. |

## Coverage

- Required: 9 plan states across Classic, Compact, and Horizontal at desktop and mobile.
- Covered: 9.
- Missing: 0.
- Status: complete; C01-C15 remains the behavioral ledger and this artifact does not replace it.
