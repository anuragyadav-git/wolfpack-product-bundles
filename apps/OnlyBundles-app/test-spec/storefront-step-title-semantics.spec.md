---
schema_version: 1
id: storefront-step-title-semantics
title: Storefront Step Title Semantics Test Spec
type: test-spec
status: active
summary: Verifies that PPB Step Name remains navigation identity while Step Title becomes optional active-content heading text.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb
  - ppb
  - settings-design-preview
source_paths:
  - app/assets/widgets/product-page/methods/step-text-methods.ts
  - app/routes/app/app.settings/storefront-preview-fixtures.ts
related_docs:
  - design-jobs/fpb-step-title-redesign-20260827/implementation-handoff.md
tags:
  - tdd
  - step-title
keywords:
  - pageTitle
  - navigation-label
  - content-heading
---

# Test Spec: Storefront Step Title Semantics
**Spec ID:** storefront-step-title-semantics  **Created:** 2026-08-27

## Purpose

Keep compact Step Name identity separate from merchant-configured Step Title content across PPB production renderers and the Settings Design deterministic fixture.

## Test Cases

### ProductPageStepTextResolver

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Distinct configured values | `name="Choose a base"`, `pageTitle="Choose products for your bundle"` | Navigation label uses name; content title uses pageTitle | Core approved semantic split |
| 2 | Missing name | Empty name at index 1 | Navigation label is `Step 2` | Existing generated identity |
| 3 | Missing title | Non-empty name and blank pageTitle | Content title is empty | No fallback heading or residual gap |
| 4 | Whitespace | Values with surrounding whitespace | Both outputs are trimmed | Prevent layout-only whitespace nodes |
| 5 | Settings preview fixture | Each FPB/PPB template | Step Name and Step Title are both non-empty and distinct | Exercises production preview semantics |

## Acceptance Criteria

- [x] Focused tests fail before the resolver implementation.
- [x] All listed test cases pass after implementation.
- [x] No test asserts CSS, class names, selector order, or visual placement.
