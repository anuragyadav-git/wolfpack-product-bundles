---
schema_version: 1
id: storefront-design-director-prompt-pack
title: Storefront Design Director Skill Build Prompt Pack
type: prompt-pack-index
status: active
summary: Indexes the ordered prompts used to build, harden, evaluate, pilot, and package the storefront design director skill.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - storefront-design-director-prompt-pack
related_docs:
  - .agents/skills/storefront-design-director/README.md
tags:
  - prompt-pack
  - skill-build
keywords:
  - storefront-design-director
  - build-order
---

# Storefront Design Director — Skill Build Prompt Pack

This pack creates a repository-scoped `storefront-design-director` Agent Skill that guides a user from rough intent and screenshots through an approved, responsive storefront component design, a Codex-ready implementation handoff, and post-implementation visual QA through Chrome DevTools MCP.

## Recommended order

1. Run `01-master-build-prompt.md` with `$skill-creator` or a capable Codex session at the repository root.
2. Run `02-architecture-and-content-audit-prompt.md`.
3. Run `03-chrome-devtools-automation-hardening-prompt.md`.
4. Run `04-skill-evals-and-regression-suite-prompt.md`.
5. Run `05-wolfpack-pilot-run-prompt.md`.
6. After several successful real projects, optionally run `06-plugin-packaging-prompt.md`.

Do not combine all prompts into one agent turn unless the coding agent has a very large, reliable context window. The staged sequence makes omissions easier to detect and correct.

## Expected installation location

Use the current repository-scoped skill location:

```text
.agents/skills/storefront-design-director/
```

## Chrome DevTools MCP prerequisite for Codex

```bash
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

For deterministic, unauthenticated local testing, an isolated profile is preferable. Configure the MCP server with `--isolated=true`; use `--headless=true` where visible browser review is not required. For authenticated storefront sessions, use a dedicated test profile or a deliberately shared Chrome session, never a personal browsing profile containing unrelated sensitive data.

## Operating principle

The design image is a visual reference. The durable source of truth is the approved design job package:

- scope and problem statement
- reference inventory
- locked decisions
- component anatomy
- state matrix
- responsive contract
- design tokens
- interaction and accessibility contract
- Codex handoff
- automated browser test plan
- visual QA report
- approval and regression baselines
