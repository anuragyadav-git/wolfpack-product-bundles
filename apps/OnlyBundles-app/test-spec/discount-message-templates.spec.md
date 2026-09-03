---
schema_version: 1
id: discount-message-templates
title: Discount Message Templates
type: test-spec
status: active
summary: Verifies that every supported discount method has explicit rule and success message templates.
last_audited: 2026-08-13
owners:
  - Wolfpack Bundles
domains:
  - pricing
systems:
  - admin-ui
source_paths:
  - app/lib/pricing-display-options.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - discount-messaging
keywords:
  - discount-message-templates
---

# Test Spec: Discount Message Templates

**Spec ID:** discount-message-templates
**Created:** 2026-08-13

## Purpose

Ensure every supported discount method has explicit default templates for its first rule, additional rules, and success message.

## Test Cases

### DiscountMessageTemplates

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Template coverage | All `DiscountMethod` values | One explicit template entry per method | Prevents implicit fallthrough |
| 2 | Fixed bundle price defaults | First and later rules | Copy describes a bundle price, not savings | Uses currency unit before value |
| 3 | Existing method defaults | Percentage, fixed amount, Buy X/Get Y | Existing merchant-facing copy remains unchanged | Regression coverage |

## Acceptance Criteria

- [x] Every discount method has an explicit template entry.
- [x] Fixed Bundle Price uses price-specific rule and success copy.
- [x] Existing discount method templates remain unchanged.
