---
schema_version: 1
id: bfs-review-remediation
title: Built for Shopify Review Remediation Test Spec
type: test-spec
status: active
summary: Behavior acceptance criteria for the July 2026 Built for Shopify review remediation.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
  - onboarding
  - storefront
systems:
  - Shopify Admin
  - App Bridge
source_paths:
  - app/routes/app/app._index.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.settings/SettingsRoute.tsx
related_docs:
  - docs/bfs-review-remediation-plan.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - bfs
  - review-remediation
keywords:
  - onboarding
  - app-extensions
  - live-preview
  - save-bar
---

# Test Spec: Built for Shopify Review Remediation
**Spec ID:** bfs-review-remediation  **Created:** 2026-07-29

## Purpose

Prove the behavior behind each reviewer finding without coupling tests to CSS, class names, source order, or screen placement.

## Test Cases

### Onboarding and create handoff
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Product-page choice | Select Product-page | Selection state changes and Continue routes with `bundleType=product_page` | Keyboard activation included |
| 2 | Full-page choice | Select Full-page | Selection state changes and Continue routes with `bundleType=full_page` | Regression for reviewer video |
| 3 | Invalid handoff | Missing or unknown query value | Create route uses its safe default and never submits an invalid bundle type | Pure parser test |

### Theme extension status and preview
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Active embed | `shopify.app.extensions()` reports active `bundle-app-embed` | Homepage and Full-page preview report active | No server fallback |
| 2 | Available embed | Embed is available but inactive | Homepage offers Theme Editor action and preview remains blocked | Lifecycle status remains available; `enabled` is false |
| 3 | Product block placement | Product block is active on the selected product template | Product-page preview proceeds without requiring the body embed | Correct gate |
| 4 | Status refresh | Return from Theme Editor | Status is refreshed before the next preview attempt | No optimistic state |

### Homepage
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Active bundle metric | Dashboard bundle payload contains active and non-active records | Metric counts only active records | Existing payload reused |
| 2 | Extension disclosure | Five extension resources with mixed statuses | All five statuses are represented and understandable | Behavior model test |

### Settings navigation
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Landing stability | Initial render and repeat route entry | One landing model is used consistently | No duplicate owner |
| 2 | Language navigation | Select desktop or mobile language section | Correct language fields become active | Same state model |
| 3 | Dirty navigation cancel | Dirty form, choose another Settings section, cancel | Current section and edits remain | `leaveConfirmation()` behavior |
| 4 | Dirty navigation confirm | Dirty form, choose another Settings section, confirm | Navigation completes and save bar state clears | Includes Cart Messaging → Edit Language |

### Guided tour and live preview
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Narrow viewport placement | 320/390px viewport and edge targets | Tooltip remains fully reachable and scrollable | Pure placement function |
| 2 | Widget mode change | Block ↔ Button | Preview representation changes immediately | No static screenshot dependency |
| 3 | Widget copy edit | Title, description, button text, or image changes | Preview reflects unsaved values immediately | No network request |

## Acceptance Criteria

- [ ] All listed behavior cases pass.
- [ ] Desktop and 390×844 mobile reviewer flows pass after hard reload.
- [ ] No new test asserts CSS, class names, source order, or element placement.
