---
schema_version: 1
id: storefront-native-dom-components
title: Storefront Native DOM Components Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for shared storefront renderers that return DOM nodes instead of HTML strings.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
systems:
  - widget-runtime
source_paths:
  - app/assets/widgets/shared/components
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - native-dom
  - tdd
keywords:
  - replaceChildren
  - DocumentFragment
---

# Test Spec: Storefront Native DOM Components
**Spec ID:** storefront-native-dom-components  **Created:** 2026-08-27

## Purpose
Prove shared product, selection, quantity, progress, timeline, toast, and variant renderers expose behavior through native nodes.

## Test Cases
### StorefrontNativeDomComponents
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Create a product card | Hostile product and variant text | Text remains inert and actions retain data and ARIA attributes | No class-name assertion |
| 2 | Operate quantity controls | Decrease and increase actions | The supplied callbacks receive the expected action | Behavior only |
| 3 | Create selected rows and slots | Selected and empty states | Product data and removal actions are preserved | Node output |
| 4 | Create discount progress and timeline | Progress, milestones, and step state | Semantic progress and step state are exposed | CSS custom properties hold validated numbers |
| 5 | Create toast and variant selector | Message and variant choices | Text is inert and change behavior is preserved | No HTML strings |

## Acceptance Criteria
- [x] All listed test cases pass
