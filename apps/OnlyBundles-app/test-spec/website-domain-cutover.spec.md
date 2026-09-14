---
schema_version: 1
id: website-domain-cutover-test-spec
title: Website Domain Cutover Test Spec
type: test-spec
status: active
summary: Verifies merchant documentation destinations use the Only Bundles domain.
last_audited: 2026-09-14
owners: [engineering]
domains: [website]
systems: [only-bundles]
source_paths: [apps/OnlyBundles-app/app/lib/tutorial-links.ts, apps/OnlyBundles-app/app/lib/app-brand.ts]
related_docs: [internal docs/Architecture/Public Website.md]
tags: [testing]
keywords: [domain, tutorials]
---

# Test Spec: Website Domain Cutover
**Spec ID:** website-domain-cutover **Created:** 2026-09-14

## Purpose
Use https://onlybundles.com for merchant documentation while preserving paths and section anchors.

## Test Cases
### Only Bundles tutorial links
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Tutorial library | Library constant | New domain with /blogs/ | |
| 2 | Topic destinations | All tutorial links | New domain with existing paths and anchors | |
| 3 | SDK destination | SDK constant | New domain with /developers/sdk/ | |

| 4 | Brand website | APP_BRAND.links | New domain; Shopify installation listing unchanged | |
| 5 | Dashboard SDK action | Render resources card | Link opens new-domain SDK guide | |

## Acceptance Criteria
- [x] All listed test cases pass
