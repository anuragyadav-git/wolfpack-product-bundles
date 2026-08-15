---
schema_version: 1
id: fpb-classic-summary-implementation-handoff
title: FPB Classic Summary Implementation Handoff
type: implementation-handoff
status: complete
summary: Defines the bounded production implementation contract for the approved Calm Review Panel redesign.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - fpb-classic-summary
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
  - app/assets/widgets/full-page-css/templates/side-footer-classic.css
related_docs:
  - design-jobs/fpb-classic-summary-20260804/component-anatomy.md
  - design-jobs/fpb-classic-summary-20260804/responsive-contract.md
tags:
  - fpb
  - classic
  - handoff
keywords:
  - calm-review-panel
  - summary-sidebar
  - summary-tray
---

# Implementation Handoff

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: approved

## Identity and approved references

Implement Direction A, **Calm Review Panel**, for the FPB Classic summary only. Approved visual evidence is the current Agent desktop and mobile captures plus the EB Classic desktop inspiration listed in `screenshot-inventory.yaml`. Those images guide visual nuance; this handoff and the approved contracts govern behavior and responsive structure.

## Source-of-truth priority

1. Existing selection, pricing, inventory, validation, cart, and merchant-setting semantics.
2. Repository `AGENTS.md`, architecture notes, and graph impact requirements.
3. `component-anatomy.md`, `state-matrix.md`, `responsive-contract.md`, `interaction-contract.md`, and `accessibility-checklist.md`.
4. `design-tokens.json` and `content-stress-cases.yaml`.
5. Approved current and target screenshots for visual nuance only.

## Goal

Turn the Classic summary into a calm review surface: a restrained desktop sidebar at 64rem and above, and one sticky disclosure tray below 64rem of available widget width. Preserve all current business behavior while improving hierarchy, row readability, long-list scrolling, total/action stability, responsive ownership, and accessible recovery.

## Non-goals

- No redesign of product cards, product details modals, steps, progress logic, pricing, inventory, validation, cart payloads, or other templates.
- No new merchant settings, copy, data migrations, compatibility shims, page scroll lock, blocking overlay, or separate mobile semantic tree.
- No production deploy, live-shop mutation, broad refactor, or unrelated cleanup.
- No pixel-copy of captured fixed dimensions; use the approved responsive tokens and intrinsic layout rules.

## Current architecture map

- Desktop rendering and business-event wiring: `app/assets/widgets/full-page/methods/side-panel-methods.js`.
- Mobile disclosure and summary rendering: `app/assets/widgets/full-page/methods/mobile-summary-methods.js`.
- Responsive construction and ownership: `app/assets/widgets/full-page/methods/responsive-layout-methods.js`.
- Classic desktop presentation: `app/assets/widgets/full-page-css/templates/classic/desktop-sidebar.css`.
- Classic mobile presentation: `app/assets/widgets/full-page-css/templates/classic/mobile.css`.
- Classic CSS assembly: `app/assets/widgets/full-page-css/templates/side-footer-classic.css`.
- Shared totals/focus styling: `app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css`; edit only when browser and source evidence proves the rule is intentionally shared.
- Merchant token bridge: `app/lib/css-generators/css-variables-generator.ts` and `app/lib/settings-design-runtime.ts`.
- Merchant custom CSS boundary: `app/lib/css-generators/index.ts`; do not place the redesign there.
- `classic-template.js` is intentionally empty and is not an ownership target. `classic.config.js` is a behavior descriptor, not a styling injection point.
- Generated widget output is assembled by `scripts/build-widget-bundles.js`. The FPB widget/build community is high-connectivity, so sibling-template regression proof is mandatory.

## Exact component anatomy

Use the anatomy in `component-anatomy.md`: owning shell; review header with purpose/title and conditional Clear; optional feedback/progress; one selected-list region; intrinsically sized rows containing product identity, optional variant, quantity, price, and remove; divider; persistent total block; existing primary action. On mobile/tablet, the same state is exposed by one collapsed disclosure/action bar and one expanded tray interior. Header and action footer stay outside the selected-list scroll region.

## Required states

All 30 rows in `state-matrix.md` are required. This includes desktop empty, partial, completion and discount boundaries, long content, quantity, loading, disabled/enabled actions, removal and clear; and mobile collapsed/expanded empty, partial and complete, long list, safe-area, narrow/wide, disabled/enabled actions, and collapse behavior. Existing predicates and handlers remain authoritative; presentation must not create duplicate calculations, submissions, or state updates.

## Responsive transformations

- Below 64rem of available widget width: expose the single sticky disclosure tray and hide the desktop sidebar.
- At 64rem and above: expose the intrinsic desktop sidebar and hide the tray.
- Prove 1023/1024/1025px transformation boundaries and 767/768/769px legacy regression boundaries.
- A 600px component inside a wider viewport must use the tray; do not rely on viewport width when container viability is narrower.
- The page remains scrollable. Only the selected-list region scrolls when content exceeds available dynamic height.
- Preserve safe-area clearance, 44px control targets, 200% zoom reflow, reduced motion, and no horizontal overflow at 320px.

## Interaction contract

Reuse current handlers for remove, Clear confirmation/cancel, disclosure, quantity, Next, and Add to cart. A user action invokes its handler once. Clear remains conditional. Default or otherwise protected selections remain non-removable under current rules. Expansion does not mutate selection. Removing an item recomputes count, totals, progress, and action availability once. No page/body scroll lock is introduced.

## Accessibility contract

Preserve native buttons and current semantic relationships. Every remove action includes the full product identity; quantity controls have unique names and boundary states; disclosure exposes `aria-expanded`; busy/disabled state and recovery reason are perceivable; totals, savings, progress, and completion are not color-only; focus remains visible and returns logically after removal, Clear, and collapse; list scrolling brings focused controls into view; decorative skeletons stay out of the accessibility tree; reduced motion removes nonessential transitions.

## Tokens and merchant-configurable values

Use semantic aliases from `design-tokens.json`. Existing merchant/config variables remain the color and typography source. Use content-driven `clamp()`, `minmax()`, intrinsic tracks, `fr`, percentages, and container/viewport-aware sizing. Exact values are limited to primitives such as hairlines, icons, minimum hit targets, and the approved 64rem component boundary. Do not introduce hardcoded merchant-facing copy, duplicate theme colors, `!important`, or captured screenshot dimensions as layout rules.

## Content fixtures

The primary fixture is Agent bundle `cmse8sp170000v0ytaqqzsvtw`, Classic preset, six known products, with the first two selected for partial-state comparison. Execute every case marked `required_in_browser_qa` in `content-stress-cases.yaml`, including long title/variant, high and discounted prices, missing image, quantity 12, empty and 12-line lists, long German copy, wide EUR formatting, validation error, and delayed loading.

## Allowed production areas

- The three Classic summary method owners named in the architecture map, only if semantic structure or responsive ownership must change.
- Classic raw source CSS files and their Classic assembler.
- The token bridge only when an existing merchant variable is not reaching the canonical Classic owner and the change is proven necessary.
- Focused behavior tests for changed exported or conditional logic, plus a required `test-spec/fpb-classic-summary.spec.md` created before implementation.
- Generated assets produced by the required repository build/minification commands.

## Prohibited changes

- Product selection, pricing, inventory, discount, validation, or cart contracts.
- FPB config-load priority, proxy retry behavior, PPB, Standard, Compact, Horizontal, Admin UI, merchant persistence, or database schema.
- JavaScript-injected CSS, runtime HTML used only to force visual layout, merchant custom CSS as the implementation owner, backwards-compatibility branches, fabricated copy, CSS/class/placement unit tests, or direct edits to generated assets.
- `shopify app deploy`, `npm run dev`, repair apply mode, commits, or fixture mutation during implementation/QA without fresh authority.

## Test commands discovered from repository

Follow Red-Green-Refactor for behavior changes. Create `test-spec/fpb-classic-summary.spec.md` first. Extend focused behavior coverage near `tests/unit/assets/fpb-standard-mobile-summary-action.test.ts`, `fpb-summary-sidebar-slots.test.ts`, `fpb-summary-current-step-removal.test.ts`, `fpb-summary-discount-badge.test.ts`, and selected-summary tests only when their behavior is affected. Never assert CSS, class names, or element placement in unit tests. After raw widget JavaScript edits run `node --check` on each changed file and `npm run build:widgets:full-page`; after raw CSS edits run `npm run minify:assets css`. Run focused tests and ESLint on modified lintable files. After code changes run `npm run graphify:rebuild` and audit generated diffs. Bump `WIDGET_VERSION` only immediately before an explicitly approved widget deploy; do not deploy autonomously.

## Chrome DevTools QA plan

Use the connected default Chrome profile and direct Chrome DevTools MCP on the approved Agent SIT storefront route. First hard-reload with cache bypass and clear Cache Storage. Confirm the exact active CSS asset URL, expected new rule, and widget version before judging visuals. Execute `browser-test-plan.yaml` at 320x720, 360x800, 390x844, 414x896, 768x1024, 1024x768, 1280x800, 1440x900, and 1536x960, plus 767/768/769 and 1023/1024/1025 boundaries and a 600px constrained host. Capture storefront-only PNGs without browser chrome. Record semantic snapshots, geometry/computed styles, console and network evidence, desktop/mobile Lighthouse accessibility and best-practices reports, the planned performance trace, and Standard/Compact/Horizontal non-regression. Store only redacted evidence under `qa/`; do not commit investigation screenshots.

## Acceptance criteria

Every item in `acceptance-criteria.md` must pass. Geometry uses the tolerances in `design-tokens.json`; a visual resemblance cannot override a semantic, business, responsive, accessibility, console, network, or sibling-regression failure.

## Stopping criteria

Stop before editing when ownership differs from this map, a required merchant value has no authoritative source, or a design choice is unresolved. Stop before QA if build/minification or focused behavior tests fail. Stop before any deploy, destructive action, production mutation, or change outside allowed areas. Return to the design director when implementation needs a new semantic structure, copy decision, breakpoint, business behavior, or mask.

## Expected final report format

Report changed source and generated files; behavior tests, syntax checks, lint, builds, and graph rebuild; each browser case with evidence paths; exact remaining visual differences; console/network/accessibility/Lighthouse/performance and sibling-template results; blockers and waivers; and the rollback boundary. Do not claim pass for unexecuted evidence.

## Unresolved risks

- The 64rem contract closes a current 768–1023px ownership gap and may require careful responsive construction, not CSS visibility alone.
- Shared summary methods and base CSS can affect sibling presets; keep selectors and logic Classic-scoped unless shared behavior is intentionally proven.
- Shopify CDN/cache state can show stale assets; active asset and widget-version verification is mandatory.
- Long-list internal scroll and sticky behavior can regress focus visibility or page scroll on short mobile viewports.

## Rollback guidance

Revert only the Classic source changes and their generated outputs as one bounded unit. Restore the preceding widget version if a deploy was explicitly performed, rebuild widgets/CSS, and re-sync the test bundle through the normal application flow. Do not restore legacy branches or manually edit generated assets. Retain the design job and QA evidence as immutable diagnostic history.
