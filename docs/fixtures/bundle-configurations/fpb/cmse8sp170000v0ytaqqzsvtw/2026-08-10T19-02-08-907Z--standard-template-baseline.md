---
schema_version: 1
id: cmse8sp170000v0ytaqqzsvtw-standard-template-baseline-2026-08-10t19-02-08-907z
title: "FPB Configuration: Standard Template Baseline"
type: bundle-configuration-snapshot
status: active
summary: "Merchant configuration snapshot for FPB cmse8sp170000v0ytaqqzsvtw."
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - bundle-configuration-registry
source_paths:
  - scripts/record-bundle-configuration.ts
related_docs:
  - docs/fixtures/bundle-configurations/fpb/cmse8sp170000v0ytaqqzsvtw/index.md
tags:
  - fpb
  - configuration
keywords:
  - standard-template-baseline
---

# FPB Configuration: Standard Template Baseline

Bundle: `cmse8sp170000v0ytaqqzsvtw`

Shop: `agent-5sfidg3m.myshopify.com`

Captured: `2026-08-10T19:02:08.907Z`
SHA-256: `cf90f4775dae99558d51395c2e093fbe72b32b962901a48a01cbd596e9d1aecf`

## Identity and status

| Setting | State |
| --- | --- |
| Name | SDD Eval FPB 2026-08-04 |
| Description | Empty |
| Status | active |

## Template and presentation

| Setting | State |
| --- | --- |
| Design template | FBP_SIDE_FOOTER |
| Design preset | STANDARD |
| Loading animation | Not configured |
| Step timeline | Not configured |
| Progress bar | Disabled |

## Steps, categories, and products

| Step | Position | Enabled | Products | Categories |
| --- | ---: | --- | ---: | ---: |
| Step 1 | 1 | Enabled | 0 | 1 |

### Products

| Product | Product ID | Position |
| --- | --- | ---: |
| 14k Dangling Obsidian Earrings | gid://shopify/Product/9506413773059 | Not configured |
| 14k Dangling Pendant Earrings | gid://shopify/Product/9506413641987 | Not configured |
| 14k Interlinked Earrings | gid://shopify/Product/9506413609219 | Not configured |
| 14k Intertwined Earrings | gid://shopify/Product/9506413576451 | Not configured |
| 14k Solid Bloom Earrings | gid://shopify/Product/9506413510915 | Not configured |
| 14k Wire Bloom Earrings | gid://shopify/Product/9506413445379 | Not configured |

### Categories

| Category | Position | Products | Collections |
| --- | ---: | ---: | ---: |
| Empty | 0 | 6 | 0 |

## Selection and quantity

| Setting | State |
| --- | --- |
| Maximum quantity per product | 1 |
| Quantity validation | `{"allowedQuantity":1,"isEnabled":true}` |
| Product slots | `{"enabled":false,"icon":null}` |
| Box selection | Not configured |
| Individual selling plan | `{"isEnabled":false,"showFor":"ALL_PRODUCTS"}` |
| Default products | Empty object |
| Preselected variant | Not configured |

## Pricing, discounts, messages, and progress

| Setting | State |
| --- | --- |
| Pricing | Enabled |
| Method | percentage_off |
| Rules | `[{"conditionType":"quantity","conditionValue":2,"discountValue":5,"id":"rule-1785958759198"},{"conditionType":"quantity","conditionValue":4,"discountValue":15,"id":"rule-1785958759407"}]` |
| Footer | Enabled |
| Progress bar | Disabled |
| Messages | `{"displayOptions":{"bundleQuantityOptions":{"defaultRuleId":"rule-1785958759198","enabled":false,"optionsByLocaleByRuleId":{},"optionsByRuleId":{"rule-1785958759198":{"label":"Box of 2","subtext":"5% off"},"rule-1785958759407":{"label":"Box of 4","subtext":"15% off"}}},"progressBar":{"enabled":false,"progressText":"Add {{conditionText}} to unlock {{discountText}}","successText":"{{discountText}} unlocked","type":"step_based"}},"ruleMessages":{"rule-1785958759198":{"discountText":"Add {{discountConditionDiff}} product(s) to save {{discountValue}}{{discountValueUnit}}!","successMessage":"Success! Your {{discountValue}}{{discountValueUnit}} discount has been applied to your cart."},"rule-1785958759407":{"discountText":"Congrats! Add {{discountConditionDiff}} more product(s) to save {{discountValue}}{{discountValueUnit}}!","successMessage":"Success! Your {{discountValue}}{{discountValueUnit}} discount has been applied to your cart."}},"showDiscountDisplay":true,"showDiscountMessaging":true,"tierTextByLocaleByRuleId":null,"tierTextByRuleId":null}` |
| Localized messages | Not configured |
| Display options | Not configured |
| Discount display override | Not configured |

## Product and variant presentation

| Setting | State |
| --- | --- |
| Product prices | Enabled |
| Compare-at prices | Disabled |
| Variant selector | Enabled |
| Text on add button | Enabled |

## Summary, media, and CSS

| Setting | State |
| --- | --- |
| Cart title | Not configured |
| Cart subtitle | Not configured |
| Bundle text | `{"bundleSummary":{"subTitle":"Two essentials unlock savings","title":"Daily Essentials"}}` |
| Personalization | Not configured |
| Desktop banner | Not configured |
| Mobile banner | Not configured |
| Bundle CSS | Not configured |
| Text overrides | `{"reviewBundle":"Two essentials unlock savings","yourBundle":"Daily Essentials"}` |
| Localized text overrides | Not configured |

## Gifts, add-ons, and upsells

| Setting | State |
| --- | --- |
| Upsell widget | `{"configuration":{"languageMode":"SINGLE","multiLangText":{},"widgetConfiguration":{"buttonText":"Save More With Bundle","description":"","displayConfiguration":{"collectionsSelectedData":[],"selectedProducts":[],"showOnAllBundleProducts":true,"showOnSpecificCollectionPages":[],"showOnSpecificProductPages":[]},"imageUrl":"","isEnabled":false,"languageMode":"SINGLE","title":"Bundle & Save","type":"OFFER_WIDGET","useLinkProductAsDefaultProduct":false}},"displayMode":"button","displayOn":"all","enabled":false}` |
| Step gifts | `[{"enabled":false,"name":null}]` |
| Step add-ons | `[{"addText":null,"displayFree":false,"icon":null,"label":null,"replaceText":null,"tiers":[],"title":null,"unlockAfterCompletion":true}]` |

## Storefront behavior and visibility

| Setting | State |
| --- | --- |
| Redirect to checkout | Disabled |
| Quantity changes | Enabled |
| Search bar | Disabled |
| Auto-select browsed product | Disabled |
| Single-step categories as steps | Disabled |

## Changes from previous snapshot

### Added

- None

### Changed

- None

### Removed

- None

## Canonical configuration

```json
{
  "defaults": {
    "preselectedVariantId": null,
    "products": {}
  },
  "giftsAddonsAndUpsells": {
    "upsellWidget": {
      "configuration": {
        "languageMode": "SINGLE",
        "multiLangText": {},
        "widgetConfiguration": {
          "buttonText": "Save More With Bundle",
          "description": "",
          "displayConfiguration": {
            "collectionsSelectedData": [],
            "selectedProducts": [],
            "showOnAllBundleProducts": true,
            "showOnSpecificCollectionPages": [],
            "showOnSpecificProductPages": []
          },
          "imageUrl": "",
          "isEnabled": false,
          "languageMode": "SINGLE",
          "title": "Bundle & Save",
          "type": "OFFER_WIDGET",
          "useLinkProductAsDefaultProduct": false
        }
      },
      "displayMode": "button",
      "displayOn": "all",
      "enabled": false
    }
  },
  "identity": {
    "description": "",
    "name": "SDD Eval FPB 2026-08-04",
    "status": "active"
  },
  "presentation": {
    "banners": {
      "desktop": null,
      "mobile": null
    },
    "bundleLevelCss": null,
    "floatingBadge": {
      "enabled": false,
      "text": ""
    },
    "loadingAnimation": null,
    "promoBannerBackground": null,
    "stepTimeline": null,
    "templateName": null
  },
  "pricing": {
    "discountDisplayOverride": null,
    "displayOptions": null,
    "enabled": true,
    "messages": {
      "displayOptions": {
        "bundleQuantityOptions": {
          "defaultRuleId": "rule-1785958759198",
          "enabled": false,
          "optionsByLocaleByRuleId": {},
          "optionsByRuleId": {
            "rule-1785958759198": {
              "label": "Box of 2",
              "subtext": "5% off"
            },
            "rule-1785958759407": {
              "label": "Box of 4",
              "subtext": "15% off"
            }
          }
        },
        "progressBar": {
          "enabled": false,
          "progressText": "Add {{conditionText}} to unlock {{discountText}}",
          "successText": "{{discountText}} unlocked",
          "type": "step_based"
        }
      },
      "ruleMessages": {
        "rule-1785958759198": {
          "discountText": "Add {{discountConditionDiff}} product(s) to save {{discountValue}}{{discountValueUnit}}!",
          "successMessage": "Success! Your {{discountValue}}{{discountValueUnit}} discount has been applied to your cart."
        },
        "rule-1785958759407": {
          "discountText": "Congrats! Add {{discountConditionDiff}} more product(s) to save {{discountValue}}{{discountValueUnit}}!",
          "successMessage": "Success! Your {{discountValue}}{{discountValueUnit}} discount has been applied to your cart."
        }
      },
      "showDiscountDisplay": true,
      "showDiscountMessaging": true,
      "tierTextByLocaleByRuleId": null,
      "tierTextByRuleId": null
    },
    "messagesByLocale": null,
    "method": "percentage_off",
    "rules": [
      {
        "conditionType": "quantity",
        "conditionValue": 2,
        "discountValue": 5,
        "id": "rule-1785958759198"
      },
      {
        "conditionType": "quantity",
        "conditionValue": 4,
        "discountValue": 15,
        "id": "rule-1785958759407"
      }
    ],
    "showFooter": true,
    "showProgressBar": false
  },
  "productPresentation": {
    "showCompareAtPrices": false,
    "showPrices": true,
    "showTextOnAddButton": true,
    "variantSelector": true
  },
  "selection": {
    "boxSelection": null,
    "individualSellingPlan": {
      "isEnabled": false,
      "showFor": "ALL_PRODUCTS"
    },
    "maximumQuantityPerProduct": 1,
    "productSlots": {
      "enabled": false,
      "icon": null
    },
    "quantityValidation": {
      "allowedQuantity": 1,
      "isEnabled": true
    }
  },
  "steps": [
    {
      "addon": {
        "addText": null,
        "displayFree": false,
        "icon": null,
        "label": null,
        "replaceText": null,
        "tiers": [],
        "title": null,
        "unlockAfterCompletion": true
      },
      "categories": [
        {
          "autoAdvance": false,
          "banner": null,
          "collections": [],
          "collectionSource": [],
          "conditions": [],
          "image": null,
          "name": "",
          "position": 0,
          "products": [
            {
              "productId": "gid://shopify/Product/9506413773059",
              "title": "14k Dangling Obsidian Earrings",
              "variants": [
                {
                  "title": "Default Title",
                  "variantId": "gid://shopify/ProductVariant/48720141091075"
                }
              ]
            },
            {
              "productId": "gid://shopify/Product/9506413641987",
              "title": "14k Dangling Pendant Earrings",
              "variants": [
                {
                  "title": "Default Title",
                  "variantId": "gid://shopify/ProductVariant/48720137748739"
                }
              ]
            },
            {
              "productId": "gid://shopify/Product/9506413609219",
              "title": "14k Interlinked Earrings",
              "variants": [
                {
                  "title": "Default Title",
                  "variantId": "gid://shopify/ProductVariant/48720137715971"
                }
              ]
            },
            {
              "productId": "gid://shopify/Product/9506413576451",
              "title": "14k Intertwined Earrings",
              "variants": [
                {
                  "title": "Default Title",
                  "variantId": "gid://shopify/ProductVariant/48720137683203"
                }
              ]
            },
            {
              "productId": "gid://shopify/Product/9506413510915",
              "title": "14k Solid Bloom Earrings",
              "variants": [
                {
                  "title": "Default Title",
                  "variantId": "gid://shopify/ProductVariant/48720137650435"
                }
              ]
            },
            {
              "productId": "gid://shopify/Product/9506413445379",
              "title": "14k Wire Bloom Earrings",
              "variants": [
                {
                  "title": "Default Title",
                  "variantId": "gid://shopify/ProductVariant/48720137617667"
                }
              ]
            }
          ],
          "rank": null,
          "selectedCollections": [],
          "selectedProducts": [],
          "subtitle": null,
          "title": null,
          "translations": null,
          "variantsAsProducts": false,
          "variantsAsSwatches": false
        }
      ],
      "completionCondition": {
        "autoAdvance": false,
        "operator": null,
        "secondaryOperator": null,
        "secondaryValue": null,
        "type": null,
        "value": null
      },
      "defaultSelection": {
        "enabled": false,
        "variantId": null
      },
      "enabled": true,
      "filters": null,
      "freeGift": {
        "enabled": false,
        "name": null
      },
      "icon": "box",
      "maximumQuantity": 0,
      "media": {
        "banner": null,
        "image": null,
        "timelineIcon": null
      },
      "minimumQuantity": 0,
      "name": "Step 1",
      "pageTitle": null,
      "position": 1,
      "primaryVariantOption": null,
      "products": [],
      "selectionSources": {
        "collections": [],
        "products": []
      },
      "translations": {},
      "variantsAsProducts": false
    }
  ],
  "storefrontBehaviorAndVisibility": {
    "allowQuantityChanges": true,
    "autoSelectBrowsedProduct": false,
    "redirectToCheckout": false,
    "searchBar": false,
    "singleStepCategoriesAsSteps": false
  },
  "summaryAndMedia": {
    "cartSubtitle": null,
    "cartTitle": null,
    "personalization": null,
    "textConfiguration": {
      "bundleSummary": {
        "subTitle": "Two essentials unlock savings",
        "title": "Daily Essentials"
      }
    }
  },
  "template": {
    "designPreset": "STANDARD",
    "designTemplate": "FBP_SIDE_FOOTER",
    "fullPageLayout": "footer_bottom",
    "tierConfiguration": null
  },
  "text": {
    "overrides": {
      "reviewBundle": "Two essentials unlock savings",
      "yourBundle": "Daily Essentials"
    },
    "overridesByLocale": null
  }
}
```
