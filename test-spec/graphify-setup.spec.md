---
schema_version: 1
id: graphify-setup
title: Graphify Setup Test Spec
type: test-spec
status: active
summary: Verifies Graphify source isolation, public rebuild behavior, graph integrity, MCP registration, and repository hook coverage.
last_audited: 2026-08-24
owners:
  - engineering
domains:
  - developer-tooling
systems:
  - graphify
source_paths:
  - .graphifyignore
  - scripts/rebuild-graphify.mjs
  - scripts/rebuild-graphify-core.cjs
related_docs:
  - internal docs/Operations/Build Process.md
tags:
  - graphify
  - knowledge-graph
keywords:
  - generated wiki
  - graph integrity
---

# Test Spec: Graphify Setup

**Spec ID:** graphify-setup  **Created:** 2026-06-20

## Purpose

Verify the repository graph is built only from owned source material, uses
Graphify's supported public CLI, removes stale or duplicate graph data, and is
available through the expected local hooks and Codex MCP registration.

## Test Cases

### GraphifyWrapper

| # | Scenario | Input | Expected Output | Notes |
|---|----------|-------|-----------------|-------|
| 1 | Existing graph contains stale `file_type: "concept"` nodes | Graph sanitization | `concept` is normalized to `document` | Keeps output compatible with current Graphify validation. |
| 2 | Wrapper performs an incremental forced rebuild | Rebuild command selection | Public CLI arguments are `update . --force` | No private Python module imports. |
| 3 | Graphify writes support files | `git status --short --ignored` | Generated support files remain ignored | Tracked report and graph remain visible. |
| 4 | Graph query is usable | `graphify query "what depends on ProductPageSelectionMethods?" --budget 600` | Command exits 0 with graph nodes | Validates CLI can read the rebuilt graph. |
| 5 | Graphify scans repo sources | Live source detection | No files under generated outputs, local tool state, or `Wolfpack: Product Bundles/` are detected | Prevents recursive wiki ingestion. |
| 6 | Existing graph contains old generated-output or no-longer-detected nodes | Graph sanitization | Nodes outside live detection are pruned with their edges | Required because incremental rebuilds can preserve old nodes. |
| 7 | Existing graph contains repeated hyperedge IDs | Graph sanitization | One hyperedge per ID remains | Removes incremental accumulation without changing normal links. |

### LocalIntegration

| # | Scenario | Input | Expected Output | Notes |
|---|----------|-------|-----------------|-------|
| 8 | Official Git hooks are inspected | `graphify hook status` | `post-commit` and `post-checkout` report installed | Tracked `.githooks/pre-commit` remains intact. |
| 9 | Codex starts Graphify MCP | User Codex config | Absolute `graphify-mcp` command reads this repo's `graph.json` | Avoids the system-Python environment mismatch. |
| 10 | Graph remains above visualization threshold | Rebuilt node count above 5,000 | `graphify tree` generates `GRAPH_TREE.html` | Tree is the supported large-graph fallback. |

## Acceptance Criteria

- [ ] Installed `graphify` is version 0.9.48 or newer
- [ ] `npm run graphify:rebuild` exits 0 through the public CLI
- [ ] Graph validation reports zero invalid file types and duplicate hyperedge IDs
- [ ] No graph node has a source under `Wolfpack: Product Bundles/` or `graphify-out/`
- [ ] `graphify hook status` reports post-commit and post-checkout installed
- [ ] Codex has a Graphify MCP server entry using the uv-managed executable
- [ ] Generated support files and local tool/editor state are excluded
- [ ] `graphify query`, `graphify path`, and `graphify tree` succeed
