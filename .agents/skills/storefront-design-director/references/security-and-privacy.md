---
schema_version: 1
id: storefront-design-director-security-privacy
title: Security and Privacy
type: skill-reference
status: active
summary: Constrains browser QA, evidence retention, profiles, credentials, and production activity.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - security
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/security-and-privacy.md
related_docs:
  - .agents/skills/storefront-design-director/references/chrome-devtools-test-protocol.md
tags:
  - privacy
keywords:
  - browser-profile
  - credentials
---

# Security and Privacy

Chrome DevTools MCP can inspect and act within its connected browser.

- Use only the currently connected default Chrome profile.
- Do not create isolated contexts, alternate user-data directories, dedicated test profiles, or secondary profiles.
- Do not inspect unrelated tabs; select only the page required for the design job.
- Use test stores and fixture data.
- Do not expose personal, customer, payment, order, or admin data.
- Redact tokens, secrets, cookies, authorization headers, and private bodies.
- Do not save profiles or credentials in design jobs.
- Do not submit real orders or run destructive merchant actions.
- Do not alter production data.
- Record local, development, staging, or production.
- Production is read-only unless separately authorized.
- Do not launch or reconnect Chrome with a separate user-data directory; keep the MCP-connected default profile.
- Retain only required evidence.
- Package approved artifacts with checksums.

If an artifact contains sensitive data, stop capture, remove only the unsafe generated artifact with explicit scope, record the incident without reproducing the secret, and recapture safely.
