# Test Spec: Settings Design Slot Icon & Size Customization
**Spec ID:** settings-design-slot-icon  **Created:** 2026-08-22

## Purpose
Expose Slot Icon upload and Slot Icon Size format customization (`fill`, `fit`, `cover`) in Admin Settings -> Design page for PPB slot templates, and wire it to live preview, CSS generation, and storefront slot card rendering.

## Test Cases
### SettingsDesignSlotIconSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Extract slot icon and slot icon size in buildSettingsDesignRuntime | `stylePresets.images.slotIconUrl`: `"https://cdn.example.com/slot.png"`, `stylePresets.images.slotIconFit`: `"Cover"` | `slotIconUrl` and `slotIconFit: "cover"` mapped to `stylePresets.images`, `mixAndMatchConfig.emptyStateCard`, and `designSettings` | Covers `fill`, `fit`, `cover` formats |
| 2 | Default slot icon fit fallback | No fit provided or invalid fit string | Defaults to `"fit"` | Safe fallback |
| 3 | DESIGN_CONFIGURATION exposes slot icon fields | `DESIGN_CONFIGURATION` "Images & GIFs" tab | Contains `Slot Icon` (image kind) and `Slot Icon Size` (select kind with `["Fit", "Fill", "Cover"]`) | Admin UI surface |
| 4 | Preview field filtering for slot templates | `getDesignFieldsForPreviewContext` with `horizontal-slots` / `vertical-slots` | Slot icon fields are included for slot templates; excluded for non-slot templates | Contextual preview filtering |
| 5 | Live preview theme builder maps slot icon variables | `buildDesignPreviewTheme` with slot icon URL and fit | `--preview-slot-icon-url` and `--preview-slot-icon-fit` are emitted | Live preview sync |
| 6 | CSS generator emits slot icon variables | `generateCSSFromSettings` with `slotIconUrl` and `slotIconFit` | `--bundle-slot-icon-url` and `--bundle-slot-icon-fit` are emitted | Storefront stylesheet sync |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Admin Settings -> Design renders FilePicker and select dropdown for slot icon
- [ ] Storefront PPB slot templates render custom icon with selected fit format
