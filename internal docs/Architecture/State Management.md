---
schema_version: 1
id: state-management
title: State Management
type: architecture
status: authoritative
summary: Defines route-owned Redux boundaries and the client state that remains outside Remix loaders and actions.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
systems:
  - redux
  - remix
source_paths:
  - app/store/
  - app/routes/app/app.dashboard/route.tsx
  - app/routes/app/app.settings.tsx
  - app/routes/app/app.settings_.controls.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/route.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - state-management
  - performance
keywords:
  - ReduxProvider
  - vendor-state
---

# State Management

Admin client state uses Redux Toolkit under `app/store/`.

## Boundaries

- Remix loaders/actions remain the primary route data model.
- Redux owns client-only Admin UI state: modal keys, toast list, navigation state, loading flags, preferences, design settings draft state, shared bundle configure draft state, subscription cache, and small app meta state.
- RTK Query is used only for standalone client-side server-state calls that were already direct fetch/fetcher flows:
  - `GET /app/store-files`
  - `POST /app/upload-store-file`
  - `GET /app/upload-store-file?fileId=...`
  - `POST /api/ensure-product-template`
- Shopify App Bridge side effects stay in route code and hooks. Settings Design,
  Language, and Controls save feedback uses the native App Bridge Toast API;
  failed saves use its error state and a five-second duration.
- Storefront widget runtime state stays outside Redux.

## Provider

The shared authenticated layout does not mount `ReduxProvider`. Dashboard, the
FPB/PPB configure routes, and each route that directly renders the Settings
workspace own the provider because they consume Redux/RTK Query state. Billing
feedback and cancellation confirmation use route-local React state. Routes
without state consumers must not import `ReduxProvider`; this keeps
`vendor-state` out of their production manifest entries.

## Slices

- `uiSlice` — keyed modals, toasts, navigation, global loading.
- `preferencesSlice` — localStorage-backed Admin preferences and recent bundles.
- `designSettingsSlice` — design settings draft buckets by bundle type.
- `bundleConfigureSlice` — shared bundle configure draft fields.
- `adminRouteStateSlice` — route-level Admin UI state for dashboard delete confirmation, billing feedback/cancel state, and cart-transform create form state.
- `configureRouteStateSlice` — shared FPB/PPB configure route state for dirty tracking, configure modals, page selection, bundle product draft metadata, selected collections, rule messages, active tab/section, and configure banners.
- `subscriptionSlice` — client subscription cache used by existing hooks.
- `metaSlice` — initialized/version metadata for hook compatibility.

## Compatibility Layer

`app/hooks/useAppState.ts` and `app/contexts/AppStateContext.tsx` keep the old hook names and return shapes while dispatching Redux actions. Production code should not import `appState` from `app/services/app.state.service.ts`.

`AppStateService` remains only as legacy code until deleted safely; do not add new imports.
