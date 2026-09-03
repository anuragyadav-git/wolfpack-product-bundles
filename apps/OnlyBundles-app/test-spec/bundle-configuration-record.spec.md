---
schema_version: 1
id: bundle-configuration-record
title: Bundle Configuration Record
type: test-spec
status: active
summary: Verifies deterministic, human-readable, versioned FPB configuration records generated from persisted merchant configuration.
last_audited: 2026-08-11
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - bundle-configuration-registry
source_paths:
  - scripts/record-bundle-configuration.ts
  - scripts/lib/bundle-configuration-record.ts
related_docs:
  - docs/issues-prod/full-page-bundle-template-fixture-spec.md
tags:
  - fpb
  - fixture
  - configuration
keywords:
  - configuration snapshot
  - fixture registry
---

# Test Spec: Bundle Configuration Record

**Spec ID:** bundle-configuration-record  **Created:** 2026-08-11

## Purpose

Ensure FPB configuration records are complete for merchant-controlled state,
deterministic, human-readable, immutable, and safe to generate from a live
bundle without persisting changes back to the app database.

## Test Cases

### BundleConfigurationRecord

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Normalize an FPB bundle | Bundle, steps, categories, products, and pricing | Classified schema-versioned configuration | Operational fields are excluded |
| 2 | Preserve meaningful empty states | `false`, `null`, `[]`, and `{}` values | Values remain distinguishable | No default fabrication |
| 3 | Deterministic serialization | Equivalent objects with different map key order | Identical JSON and SHA-256 hash | Ordered semantic arrays remain ordered |
| 4 | Render readable Markdown | Normalized configuration | Labeled sections, tables, and explicit disabled/not-configured states | Markdown includes required frontmatter |
| 5 | Diff configuration versions | Previous and current normalized records | Categorized added, changed, and removed paths | Used by snapshot and index history |
| 6 | Write an immutable snapshot | Valid bundle, label, timestamp, and empty target directory | JSON, Markdown, and bundle index are written | File stem is timestamp plus slugged label |
| 7 | Refuse overwrite | Existing snapshot uses the same file stem | Recorder throws and leaves existing files intact | Snapshots are immutable |
| 8 | Reject invalid capture targets | Missing bundle, shop mismatch, or non-FPB bundle | Clear failure and no output files | Database remains read-only |

## Acceptance Criteria

- [x] All listed test cases pass.
- [x] Merchant-configurable FPB fields are represented once in a classified schema.
- [x] Shopify linkage, sync state, database timestamps, and other operational fields are excluded.
- [x] Snapshot JSON is deterministic and lossless for the selected merchant configuration.
- [x] Generated Markdown begins with the repository-standard metadata fields.
- [x] Existing snapshots can never be overwritten.
- [x] The recorder performs no database mutation.
