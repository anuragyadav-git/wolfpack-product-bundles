---
schema_version: 1
id: settings-language-runtime-test-spec
title: Settings Language Runtime Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for store-level language configuration across Admin and storefront runtimes.
last_audited: 2026-08-21
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-language
source_paths:
  - app/lib/settings-language-runtime.ts
  - app/routes/app/app.settings.tsx
related_docs:
  - internal docs/EB Settings Language Reference.md
tags:
  - language
  - testing
keywords:
  - locale resolution
  - text overrides
---

# Test Spec: Settings Language Runtime
**Spec ID:** settings-language-runtime  **Issue:** [eb-settings-language-parity-1]  **Created:** 2026-06-04  **Updated:** 2026-08-21

## Purpose
Verify Settings -> Language creates an EB-shaped store-level language contract for both Landing Page and Product Page bundle storefronts.

## Test Cases

### SettingsLanguageRuntime
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Multilanguage enabled | `isMultilanguageEnabled: true` | `languageMode` is `MULTIPLE` | Matches EB save document |
| 2 | Shared cart labels | Custom shared cart fields | `sharedComponents.en.cartAndCheckout` and `sharedCartLabels` use custom values | Used by cart line display |
| 3 | Landing page labels | Custom FPB product and cart labels | `en.general` and FPB `textOverrides` map to widget keys | FPB active runtime remains field objects |
| 4 | Product page labels | Custom PPB product and cart labels | `mixAndMatchTextData.en` and PPB `customTextSettings` map to independent widget keys | Product card add and bundle ATC stay separate |
| 5 | Product page inline card labels | Custom `productCardAddBtnText_inPage`, `productVariantLabelText`, plus modal add text | PPB `textOverrides.productCardInlineAddButton` and `productVariantLabel` map separately from `productCardAddButton` | Product Grid and Cascade cards use EB inline add copy; selectors use active variant label |
| 6 | Product page bundle cart labels | Custom inline drawer and selected-products labels | PPB `textOverrides.viewBundleItems` and `bundleCartSelectedProductsText` map from EB runtime keys | Cascade bundle cart copy uses active locale |
| 7 | Product page validation labels | Custom quantity and amount validation messages | PPB `textOverrides` maps validation message aliases used by Product Page modal/in-page navigation | Validation toasts use active locale instead of hardcoded copy |
| 8 | Exact locale resolution | MULTIPLE document with `fr`, request `fr` | French FPB, PPB, and shared labels are returned | Locale matching is case-insensitive |
| 9 | Regional locale resolution | MULTIPLE document with `pt-BR`, request `pt-br` | Brazilian Portuguese values are returned | Exact regional locale wins |
| 10 | Base locale resolution | MULTIPLE document with `fr`, request `fr-CA` | French values are returned | Falls back from regional request to configured base locale |
| 11 | Single-language mode | SINGLE document with `fr`, request `fr` | English values are returned | SINGLE always resolves English |
| 12 | Unsupported locale | MULTIPLE document, request unknown locale | English values are returned | Deterministic fallback |
| 13 | Locale removal | Remove non-English locale | Locale is absent from FPB, PPB, and shared roots | English cannot be removed |
| 14 | Agent field scope | Default document | No personalization, gift-message, video-message, or personalization-charge roots exist | Agent has no customer-message feature |
| 15 | Product Page success label | Custom Add Bundle Success label | PPB runtime and text overrides expose the saved value | Used by successful bundle add toast |
| 16 | Supported locales | Locale catalog | All 39 current EB locale labels and codes are present | Includes Serbian |
| 17 | Storefront route locale | Configured locale query | Response resolves the requested locale | Applies to FPB and PPB bundle types |
| 18 | Storefront route failure | Persistence read throws | English defaults are returned without caching | Widget remains usable |
| 19 | Locale default preset | Add any supported non-English locale | Every field receives translated default copy and all template variables are preserved | No runtime translation service |
| 20 | Variables action | Open a field group containing template variables | Polaris opens the Variables modal through its overlay command | Works inside the embedded Admin iframe |
| 21 | Mobile section navigation | Open Language settings on a narrow Admin viewport | Concise labels, wrapped locale pills, and a compact section pill rail remain usable | Desktop sidebar navigation is unchanged |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Runtime response exposes full language document, FPB active locale, PPB custom text settings, PPB text override aliases, and shared cart labels
- [x] Locale documents are isolated by layout and resolve exact, base-language, and English fallback rules
- [x] No customer message, video message, personalization, or personalization-charge configuration is persisted
