---
schema_version: 1
id: admin-events-removal
title: Admin Updates and FAQs Removal
type: test-spec
status: active
summary: Verifies that the retired Updates and FAQs page and every live Admin navigation entry to it are removed.
last_audited: 2026-09-02
owners:
  - engineering
domains:
  - admin
systems:
  - remix-routes
source_paths:
  - app/routes/app/app.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.dashboard/DashboardResourcesCard.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - navigation
  - route-removal
keywords:
  - updates-faqs
  - app-events
---

# Test Spec: Admin Updates and FAQs Removal

**Spec ID:** admin-events-removal

**Created:** 2026-09-02

## Purpose

Ensure the retired Updates and FAQs page cannot be reached from the embedded Admin app and leaves no page-specific runtime artifacts.

## Test Cases

### Route and navigation removal

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Route module is removed | Inspect the Remix app route path | `app.events.tsx` does not exist | A direct `/app/events` request no longer matches the retired route |
| 2 | App navigation excludes the page | Render the authenticated app shell | No `/app/events` link or `nav.events` label is rendered | Shopify native `s-app-nav` remains the navigation owner |
| 3 | Dashboard excludes page shortcuts | Inspect Dashboard header and resources | No changelog bell, Explore Update item, or `/app/events` navigation remains | Prevents dead merchant actions |
| 4 | Page-only UI artifacts are removed | Inspect page-specific components and styles | No route-only accordion, cart-fix card, or events stylesheet remains | Removes unreachable code rather than retaining compatibility shims |

## Acceptance Criteria

- [x] The `/app/events` route module is absent.
- [x] Shopify Admin navigation has no Updates and FAQs item.
- [x] Dashboard has no action targeting the removed page.
- [x] Page-only UI files are absent.
- [x] Focused tests, typecheck, build, lint, and browser smoke checks pass.
