---
schema_version: 1
id: eb-settings-language-reference
title: EB Settings Language Reference
type: reference
status: active
summary: Documents EB language settings evidence and the WPB storefront language-runtime contract.
last_audited: 2026-08-21
owners:
  - engineering
domains:
  - storefront
  - admin
systems:
  - settings-language
  - widget-runtime
source_paths:
  - app/lib/settings-language-runtime.ts
  - app/lib/admin-configuration-surfaces.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - language
  - storefront
keywords:
  - rule messages
  - text overrides
---

# EB Settings Language Reference

This document captures live EB behavior from `yash-wolfpack.myshopify.com` for Settings -> Language. Evidence came from Chrome DevTools snapshots, a saved-field network capture, and FPB/PPB storefront runtime globals.

## Admin Data Flow

EB Settings -> Language is store-level, not bundle-level. A save posts the complete language document to:

```text
POST https://prod.backend.giftbox.giftkart.app/api/saveLanguage/update?shopName={shop}
```

Immediately after save, EB rereads:

```text
GET https://prod.backend.giftbox.giftkart.app/api/saveLanguage/read?shopName={shop}
```

The update payload is the full persisted language document, not a patch. Top-level roots:

```text
_id
shopName
__v
createdAt
updatedAt
languageMode
en
mixAndMatchTextData
sharedComponents
```

`languageMode` is `"MULTIPLE"` when Enable Multilanguage is checked. The observed active language was English, stored under `en`.

## Admin UI Grouping

Top controls:

- Enable Multilanguage checkbox controls `languageMode`.
- Add preferred languages selects the active editing language.
- Active language chip displays the current language.

Shared Components:

- Cart & Checkout maps to `sharedComponents.{locale}.cartAndCheckout`.

Template Language has two layouts:

- Landing Page Layout maps to `en`.
- Product Page Layout maps to `mixAndMatchTextData.en`.

Landing Page Layout panels:

- Product Card
- Bundle Cart
- Bundle
- Popups
- Toasts
- Addons
- Messages

Product Page Layout panels:

- Product Card
- Bundle Cart
- Bundle
- Toasts

## Storefront Propagation

Both FPB and PPB storefronts receive the complete store-level document at:

```js
window.easybundles_ext_data.languageData
```

FPB then reduces the active locale into:

```js
window.gbb.settings.languageData
```

This active FPB object contains `landingPage`, `navigationSteps`, `productPage`, `giftBoxPage`, `videoMessage`, `personalizePage`, `reviewPage`, `discountRules`, `sortBy`, `conditions`, `general`, `multipleCategoriesPage`, `multipleCategories`, `addons`, `modals`, and `sharedComponents`.

PPB also exposes the active FPB-style locale at:

```js
window.gbbMix.settings.languageData
```

For actual PPB widget copy, EB flattens Product Page language into:

```js
window.gbbMix.settings.pageCustomizationSettings.customTextSettings
```

Shared cart labels are also available at:

```js
window.gbbMix.constants.cartLineLabels
```

## Field Roots

Shared Cart & Checkout has 3 fields:

- `bundleContainsLabel` -> cart/checkout bundle item label, default `Items`
- `bundleOriginalPriceLabel` -> original price line label, default `Retail Price`
- `bundleDiscountDisplayLabel` -> savings line label, default `You Save`

Landing Page / FPB (`en`) stores text fields across these roots:

- `landingPage`
- `navigationSteps`
- `productPage`
- `reviewPage`
- `discountRules`
- `sortBy`
- `conditions`
- `general`
- `multipleCategoriesPage`
- `addons`
- `modals.clearCart`

Product Page / PPB (`mixAndMatchTextData.en`) has 33 leaf text fields in WPB:

- `productCard`
- `general`
- `footer`
- `conditions.amount`
- `conditions.quantity`
- `conditions.weight`

WPB exposes Weight as a saved step-rule type for both bundle runtimes, so its
Product Page language document includes the three Weight operator messages even
though the latest captured EB PPB selector exposed only Quantity and Amount.

Runtime PPB `customTextSettings` values are plain strings. Runtime FPB `languageData` values remain EB field objects with `{id,label,type,value}`.

## Variable Tokens

Admin fields display variable tokens in double braces, for example:

```text
{{conditionQuantity}}
{{conditionAmount}}
{{conditionWeight}}
{{boxSelectionDifference}}
{{quantityDifference}}
{{allowedQuantity}}
{{stepName}}
{{maxAllowedAddons}}
```

The raw `saveLanguage/read` document uses double braces. In the observed FPB active runtime object, some condition/toast variables were normalized to `##token##`. PPB `customTextSettings` kept double braces.

## WPB Implementation Target

WPB should persist one EB-shaped language document in `DesignSettings.generalSettings.settingsLanguage` for both `full_page` and `product_page`.

The Admin supports the 39 currently observed locale codes. Locale membership is
layout-specific in the persisted FPB and PPB roots, while shared labels use the
same configured locale set. English is mandatory; removing another locale
deletes it from the FPB, PPB, and shared roots. Switching layouts or disabling
multilanguage editing resets the selected editor locale to English without
discarding saved locale documents.

Adding a locale seeds locale-specific translated copy immediately. On
2026-08-21, adding French changed the Landing Page product-card button default
from the English copy to `Ajouter au coffret` before save. WPB therefore ships
static generated presets for every supported locale; they seed editable copy at
locale creation time and avoid a storefront translation dependency. Copying
English into a new locale is not complete parity.

Agent does not implement EB's customer gift-message, video-message, or
personalization workflow. Those no-op roots and the hidden personalization-cost
label are intentionally excluded from both the Admin surface and persisted
language document.

The storefront should receive a single app-proxy JSON response with:

- `languageMode`
- full `languageData`
- active FPB locale object
- PPB `customTextSettings`
- shared cart labels

In MULTIPLE mode, the storefront resolves a requested locale by exact
case-insensitive match, then configured base-language match, then English. In
SINGLE mode it always resolves English. The active shared labels are carried in
`_bundle_display_properties` so the Cart Transform and checkout surfaces retain
the shopper's locale.

Widgets should consume this runtime data before rendering text. FPB should resolve Settings Language before per-bundle text fallback. PPB should use separate keys for product-card add text and bundle add-to-cart text because EB controls them independently.
