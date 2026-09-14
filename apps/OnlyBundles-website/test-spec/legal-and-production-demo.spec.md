---
schema_version: 1
id: legal-and-production-demo-test-spec
title: Legal Pages and Production Demo Test Spec
type: test-spec
status: active
summary: Defines truthful legal-page and production-renderer demo behavior for the Only Bundles public website.
last_audited: 2026-09-07
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
| 6 | Resize browser viewport | Desktop width or actual 390x844 Chrome window | The directly mounted renderer follows its production responsive rules | No device frame, iframe, scaling, or manual viewport mode |
| 7 | Load a desktop viewport | Browser wider than the production mobile breakpoint | Storefront components use the desktop placement served by the widget styles | Demo wrapper does not override widget layout |
| 8 | Load a mobile viewport | Actual 390x844 Chrome window | Storefront components use the mobile placement served by the widget styles | Demo wrapper does not override widget layout |
| 9 | View a tall desktop fixture | Production renderer exceeds the demo surface height | The direct renderer scrolls inside a bounded desktop surface without scaling | Mobile returns to natural document flow |
| 10 | Initialize or switch template | Production stylesheet manifest | Every required stylesheet loads before controller render and ready status | Matches Settings Design preview ordering |

## Acceptance Criteria

- [x] Legal pages disclose verified application behavior and business identity.
- [x] Legal pages are public and included in the sitemap.
- [x] Demo uses production controllers, fixtures, and stylesheet owners.
- [x] Demo does not implement separate pricing or selection arithmetic.
- [x] Demo has one directly mounted storefront surface and no device-frame controls.
- [x] Tall desktop fixtures remain usable without expanding the marketing page to their full height.
- [x] All eight templates match production component placement at desktop and an actual mobile-breakpoint browser width.
- [ ] Browser QA passes on desktop and an actual 390×844 Chrome window.

The 2026-09-07 follow-up RCA invalidated the earlier visual pass: the website
mount omitted the production `bundle-widget-container` and
`bundle-widget-full-page` classes, so the FPB `fpb-shell` and `fpb-catalog`
container-query rules never matched. Stylesheet loading was also not awaited.
The implementation now mirrors the Settings Design preview mount and load
ordering. Post-fix direct Chrome QA at 1440x900 passed all eight templates with
the correct template identifiers, initialized controllers, no console errors,
no XHR or fetch requests, and no horizontal overflow. Standard FPB now uses the
production three-column grid at the measured 1,122 px mount width, with 230 px
cards instead of the broken 644 px single-column cards.

The 2026-09-07 retry reached Chrome's actual 500x844 minimum window at DPR 1
and 100% zoom. This activates the production mobile path below the 520 px demo
breakpoint. All eight templates initialized with loaded images, natural document
flow, no horizontal overflow, no console warnings or errors, and no XHR or fetch
requests. Measured mobile cards were 180 px in Standard's two-column grid and
132 px in Product Grid's two-column grid; Classic and Horizontal used their
production single-column mobile layouts. The FPB summary opened as a modal
dialog, locked body scrolling, closed with Escape, and restored focus to its
toggle. Chrome still clamps a requested 390x844 window to 500 px wide, so the
exact required 390 px evidence remains blocked rather than emulated.
