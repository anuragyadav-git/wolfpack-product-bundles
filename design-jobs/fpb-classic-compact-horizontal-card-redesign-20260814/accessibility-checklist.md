---
schema_version: 1
id: fpb-three-preset-accessibility-checklist
title: FPB Classic Compact Horizontal Accessibility Checklist
type: design-job-artifact
status: complete
summary: Defines accessibility preservation and browser verification for the four-template CSS-only alignment remediation.
last_audited: 2026-09-03
owners:
  - Aditya Awasthi
domains:
  - accessibility
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/shared/components/product-card.js
related_docs:
  - interaction-contract.md
  - browser-test-plan.yaml
tags:
  - fpb
  - accessibility
keywords:
  - focus visible
  - keyboard
---

# Accessibility Checklist

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 4
Artifact status: complete

- [x] Existing native semantics and accessible names are preserved; CSS adds no replacement controls.
- [x] Existing selected, expanded, disabled, invalid, and busy state exposure remains runtime-owned.
- [x] Keyboard-only completion order remains DOM order across all responsive arrangements.
- [x] Contract requires focus-visible styling to remain visible, unclipped, and inside the stable card envelope.
- [x] Selected, sale, unavailable, disabled, and focus states cannot rely on color alone.
- [x] Existing dynamic selection, total, validation, and error announcements remain shared-runtime owned.
- [x] Existing product image alternative-text policy remains unchanged.
- [x] CSS introduces no IDs and cannot create duplicate IDs.
- [x] Long content and 200% zoom remain operable without page-level horizontal overflow.
- [x] No new motion is introduced; existing reduced-motion behavior remains authoritative.
- [x] Automated findings require manual triage and keyboard confirmation in direct Chrome DevTools MCP.

## Known risks, browser evidence, and validation status

- Risk: a new card outline could clip focus. Verify focus ring bounds against the grid cell at all five widths.
- Risk: the contained Compact action could reduce the effective target. Computed hit area must remain at least the existing 44px contract.
- Risk: Horizontal at the 800px boundary may constrain long titles or variant labels. Verify 799/800/801 container widths and 200% zoom.
- Risk: merchant colors can reduce contrast. Record computed foreground/background values and treat any new failure introduced by preset rules as blocking.
- Required evidence: fresh accessibility tree, keyboard-only add/quantity/variant/details flow, exposed disabled state, focus screenshots, and absence of focus clipping for each preset at desktop and mobile.
- Validation status: contract complete; execution occurs after implementation in Chrome QA.
