---
schema_version: 1
id: storefront-design-director-reference-loading-map
title: Storefront Design Director Reference Loading Map
type: skill-reference
status: active
summary: Maps each workflow stage to the smallest useful reference set for progressive disclosure.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - design-operations
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/reference-loading-map.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - progressive-disclosure
keywords:
  - reference-loading
  - workflow-stage
---

# Reference Loading Map

Load SKILL.md and the active design-job manifest first. Load only the row for the current stage plus a named cross-cutting reference when a concrete risk requires it. Do not preload the entire skill.

| Stage group | Load | Add only when needed |
|---|---|---|
| DISCOVERY and SCOPE | conversational-guidance.md, wolfpack-domain-context.md | code-ownership-and-handoff.md for repository ownership |
| REFERENCE_INTAKE and REFERENCE_VALIDATION | screenshot-intake-protocol.md | failure-and-recovery.md for unusable evidence |
| VISUAL_ANALYSIS | visual-analysis-rubric.md | design-token-and-geometry-guide.md for measured values |
| DIRECTION_EXPLORATION and DIRECTION_APPROVAL | conversational-guidance.md, visual-analysis-rubric.md | prototype-guidance.md when static directions cannot resolve risk |
| COMPONENT_ANATOMY | ecommerce-component-catalog.md, code-ownership-and-handoff.md | wolfpack-domain-context.md in Wolfpack repositories |
| STATE_CONTRACT | state-coverage-catalog.md | interaction-and-accessibility.md for state semantics |
| RESPONSIVE_CONTRACT | responsive-design-contract.md | screenshot-intake-protocol.md when captures are not comparable |
| INTERACTION_ACCESSIBILITY | interaction-and-accessibility.md | state-coverage-catalog.md for recovery paths |
| TOKENS_GEOMETRY | design-token-and-geometry-guide.md | visual-comparison-rubric.md for tolerance policy |
| PROTOTYPE_OPTIONAL | prototype-guidance.md | security-and-privacy.md before browser-connected work |
| HANDOFF_ASSEMBLY and HANDOFF_VALIDATION | code-ownership-and-handoff.md, output-contracts.md | wolfpack-domain-context.md for generated assets and sibling scope |
| IMPLEMENTATION_AWAITED | output-contracts.md | failure-and-recovery.md when implementation diverges |
| CHROME_QA_PREFLIGHT and CHROME_QA_EXECUTION | chrome-devtools-test-protocol.md, chrome-flow-recipes.md, security-and-privacy.md | visual-comparison-rubric.md for image evidence |
| VISUAL_REMEDIATION | visual-comparison-rubric.md, code-ownership-and-handoff.md | failure-and-recovery.md for blocked reruns |
| FINAL_APPROVAL and ARCHIVED | output-contracts.md, workflow-state-machine.md | security-and-privacy.md before packaging or retention |

Load example-conversations.md only when response shape or question discipline is uncertain. Load failure-and-recovery.md whenever a gate is blocked. Load security-and-privacy.md before any Chrome session, evidence capture, package, or production read.
