---
schema_version: 1
id: fpb-upsell-acceptance
title: FPB Upsell Acceptance Criteria
type: acceptance-criteria
status: approved
summary: Defines functional, responsive, accessibility, and lifecycle acceptance for FPB upsells.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [engineering]
systems: [fpb-upsell]
source_paths: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/state-matrix.md]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/implementation-handoff.md]
tags: [acceptance]
keywords: [fpb]
---

# Acceptance Criteria

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 1
Artifact status: approved

- [ ] Save boundary normalizes direct fields and compact config atomically and rejects invalid enabled configuration.
- [ ] Signed API returns only eligible same-shop active/unlisted FPBs, localized, deduplicated, and ordered.
- [ ] App embed renders zero shell on empty/error and all matching Button/Block offers otherwise.
- [ ] First visible custom anchor wins; automatic placement is bounded and idempotent.
- [ ] Click captures the current exact variant, writes a ten-minute one-shot bundle-scoped handoff, and restores busy state on pageshow.
- [ ] Shared FPB controller selects only an exact available variant in the first enabled paid step, merges defaults, and refreshes both shared summaries.
- [ ] No FPB preset-specific logic or PPB behavior change is introduced.
- [ ] One bundle-upsell block replaces both obsolete handles; version is 11.0.0.
- [ ] Desktop/mobile and constrained-column behavior follow responsive and accessibility contracts.
- [ ] Required local tests/builds/checks pass; deployment and live Chrome verification remain stopped pending manual SIT deploy.
