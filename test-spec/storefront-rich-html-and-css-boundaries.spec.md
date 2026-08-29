---
schema_version: 1
id: storefront-rich-html-and-css-boundaries
title: Storefront Rich HTML and CSS Boundaries Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for sanitized rich HTML, same-origin theme sections, message segments, and managed styles.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
systems:
  - widget-runtime
source_paths:
  - app/assets/widgets/shared
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - security
  - tdd
keywords:
  - DOMPurify
  - sanitization
---

# Test Spec: Storefront Rich HTML and CSS Boundaries
**Spec ID:** storefront-rich-html-and-css-boundaries  **Created:** 2026-08-27

## Purpose
Prove that the only rich-HTML and runtime-style boundaries preserve approved content while rejecting executable markup and stale styles.

## Test Cases
### StorefrontRichHtmlAndCssBoundaries
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Sanitize a product description | Formatting plus scripts, handlers, forms, styles, and unsafe URLs | Approved formatting remains and executable content is absent | Fragment output only |
| 2 | Sanitize a review badge | Badge markup plus embedded content and unsafe URLs | Narrow badge markup remains inert | Fragment output only |
| 3 | Render a merchant message | Hostile template and variable text plus known discount segments | Merchant content is text; only owned spans are elements | No HTML flag |
| 4 | Replace a managed style | Valid CSS, replacement CSS, then blank CSS | One keyed style is updated and then removed | Caller cannot create duplicates |
| 5 | Parse a theme section | Same-origin successful HTML response and required selector | A detached validated element is returned | Invalid response or selector fails closed |

## Acceptance Criteria
- [x] All listed test cases pass
