---
schema_version: 1
id: storefront-design-director-chrome-automation
title: Storefront Design Director Chrome Automation Hardening Test Spec
type: test-spec
status: approved
summary: Defines synthetic and live-smoke coverage for deterministic Chrome DevTools MCP preflight, browser plans, evidence gates, masks, and reruns.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - browser-qa
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director
related_docs:
  - storefront-design-director-prompt-pack/03-chrome-devtools-automation-hardening-prompt.md
tags:
  - tdd
  - chrome-devtools
keywords:
  - preflight
  - browser-test-plan
  - evidence-gates
---

# Test Spec: Storefront Design Director Chrome Automation Hardening

**Spec ID:** storefront-design-director-chrome-automation  **Created:** 2026-08-03

## Purpose

Prove that the skill turns its Chrome DevTools MCP requirement into an executable, deterministic protocol that blocks unavailable infrastructure or missing evidence, fails product regressions, validates complete desktop and mobile plans, and preserves auditable retry and waiver history.

## Test Cases

### BrowserPlanValidation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Complete browser plan | Required top-level schema, desktop and mobile viewports, states, and cases | No validation issues | Uses the connected default-profile policy |
| 2 | Incomplete viewport matrix | Mobile viewport has no test case | Handoff validation blocks | Every required viewport must be exercised |
| 3 | Incomplete test case | A required case field is absent | Handoff validation blocks | Includes semantic, DOM, geometry, screenshot, policy, cleanup, and evidence fields |
| 4 | Invalid mask approval | Case references an unapproved or component-covering mask | Handoff validation blocks | No mask may hide the tested component |
| 5 | Performance not applicable | Trace is disabled without a reason | Handoff validation blocks | Performance exclusions are explicit |

### BrowserEvidenceSummary

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Chrome unavailable | Failed mandatory preflight connection check | Overall status blocked | Another browser cannot substitute |
| 2 | Screenshot missing | Passed case declaration without its screenshot file | Visual evidence blocked | Missing evidence never passes |
| 3 | Console violation | Uncaught exception in structured case evidence | Console gate failed | Declared pass cannot override observations |
| 4 | Network violation | Unexpected 404 in structured case evidence | Network gate failed | Expected analytics remain separate |
| 5 | Geometry assertion failure | Failed geometry assertion | Geometry gate failed | Assertion evidence is preserved |
| 6 | Accessibility assertion failure | Failed accessibility assertion | Accessibility gate failed | Keyboard and semantic failures remain separate |
| 7 | Baseline dimension mismatch | Failed comparison summary | Visual and geometry gates failed | Images are never silently resized |
| 8 | Performance exclusion without reason | Not-applicable performance gate | Evidence blocked | A reason is mandatory |
| 9 | Invalid waiver | Waived gate without reason or approver | Evidence blocked | Waivers require approval metadata |
| 10 | Passing evidence set | Passed preflight, complete files, assertions, policies, and retry history | Overall status approved | All mandatory evidence is present |
| 11 | Retry preservation | Multiple recorded attempts | Summary retains every attempt | Exhaustion remains auditable |

### VisualMaskSafety

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Approved dynamic mask | Mask pixels stay within an approved rectangle | Comparison runs with only that region ignored | Region is explicitly approved |
| 2 | Escaping dynamic mask | Mask pixels extend outside approved rectangles | Comparison blocks | Masks cannot expand silently |
| 3 | Dimension mismatch | Baseline and actual dimensions differ | Comparison fails | Exact viewport metadata remains meaningful |

### LiveChromeSmoke

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Local fixture smoke | Direct Chrome DevTools MCP and the skill-owned static fixture | Navigation, resize, snapshot, safe interaction, screenshot, console, network, Lighthouse, and cleanup succeed | No production or merchant mutation |
| 2 | Browser-default resource requests | Local fixture loaded in a fresh Chrome tab | No implicit favicon request produces a console or network error | The fixture owns an inline empty favicon |
| 3 | Lighthouse discovery requests | Desktop and mobile Lighthouse snapshots | Optional `robots.txt` and `llms.txt` discovery requests return successfully | No hidden auxiliary 404s in the fixture server log |

## Acceptance Criteria

- [x] Synthetic tests pass without a live browser.
- [x] Chrome DevTools MCP remains mandatory and default-profile-only.
- [x] Browser plans cover desktop and mobile viewports and every declared state.
- [x] Missing evidence blocks; observed product errors fail the relevant gate.
- [x] Dynamic masks are bounded by explicit approved regions.
- [x] Waiver and retry history remain machine-readable.
- [x] The direct Chrome DevTools MCP smoke test completes against the local fixture, or the audit records the exact connection blocker without claiming a pass.
