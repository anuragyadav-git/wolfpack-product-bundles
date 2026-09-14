# Test Spec: Tier Badge Settings Design Migration
**Spec ID:** tier-badge-settings-design-migration  **Created:** 2026-09-12

## Purpose
Ensure that Tier Badge visual styling options (Shape, Visibility, Text colour, and Background colour) are relocated to Settings -> Design page as their canonical owner, while Discount & Pricing -> Discount Rule -> Tier Badge retains only enablement and badge text with a 'Show variables' modal for variable inspection and clipboard copying.

## Test Cases
### TierBadgeSettingsDesignMigration
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PricingTierBadgeFields renders only enablement, text, and 'Show variables' button | Render `PricingTierBadgeFields` with enabled rule | Renders text field and 'Show variables' button; does NOT render shape, visibility, or color inputs | Clean separation of content vs design |
| 2 | 'Show variables' modal opens on button click | Click 'Show variables' button in `PricingTierBadgeFields` | Shows Polaris modal with `{{saved_percentage}}` and `{{saved_total}}` | Provides in-context variable reference |
| 3 | Variable copy action copies to clipboard | Click copy button for `{{saved_percentage}}` | Calls `navigator.clipboard.writeText("{{saved_percentage}}")` | Easy variable usage |
| 4 | Settings -> Design includes Tier Badge styling controls | Inspect `DESIGN_CONFIGURATION` and `SETTINGS_DESIGN_DEFAULT_FIELD_VALUES` | Contains Shape, Visibility, Text Color, and Background Color fields under Tier Badge | Canonical styling ownership |

## Acceptance Criteria
- [ ] All listed test cases pass
