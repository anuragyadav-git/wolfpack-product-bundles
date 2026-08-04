---
schema_version: 1
id: fpb-all-template-summary-state-matrix
title: FPB All-Template Summary State Matrix
type: design-state-matrix
status: active
summary: Maps every required FPB summary state to desktop and mobile behavior across all four templates.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
related_docs:
  - design-jobs/fpb-all-template-summary-20260804/component-brief.md
tags:
  - fpb
  - summary
keywords:
  - configurable states
  - template coverage
---

# State Matrix

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 1
Artifact status: complete

| State ID | Trigger | Data precondition | Visible result | Available interaction | Accessibility | Desktop | Mobile | Fresh evidence required | Automated assertion | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| SUM-01 | Initial render | No selections; slots off | Title/subtitle, zero count, row/skeleton empty state, zero total, valid CTA | Navigate when rules allow | Empty state is named without exposing fake controls | ST/CL/CO/HO | Expanded content equivalent | Yes, every preset | State branch and required count | Required |
| SUM-02 | Initial render | No selections; slots on | Quantity-derived empty image slots and merchant icon/default plus | Slot affordances remain non-destructive | Decorative icons have empty alt | ST/CL/CO/HO | Expanded slot strip | Yes, every preset | Slot mode and count | Required |
| SUM-03 | Add products | Partial selection | Stable order, quantities, variants, prices, removal state, remaining slots/rows | Remove eligible item; blocked removal explains why | Names include product identity; disabled state exposed | ST/CL/CO/HO | Collapsed count and expanded details sync | Yes, every preset | Selection expansion and removal predicate | Required |
| SUM-04 | Satisfy target | Exact/full selection | Complete slot/row state, final totals, qualified CTA | Next or add to cart | Completion is not color-only | ST/CL/CO/HO | Same outcome | Yes, every preset | Validation/CTA result | Required |
| SUM-05 | Add beyond minimum | Overflow selection allowed | Internal list grows or scrolls without moving action/total out of reach | Scroll list; remove item | Scroll region keyboard reachable when needed | ST/CL/CO/HO | Expanded tray owns internal content scroll only | Yes, every preset | Content count preserved | Required |
| SUM-06 | Clear | One or more removable selections | Confirmation flow then synchronized empty state | Clear/cancel/confirm | Focus returns predictably | ST/CL/CO/HO | Expanded and collapsed paths | Yes, shared plus sibling smoke | Clear behavior | Required |
| SUM-07 | Mobile disclosure | Any selection state | One connected count/caret control toggles the same tray; no duplicate visible toggle | Expand/collapse | `aria-expanded`; collapsed content inert and hidden | N/A | ST/CL/CO/HO | Yes, every preset at 320/390/768 | Disclosure state helper | Required |
| SUM-08 | BQO enabled | Two or more box rules | Active box label/subtext and quantity target appear; totals/slots update | Switch tier | Group and selected option announced | ST/CL/CO/HO | Expanded tray equivalent | Yes, every preset | Target-count and retention/reset behavior | Required |
| SUM-09 | BQO validation | Under/exact/over target | CTA and add controls reflect saved enforcement | Correct selection or switch box | Disabled reason remains perceivable | ST/CL/CO/HO | Collapsed CTA remains readable | Yes, every preset | Checkout predicate | Required |
| SUM-10 | Pricing configured | Disabled, percent, fixed amount, fixed price, BXY, amount threshold | Message/progress/badge/original/final totals follow independent controls | Selection changes qualification | Progress and totals have text equivalents | ST/CL/CO/HO | Same values in tray CTA/details | Yes, every pricing family per shared path plus preset smoke | Pricing selectors | Required |
| SUM-11 | Add-on/free gift configured | Locked, eligible, selected, active add-on step | Offer content appears only on EB-owned stage; core selections stay intact | Navigate/select offer | Status and disabled meaning are named | ST/CL/CO/HO | Badge/tray state where applicable | Yes, every preset | Eligibility and placement predicates | Required |
| SUM-12 | Saved summary copy | Custom/long title and subtitle, locale/currency | Saved text and money format render without fabricated fallback copy | None | Heading relationship remains clear | ST/CL/CO/HO | Expanded tray | Yes, every preset | Resolver output | Required |
| SUM-13 | Multi-step flow | Selection on prior/current steps | Summary retains identity; removal is enabled only on allowed step; back/next state is correct | Back/next/remove | Buttons expose direction and disabled state | ST/CL/CO/HO | CTA equivalent | Yes, every preset | Removal and navigation predicates | Required |
| SUM-14 | Loading/recovery | Delayed hydration, missing image, invalid default, unavailable item | Reserved shell avoids layout jump; bad items/images recover safely | Retry through normal reload/state correction | Busy/hidden states do not trap focus | ST/CL/CO/HO | No title/Standard flash | Yes, representative shared path plus preset first-paint smoke | Normalizer/error behavior | Required |
| SUM-15 | Responsive boundary | 319/320/360/390/414/600/767/768/769/1023/1024/1025/1280/1440/1536 widths | Exactly one summary surface; no page overflow; content-driven sizing | Resize/rotate/scroll | Reading and focus order stay coherent | Sidebar at component width >=1024 | Tray below 1024 | Yes, boundary sweep | Responsive mode predicate | Required |
| SUM-16 | Reload/session | Selected state then cache-bypassed hard reload | Persist/reset behavior matches EB and correct preset assets render | Hard reload only | No duplicate controls after re-init | ST/CL/CO/HO | ST/CL/CO/HO | Yes, every preset | Bootstrap idempotency | Required |

## Not applicable

| Catalog state | Reason |
|---|---|
| Drag/reorder | Summary order follows bundle selection order; shopper reordering is not an FPB capability. |
| Inline editing | Summary copy and configuration are merchant-owned Admin settings, not storefront-editable fields. |

## Coverage

- Required: 16 state families across Standard, Classic, Compact, and Horizontal, with desktop/mobile applicability as listed.
- Covered: Requirements and current source ownership mapped. Classic has a new implementation with partial post-change QA; other presets only have historical pre-program evidence.
- Missing: Fresh all-template visual baselines, direction artifacts, post-change browser proof, stress fixtures, and acceptance approval.
- Status: Discovery complete; implementation completion unproven.
