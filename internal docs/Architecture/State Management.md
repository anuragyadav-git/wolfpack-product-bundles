---
schema_version: 1
id: state-management
title: State Management
type: architecture
status: authoritative
summary: Defines Remix server-state ownership and route-local React state boundaries for the embedded Admin app.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
systems:
  - react
  - remix
source_paths:
  - apps/OnlyBundles-app/app/hooks/configure-route-state.ts
  - apps/OnlyBundles-app/app/hooks/useBundleConfigurationState.ts
  - apps/OnlyBundles-app/app/hooks/useDashboardState.ts
  - apps/OnlyBundles-app/app/lib/admin-store-files.client.ts
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/route.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - state-management
  - performance
keywords:
  - useReducer
  - useFetcher
  - App Bridge fetch
---

# State Management

## Ownership

- Remix loaders and actions own route server state and mutations.
- Route-local `useState` and `useReducer` own transient Admin UI state. The
  configure reducer keeps the existing hook return shape while replacing the
  former shared Redux slice.
- Remix fetchers own route-bound asynchronous submissions and revalidation.
- Shopify Files uploads and processing-status polls use relative, App
  Bridge-authenticated `fetch` requests through
  `app/lib/admin-store-files.client.ts`. There is no client-side Files library
  listing or parallel picker state; Polaris `s-drop-zone` owns local file
  selection.
- Shopify App Bridge owns title-bar, save-bar, toast, and resource-picker
  interactions.
- Storefront controllers own storefront state; it is not shared with Admin.

There is no global Redux provider, Redux Toolkit slice, RTK Query API, or
`vendor-state` bundle. New route state must stay local unless a concrete
cross-route persistence requirement is demonstrated.

## Configure Routes

FPB and PPB keep their separate feature hooks and save contracts. Their hooks
compose typed return values through direct imports rather than mutating or
spreading a service-locator object. Shared helpers are imported from their
owning module; a compatibility re-export barrel is not an ownership boundary.

## Performance Boundary

Do not add a client cache library for data already supplied by a loader or
managed by a fetcher. Any new server-state library requires a measured route
problem and an LCP/SIT comparison against the current Remix path.
