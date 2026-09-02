---
schema_version: 1
id: tutorial-library-links-test-spec
title: Tutorial Library Links Test Spec
type: test-spec
status: active
summary: Defines the canonical external tutorial destinations used by merchant-facing help actions in the embedded Admin application.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - merchant-education
systems:
  - only-bundles-admin
source_paths:
  - apps/OnlyBundles-app/app/lib/tutorial-links.ts
  - apps/OnlyBundles-app/tests/unit/lib/tutorial-links.test.ts
related_docs:
  - internal docs/Architecture/Public Website.md
tags:
  - tdd
keywords:
  - tutorial links
---

# Test Spec: Tutorial Library Links

**Spec ID:** tutorial-library-links  **Created:** 2026-09-03

## Purpose

Ensure every merchant-facing tutorial action uses the current Only Bundles
Workers hostname and a published, topic-specific tutorial rather than legacy
videos, partner pages, or fabricated destinations.

## Test Cases

### TutorialLinks

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Open tutorial library | Library destination | Workers `/blogs/` URL | Custom domain changes in one owner later |
| 2 | Open setup tutorials | Every configured topic | HTTPS URL under the canonical tutorial library | No legacy video or company URL |
| 3 | Link contextual rules help | FPB and PPB rule actions | Relevant article section anchors | Avoid generic landing pages |
| 4 | Link feature help | Gifts, subscriptions, analytics | Relevant published tutorial | PPB gifts has a dedicated guide |

## Acceptance Criteria

- [ ] All listed test cases pass
- [ ] Every configured destination resolves in the website static build
- [ ] No tutorial action points to YouTube or the Shopify partner profile
