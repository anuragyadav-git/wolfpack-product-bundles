# Test Spec: Dashboard Rename Bundle Action
**Spec ID:** dashboard-rename-bundle  **Created:** 2026-09-04

## Purpose
Allow merchants to rename any bundle directly from the Dashboard table through a native Polaris modal (`<s-modal>`) with inline validation and server-side persistence.

## Test Cases
### DashboardRenameBundle
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Missing bundleId | `{ intent: "renameBundle", bundleName: "New Name" }` | 400 Bad Request with `{ success: false, error: "Missing bundleId" }` | Rejects missing ID |
| 2 | Empty bundle name | `{ intent: "renameBundle", bundleId: "b-1", bundleName: "   " }` | 400 Bad Request with `{ success: false, error: "Bundle name cannot be empty" }` | Enforces non-empty name |
| 3 | Bundle name too long | `{ intent: "renameBundle", bundleId: "b-1", bundleName: "a".repeat(256) }` | 400 Bad Request with `{ success: false, error: "Bundle name cannot exceed 255 characters" }` | Enforces character limit |
| 4 | Bundle not found | `{ intent: "renameBundle", bundleId: "nonexistent", bundleName: "Valid Name" }` | 404 Not Found with `{ success: false, error: "Bundle not found" }` | Shop-isolated lookup |
| 5 | Successful rename | `{ intent: "renameBundle", bundleId: "b-1", bundleName: "New Bundle Name" }` | 200 OK with `{ success: true, bundleId: "b-1", bundleName: "New Bundle Name" }` | Updates DB and syncs storefront |
| 6 | Storefront sync on rename | Valid rename request | Calls `syncBundleStorefrontNow` with the bundle's type and reason "save" | Updates storefront cache/metafields |

## Acceptance Criteria
- [ ] Empty or whitespace-only bundle name is rejected with a 400 response.
- [ ] Non-existent bundle or bundle belonging to another shop returns 404.
- [ ] Valid rename updates `db.bundle.update` with the trimmed name.
- [ ] Storefront sync is initiated for the renamed bundle.
- [ ] Polaris modal in UI displays validation errors without closing when invalid.
