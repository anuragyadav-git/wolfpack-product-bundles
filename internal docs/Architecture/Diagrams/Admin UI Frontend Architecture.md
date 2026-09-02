---
schema_version: 1
id: wpb-admin-ui-frontend
title: Admin UI Frontend Architecture
type: architecture-diagram
status: authoritative
summary: Embedded Shopify Admin frontend composition, Shopify-native locale ownership, provider hierarchy, Remix data flow, and route-owned configure adapters.
last_audited: 2026-09-02
owners:
  - Engineering
domains:
  - admin-ui
  - frontend
  - bundle-configuration
systems:
  - Shopify Admin iframe
  - App Bridge
  - Polaris Web Components
  - Remix
  - React
  - Redux Toolkit
  - i18next
source_paths:
  - app/routes/app/app.tsx
  - app/i18n/
  - app/store/ReduxProvider.tsx
  - app/store/
  - app/routes/app/_shared/bundle-configure/CommonConfigureShell.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleFlow.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/route.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbConfigureFlow.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext.tsx
related_docs:
  - ../Admin Configure Page.md
  - ../State Management.md
  - ../../Shopify Integration/Admin API.md
tags:
  - architecture
  - mermaid
  - admin-ui
  - app-bridge
  - polaris
keywords:
  - CommonConfigureShell
  - useConfigureBundleFlow
  - usePpbConfigureFlow
  - SaveBar
  - shopify.config.locale
  - ReduxProvider
  - Polaris Web Components
---

# Admin UI Frontend Architecture

```mermaid
flowchart TB
    Admin[Merchant in Shopify Admin]
    Iframe[Cross-origin embedded app iframe]

    subgraph RouteShell[Authenticated Remix app shell]
        RootLoader[App loader: session, Shopify request locale, API key]
        NativeLocale[App Bridge shopify.config.locale]
        AppProvider[Shopify AppProvider and App Bridge]
        Redux[ReduxProvider]
        I18n[I18nextProvider]
        Nav[s-app-nav]
        Outlet[Remix Outlet]
    end

    subgraph RouteData[Route-owned server boundary]
        Loader[Authenticated route loader]
        Action[Authenticated intent-based route action]
        LoadSources[Prisma bundle plus Shopify Admin reads]
        Handlers[Save, sync, preview, placement, and template handlers]
    end

    subgraph Configure[FPB and PPB configure frontend]
        FpbFlow[FPB useConfigureBundleFlow controller composition]
        PpbFlow[PPB usePpbConfigureFlow plus context provider]
        SharedShell[CommonConfigureShell]
        Header[Route-owned canvas header]
        Sidebar[Route-owned sidebar]
        Sections[Polaris-first configuration sections]
        Overlays[Modals, pickers, and dialogs]
        SaveBar[App Bridge SaveBar]
        Draft[Route draft state and Redux client-only UI state]
    end

    subgraph ServerEffects[Save result]
        Persist[Persist canonical bundle in PostgreSQL]
        Sync[Run synchronous storefront sync]
        Compact[Return compact success or error response]
    end

    Admin --> Iframe
    Iframe --> RootLoader
    RootLoader --> AppProvider
    AppProvider --> NativeLocale
    AppProvider --> Redux
    Redux --> I18n
    NativeLocale --> I18n
    I18n --> Nav
    I18n --> Outlet
    Outlet --> Loader
    Loader --> LoadSources
    LoadSources --> FpbFlow
    LoadSources --> PpbFlow
    FpbFlow --> SharedShell
    PpbFlow --> SharedShell
    SharedShell --> SaveBar
    SharedShell --> Header
    SharedShell --> Sidebar
    SharedShell --> Sections
    SharedShell --> Overlays
    Header --> Draft
    Sidebar --> Draft
    Sections --> Draft
    Overlays --> Draft
    Draft -->|dirty state| SaveBar
    SaveBar -->|FormData with intent| Action
    Action --> Handlers
    Handlers --> Persist
    Persist --> Sync
    Sync --> Compact
    Compact -->|fetcher response| Draft
```

## Ownership boundaries

- Shopify owns each Admin user's locale preference. The initial request `locale` parameter and client-side `shopify.config.locale` select the matching i18next and Polaris resources; the app does not persist or render a separate locale preference.
- The app shell owns authentication bootstrap, App Bridge, lazy locale-resource loading, Redux, localization, and global navigation.
- All embedded Admin routes, shared components, banners, modals, form labels, and accessibility labels consume the common Admin catalogs. Unsupported Shopify locales fall back to English; Simplified Chinese resolves from `zh`, `zh-Hans`, and `zh-CN`.
- Remix loaders/actions remain the route data boundary; Redux stores only client-side Admin state and selected standalone client calls.
- FPB and PPB keep separate route URLs, loaders, actions, save handlers, and storefront sync contracts.
- `CommonConfigureShell` owns shared shell composition only. FPB and PPB flows inject their own header, sidebar, sections, overlays, draft logic, and save semantics.
- Admin components use Polaris web components first; custom HTML is reserved for documented gaps such as the configure shell grid and specialized overlays.
