---
schema_version: 1
id: checkout-parity-implementation-goal
title: Checkout Parity Implementation Goal
type: goal-prompt
status: ready
summary: Binding execution prompt for complete checkout UI, integration, Integrations Hub, and Additional Configurations parity.
last_audited: 2026-07-30
owners:
  - wolfpack
domains:
  - checkout
  - integrations
  - admin-settings
systems:
  - bundle-checkout-ui
  - checkout-integrations
  - settings-controls
source_paths:
  - docs/competitor-analysis/checkout-page-parity-matrix.md
  - docs/competitor-analysis/checkout-integrations-additional-configurations-parity-plan.md
related_docs:
  - internal docs/EB Integrations Reference.md
  - internal docs/Shopify Integration/Checkout UI Extension.md
tags:
  - goal
  - parity-execution
keywords:
  - complete-implementation
  - checkout-parity
  - integration-adapters
  - no-missed-rows
---

# Goal Prompt: Complete Checkout and Integration Parity

## Goal

Implement the complete plan in:

- `docs/competitor-analysis/checkout-page-parity-matrix.md`
- `docs/competitor-analysis/checkout-integrations-additional-configurations-parity-plan.md`

Do not stop at planning, partial implementation, source-only confidence, or a
summary of remaining work. Continue until every completion gate below is
satisfied or a genuine external blocker has repeated for three consecutive goal
turns and no other meaningful work remains.

## Binding Scope

Complete all four workstreams:

1. Shopify checkout page visual and functional parity.
2. Checkout/side-cart provider adapter parity.
3. EB-style Integrations Hub visual and functional parity.
4. Full Additional Configurations parity for Landing Page Layout and Product
   Page Layout.

Additional Configurations is required scope, not optional bonus work.

## Required Starting Sequence

1. Read `AGENTS.md`.
2. Read both canonical plan artifacts in full.
3. Read:
   - `internal docs/EB Integrations Reference.md`
   - `internal docs/Shopify Integration/Checkout UI Extension.md`
   - `internal docs/EB Implementation Reference.md`
4. Audit `git status --short` and preserve every unrelated change.
5. Audit the matrix and current source before editing.
6. Refresh current Shopify and provider documentation from official sources.
7. Open current EB and WPB surfaces in direct Chrome DevTools MCP.

## Browser Rules

- Use direct Chrome DevTools MCP for every browser action and evidence step.
- Every `select_page` call must include `bringToFront:false`.
- Never bring Chrome to the foreground.
- Do not use browser wrappers, plugins, extensions, or Node browser automation.
- Refresh the relevant page after every source/build change before testing.
- Use cache-bypassed reload for storefront and checkout parity.
- Test desktop and mobile.

## EB Research Rules

- EB is the visual and behavior source of truth.
- Inspect the Integrations page.
- Inspect Settings > Controls > Additional Configurations.
- Traverse every visible tab and both layout branches.
- Open and read every `Know More`, `View Setup`, help, or learn-more destination
  before implementing the related behavior.
- Do not trigger Request Integration or chat notifications merely to inspect UI.
- Do not copy EB code, private tokens, session values, or vendor secrets.
- Do not put competitor names in runtime code except legitimate third-party
  provider names such as GoKwik or Shopflo.

## Internet Research Rules

- Refresh Shopify checkout-extension and standard-storefront-action docs.
- Use official provider documentation where available.
- Record the date, URL, observed contract, and confidence.
- Do not preserve a legacy callback when the provider’s current official
  contract requires a token or checkout-URL flow.
- If official documentation is unavailable, keep the adapter bounded,
  capability-detected, and safely fallback to Shopify checkout/cart.

## Fixture Strategy

- Temporary SIT fixture changes are approved.
- Use rolling fixtures.
- Do not restore the entire fixture after every item.
- Each parity pass must remove only incompatible values and add the values
  required for the current item.
- Keep one rich checkout cart, one zero-savings cart, and one multi-bundle stress
  cart as defined by the matrix.
- Restore only at workstream boundaries or when the next item requires a clean
  state.
- Document the final fixture state.

## Implementation Rules

- Fix root causes in shared sources.
- Use one provider adapter contract for FPB and PPB.
- Prefer Shopify standard storefront actions for native/theme cart behavior.
- Keep cart-line checkout extension targets inert.
- Render only `TOTAL SAVINGS` at the reductions-after target when savings are
  positive.
- Do not add backward-compatibility shims.
- Do not fabricate merchant-facing fallback copy.
- Use Polaris web components first for Admin UI.
- Never execute merchant scripts inside Admin.
- Never log checkout tokens, provider secrets, customer data, addresses, or
  payment data.
- Never run `npm run dev`, deploy, deployment backfill, or cart-transform repair.
- SIT is visible through the existing dev tunnel; no deployment is required for
  browser verification.

## TDD Rules

- Write behavior tests and a compliant `test-spec/` artifact before each new
  implementation slice.
- Test provider selection, capability detection, fallback, one-shot lifecycle,
  discount handoff, settings persistence, dependency behavior, and checkout
  calculations.
- Do not write tests that inspect CSS, class names, source order, or visual
  placement.
- Verify visual parity with Chrome DevTools MCP and computed styles.

## Matrix Execution

Execute the checkout fixtures strictly in this order:

1. C0 rich qualified cart.
2. C1 settings permutation without rebuilding the cart.
3. C2 zero savings.
4. C3 multi-bundle stress.
5. C4 locale/currency.
6. C5 post-purchase.

For each row:

- capture EB first;
- capture equivalent WPB;
- record expected/actual delta;
- implement if needed;
- rerun focused tests/build;
- refresh and replay;
- assign terminal status;
- attach evidence ID.

No applicable cell may remain `S` or `T`.

## Integration Execution

For each provider:

- prove saved Admin value;
- prove runtime provider ID;
- prove capability detection;
- prove one invocation;
- prove discount handoff only when required;
- prove timeout/error fallback;
- prove cart and bundle metadata survive;
- prove no double invocation;
- assign terminal status.

If the provider is not installed or cannot execute in the available store:

- do not claim parity;
- mark the live environment row `E`;
- retain provider-contract tests and official-doc evidence;
- continue every other provider and workstream.

## Additional Configurations Execution

Every field listed in the plan must have:

- live EB evidence;
- WPB visual equivalent;
- load/save/discard behavior;
- hard-reload persistence;
- dependency behavior;
- runtime effect or an explicit `E`, `X`, or `N/A`;
- desktop/mobile Admin proof.

Update `docs/app-nav-map/APP_NAVIGATION_MAP.md` if navigation, tabs, or routes
change.

## Validation

Run the narrowest relevant checks first, then broader checks:

- focused Jest;
- Rust Cart Transform tests;
- checkout-extension TypeScript/component validation;
- ESLint on modified files;
- required widget/SDK/checkout builds;
- `git diff --check`;
- `npm run graphify:rebuild`;
- final terminal-status audit;
- final EB/WPB desktop/mobile regression.

Do not fix unrelated failures. Report them separately.

## Evidence and Privacy

- Keep screenshots, HAR, network bodies, and raw snapshots in `/private/tmp`.
- Never commit checkout URLs containing tokens.
- Redact HMACs, sessions, customer details, addresses, and payment information.
- Commit concise evidence summaries linked to matrix rows.

## Commit Discipline

- Commit each completed bounded group from the plan.
- Stage only intended files.
- Audit `git diff --cached --name-only`.
- Audit hook-generated graph/build changes immediately.
- Never include unrelated dirty files.
- Do not deploy.

## Completion Gate

Do not declare completion until:

- every checkout matrix row is terminal;
- every provider is terminal;
- all ten Integrations Hub cards are accurate and functional;
- every Additional Configurations field is terminal;
- desktop and mobile parity is proven;
- FPB, PPB, ordinary cart lines, no-discount, paid add-on, free add-on,
  multi-bundle, locale, and currency regressions pass;
- checkout and provider errors have safe fallback;
- focused tests/build/lint/graph checks pass;
- final fixture state is documented;
- all bounded commits are complete;
- no deploy was performed.

Final response must list:

- terminal matrix counts;
- provider status counts;
- completed commits;
- validation commands/results;
- live EB/WPB evidence batches;
- any `E`, `X`, or `N/A` decisions and why;
- remaining unrelated dirty files.
