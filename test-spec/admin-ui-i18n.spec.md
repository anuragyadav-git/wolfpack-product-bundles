---
schema_version: 1
id: admin-ui-i18n
title: Embedded Admin UI Internationalisation
type: test-spec
status: active
summary: Verifies Shopify-native locale resolution and complete translation-catalog coverage across the embedded Admin UI.
last_audited: 2026-09-02
owners:
  - Wolfpack Product Bundles
domains:
  - admin-ui
systems:
  - i18next
  - Shopify App Bridge
source_paths:
  - app/i18n/
  - app/routes/app/
  - app/components/
related_docs:
  - internal docs/Architecture/Diagrams/Admin UI Frontend Architecture.md
tags:
  - i18n
  - localization
keywords:
  - shopify.config.locale
  - zh-CN
---

# Test Spec: Embedded Admin UI Internationalisation

**Spec ID:** admin-ui-i18n **Issue:** [admin-ui-i18n-1] **Created:** 2026-09-02

## Purpose

Verify that the embedded Admin follows each staff member's Shopify Admin locale, defaults unsupported locales to English, supports Simplified Chinese, and keeps every Admin translation catalog key-compatible. Merchant-visible application copy must be externalized across routes, shared components, banners, modals, and feedback surfaces.

## Test Cases

### Locale Configuration

| #   | Scenario                         | Input                    | Expected Output                                | Notes                                   |
| --- | -------------------------------- | ------------------------ | ---------------------------------------------- | --------------------------------------- |
| 1   | Supported locales                | config import            | `en`, `fr`, `de`, `es`, `ja`, `pt-BR`, `zh-CN` | Polaris-compatible list                 |
| 2   | Supported locale normalization   | `"fr-FR"`                | `"fr"`                                         | Shopify BCP-47 locale mapped to catalog |
| 3   | Unsupported locale normalization | `"xx"`                   | `"en"`                                         | English fallback                        |
| 4   | Catalog parity                   | all locale JSON files    | identical flattened key sets                   | No missing translations                 |
| 5   | Simplified Chinese aliases       | `zh`, `zh-Hans`, `zh-CN` | `zh-CN`                                        | Canonical Simplified Chinese catalog    |

### Shopify-Native Locale Contract

| #   | Scenario                  | Input                         | Expected Output                                      | Notes                                           |
| --- | ------------------------- | ----------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| 6   | Initial embedded request  | `?locale=zh-CN`               | shell loads `zh-CN`                                  | Shopify request locale is authoritative for SSR |
| 7   | Client App Bridge context | `shopify.config.locale=fr-FR` | shell selects `fr`                                   | Per-user Admin preference                       |
| 8   | Missing Shopify locale    | no request/config locale      | shell selects `en`                                   | Deterministic fallback                          |
| 9   | Dashboard                 | rendered route                | no app-owned language selector or locale-save action | Shopify owns the preference                     |
| 10  | Persistence model         | Prisma schema                 | no `Shop.adminLocale`                                | No duplicate locale source                      |

### App Shell Resolution

| #   | Scenario                    | Input          | Expected Output | Notes                   |
| --- | --------------------------- | -------------- | --------------- | ----------------------- |
| 11  | French regional locale      | `locale=fr-FR` | catalog `fr`    | Language fallback       |
| 12  | Brazilian Portuguese locale | `locale=pt-BR` | catalog `pt-BR` | Region-specific catalog |
| 13  | Unsupported locale          | `locale=it-IT` | catalog `en`    | Defensive fallback      |

### Admin Copy Extraction

| #   | Scenario                        | Input                                                 | Expected Output                                                                                   | Notes                                        |
| --- | ------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 14  | Catalog key validation          | Admin translation catalogs                            | every supported catalog contains every English key                                                | Required after each extraction batch         |
| 15  | Storefront exclusion            | widget sources                                        | unchanged                                                                                         | Admin-only feature                           |
| 16  | Shared Admin copy extraction    | shared Admin banners and configure modals             | merchant-facing copy resolves through translation keys                                            | Shared component batch                       |
| 17  | Create-bundle wizard extraction | `/app/bundles/create`                                 | wizard chrome, fields, validation, and actions resolve through translation keys                   | Top-level route batch                        |
| 18  | Billing feedback extraction     | billing feedback banners and upgrade modal            | feedback copy resolves through translation keys                                                   | Billing leaf batch                           |
| 19  | Billing plan-card extraction    | Free/Grow cards and upgrade CTA                       | plan-card chrome resolves through translation keys                                                | Billing card batch                           |
| 20  | Billing route extraction        | `/app/billing`                                        | plan status, usage, cancellation, feature, and support copy resolves through translation keys     | Billing route batch                          |
| 21  | Full Admin extraction           | all rendered Admin route and shared-component sources | no merchant-visible English literals remain outside explicit allowlisted technical/product values | Includes configure flows and banners         |
| 22  | Existing locale extension       | every supported locale                                | newly extracted keys are translated in all seven catalogs                                         | No English-only rollout                      |
| 23  | Interpolation integrity         | every localized catalog value                         | exact English `{{token}}` set is preserved                                                        | Prevents runtime substitutions from breaking |

## Acceptance Criteria

- [x] All listed tests pass
- [x] Shopify's request/App Bridge locale is the only Admin-locale source
- [x] Every supported language has a Polaris locale resource
- [x] Simplified Chinese resolves from `zh`, `zh-Hans`, and `zh-CN`
- [x] The dashboard has no app-owned language selector
- [x] All Admin routes and shared merchant-facing surfaces use translation resources
- [x] No storefront widget source files are modified
