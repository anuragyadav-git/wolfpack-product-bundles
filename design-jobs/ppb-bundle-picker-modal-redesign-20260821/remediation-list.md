---
schema_version: 1
id: ppb-bundle-picker-modal-redesign-remediation
title: PPB Bundle Picker Modal Remediation List
type: remediation-list
status: active
summary: Records resolved predecessor findings and the revision-5 filled-slot redesign awaiting implementation and Chrome rerun.
last_audited: 2026-08-21
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - ppb-product-page-widget
source_paths:
  - app/assets/widgets/product-page
related_docs:
  - design-jobs/ppb-bundle-picker-modal-redesign-20260821/browser-test-report.md
tags:
  - ppb
  - remediation
keywords:
  - chrome-qa
  - resolved-findings
---

# Remediation List

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 5
Artifact status: draft

| ID | Finding | Canonical owner | Rerun evidence | Status |
|---|---|---|---|---|
| QA-R2-1 | Picker did not remain at 85dvh | PPB bottom-sheet CSS | all four templates at five viewports | resolved |
| QA-R2-2 | Existing-selection details action showed Add copy | PPB details localization/rendering | desktop and mobile Update flow | resolved |
| QA-R2-3 | Remove-all could leave no empty opener | PPB slot rendering | remove-all, reopen, and session restore | resolved |
| QA-R2-4 | Chrome path write rejected direct screenshot persistence | QA evidence adapter | direct Chrome bytes persisted as sanitized PNGs; no alternate browser | resolved |
| QA-R2-5 | Complete deterministic state matrix was unavailable | tab-local non-mutating response adapters | full template/state matrix | resolved |
| QA-R3-1 | Quantity controls were narrower than Add | PPB modal CSS | equal 204x44 desktop and 143x44 mobile | resolved |
| QA-R3-2 | Card entrance produced synthetic layout shift | PPB modal CSS | trusted-click CLS 0.00, INP 37 ms | resolved |
| QA-R3-3 | Closing from the close button could hide focused content | PPB modal state owner | red/green focus-order test and clean Chrome console retest | resolved |
| QA-R4-1 | Rigid footer-summary tracks displaced the count and left unused width | PPB bottom-sheet CSS | hard-reloaded five-viewport matrix plus long count/price stress | resolved |
| QA-R5-1 | Filled slots clamp long product names and use an overlaid icon-only removal control | PPB selected-slot rendering and modal-slots CSS | Horizontal/Vertical five-viewport long-title removal matrix | pending implementation |

Revision-5 remediation remains open until implementation and direct Chrome reruns pass. The repository-wide pre-existing typecheck backlog remains an external release-baseline issue, not a waived PPB defect.
