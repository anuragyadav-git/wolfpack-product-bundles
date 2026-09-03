---
schema_version: 1
id: fpb-category-title-deduplication
title: FPB Category Title Deduplication Test Spec
type: test-spec
status: active
summary: Verifies that FPB category tabs and the standalone active-category label never render the same category simultaneously.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-widget
  - settings-design-preview
source_paths:
  - app/assets/widgets/full-page/methods/responsive-layout-methods.ts
  - app/assets/widgets/full-page/methods/validation-addons-methods.ts
  - tests/unit/assets/fpb-category-title-deduplication.test.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - storefront
keywords:
  - category-tabs
  - active-category-title
---

# Test Spec: FPB Category Title Deduplication
**Spec ID:** fpb-category-title-deduplication  **Created:** 2026-08-27

## Purpose

Ensure a selected FPB category is represented by either its category tab or the standalone active-category label, never both, during initial rendering and step navigation.

## Test Cases

### FullPageCategoryRendering

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial render with tabs | `showCategoryTabs=true` | Category tabs render and the standalone category label is not requested | Prevents the duplicate shown in Settings Design and storefronts |
| 2 | Initial render without tabs | `showCategoryTabs=false` | Standalone active-category label renders | Preserves category context for non-tab designs |
| 3 | Step navigation with tabs | `showCategoryTabs=true` | Updated tabs render and no standalone category label is created | Prevents the duplicate from returning after navigation |

## Acceptance Criteria

- [x] Focused tests fail before implementation.
- [x] All listed test cases pass after implementation.
- [x] Settings Design desktop and mobile previews show the selected category once.
- [ ] Tests assert renderer behavior, not CSS, class names, or visual placement.
