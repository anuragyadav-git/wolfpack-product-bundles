---
schema_version: 1
id: fpb-upsell-accessibility
title: FPB Upsell Accessibility Checklist
type: accessibility-checklist
status: approved
summary: Lists the semantic and keyboard requirements for product-page upsells.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [accessibility]
systems: [fpb-upsell]
source_paths: [app/storefront/app-embed.ts]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/interaction-contract.md]
tags: [accessibility]
keywords: [keyboard]
---

# Accessibility Checklist

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 2
Artifact status: approved

- [x] Contract requires a native link with a merchant-authored accessible name.
- [ ] Keyboard Enter activation matches pointer activation and runs once.
- [ ] Focus-visible is visible on all merchant surfaces.
- [ ] Minimum target height is 44px.
- [ ] Offer image is decorative (`alt=""`).
- [ ] Busy state is exposed with `aria-busy`; repeat activation is blocked.
- [ ] Spinner has no text announcement and no motion under reduced-motion preference.
- [ ] Empty/error states add no focusable shell.
- [ ] Multiple offers follow visual/DOM order.
- [ ] No focus is moved during automatic placement or destination reconciliation.
