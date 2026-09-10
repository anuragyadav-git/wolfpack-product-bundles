---
schema_version: 1
id: bundle-readiness-overlay
title: Bundle Readiness Overlay Test Spec
type: test-spec
status: active
summary: Behavioral coverage for the Shopify-native floating bundle readiness popover and compact trigger.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/bundle-configure/BundleReadinessOverlay.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - readiness
  - popover
keywords:
  - collapsed-trigger
  - checklist
---

# Test Spec: Bundle Readiness Overlay
**Spec ID:** bundle-readiness-overlay  **Created:** 2026-09-09

## Purpose

Preserve the readiness checklist's functional contract while Shopify owns its
contextual overlay behavior and the floating trigger collapses to a usable
score control.

## Test Cases

### BundleReadinessOverlayTrigger
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial trigger | Readiness items are supplied | Score, title, and helper copy are present | Initial expanded context |
| 2 | Timed collapse | Five seconds elapse | Trigger state changes once from contextual to compact | No CSS or placement assertion |
| 3 | Native overlay wiring | Merchant activates the readiness trigger | `commandFor` opens the readiness `s-popover` | Shopify owns placement, focus, Escape, and outside dismissal |
| 4 | Header trigger | Merchant activates either FPB or PPB header readiness action | The same readiness popover opens through `commandFor` | No programmatic page-load opening |
| 5 | Overlay lifecycle | Polaris emits `show`, `hide`, and `afterhide` | Route-owned open state receives one `true` and one `false` transition | The later lifecycle phase must not duplicate cleanup |
| 6 | Remediation action | Merchant activates an incomplete checklist item | Popover closes before the owned remediation callback runs | Completed items remain non-remediating |
| 7 | Checklist content | Readiness items are supplied | Labels, descriptions, points, and readiness status remain available without duplicating the trigger's score gauge inside the popover | Behavior and data flow only |
| 8 | Responsive trigger ownership | Configure page crosses the mobile breakpoint | Desktop uses only the bottom-left gauge; mobile uses only the header readiness action | Guided tour resolves the visible trigger |
| 9 | Guided-tour viewport gate | Configure page loads or resizes below 768px | Guided tour does not start or remain visible | Mobile readiness popover remains independent |
| 10 | Immediate readiness delivery | Configure page renders before deferred dialogs and tours | Readiness trigger and popover are already available | Only genuinely non-critical overlays remain idle-deferred |
| 11 | Header action independence | Merchant activates Readiness and Preview Bundle | Readiness opens the popover and Preview runs the preview handler | Both controls remain direct native actions without a wrapper-owned interaction |
| 12 | Outside interaction over an action | Merchant clicks an underlying Admin action while the readiness popover is open | Polaris dismisses the non-modal popover and the deliberately clicked action activates once | The app does not install a document-level click interceptor |

## Acceptance Criteria

- [x] All listed behavioral tests pass.
- [x] The collapsed and open states are verified in the Agent store with direct Chrome DevTools after a cache-bypassed reload.
