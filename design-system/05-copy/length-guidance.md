---
schema_version: 1
id: copy-length-guidance
title: Copy Length Guidance
type: copy-contract
status: active
summary: Character and clipping guidance for bundle copy fields.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - copy-management
source_paths:
  - design-system/00-inventory/copy-registry.yaml
  - design-system/05-copy/placeholder-contract.md
related_docs:
  - design-system/05-copy/copy-schema.json
  - design-system/05-copy/fallback-rules.md
tags:
  - copy
  - length
  - locale
keywords:
  - truncation
  - character-limit
  - fallback
---

# Copy Length Guidance

## General behavior

- Use concise phrases for mobile-critical CTAs.
- Allow wrapping for summary titles with controlled max lines.
- Keep numeric labels short to avoid control overflow.

## Implementation note

- Long text should degrade gracefully and remain readable without layout shifts.
