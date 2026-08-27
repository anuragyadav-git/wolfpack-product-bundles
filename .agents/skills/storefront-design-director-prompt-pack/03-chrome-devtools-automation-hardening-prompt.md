---
schema_version: 1
id: storefront-design-director-chrome-hardening-prompt
title: Storefront Design Director Chrome DevTools Automation Hardening
type: prompt-pack
status: active
summary: Defines deterministic Chrome DevTools MCP hardening and evidence requirements for storefront visual QA.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - browser-qa
systems:
  - storefront-design-director
source_paths:
  - storefront-design-director-prompt-pack/03-chrome-devtools-automation-hardening-prompt.md
related_docs:
  - storefront-design-director-prompt-pack/README.md
tags:
  - prompt
  - chrome-devtools
keywords:
  - storefront-design-director
  - browser-qa
---

# Prompt 3 — Chrome DevTools automation hardening

Run this after the general skill audit. This prompt makes browser validation operational rather than aspirational.

---

Harden the `storefront-design-director` skill’s Chrome DevTools MCP workflow.

Target:

```text
.agents/skills/storefront-design-director/
```

Chrome DevTools MCP must remain the mandatory primary browser QA mechanism.

## 1. Verify current tools

Use the Chrome DevTools MCP server actually exposed in this session.

1. Enumerate or otherwise confirm available Chrome DevTools capabilities.
2. Compare them with every tool name referenced by the skill.
3. Replace invented, deprecated, or incorrect names.
4. Keep the skill capability-oriented where client namespaces can differ.
5. Record the verified capability list and date in:
   `references/chrome-devtools-test-protocol.md`.
6. Do not use web search or memory as a substitute for actual exposed-tool verification when the MCP is connected.

Expected capability categories include:

- page listing/selection/creation/closure
- navigation and waiting
- resize and emulation
- accessibility-tree snapshots
- clicks, hover, form fill, typing, key presses, dragging, dialogs, upload
- JavaScript evaluation
- screenshots
- console inspection
- network inspection
- Lighthouse accessibility/best-practices/SEO
- performance traces and insight analysis

## 2. Add a strict preflight

Create a preflight checklist and machine-readable result template.

Preflight must verify:

- Chrome MCP connected
- supported Chrome or Chrome for Testing available
- intended page selected
- app server reachable
- correct environment: local/development/staging/production
- fixture route exists
- authentication state intentional
- no unrelated sensitive tabs selected
- viewport can be resized
- snapshots work
- screenshots can be saved to the permitted artifact directory
- console and network inspection work
- repository/branch/commit identified
- job revision and baseline identified

Fail preflight if any mandatory item is unavailable.

## 3. Deterministic browser setup

Add exact instructions for:

- isolated Chrome profile by default
- dedicated authenticated profile only where required
- 100% zoom
- explicit viewport
- stable locale/currency/theme
- stable fixture data
- stable feature flags
- deterministic random/time data where the app supports test hooks
- waiting for `document.fonts.ready`
- waiting for images to complete
- waiting for hydration and target state
- setting scroll position
- disabling nonessential animation through reversible injected CSS
- hiding carets and transient cursors for screenshots
- excluding dynamic timestamps or masking them
- not hiding real defects

Add a reusable JavaScript assertion/helper library as a documented snippet inside the Chrome protocol reference. It must be JSON-serializable and safe to execute in the page.

## 4. Browser test-plan schema

Make `browser-test-plan.yaml` capable of describing:

```yaml
job_id:
revision:
environment:
base_url:
fixture:
authentication_mode:
setup:
viewports:
states:
interactions:
assertions:
screenshots:
console_policy:
network_policy:
lighthouse:
performance:
visual_diff:
non_regression:
cleanup:
```

Each test case must include:

- stable ID
- purpose
- precondition
- viewport
- state
- steps
- expected semantic result
- DOM assertions
- style/geometry assertions
- screenshot path
- baseline path
- allowed masks
- console/network expectations
- cleanup
- pass/fail status
- evidence links

Validate this schema from `validate_handoff.py`.

## 5. Required user-flow automation

Add reusable test-flow recipes for:

### Product card
- hover
- keyboard focus
- add
- selected state
- quantity increase
- quantity decrease
- max quantity
- remove
- variant selection
- unavailable variant
- out of stock
- details modal

### Summary sidebar
- empty
- partial
- complete
- discount tier reached
- long list and scroll
- remove item
- clear all
- CTA disabled/enabled
- submit loading/error where safely testable

### Mobile tray/footer
- collapsed
- expanded
- focus/keyboard behavior where applicable
- backdrop behavior
- long list scroll
- safe-area space
- CTA remains reachable
- close through toggle/backdrop/Escape where specified
- body content not unintentionally hidden or unscrollable

### Step/tabs/progress
- inactive
- active
- completed
- locked
- single tier
- multiple tiers
- progress updates
- navigation between steps

### Modal
- open
- focus moved inside
- focus trap
- keyboard variant choice
- quantity
- carousel
- close button
- Escape
- focus restoration

## 6. In-page assertion library

Document robust JavaScript functions for:

- get bounding box
- get computed style subset
- detect horizontal overflow
- detect clipped descendants
- detect duplicate IDs within a root
- list interactive elements in DOM order
- collect accessible labels/roles where exposed in DOM
- check image load status
- inspect CSS custom-property resolution
- inspect focus-visible style after keyboard focus
- verify `aria-expanded`, `aria-selected`, `aria-current`, `disabled`
- compare geometry before and after a state change
- detect unexpected layout shift during a controlled interaction
- detect elements outside the viewport or intended scroll container
- confirm sticky/fixed element remains positioned after scroll
- check text line count approximately through geometry and line height
- detect overlapping rectangles for designated critical elements

Every helper must return JSON-serializable output and must not mutate production state except where the helper is explicitly a reversible test setup.

## 7. Screenshot protocol

Require:

- element screenshot for isolated component comparison
- viewport screenshot for contextual alignment
- full-page screenshot only where needed
- PNG for visual baselines
- deterministic filename
- exact viewport metadata
- screenshots before and after critical interactions
- approved reference and actual stored side by side
- diff file
- JSON diff summary
- masks only for approved dynamic regions
- no mask that hides the component being tested

Create a screenshot index in the browser test report.

## 8. Console policy

Default failure policy:

Fail on:

- uncaught exceptions
- unhandled promise rejections
- severe application errors
- failed resource parsing
- newly introduced repeated warnings
- accessibility-related runtime errors
- framework hydration errors
- duplicate-key warnings
- CSP violations caused by the change
- errors attributable to the tested interaction

Allow only explicitly documented, pre-existing messages with:

- exact or pattern match
- reason
- owner
- expiration/review date

No blanket “ignore warnings.”

## 9. Network policy

Fail on unexpected:

- 4xx/5xx
- blocked CSS/JS/font/image required by the component
- aborted requests caused by implementation errors
- CORS errors
- duplicate mutation/API calls from one action
- missing product media
- missing translation resource
- requests to production from a local fixture
- submission of real orders or destructive admin actions

Record expected analytics noise separately and do not expose credentials or response bodies containing secrets.

## 10. Lighthouse and accessibility

Run Lighthouse in both mobile and desktop modes for relevant pages.

The skill must:

- save report paths
- record accessibility findings
- distinguish page-level pre-existing issues from component-introduced issues
- fail on new serious component-related issues
- never claim Lighthouse performance was run through `lighthouse_audit` if the exposed tool excludes performance
- use performance tracing for performance metrics
- combine Lighthouse with keyboard and semantic interaction testing

## 11. Performance

Require a trace when the change affects:

- above-the-fold content
- product imagery
- loading strategy
- large injected CSS
- sticky/fixed UI
- animation
- interaction handlers
- layout reflow
- component hydration
- long lists

Record:

- LCP
- CLS
- interaction findings
- long tasks
- layout-shift sources
- image/font loading findings
- relevant performance insights
- baseline comparison
- trace path

Do not fail solely on noisy timing without rerun or baseline context. Do fail on clear new layout shifts, duplicate work, or regression supported by evidence.

## 12. Visual-difference review

After automated image comparison, require a semantic review table:

| Region | Reference | Actual | Difference | Severity | Measured evidence | Proposed owner | Required fix |
|---|---|---|---|---|---|---|---|

Severity:

- `BLOCKER`: unusable, wrong state, severe overlap, missing action
- `HIGH`: major geometry/hierarchy/responsive mismatch
- `MEDIUM`: visible spacing/type/surface mismatch
- `LOW`: minor polish or anti-aliasing
- `ACCEPTED`: intentional approved deviation

Feedback must be measured. Ban feedback such as “make it closer” without details.

## 13. Automated rerun loop

The skill must define:

```text
run mandatory test
→ collect evidence
→ classify failure
→ map failure to canonical code owner
→ create remediation list
→ implementation agent patches
→ rerun only affected fast checks
→ rerun full mandatory matrix
→ update evidence
→ approve or continue
```

Maximum retries should be configurable. Exhaustion must produce an honest blocked report, not approval.

## 14. Skill tests for Chrome behavior

Add or improve tests that validate:

- Chrome unavailable → blocked
- screenshot missing → failed evidence
- console errors → failed
- network error → failed
- geometry assertion fail → failed
- accessibility assertion fail → failed
- baseline dimension mismatch → failed
- dynamic mask configured → applied only to approved region
- performance not applicable → reason required
- incomplete viewport matrix → failed handoff validation
- all evidence present → pass
- waived issue → requires reason and approver
- retry history preserved

These tests may use synthetic artifacts; they must not require a live browser in the ordinary unit-test suite.

## 15. Live smoke test

After hardening, perform one non-destructive Chrome MCP smoke test against an approved local/demo URL available in the repository.

The smoke test must:

1. navigate
2. resize
3. take a snapshot
4. find and interact with one safe control if available
5. take a screenshot
6. inspect console
7. inspect network
8. run a Lighthouse snapshot or navigation audit where safe
9. save evidence to a temporary skill test fixture
10. clean up

If no app URL is available, use a small local static fixture created under the skill tests. Do not test an unrelated public site as proof of repository integration.

Create:

```text
.agents/skills/storefront-design-director/CHROME_AUTOMATION_AUDIT.md
```

Include tool availability, changes, test results, smoke-test evidence, and remaining limitations.

Do not conclude until Chrome QA is a complete executable protocol and all synthetic tests pass.

---
