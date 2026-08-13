---
schema_version: 1
id: storefront-design-director-plugin-packaging-prompt
title: Storefront Design Director Plugin Packaging
type: prompt-pack
status: active
summary: Defines optional packaging checks for distributing the storefront design director as a plugin.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - skill-packaging
systems:
  - storefront-design-director
source_paths:
  - storefront-design-director-prompt-pack/06-plugin-packaging-prompt.md
related_docs:
  - storefront-design-director-prompt-pack/README.md
tags:
  - prompt
  - plugin
keywords:
  - storefront-design-director
  - packaging
---

# Prompt 6 — Optional plugin packaging

Run only after the skill has completed several successful design jobs and Chrome QA cycles.

---

Package the proven `storefront-design-director` skill into a distributable plugin without changing its workflow behavior.

Source:

```text
.agents/skills/storefront-design-director/
```

## Requirements

1. Use the current official plugin schema available in the environment.
2. Do not invent `.codex-plugin/plugin.json` fields.
3. Preserve the standalone repository-scoped skill.
4. Package a copy or supported reference to the skill according to current plugin rules.
5. Declare Chrome DevTools MCP as a dependency only where the plugin schema supports MCP dependencies.
6. Do not bundle browser profiles, screenshots containing private data, design jobs, credentials, or generated QA artifacts.
7. Include:
   - stable plugin identity
   - version
   - description
   - skill entry
   - Chrome MCP setup/dependency
   - privacy and security notes
   - installation instructions
   - upgrade policy
   - compatibility notes
8. Validate the package with current tooling.
9. Install or load it locally only in a development/test context.
10. Verify explicit invocation and implicit triggering.
11. Verify Chrome QA still blocks when the MCP dependency is unavailable.
12. Verify the plugin does not alter repositories merely by being installed.
13. Create a release checklist.
14. Do not publish externally without explicit user direction.

Produce:

- plugin directory
- package validation report
- local installation instructions
- versioning strategy
- release checklist
- rollback/uninstall instructions
- known limitations

Do not call the plugin complete unless the packaged skill passes the same eval suite as the standalone skill.

---
