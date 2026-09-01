import { Temporal } from 'temporal-polyfill';

import type { OfferEligibilitySource } from './analytics/offer-dimensions';

export type OfferScheduleState = 'active' | 'scheduled' | 'expired' | 'invalid';
export type OfferScheduleMode = 'always' | 'one_time' | 'recurring';
export type OfferRecurrenceFrequency = 'weekly' | 'monthly';
export type OfferRecurrenceTermination = 'never' | 'on_date' | 'after_runs';

export type OfferPolicyTiming = {
  scheduleMode?: OfferScheduleMode | null;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  recurrenceFrequency?: OfferRecurrenceFrequency | null;
  recurrenceTimezone?: string | null;
  recurrenceAnchorDate?: Date | string | null;
  recurrenceWindowStartMinute?: number | null;
  recurrenceWindowEndMinute?: number | null;
  recurrenceTermination?: OfferRecurrenceTermination | null;
  recurrenceEndsOn?: Date | string | null;
  recurrenceRunCount?: number | null;
};

export type OfferScheduleDecision = {
  effective: boolean;
  state: OfferScheduleState;
  nextTransitionAt: string | null;
};

type OfferPriorityPolicy = OfferPolicyTiming & {
  priority?: number | null;
  stopLowerPriority?: boolean | null;
};

type PrioritizedOffer = {
  id: string;
  offerPolicy?: OfferPriorityPolicy | null;
};

type OfferDecisionPolicy = OfferPolicyTiming & {
  id: string;
  ruleVersion: number;
  specificLinkRequired: boolean;
  priority?: number | null;
  stopLowerPriority?: boolean | null;
  countryTargetingEnabled?: boolean | null;
  countryTargetingMode?: 'include' | 'exclude' | null;
  countryCodes?: readonly string[] | null;
};

export type OfferDecisionMarker = {
  decisionRequired: boolean;
  serverDecisionRequired: boolean;
  specificLinkRequired: boolean;
  countryTargetingEnabled: boolean;
  countryTargetingMode: 'include' | 'exclude';
  countryCodes: string[];
  offerPolicyId: string | null;
  ruleVersion: number | null;
  eligibilitySource: OfferEligibilitySource | null;
};

const INVALID_SCHEDULE: OfferScheduleDecision = {
  effective: false,
  state: 'invalid',
  nextTransitionAt: null,
};

function instant(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function plainDate(value: Date | string | null | undefined): Temporal.PlainDate | null {
  if (value == null || value === '') return null;
  try {
    const date = value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
    return Temporal.PlainDate.from(date);
  } catch {
    return null;
  }
}

function toIso(zonedDateTime: Temporal.ZonedDateTime): string {
  return new Date(Number(zonedDateTime.epochMilliseconds)).toISOString();
}

function occurrenceBoundary(
  date: Temporal.PlainDate,
  minute: number,
  timeZone: string,
): Temporal.ZonedDateTime {
  const hour = Math.floor(minute / 60);
  return Temporal.ZonedDateTime.from({
    timeZone,
    year: date.year,
    month: date.month,
    day: date.day,
    hour,
    minute: minute - hour * 60,
  }, { disambiguation: 'compatible' });
}

function monthSerial(date: Temporal.PlainDate): number {
  return date.year * 12 + date.month - 1;
}

function dateFromMonthSerial(serial: number, day: number): Temporal.PlainDate | null {
  const year = Math.floor(serial / 12);
  const month = serial - year * 12 + 1;
  const yearMonth = Temporal.PlainYearMonth.from({ year, month });
  return day <= yearMonth.daysInMonth
    ? Temporal.PlainDate.from({ year, month, day })
    : null;
}

function nextMonthlyDate(
  anchor: Temporal.PlainDate,
  fromMonthSerial: number,
): Temporal.PlainDate {
  let serial = Math.max(monthSerial(anchor), fromMonthSerial);
  while (true) {
    const candidate = dateFromMonthSerial(serial, anchor.day);
    if (candidate) return candidate;
    serial += 1;
  }
}

function validMonthsPerGregorianCycle(day: number): number {
  if (day <= 28) return 4_800;
  if (day === 29) return 4_497;
  if (day === 30) return 4_400;
  return 2_800;
}

function monthlyOccurrenceNumber(
  anchor: Temporal.PlainDate,
  occurrence: Temporal.PlainDate,
): number {
  const first = monthSerial(anchor);
  const last = monthSerial(occurrence);
  const totalMonths = last - first + 1;
  const fullCycles = Math.floor(totalMonths / 4_800);
  let count = fullCycles * validMonthsPerGregorianCycle(anchor.day);
  const remainderStart = first + fullCycles * 4_800;
  for (let serial = remainderStart; serial <= last; serial += 1) {
    if (dateFromMonthSerial(serial, anchor.day)) count += 1;
  }
  return count;
}

function recurringDecision(
  policy: OfferPolicyTiming,
  now: Date,
): OfferScheduleDecision {
  const frequency = policy.recurrenceFrequency;
  const timeZone = policy.recurrenceTimezone;
  const anchor = plainDate(policy.recurrenceAnchorDate);
  const startMinute = policy.recurrenceWindowStartMinute;
  const endMinute = policy.recurrenceWindowEndMinute;
  const termination = policy.recurrenceTermination ?? 'never';
  const endsOn = plainDate(policy.recurrenceEndsOn);
  const runCount = policy.recurrenceRunCount;

  if ((frequency !== 'weekly' && frequency !== 'monthly')
    || !timeZone
    || !anchor
    || !Number.isInteger(startMinute)
    || !Number.isInteger(endMinute)
    || startMinute! < 0
    || endMinute! > 1_439
    || startMinute! >= endMinute!
    || !['never', 'on_date', 'after_runs'].includes(termination)
    || (termination === 'on_date' && (!endsOn || Temporal.PlainDate.compare(endsOn, anchor) < 0))
    || (termination === 'after_runs' && (!Number.isInteger(runCount) || runCount! < 1))) {
    return INVALID_SCHEDULE;
  }

  try {
    const nowInstant = Temporal.Instant.from(now.toISOString());
    const localDate = nowInstant.toZonedDateTimeISO(timeZone).toPlainDate();
    let occurrence: Temporal.PlainDate;
    let occurrenceNumber: number;

    if (frequency === 'weekly') {
      const daysFromAnchor = localDate.since(anchor, { largestUnit: 'day' }).days;
      const weekIndex = daysFromAnchor < 0 ? 0 : Math.floor(daysFromAnchor / 7);
      occurrence = anchor.add({ weeks: weekIndex });
      occurrenceNumber = weekIndex + 1;
      if (Temporal.PlainDate.compare(occurrence, localDate) < 0) {
        occurrence = occurrence.add({ weeks: 1 });
        occurrenceNumber += 1;
      }
    } else {
      occurrence = nextMonthlyDate(anchor, monthSerial(localDate));
      occurrenceNumber = monthlyOccurrenceNumber(anchor, occurrence);
    }

    const occurrenceStart = occurrenceBoundary(occurrence, startMinute!, timeZone);
    const occurrenceEnd = occurrenceBoundary(occurrence, endMinute!, timeZone);

    if (Temporal.PlainDate.compare(occurrence, localDate) === 0
      && Temporal.Instant.compare(nowInstant, occurrenceEnd.toInstant()) < 0) {
      if (termination === 'on_date' && Temporal.PlainDate.compare(occurrence, endsOn!) > 0) {
        return { effective: false, state: 'expired', nextTransitionAt: null };
      }
      if (termination === 'after_runs' && occurrenceNumber > runCount!) {
        return { effective: false, state: 'expired', nextTransitionAt: null };
      }
      if (Temporal.Instant.compare(nowInstant, occurrenceStart.toInstant()) >= 0) {
        return { effective: true, state: 'active', nextTransitionAt: toIso(occurrenceEnd) };
      }
      return { effective: false, state: 'scheduled', nextTransitionAt: toIso(occurrenceStart) };
    }

    if (Temporal.Instant.compare(nowInstant, occurrenceEnd.toInstant()) >= 0) {
      if (frequency === 'weekly') {
        occurrence = occurrence.add({ weeks: 1 });
        occurrenceNumber += 1;
      } else {
        occurrence = nextMonthlyDate(anchor, monthSerial(occurrence) + 1);
        occurrenceNumber = monthlyOccurrenceNumber(anchor, occurrence);
      }
    }

    if ((termination === 'on_date' && Temporal.PlainDate.compare(occurrence, endsOn!) > 0)
      || (termination === 'after_runs' && occurrenceNumber > runCount!)) {
      return { effective: false, state: 'expired', nextTransitionAt: null };
    }

    return {
      effective: false,
      state: 'scheduled',
      nextTransitionAt: toIso(occurrenceBoundary(occurrence, startMinute!, timeZone)),
    };
  } catch {
    return INVALID_SCHEDULE;
  }
}

export function resolveOfferSchedule(
  policy: OfferPolicyTiming,
  now = new Date(),
): OfferScheduleDecision {
  const mode = policy.scheduleMode ?? 'always';
  if (mode === 'always') {
    return { effective: true, state: 'active', nextTransitionAt: null };
  }
  if (mode === 'recurring') return recurringDecision(policy, now);
  if (mode !== 'one_time') return INVALID_SCHEDULE;

  const startsAt = instant(policy.startsAt);
  const endsAt = instant(policy.endsAt);
  if ((policy.startsAt != null && !startsAt)
    || (policy.endsAt != null && !endsAt)
    || (startsAt && endsAt && endsAt <= startsAt)) {
    return INVALID_SCHEDULE;
  }
  const current = now.getTime();

  if (startsAt && current < startsAt.getTime()) {
    return { effective: false, state: 'scheduled', nextTransitionAt: startsAt.toISOString() };
  }
  if (endsAt && current >= endsAt.getTime()) {
    return { effective: false, state: 'expired', nextTransitionAt: null };
  }
  return { effective: true, state: 'active', nextTransitionAt: endsAt?.toISOString() ?? null };
}

export function applyOfferPriority<T extends PrioritizedOffer>(
  offers: readonly T[],
  now = new Date(),
): T[] {
  const ordered = offers
    .filter((offer) => resolveOfferSchedule(offer.offerPolicy ?? {}, now).effective)
    .sort((left, right) => {
      const priority = (left.offerPolicy?.priority ?? 100)
        - (right.offerPolicy?.priority ?? 100);
      return priority || left.id.localeCompare(right.id);
    });
  const stopIndex = ordered.findIndex(
    (offer) => offer.offerPolicy?.stopLowerPriority === true,
  );
  return stopIndex === -1 ? ordered : ordered.slice(0, stopIndex + 1);
}

export function buildOfferDecisionMarker(
  policy: OfferDecisionPolicy | null,
): OfferDecisionMarker {
  const specificLinkRequired = policy?.specificLinkRequired === true;
  const countryTargetingEnabled = policy?.countryTargetingEnabled === true;
  const scheduleDecisionRequired = policy != null && policy.scheduleMode !== 'always';
  const serverDecisionRequired = specificLinkRequired || scheduleDecisionRequired;
  const countryCodes = [...new Set((policy?.countryCodes ?? [])
    .map((countryCode) => countryCode.trim().toUpperCase())
    .filter((countryCode) => /^[A-Z]{2}$/.test(countryCode)))]
    .sort();
  const eligibilitySource: OfferEligibilitySource | null = !policy
    ? null
    : specificLinkRequired
      ? 'specific_link'
      : scheduleDecisionRequired
        ? 'schedule'
        : countryTargetingEnabled
          ? 'country'
          : (policy.priority ?? 100) !== 100 || policy.stopLowerPriority === true
            ? 'priority'
            : 'always';
  return {
    decisionRequired: serverDecisionRequired || countryTargetingEnabled,
    serverDecisionRequired,
    specificLinkRequired,
    countryTargetingEnabled,
    countryTargetingMode: policy?.countryTargetingMode === 'exclude' ? 'exclude' : 'include',
    countryCodes,
    offerPolicyId: policy?.id ?? null,
    ruleVersion: policy?.ruleVersion ?? null,
    eligibilitySource,
  };
}
