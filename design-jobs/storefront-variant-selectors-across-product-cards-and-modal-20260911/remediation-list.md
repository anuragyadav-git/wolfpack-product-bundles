---
schema_version: 1
id: storefront-variant-selectors-remediation-list
title: Storefront Variant Selector Remediation List
type: qa-remediation
status: complete
summary: Records measured FPB and PPB variant-selector visual defects, canonical corrections, and rerun evidence.
last_audited: 2026-09-12
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-widget
source_paths:
  - apps/OnlyBundles-app/app/assets/widgets/full-page-css/shared/responsive-layout.css
  - apps/OnlyBundles-app/app/assets/bundle-modal-component.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page/methods/modal-methods.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page-css/templates/inpage-cascade.css
  - apps/OnlyBundles-app/app/assets/widgets/product-page-css/templates/inpage-grid.css
related_docs:
  - design-jobs/storefront-variant-selectors-across-product-cards-and-modal-20260911/browser-test-report.md
tags:
  - visual-qa
keywords:
  - variant-selectors
  - product-card
---

# Remediation List

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 4
Artifact status: complete

| ID | Gate | Region and state | Expected | Actual | Measured delta | Severity | Canonical owner | Correction | Retest cases | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| VS-R04 | Visual geometry | FPB Standard mixed product cards | Prices share the content origin and baseline below selectors | Shared responsive rule centered price rows, shifting card prices relative to their selector/content origin | 606px: both price origins now equal their card content origins; 1280px: both origins match with 0px delta and equal baselines | Major | `full-page-css/shared/responsive-layout.css` | Remove the cross-template centering override so each template owns price alignment | FPB Standard mixed cards at narrow and desktop widths | Resolved |
| VS-R05 | Visual geometry | FPB product modal with sanitized empty description | Variant controls follow product identity without an empty content region | Empty paragraph markup occupied the description track and created a 232px gap | Header-to-selector gap reduced to 20px at 606px and 1280px; description box is 0x0 | Major | `bundle-modal-component.ts` | Hide descriptions with no text or meaningful media after sanitization | Empty HTML, plain-text, rich-text, narrow modal, desktop modal | Resolved |
| VS-R06 | Visual geometry | PPB Product List with two-dimensional selectors | Size and Color use the full content region above price and Add | The inner selector wrapper spanned columns, but its immediate selector container remained in the 112px action column and forced a 138px stack | Final selector container is 318x65 at 500px and 317x65 at desktop, with two equal columns and zero overflow | Major | `product-page-css/templates/inpage-cascade.css` | Make the selector container, not only its child, span the complete list content grid | Product List at desktop and narrow real-window widths | Resolved |
| VS-R07 | Functional | PPB Product Grid/List sequential Size then Color selection | The second choice resolves from the newly selected first dimension | Replacing the in-page grid removed selector-internal listeners; the remaining Color control was bound to the old Size and resolved `M -> S` | Live hard-reload interaction now resolves `S / Black -> M / Black -> M / Navy`, including Navy media, selected defaults, and unchanged price | Critical | `product-page/methods/modal-methods.ts` | Rebuild the canonical in-page step cards after every delegated option change, matching the modal path | Focused DOM regression plus live Product Grid interaction | Resolved |
| VS-R08 | Responsive geometry | All four PPB templates with a variant and non-variant product | Selector density must not distort adjacent cards or move price/CTA above the selectors | Two-dimensional controls previously stacked or inherited uneven card regions depending on the template | Grid: 205.5x467.3 equal cards and 205.5x71 two-column selector at 500px; List: 318x65 two-column selector; modal templates: equal 209x473.5 cards with aligned price and CTA and no overflow | Major | PPB shared selector and template CSS owners | Use intrinsic selector tracks, stable card regions, and template-specific grid ownership without changing the PPB shells | Product Grid, Product List, Horizontal Slots, Vertical Slots at desktop and narrow real-window widths | Resolved |

## Infrastructure blockers and product failures

- The current resizable Chrome window clamps a requested 390×844 real-window resize to 500×844. Existing FPB evidence includes the required real 390px width; this PPB pass records the narrowest genuine window available, 500×844, without viewport or device emulation. Exact 390px PPB evidence therefore remains a final browser-host gate, not an implementation fallback.

## Approved waivers

| ID | Reason | Risk | Approver | Timestamp | Follow-up |
|---|---|---|---|---|---|

## Retry history

| Case | Attempt | Failure class | Evidence | Fast checks | Full matrix | Result |
|---|---|---|---|---|---|---|
| VS-R04 and VS-R05 | 1 | product | User screenshots and live geometry showed misaligned Standard prices and a 232px empty modal gap | Focused modal behavior test and source-owner inspection | Not run before correction | Failed |
| VS-R04 and VS-R05 | 2 | recovered | Served widget 22.0.1; 606px and 1280px live geometry showed aligned prices, 20px modal gap, and zero overflow | 10/10 focused tests, typecheck, Knip, lint | 3622/3622 tests passed | Passed |
| VS-R06 through VS-R08 | 1 | product | Product List selector was constrained to its action column and sequential in-page option changes could resolve against stale sibling state | Added behavior regression before the rerender fix; inspected canonical CSS grid owners | Product Grid, Product List, Horizontal Slots, Vertical Slots | Failed |
| VS-R06 through VS-R08 | 2 | recovered | Served widget 22.1.0; live Size then Color resolved M / Navy; all four PPB templates reported equal adjacent cards and zero card, dialog, and document overflow | 35/35 focused tests and 3625/3625 full suite | Desktop plus 500×844 narrowest real Chrome window | Passed with exact-390 host gate noted |
