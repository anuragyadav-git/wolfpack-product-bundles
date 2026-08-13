---
schema_version: 1
id: storefront-design-director-prototype-guidance
title: Standalone Prototype Guidance
type: skill-reference
status: active
summary: Defines when and how isolated storefront prototypes may reduce design ambiguity without becoming production code.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - prototyping
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/prototype-guidance.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - prototype
keywords:
  - isolated-preview
  - semantic-html
---

# Prototype Guidance

Create a standalone prototype only when it resolves a high-risk interaction, responsive transformation, or state transition more clearly than static artifacts.

- Keep it under the design job's prototype directory.
- Do not import production modules or mutate production configuration.
- Use semantic HTML and deterministic fixtures.
- Model approved behavior only and label simulated logic.
- Include keyboard, focus, long-content, empty, error, and reduced-motion states in scope.
- Use job tokens rather than inventing a second system.
- Record viewport and browser conditions.

The prototype is lower priority than product semantics, repository architecture, and approved contracts. Record revision, questions answered, production differences, and approval.
