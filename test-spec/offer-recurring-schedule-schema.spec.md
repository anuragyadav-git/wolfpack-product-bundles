---
schema_version: 1
id: offer-recurring-schedule-schema
title: Offer Recurring Schedule Schema
type: test-spec
status: active
summary: Defines the normalized persistence contract for weekly and monthly offer schedules in the shop timezone.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - offers
systems:
  - offer-policy
source_paths:
  - prisma/schema.prisma
  - prisma/migrations/20260901170000_add_offer_recurring_schedule/migration.sql
related_docs:
  - docs/competitor-analysis/20-bogos-personalization-analytics-offer-operations.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - scheduling
  - recurrence
keywords:
  - weekly offers
  - monthly offers
---

# Test Spec: Offer Recurring Schedule Schema

**Spec ID:** offer-recurring-schedule-schema  **Created:** 2026-09-01

## Purpose

Persist recurring offer schedules as direct typed policy fields. One-shot UTC
instants remain separate from recurring shop-local calendar values so daylight
saving changes do not rewrite merchant intent. The schema does not create an
unbounded job series or store an opaque recurrence document.

## Test Cases

### OfferRecurringScheduleSchema

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Schedule mode | New or existing offer policy | `always`, `one_time`, or `recurring` enum | Exactly one mode owns schedule evaluation |
| 2 | Recurrence frequency | Recurring policy | `weekly` or `monthly` enum | Daily recurrence is outside the approved initial slice |
| 3 | Shop-local calendar | Recurring policy | IANA timezone, anchor date, and start/end minutes | Local values survive daylight-saving transitions |
| 4 | Termination | Recurring policy | `never`, `on_date`, or `after_runs` plus typed value | Invalid combinations are rejected by application validation |
| 5 | Existing one-shot rows | Policy with `startsAt` or `endsAt` | Migration assigns `one_time` | Data migration replaces the old implicit mode; no runtime compatibility branch |

## Acceptance Criteria

- [ ] Prisma exposes every normalized schedule field and enum
- [ ] Existing one-shot policy rows are explicitly migrated to `one_time`
- [ ] No recurrence JSON blob or generic scheduled-job model is introduced
- [ ] Prisma validation and the focused schema test pass
