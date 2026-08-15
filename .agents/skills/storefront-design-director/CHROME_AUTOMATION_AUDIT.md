---
schema_version: 1
id: storefront-design-director-chrome-automation-audit
title: Storefront Design Director Chrome Automation Audit
type: audit-report
status: approved
summary: Records the approved Chrome DevTools MCP automation hardening, synthetic test proof, completed desktop and mobile live smoke, and remaining limitations.
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
  - chrome-devtools
  - audit
keywords:
  - preflight
  - live-smoke
---

# Storefront Design Director Chrome Automation Audit

## Scope and boundary

This audit hardens the repository-scoped design skill only. It does not edit storefront production code, start the Shopify development server, deploy, mutate merchant fixtures, use a browser substitute, create an isolated Chrome context, or use an alternate user-data directory.

## Higher-priority policy resolutions

The prompt requested an isolated Chrome profile by default, but the installed skill, repository security guidance, and current design-job contract require the connected default profile and explicitly forbid isolated contexts or alternate user-data directories. This audit preserves the higher-priority default-profile rule. The prompt also described a missing screenshot as failed evidence; the installed skill requires missing evidence to remain blocked, while observed product defects fail their specific gates. Both resolutions are covered by tests and recorded rather than silently changed.

## Verified tool availability

Codex enumerated and exercised the Chrome DevTools MCP tools actually exposed on 2026-08-04. The exposed server includes page lifecycle, navigation, waiting, viewport resize and emulation, accessibility snapshots, pointer and keyboard input, forms, drag, dialogs, upload, JavaScript evaluation, screenshots, console detail, network detail, Lighthouse accessibility or best-practices or SEO, performance traces, performance insights, and heap snapshots. The exact names are recorded in `references/chrome-devtools-test-protocol.md`.

The first connection probe returned `Could not find DevToolsActivePort`. Chrome 150.0.7871.187 was running in the default profile with `--remote-debugging-port=0`, but there was no listening endpoint and the on-disk port file was stale. Chrome was quit gracefully and reopened normally at `chrome://inspect/#remote-debugging`; direct `list_pages` then succeeded through the [official auto-connect path](https://github.com/ChromeDevTools/chrome-devtools-mcp#automatically-connecting-to-a-running-chrome-instance). No isolated context, alternate user-data directory, browser wrapper, or substitute browser was used.

## Hardened artifacts

- `references/chrome-devtools-test-protocol.md`: verified capability names, strict preflight, deterministic setup, assertion dispatcher, screenshot, console, network, Lighthouse, performance, semantic review, and rerun rules.
- `references/chrome-flow-recipes.md`: product card, summary sidebar, mobile tray or footer, step or tab progress, and modal automation recipes.
- `assets/templates/browser-test-plan.yaml`: complete machine-readable plan schema with desktop and mobile coverage, policies, cases, masks, performance, non-regression, and cleanup.
- `assets/templates/chrome-preflight-result.yaml`: one result entry for every mandatory preflight check.
- `assets/templates/browser-case-result.json`: structured evidence, observations, waivers, and retry history.
- `scripts/validate_handoff.py`: strict browser-plan schema, viewport, state, case, mask, Lighthouse, performance, and non-regression validation.
- `scripts/summarize_browser_artifacts.py`: evidence reconciliation that prevents declared passes from overriding missing files or observed failures.
- `scripts/compare_images.py`: approved mask-rectangle enforcement and dimension mismatch failure.
- `tests/fixtures/chrome-smoke/index.html`: local, deterministic, non-destructive live-smoke target with an inline favicon, Lighthouse metadata, and content-box-safe mobile sizing.
- `tests/fixtures/chrome-smoke/robots.txt` and `tests/fixtures/chrome-smoke/llms.txt`: successful, valid Lighthouse discovery resources that prevent hidden auxiliary 404s.

## Synthetic test results

The red phase proved the new validator did not exist. The green focused phase passed 19 Chrome automation tests and 4 image-comparison tests. Live defects added red-to-green fixture contracts for the implicit favicon request, Lighthouse metadata, required discovery resources, and valid `llms.txt` structure. The final standard-library suite passed 65 tests. Twenty-three Python files parsed through the Python AST, browser JSON templates parsed, Markdown metadata and local links passed, and the repository graph rebuilt to 44,587 nodes, 53,006 edges, and 4,249 communities.

Synthetic coverage includes unavailable Chrome, missing screenshots, console and network violations, geometry and accessibility failures, baseline dimension mismatch, approved-mask bounds, unjustified performance exclusions, incomplete viewports, complete evidence, invalid waivers, and preserved retry history. These tests do not require a live browser.

## Live smoke plan and evidence

The approved target was the skill-owned local static fixture served only on `http://127.0.0.1:8765/index.html`. Direct Chrome DevTools MCP performed the complete sequence in the connected default profile.

| Gate | Final evidence |
|---|---|
| Navigation and readiness | Hard reload with cache ignored; document ready; local page returned 200 |
| Desktop viewport | 1280 x 800 at DPR 1; card width 512; no horizontal overflow |
| Mobile viewport | 390 x 844 at DPR 3 with touch; document client and scroll width both 390; card bounds 16 to 374 and width 358; no horizontal overflow |
| Semantic snapshot | Named `main`, level-one heading, described toggle button, `aria-pressed`, and polite status region present in fresh accessibility snapshots |
| Safe interaction | Toggle transitioned `false -> true -> false`; focus stayed on the button; final state was `Fixture state: idle` |
| Screenshot evidence | Direct MCP PNGs verified as 1280 x 800 desktop and 1170 x 2532 physical-pixel mobile images |
| Console | No messages after the final desktop or mobile hard reload |
| Network | Page inspection showed one successful document request; final server log showed only 200 or 304 for `index.html`, `robots.txt`, and `llms.txt`, with no 4xx or 5xx |
| Desktop Lighthouse | Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100; 28 passed and 0 failed |
| Mobile Lighthouse | Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100; 28 passed and 0 failed |

Two live failures were fixed rather than waived: an implicit favicon 404 and a 390px mobile overflow caused by content-box sizing. Review of the server log then found optional Lighthouse discovery 404s; fixture-owned `robots.txt` and a valid linked `llms.txt` removed them. A first unlinked `llms.txt` correctly failed agentic browsing at 50 before the final linked version restored 100.

Temporary evidence was written to `.chrome-smoke-evidence`, validated, and hashed before cleanup. Final hashes were `dc28bcc9ae30d24e6d3c7b657f7bad8f576b091c8a785f24baee30635deb02dc` for the desktop PNG, `a0d106506b8e5a52bb37d8e96e34c14ea83f7f9e7350ee67b45095aa88c00278` for the mobile PNG, `5b6ee37b51a921b556f38068345f2858e8404af37c5a1f23d2b97c690e578e86` for the desktop Lighthouse JSON, and `df7ca8b3ee0412a7d4807aeb086a4874a703e1d980faaf74eaaaef2bcdb74367` for the mobile Lighthouse JSON. Investigation artifacts are not committed. The created Chrome tab was closed, the control was restored to idle, and the local server was stopped.

## Final approval

- Decision: approved.
- Approver: Aditya Awasthi, through explicit user instruction in this repository session.
- Approved at: `2026-08-04T00:48:30+05:30`.
- Scope: the repository-scoped Storefront Design Director Chrome automation hardening, synthetic contracts, deterministic fixture, desktop and mobile direct-MCP smoke evidence, remediation, and cleanup recorded in this audit.
- Revision: 1.
- Waivers: none.
- Baseline disposition: not applicable. This is a skill-hardening audit rather than a storefront design job, and repository policy prohibits committing Chrome investigation screenshots. Verified dimensions, scores, and hashes remain recorded above.
- Workflow disposition: FINAL_APPROVAL is complete and the audit is ready for the separate ARCHIVED gate. No `design-job.yaml` or checksum registry exists for this prompt-pack audit, so no manifest transition or fabricated `approval-record.yaml` was created.

## Remaining limitations

- Future live proof still depends on Chrome remote debugging being enabled for the connected default profile; a missing endpoint remains a blocked preflight rather than a browser-substitution case.
- In this client, direct `filePath` writes from `take_snapshot` and `take_screenshot` were rejected because no MCP workspace root was accepted. The direct tools still returned snapshots and PNG bytes; the smoke persisted those bytes mechanically to the temporary repository evidence directory before verification and cleanup.
- Lighthouse performance is excluded by the exposed tool; performance metrics require a trace.
- Pillow remains optional for PNG pixel comparison. Dependency-free binary PPM comparison remains available, but a missing PNG comparison dependency blocks rather than passes.
- Automated evidence does not replace semantic visual review or explicit final approval.
