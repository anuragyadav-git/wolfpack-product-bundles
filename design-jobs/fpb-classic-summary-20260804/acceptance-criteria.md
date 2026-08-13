---
schema_version: 1
id: fpb-classic-summary-acceptance-criteria
title: FPB Classic Summary Acceptance Criteria
type: quality-contract
status: complete
summary: Defines independently testable acceptance gates for the Calm Review Panel implementation.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-quality
systems:
  - fpb-classic-summary
source_paths:
  - design-jobs/fpb-classic-summary-20260804/state-matrix.md
  - design-jobs/fpb-classic-summary-20260804/browser-test-plan.yaml
related_docs:
  - design-jobs/fpb-classic-summary-20260804/implementation-handoff.md
tags:
  - acceptance
  - fpb
keywords:
  - browser-qa
  - non-regression
---

# Acceptance Criteria

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: approved

- [ ] Direction A reads as a calm review surface: clear review purpose, low-chrome selected rows, restrained divider, stable total, and one dominant existing CTA.
- [ ] Existing selection, protected-item removal, quantity, pricing, discount, validation, inventory, progress, Next, and Add-to-cart rules remain unchanged and each user action invokes its handler once.
- [ ] All 30 `state-matrix.md` states produce the specified semantic and visible outcome; loading, errors, Clear cancel/confirm, and recovery paths work.
- [ ] Header/feedback and total/action footer remain outside the selected-list scroll; only the selected list scrolls under long-content or short-height pressure.
- [ ] Below 64rem available component width exactly one sticky tray is exposed; at 64rem and above exactly one desktop sidebar is exposed.
- [ ] 1023/1024/1025 and 767/768/769 boundaries have no duplicated tree, unowned summary, flicker, overlap, or stale layout.
- [ ] A 600px component in a wider viewport uses the tray, proving component viability rather than unrelated viewport width owns the transformation.
- [ ] Required 320x720, 360x800, 390x844, 414x896, 768x1024, 1024x768, 1280x800, 1440x900, and 1536x960 runs pass.
- [ ] At 320px, 200% zoom-equivalent reflow, rotated mobile, short height, and safe-area conditions, no control or semantic content is clipped, overlapped, hidden, or horizontally scrollable.
- [ ] Long title/variant, missing image, quantity 12, 12 selected lines, high/wide currency, long translation, discounted total, validation error, and delayed loading stress fixtures pass.
- [ ] Existing merchant color/typography/configuration variables remain authoritative; no new hardcoded merchant-facing copy, duplicate theme values, `!important`, or captured fixed layout dimensions are introduced.
- [ ] Geometry and visual differences remain inside the named tolerances in `design-tokens.json`; responsive/intrinsic behavior takes precedence over one-screenshot pixel copying.
- [ ] Native control semantics, accessible names/states, `aria-expanded`, focus visibility/return, keyboard activation, polite announcements, 44px targets, reduced motion, and non-color-only status pass fresh accessibility-tree inspection.
- [ ] No body/page scroll lock is added. Expanded tray/list scrolling remains operable by keyboard and touch, and focused off-screen controls scroll into view.
- [ ] Behavior tests were written first with `test-spec/fpb-classic-summary.spec.md`; no unit test asserts CSS, class names, source placement, or visual geometry.
- [ ] Focused tests, raw-JS syntax checks when applicable, ESLint on modified lintable files, required widget build/minification, and graph rebuild complete with no introduced errors.
- [ ] Cache-bypassed Chrome QA proves the active CSS asset URL contains the expected rule and the running widget version is the built version before visual judgment.
- [ ] No new uncaught errors, severe/repeated warnings, required-resource failures, CORS failures, duplicate mutations, hydration errors, or tested-interaction errors appear.
- [ ] Storefront-only before/after, element, viewport, baseline, diff, and JSON evidence is complete without browser chrome, secrets, private bodies, or unapproved masks.
- [ ] Desktop and mobile Lighthouse accessibility and best-practices findings identify pre-existing page issues separately from component-introduced issues.
- [ ] The required performance trace shows no introduced layout-shift, long-task, LCP-candidate, image/font-loading, or interaction regression attributable to the redesign.
- [ ] Classic control baseline and Standard, Compact, and Horizontal summary non-regression cases pass.
- [ ] Every failure remains a failure until fixed or explicitly waived with reason, approver, and timestamp; retries are append-only and no unexecuted case is reported as passed.
- [ ] No deploy, production mutation, unrelated source change, compatibility shim, or direct generated-asset edit occurs.
