# Test Spec: PPB Design Media Ownership
**Spec ID:** ppb-design-media-ownership  **Created:** 2026-09-10

## Purpose

Make Settings → Design the single store-level loading-screen owner for FPB and
PPB while removing the redundant PPB Images & GIFs configure section.

## Test Cases

### Configure navigation and persistence

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build FPB navigation | `full_page` | Images & GIFs remains available | FPB bundle media is unchanged |
| 2 | Build PPB navigation | `product_page` | Images & GIFs is absent | No inaccessible section remains |
| 3 | Save a PPB with retired media values | `loadingGif` and `bannerImageUrl` in the request | Neither field is written; `stepImage` remains canonical | Prevents the removed editor from retaining ownership |

### Shared Design loading screen

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 4 | Resolve valid Design loading settings | HTTPS GIF and valid color | Normalized shared loading-screen object | One validation owner |
| 5 | Resolve invalid Design loading settings | Non-HTTPS GIF and invalid color | Default spinner and white background | Fail closed |
| 6 | Build PPB Shopify-hosted runtime | Product-page Design settings | Runtime contains the normalized shared loading screen | No app-proxy request |
| 7 | Select loading preview from a PPB template | PPB template plus loading field | Loading scenario remains selected | Design preview covers both bundle families |

### PPB storefront rendering

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 8 | Render initial or action loading | Shared runtime GIF | PPB overlay uses the shared GIF and background | Ignores retired bundle-level GIF |
| 9 | Render modal product loading | Shared runtime GIF | Modal loading status uses the shared GIF | Default spinner remains when unset |

## Acceptance Criteria

- [x] PPB Configure no longer exposes or renders Images & GIFs.
- [x] FPB Configure Images & GIFs remains unchanged.
- [x] Settings → Design owns one loading GIF and background for FPB and PPB.
- [x] PPB storefront loading surfaces consume only Shopify-hosted Design runtime.
- [x] Removed PPB media code, state, save fields, and stale tests are deleted.
- [x] Widget assets are rebuilt with a major version bump.
