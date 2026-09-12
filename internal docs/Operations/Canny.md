---
schema_version: 1
id: canny-integration
title: Canny Changelog and Feature Requests
type: operations
status: implementation
summary: Canny-owned release notes and feedback with authenticated Shopify-store identity and isolated QA configuration.
last_audited: 2026-09-12
owners: [engineering]
domains: [admin, releases]
systems: [canny, shopify, remix]
source_paths:
  - apps/OnlyBundles-app/app/services/canny.server.ts
  - apps/OnlyBundles-app/app/lib/canny.client.ts
  - apps/OnlyBundles-app/app/components/canny/
  - apps/OnlyBundles-app/app/routes/app/app.canny.session.ts
  - apps/OnlyBundles-app/app/routes/app/app.feature-requests.tsx
related_docs:
  - AGENTS.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
  - internal docs/Operations/Admin Performance.md
tags: [canny, changelog, feedback]
keywords: [SSO, feature requests, notification, publishing]
---

# Canny integration

## Ownership and Shopify-native boundary

Shopify owns embedded authentication, navigation, and native Polaris controls.
Canny owns release content, unread tracking, feedback records, votes, comments,
and its cross-origin widget. No application feedback database, publishing API,
or replacement voting/moderation system is added. Existing expiring offline
token handling remains untouched.

The Dashboard uses a native `s-button icon="notification"` to the right of Create
Bundle. Canny's official `initChangelog` opens its bottom/right popup. A measured
inline wrapper hosts `data-canny-changelog`: the Polaris custom-element button
host has a zero-sized bounding box, which cannot anchor the Canny popup. This
wrapper is an SDK interoperability exception, not a custom button.

The shared SDK loads once, eight seconds after Dashboard mount or immediately
on merchant intent/feedback-page entry. A first early click waits and opens
once. Each newly mounted trigger is initialized once; never initialize the same
element twice. Route exit closes the shared popup. Changelog initialization uses
`omitNonEssentialCookies: true`; Canny still owns its essential unread state.

Feature requests lives at `/app/feature-requests` before Billing in navigation.
It uses the official Canny board embed inside a Polaris shell. `basePath: null`
prevents Canny from rewriting the embedded Shopify URL. Keep Canny's Widget URL
unset: share links and notification emails should point to its public hosted
portal, not a Shopify Admin deep link that may lack store/auth context.

## Identity and security

`GET /app/canny/session` calls `authenticate.admin(request)` directly, then
requests `shop { id name email }`. Immutable Shop GID is the Canny identity ID;
Shop name and owner email come from the same canonical query. All staff share
their store's requests/votes. Missing identity or GraphQL errors fail closed;
never invent fallback email/name or accept identity from browser parameters.

The server signs HS256 with the workspace's SSO private key and a 15-minute
expiry. Responses have `Cache-Control: no-store`; errors expose only a safe
code. Tokens stay in memory and are passed to Canny, never logged or persisted
by the application. Canny receives shop name/email/GID; no Shopify access token
or Canny signing key crosses the browser boundary. A fresh page mount/retry
requests a new token. Canny owns its authenticated widget session after SSO.

Canny documents that SSO cannot authenticate an email belonging to an admin of
another Canny company. Do not work around this with fake store emails or changed
identity IDs; the user handles any required Canny login.

## Environment configuration

All four variables are required. Partial/unsafe configuration fails closed.
`CANNY_PORTAL_URL` must be an HTTPS origin (no credentials/path/query/hash).

| Variable | Purpose | Exposure |
|---|---|---|
| `CANNY_APP_ID` | Changelog workspace | Public |
| `CANNY_BOARD_TOKEN` | Feature Requests board | Public |
| `CANNY_PORTAL_URL` | Hosted portal origin | Public |
| `CANNY_SSO_PRIVATE_KEY` | HS256 SSO signing | Server secret |

| Environment | Workspace | Board |
|---|---|---|
| PROD | `https://wolfpack-apps.canny.io` | Public Feature Requests |
| Local/SIT | `https://only-bundles-qa.canny.io` | Public Feature Requests |

Local ignored `.env`/`.env.staging` contain QA configuration; `.env.prod` contains
production configuration. Hosting environment variables must be set separately;
local files do not prove Render configuration. Do not commit these files or
expose the signing key through a Vite public environment variable.

Stay on Canny Free unless the user approves an upgrade. The inspected Free
allowance is 25 tracked feedback-participating users (stores with this identity
model); recheck pricing before rollout at scale. Changelog viewing does not
require creating a feedback identity. Changelog email sending remains disabled.
Public boards permit access; Private boards in the current dashboard are
Canny-admin-only and are unsuitable for merchant SSO acceptance testing.

## Release publication

The durable authorization is in root `AGENTS.md`. Agents may draft merchant-
relevant New/Improved/Fixed entries and publish via the logged-in dashboard only
after the corresponding production release is live and behavior is verified.
Check drafts/published entries for duplicates; preserve unrelated drafts.
The pre-existing production draft **Full Page Template** is unrelated and must
not be published without verifying its content against a released feature.

Action-required notes must explain affected merchants, required steps, any real
deadline, and consequences. Reuse the existing Sync prompt when relevant; no
additional Dashboard action-required system is introduced. Do not claim test
features are released. Verify the public URL and Dashboard bell after publishing.

If login/MFA is requested, ask the user to log in. Never handle their credentials.
Publication approval does not authorize Shopify deployment, paid upgrades, or
changes outside the release's scope.

## Verification and impact

Behavior tests live in `tests/unit/{services,lib,routes}/canny*.test.ts`; the test
spec is `test-spec/canny.spec.md` under the app workspace. Test SDK failure,
timeout/retry, first click, unmount-before-load, authentication, JWT signatures,
and missing config without inspecting CSS/source placement.

Browser QA uses Agent/SIT and the isolated QA workspace. The QA-only changelog
entry is `https://only-bundles-qa.canny.io/changelog/qa-only-changelog-and-feedback-integration`.
No production release announcement was published during implementation.

2026-09-12 direct Chrome results on Agent/SIT:

- Desktop native bell, Canny popup, QA release display, unread badge removal,
  feedback submission, vote removal/restoration, and comment submission verified.
- The authenticated endpoint returned `200` and `no-store`. The signed identity
  was Shop GID `gid://shopify/Shop/82138693891`, name `agent`.
- **Merchant SSO remains blocked:** Canny's official token validator rejected
  Agent's owner identity as an administrator of another Canny company. The
existing logged-in admin session therefore authored the QA feedback as Parth
  Gulati. This is not proof of merchant/store SSO. Retest with a store owner
  email that is not a Canny admin; do not change merchant identity to bypass it.
- **Mobile remains unverified:** actual Chrome resize requests for 390×844 and
  900×900 left both inner and outer dimensions at 1688×844. No viewport/device
  emulation was substituted. Desktop app-frame width was 1448px without document
  overflow.
- Temporary app-frame LCP checks observed support-card text at 1556ms and 2116ms.
  Dashboard SDK fetch began at approximately 10.0s and 12.0s respectively, after
  initial content. These are local spot checks, not comparative baseline or
  Shopify field p75 proof. The temporary diagnostic bridge is not shipped.

Production hosting configuration/release and post-release bell verification are
still manual gates. Local implementation and QA fixtures are not production
deployment evidence.

The production draft **Product updates and feature requests in Only Bundles**
is saved at `https://wolfpack-apps.canny.io/admin/changelog/product-updates-and-feature-requests-in-only-bundles/edit`.
It remains unpublished. The original **Full Page Template** draft was preserved.
Desktop repeated Dashboard/Feature requests navigation, Enter activation, and
Escape dismissal from the app were verified. Canny owns keyboard behavior when
focus moves into its cross-origin content.

Impact: DashboardHeader and authenticated app navigation/config loader are the
existing integration points. `authenticate` is a graph god node used but not
modified. Canny failures are isolated from bundle operations. No Prisma schema,
storefront assets, sync jobs, app scopes, or Shopify extension changes are needed.

## Official references

- [Changelog SDK](https://developers.canny.io/install/changelog)
- [Changelog privacy](https://developers.canny.io/install/changelog/privacy)
- [Feedback embed](https://developers.canny.io/install/widget/web)
- [SSO and expiry](https://developers.canny.io/install/widget/sso)
- [Widget readiness callback](https://developers.canny.io/install/widget/advanced)
- [Shopify Shop fields](https://shopify.dev/docs/api/admin-graphql/latest/objects/Shop)
