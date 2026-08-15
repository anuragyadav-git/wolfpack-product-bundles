---
schema_version: 1
id: storefront-design-director-readme
title: Storefront Design Director
type: skill-readme
status: active
summary: Installation, operation, lifecycle, and troubleshooting guide for repository-scoped storefront design jobs.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - skill
  - design-operations
keywords:
  - design-job
  - handoff
  - chrome-qa
---

# Storefront Design Director

This repository-scoped skill turns storefront design requests into durable design jobs, approved contracts, implementation handoffs, and browser QA evidence. It never silently edits production storefront code while acting as design director.

## Installation and invocation

The skill is installed at .agents/skills/storefront-design-director and can be invoked with:

~~~text
$storefront-design-director new: redesign the FPB Standard product card from these current and target screenshots
~~~

Resume with:

~~~text
$storefront-design-director resume design-jobs/fpb-standard-card-20260803
~~~

Run the post-implementation gate with:

~~~text
$storefront-design-director qa design-jobs/fpb-standard-card-20260803 using the returned implementation branch
~~~

## Job commands

~~~bash
python3 .agents/skills/storefront-design-director/scripts/init_design_job.py "FPB Standard product card" --repository .
python3 .agents/skills/storefront-design-director/scripts/validate_design_job.py design-jobs/<job-id>/design-job.yaml --json
python3 .agents/skills/storefront-design-director/scripts/update_job_stage.py design-jobs/<job-id>/design-job.yaml SCOPE --reason "Discovery evidence recorded"
python3 .agents/skills/storefront-design-director/scripts/record_artifact.py design-jobs/<job-id>/design-job.yaml component-brief.md complete
python3 .agents/skills/storefront-design-director/scripts/validate_handoff.py design-jobs/<job-id>/design-job.yaml --json
python3 .agents/skills/storefront-design-director/scripts/package_handoff.py design-jobs/<job-id> design-jobs/<job-id>-handoff.zip
~~~

The generated .yaml files use JSON-compatible YAML so the scripts remain dependency-free. If a user converts a file to block-style YAML, install PyYAML in the execution environment. Comments are not preserved when a manifest is rewritten.

## Lifecycle

The job advances through discovery, scope, reference intake and validation, visual analysis, direction approval, component contracts, optional prototype, handoff, implementation return, Chrome QA, remediation, final approval, and archive. Every stage transition is appended to history with a reason, revision, and evidence paths.

Approved artifacts are immutable. A changed decision creates a new revision and identifies affected downstream contracts.

Each generated artifact carries job ID, revision, and status metadata plus a manifest checksum. Use record_artifact.py to mark completion or approval. Never edit checksum records manually. Superseding an approved artifact requires an explicit reason and creates preserved revision history.

Use references/reference-loading-map.md to load only the current stage's guidance. references/example-conversations.md demonstrates nine common dialogue and recovery patterns.

## Artifact placement

assets/templates/settings.yaml defaults artifact_root to design-jobs. The initializer rejects roots under common production or generated asset directories. Override the root only when the repository already has an approved design-artifact location.

## Chrome DevTools MCP setup

Chrome DevTools MCP must expose the connected host's real page navigation, input, accessibility-tree, script evaluation, screenshot, console, network, and applicable quality capabilities. Tool names vary by host, so the skill detects capabilities at CHROME_QA_PREFLIGHT and records what is actually available.

Always use the currently connected default Chrome profile. Do not create isolated browser contexts, dedicated QA profiles, secondary profiles, or alternate user-data directories. Omit isolatedContext when opening a page. If authentication is missing, ask the user to authenticate in the default profile and then resume the same preflight.

If no Chrome DevTools MCP capability is exposed:

1. Keep qa.preflight_status blocked.
2. Configure the Chrome DevTools MCP server in the current Codex host using that host's supported MCP configuration.
3. Restart or reconnect the host so the tools appear.
4. Resume the same design job at CHROME_QA_PREFLIGHT.

Do not use another browser to mark this gate complete.

Copy `chrome-preflight-result.yaml` to `qa/preflight.json`, verify every mandatory check, then execute the validated `browser-test-plan.yaml`. Case results use `browser-case-result.json`. Summarize them with `scripts/summarize_browser_artifacts.py`; the summary independently reconciles screenshots, diffs, assertions, console, network, Lighthouse, performance, waivers, and retries.

## Tests

~~~bash
python3 -m unittest discover -s .agents/skills/storefront-design-director/tests -p 'test_*.py'
python3 .agents/skills/storefront-design-director/scripts/run_skill_evals.py --skill-root .agents/skills/storefront-design-director --output-dir .agents/skills/storefront-design-director/evals/results/latest
~~~

Tests use only the Python standard library. Pillow is optional for PNG/JPEG visual diffs; binary PPM comparison remains available without it. The eval runner reports deterministic and model-dependent status separately, so a local corpus pass never stands in for unexecuted Codex or Chrome evidence.

## Troubleshooting

- Manifest parse error: keep generated JSON-compatible YAML or install PyYAML for block-style YAML.
- Existing job collision: pass --resume only when continuing the same job.
- Illegal transition: inspect history and references/workflow-state-machine.md; resume from the failed gate.
- Image comparison blocked: install Pillow or convert deterministic captures to binary PPM. Do not report a pass.
- Chrome preflight blocked: configure the required MCP integration and resume; preserve all current artifacts.
- Chrome tools exposed but `DevToolsActivePort` missing: in the existing default-profile Chrome, open `chrome://inspect/#remote-debugging`, enable remote debugging, approve the incoming connection prompt, and retry. Do not add an alternate user-data directory.
- Authentication barrier: ask the user to authenticate in the default Chrome profile and use safe fixture data. Never create an alternate profile or capture credentials, cookies, or private response bodies.
- Unstable visual diff: stabilize data, fonts, images, animation, scroll position, viewport, zoom, and dynamic masks before retrying.

Windows is not a primary target. The Python scripts use pathlib and should work, but Chrome profile setup and repository shell commands must be adapted to the host.
