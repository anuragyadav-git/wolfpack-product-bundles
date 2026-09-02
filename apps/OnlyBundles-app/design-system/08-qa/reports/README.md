---
schema_version: 1
id: design-system-qa-report-governance
title: Design System QA Report Governance
type: qa-document
status: active
summary: Defines the durable evidence required before a template or state can be approved.
last_audited: 2026-08-07
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb
  - ppb
source_paths:
  - design-system/08-qa/browser-test-plan.yaml
related_docs:
  - design-system/08-qa/release-matrix.md
tags:
  - qa
  - reports
keywords:
  - approval
  - browser-evidence
---

# QA Reports

One report is required per release-matrix run. It records template ID, fixture ID, state ID, viewport, widget version, exact JS/CSS asset URLs, console and network results, accessibility assertions, interaction results, screenshot requirement, approver, and approval timestamp.

Screenshots are evidence during investigation but are not committed by default. State registry approval changes require a durable text report that points to the capture location and records measured results.
