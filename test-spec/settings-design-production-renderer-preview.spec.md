---
schema_version: 1
id: settings-design-production-renderer-preview
title: Settings Design Production Renderer Preview Test Spec
type: test-spec
status: active
summary: Verifies that Settings Design uses isolated production FPB and PPB renderers with deterministic side-effect-free fixtures.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-design
  - design-preview
source_paths:
  - app/routes/app/app.settings/storefront-preview-protocol.ts
  - app/routes/app/app.settings/storefront-preview-fixtures.ts
  - app/routes/app/app.settings/storefront-preview-interactions.ts
  - app/routes/root/settings-design-preview-frame/route.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - production-renderer
  - visual-parity
keywords:
  - preview-frame
  - storefront-renderer
  - iframe-isolation
---

# Test Spec: Settings Design Production Renderer Preview
**Spec ID:** settings-design-production-renderer-preview  **Created:** 2026-08-27

## Purpose

Ensure Settings Design previews use the production storefront renderer and exact template stylesheet manifest without storefront data loading, cart mutation, analytics, navigation, or persisted preview state.

## Test Cases

### SettingsDesignProductionRendererPreviewSuite

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid parent command | Version 1 command with canonical template and surface | Command is accepted | Pure protocol validation |
| 2 | Invalid parent command | Wrong version, template, viewport, or missing payload | Command is rejected | No silent fallback |
| 3 | Valid child event | READY, STATE_CHANGED, or ERROR event | Event is accepted | Pure protocol validation |
| 4 | Template stylesheet selection | Each of eight canonical template keys | Exact family base and template stylesheet manifest | Matches Liquid asset composition |
| 5 | Deterministic fixture | FPB or PPB template | Canonical bundle payload and hydrated product cache | No network source is required |
| 6 | Preview safety | Deterministic fixture | Cart, analytics, persistence, and external navigation capabilities remain disabled | Frame actions are visual only |
| 7 | Frame route isolation | Preview-frame pathname | Admin App Bridge, Polaris CDN, font CDN, Crisp, and scroll restoration are omitted | Remix scripts remain for hydration |
| 8 | Normal Admin document | Any other pathname | Existing Admin document dependencies remain unchanged | Protects embedded Admin behavior |
| 9 | Parent frame transport | Design state changes | Latest normalized runtime command is posted after READY | Unsaved changes appear immediately |
| 10 | Invalid message source | Wrong origin or source window | Message is ignored | Same-origin parent only |
| 11 | Product picker focus | Rendered slot trigger exists | Production slot interaction opens the picker | Preserves the storefront event path |
| 12 | Product picker fallback | No rendered slot trigger exists | Production controller opens step zero | Keeps non-slot templates operable |
| 13 | Overlay ownership | Production controller creates body-level overlays | Overlays move into the stable preview-frame host | Survives React document reconciliation |
| 14 | PPB drawer stylesheet composition | PPB preview manifest | Every production base module used by the picker drawer is loaded explicitly | Protects Vite-served Admin preview composition |
| 15 | FPB storefront host contract | Each Landing Page template | The production controller mounts inside the same full-page host contract as the storefront app embed | Chrome geometry evidence; no class-name unit assertion |
| 16 | FPB responsive parity | Standard, Classic, Compact, and Horizontal at desktop and mobile widths | Production grid, sidebar/tray, cards, and component surfaces use their storefront geometry | Direct Chrome DevTools verification |

## Acceptance Criteria

- [x] All eight templates reuse the production renderer and exact storefront CSS sources.
- [x] No synthetic bundle surface remains in the live preview path.
- [x] Preview fixtures are deterministic and require no Shopify or app-proxy request.
- [x] Preview interactions cannot mutate cart, analytics, storage, navigation, or server state.
- [x] The preview frame is isolated from Admin-only document dependencies.
- [x] Focused behavior tests, lint, build, Graphify, and direct Chrome QA pass.
- [x] All four FPB templates mount with the storefront full-page host contract and pass refreshed desktop/mobile Chrome comparison.
