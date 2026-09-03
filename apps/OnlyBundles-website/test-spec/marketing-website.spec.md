---
schema_version: 1
id: marketing-website-test-spec
title: Marketing Website and Demo Test Spec
type: test-spec
status: verified
summary: Defines route, demo behavior, release-safety, and HTTP checks for the Only Bundles marketing website.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - website
systems:
  - cloudflare-workers
source_paths:
  - apps/OnlyBundles-website/src/
  - apps/OnlyBundles-website/tests/
related_docs:
  - internal docs/Architecture/Repository Layout.md
tags:
  - tdd
keywords:
  - astro
  - interactive demo
---

# Test Spec: Marketing Website and Demo

**Spec ID:** marketing-website  **Created:** 2026-09-03

## Purpose

Verify the static marketing routes, interactive demo rules, public discovery,
pricing evidence, release gate, and custom not-found response without asserting
visual styling or placement.

## Test Cases

### StaticOutput

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build public pages | Launch route manifest | Every route produces static HTML | No server runtime |
| 2 | Publish metadata | Any indexable route | Title, description, canonical URL, index/follow | Legal placeholders remain noindex |
| 3 | Present product | Home | Both bundle surfaces and verified calls to action | No unsupported claims |
| 4 | Publish pricing | `/pricing/` | Verified Free and Growth values and audit date | Shopify remains current source |
| 5 | Publish discovery files | Robots and sitemap | Public routes discoverable | Legal placeholders excluded |
| 6 | Handle unknown paths | Unknown route | Custom 404 and home recovery | Wrangler owns HTTP 404 |
| 7 | Publish approved media | Product asset URLs | Files exist in static output | Reused application assets |

### DemoState

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parse shareable state | Valid query | Surface, template, scenario, palette selected | Deterministic |
| 2 | Reject incompatible template | PPB with FPB template | Canonical PPB default | No shim |
| 3 | Change surface | FPB to PPB | Incompatible state resets; palette remains | Pure transition |
| 4 | Select products | IDs and quantities | Progress and summary update | Pure transition |
| 5 | Calculate tiers | Three and five items | Example tier applies | Exact arithmetic |
| 6 | Unlock gift | Five items | Gift becomes eligible | No cart mutation |
| 7 | Select add-on and plan | Valid options | Summary reflects both independently | Provider-neutral preview |
| 8 | Preview checkout | Eligible state | Informational result only | No external effect |
| 9 | Reset | Modified state | Canonical default state | Deterministic |

### ReleaseReadiness

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Missing approval | Pending Privacy or Terms | Release check fails | Deployment gate |
| 2 | Approved legal content | Production release | Release check passes without analytics configuration | No visitor analytics enabled |
| 3 | All requirements met | Approved policies and token | Release check passes | Public launch prerequisite |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Astro produces fully static output
- [x] Demo actions never call Shopify or mutate a real cart
- [x] Production deploy is blocked without approved policies and does not require analytics configuration
- [x] No test asserts CSS, class names, or element placement
