---
schema_version: 1
id: local-dev-process-runtime-logs
title: Local Dev Process and Runtime Logs
type: operations
status: authoritative
summary: Operational notes for tracing Shopify storefront dev process trees and locating safe log sources.
last_audited: 2026-07-31
owners:
  - engineering
domains:
  - storefront
  - development
systems:
  - shopify
  - developer-tooling
source_paths:
  - AGENTS.md
  - internal docs/Operations/Local Dev Process and Runtime Logs.md
related_docs:
  - internal docs/index.md
  - AGENTS.md
tags:
  - processes
  - logs
  - chrome-devtools
keywords:
  - pid
  - lsof
  - process-tree
  - shopify app dev
---

# Local Dev Process and Runtime Logs

## Goal

Provide a repeatable method to identify which process is producing runtime output during local development and where logs are sourced.

## Observed process layout (example)

- Shell PID `80015` was `/bin/zsh -il`.
- Child process `54152` was the active Node process:
  - `node /Users/adityaawasthi/.nvm/versions/node/v25.1.0/bin/shopify app dev --config shopify.app.wolfpack-product-bundles-sit.toml`
- Node descriptors included `/dev/ttys006` for stdin/stdout/stderr and internal pipes (`lsof -p 54152` showed pipe endpoints `4` ↔ `5`).

## How to locate runtime logs safely

1. Find the active shell PID (`ps -p <shell_pid>`).
2. Resolve child Node PID (`ps -ef | grep <shell_pid>` or equivalent).
3. Inspect file descriptors for that Node PID (`lsof -p <node_pid>`).
4. Prefer collecting logs from files or explicit log sinks where available, not direct TTY reads.

If logs are only attached to shell TTY descriptors, capture logs from the terminal session that started the process rather than trying to tail `/dev/ttys*` directly.
