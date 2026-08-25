---
schema_version: 1
id: analytics-days-custom-utm
title: Analytics Days Filter and Custom UTM Tracking
type: test-spec
status: active
summary: Verifies Analytics date windows, exports, backfills, and custom UTM tracking controls.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
  - analytics
systems:
  - attribution
source_paths:
  - app/routes/app/app.attribution.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - analytics
  - utm
keywords:
  - date window
  - custom UTM parameters
---

# Test Spec: Analytics Days Filter and Custom UTM Tracking
**Spec ID:** analytics-days-custom-utm  **Created:** 2026-07-11

## Purpose
Keep Analytics date filtering consistent across presets, custom ranges, export, backfill, and charts. Allow merchants to configure additional URL parameters to capture with UTM attribution.

## Test Cases
### AttributionControls
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Invalid days | `days=abc` | Defaults to 30 days | Prevents NaN windows |
| 2 | Oversized days | `days=365` | Clamps to 90 days | Matches backfill cap |
| 3 | Preset day window | `days=7`, fixed now | Seven inclusive calendar days | No extra bucket |
| 4 | Custom date range | `from=2026-06-01&to=2026-06-07` | Seven-day bounded window | Charts stop at `to` |
| 5 | Reversed custom range | `from > to` | Falls back to default days | Avoid invalid DB ranges |
| 6 | Custom UTM names | mixed comma/newline input | Lowercase sanitized names, max 10 | Prevents arbitrary payload keys |
| 7 | Custom UTM help content | Card rendered | Learn More action opens modal with setup guidance, examples, limits, privacy guidance, and save behavior | Merchant understands comma/newline entry and what tracking will do |
| 8 | Saved custom UTM chips | Saved names and remove action | Saved names render as removable chips; removing one submits the remaining names | Merchant can see and remove tracked custom attributes |

### AttributionRoute
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Loader uses day window | `days=7` | DB queries use seven-day inclusive window | Tests route plumbing |
| 2 | Backfill respects selected days | `intent=backfill&days=7` | Backfill receives seven-day window | Control no longer hardcodes 30 |
| 3 | Save custom UTM fields | `intent=saveCustomUtms` | Shop setting saved and pixel reactivated with names | Single source: Web Pixel settings |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] TypeScript passes
- [ ] Integration tests pass
