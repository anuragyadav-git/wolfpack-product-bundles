# Test Spec: Dismissible Banner Session State Persistence
**Spec ID:** banner-session-dismissal  **Created:** 2026-08-18

## Purpose
Ensure that dismissible Admin banners persist their dismissed state in browser `sessionStorage` so that once a user dismisses a banner, reloading the page or returning during the same session does not re-display the dismissed banner.

## Test Cases
### BannerSessionStateSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Banner not yet dismissed | Clean sessionStorage, `isBannerDismissedInSession("test_banner")` | Returns `false` | Default visible state |
| 2 | Banner dismissed | `dismissBannerInSession("test_banner")` | Sets `wpb_banner_dismissed_test_banner` in sessionStorage | Stored |
| 3 | Query dismissed banner | `isBannerDismissedInSession("test_banner")` after dismiss | Returns `true` | Persisted within session |
| 4 | SSR / No window environment | Window or sessionStorage is undefined | Returns `false` without throwing | SSR safe |
| 5 | Storage exception handling | sessionStorage.getItem throws SecurityError | Returns `false` without throwing | Resilience |
| 6 | Dashboard storefront setup banner | Dismiss dashboard setup banner | Stores session state; banner returns `null` on reload | Session persistence |
| 7 | Default product discount tip banner | Dismiss configure discount tip banner | Stores session state; banner returns `null` on reload | Session persistence |
| 8 | Discount pricing tip banner | Dismiss configure discount pricing banner | Stores session state; banner returns `null` on reload | Session persistence |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Session storage errors or SSR environments do not crash the app
- [ ] Reloading the page retains the dismissed state for the duration of the browser session
