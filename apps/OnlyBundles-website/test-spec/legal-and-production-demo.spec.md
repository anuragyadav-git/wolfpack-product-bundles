---
schema_version: 1
id: legal-and-production-demo-test-spec
title: Legal Pages and Production Demo Test Spec
type: test-spec
status: active
summary: Defines truthful legal-page and production-renderer demo behavior for the Only Bundles public website.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - website
systems:
  - astro
  - widget-runtime
source_paths:
  - apps/OnlyBundles-website/src/pages/privacy.astro
  - apps/OnlyBundles-website/src/pages/terms.astro
  - apps/OnlyBundles-website/src/components/DemoExperience.astro
related_docs:
  - internal docs/Architecture/Public Website.md
tags:
  - tdd
keywords:
  - privacy
  - production widget demo
---

# Test Spec: Legal Pages and Production Demo

**Spec ID:** legal-and-production-demo  **Created:** 2026-09-03

## Purpose

Verify that the public legal pages disclose Only Bundles' actual Shopify-app
data flows and that the demo delegates shopper UI to the production FPB and PPB
renderers without enabling network, analytics, persistence, navigation, or cart
side effects.

## Test Cases

### LegalOutput

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Identify provider | Privacy and Terms | Only Bundles, Delhi, India, and verified support email | User-confirmed facts |
| 2 | Explain app privacy roles | Privacy | Merchant-controller and Only Bundles processor/controller roles | No blanket role claim |
| 3 | Disclose app data | Privacy | Merchant, staff, storefront, order attribution, support, logs, and website analytics | Matches repository and listing |
| 4 | Explain rights | Privacy | Global request process plus major regional rights | Subject to applicable law |
| 5 | Explain service contract | Terms | Shopify dependency, billing, acceptable use, IP, termination, warranties, liability, and India law | No invented guarantee |
| 6 | Publish legal routes | Privacy and Terms | Index/follow metadata and sitemap membership | Policies approved by user-supplied facts |

### ProductionWidgetDemo

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Select FPB template | Four FPB controls | Actual production FPB controller and styles render | No handcrafted card renderer |
| 2 | Select PPB template | Four PPB controls | Actual production PPB controller and styles render | Same template identifiers as app |
| 3 | Interact with products | Production renderer controls | Production selection and validation behavior runs | Deterministic Shopify-shaped fixture |
| 4 | Attempt purchase/navigation | Demo action | Side effect is prevented and explained | No real store or cart |
| 5 | Load demo | Browser network | No Shopify/app-proxy/analytics request | Static assets only |

## Acceptance Criteria

- [x] Legal pages disclose verified application behavior and business identity.
- [x] Legal pages are public and included in the sitemap.
- [x] Demo uses production controllers, fixtures, and stylesheet owners.
- [x] Demo does not implement separate pricing or selection arithmetic.
- [ ] Browser QA passes on desktop and an actual 390×844 Chrome window.

Desktop and a real 500×844 Chrome window pass with no horizontal overflow. The
direct Chrome DevTools resize operation currently stops at a 500 px window
width, so the required 390×844 evidence remains blocked rather than emulated.
