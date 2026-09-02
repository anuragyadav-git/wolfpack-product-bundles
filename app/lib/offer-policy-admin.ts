import { Temporal } from 'temporal-polyfill';

import { i18n } from '../i18n/config';
import type { OfferCountryTargetingData } from './offer-country-targeting';
import type {
  OfferRecurrenceFrequency,
  OfferRecurrenceTermination,
  OfferScheduleMode,
} from './offer-policy-decision';

export type OfferOperationsAdminState = {
  priority: number;
  stopLowerPriority: boolean;
  scheduleMode: OfferScheduleMode;
  startsAt: string | null;
  endsAt: string | null;
  recurrenceFrequency: OfferRecurrenceFrequency | null;
  recurrenceTimezone: string;
  recurrenceAnchorDate: string | null;
  recurrenceWindowStart: string | null;
  recurrenceWindowEnd: string | null;
  recurrenceTermination: OfferRecurrenceTermination;
  recurrenceEndsOn: string | null;
  recurrenceRunCount: number | null;
};

export type OfferOperationsPolicyState = {
  priority: number;
  stopLowerPriority: boolean;
  scheduleMode: OfferScheduleMode;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  recurrenceFrequency: OfferRecurrenceFrequency | null;
  recurrenceTimezone: string | null;
  recurrenceAnchorDate: Date | string | null;
  recurrenceWindowStartMinute: number | null;
  recurrenceWindowEndMinute: number | null;
  recurrenceTermination: OfferRecurrenceTermination;
  recurrenceEndsOn: Date | string | null;
  recurrenceRunCount: number | null;
};

export type RawOfferOperations = {
  priority: FormDataEntryValue | null;
  stopLowerPriority: FormDataEntryValue | null;
  scheduleMode: FormDataEntryValue | null;
  startsAt: FormDataEntryValue | null;
  endsAt: FormDataEntryValue | null;
  recurrenceFrequency: FormDataEntryValue | null;
  recurrenceAnchorDate: FormDataEntryValue | null;
  recurrenceWindowStart: FormDataEntryValue | null;
  recurrenceWindowEnd: FormDataEntryValue | null;
  recurrenceTermination: FormDataEntryValue | null;
  recurrenceEndsOn: FormDataEntryValue | null;
  recurrenceRunCount: FormDataEntryValue | null;
};

export type OfferOperationsData = {
  priority: number;
  stopLowerPriority: boolean;
  scheduleMode: OfferScheduleMode;
  startsAt: Date | null;
  endsAt: Date | null;
  recurrenceFrequency: OfferRecurrenceFrequency | null;
  recurrenceTimezone: string | null;
  recurrenceAnchorDate: Date | null;
  recurrenceWindowStartMinute: number | null;
  recurrenceWindowEndMinute: number | null;
  recurrenceTermination: OfferRecurrenceTermination;
  recurrenceEndsOn: Date | null;
  recurrenceRunCount: number | null;
};

type OfferOperationsSaveResult =
  | { changed: boolean; data: OfferOperationsData }
  | { issue: { path: string; message: string } };

function iso(value: Date | string | null | undefined): string | null {
  if (value == null || value === '') return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function localDate(value: Date | string | null | undefined): string | null {
  const serialized = iso(value);
  return serialized?.slice(0, 10) ?? null;
}

function minuteString(value: number | null | undefined): string | null {
  if (!Number.isInteger(value) || value! < 0 || value! > 1_439) return null;
  return `${String(Math.floor(value! / 60)).padStart(2, '0')}:${String(value! % 60).padStart(2, '0')}`;
}

function parseMinute(value: FormDataEntryValue | null): number | null {
  const match = String(value ?? '').trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? hour * 60 + minute : null;
}

function parseLocalDate(value: FormDataEntryValue | null): Date | null {
  const input = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  try {
    return new Date(`${Temporal.PlainDate.from(input).toString()}T00:00:00.000Z`);
  } catch {
    return null;
  }
}

function validTimezone(timezone: string): boolean {
  try {
    Temporal.Instant.from('2000-01-01T00:00:00Z').toZonedDateTimeISO(timezone);
    return true;
  } catch {
    return false;
  }
}

function defaultState(shopIanaTimezone: string): OfferOperationsAdminState {
  return {
    priority: 100,
    stopLowerPriority: false,
    scheduleMode: 'always',
    startsAt: null,
    endsAt: null,
    recurrenceFrequency: 'weekly',
    recurrenceTimezone: shopIanaTimezone,
    recurrenceAnchorDate: null,
    recurrenceWindowStart: '09:00',
    recurrenceWindowEnd: '17:00',
    recurrenceTermination: 'never',
    recurrenceEndsOn: null,
    recurrenceRunCount: null,
  };
}

export function buildOfferOperationsAdminState(
  policy: OfferOperationsPolicyState | null,
  shopIanaTimezone: string,
): OfferOperationsAdminState {
  if (!policy) return defaultState(shopIanaTimezone);
  return {
    priority: policy.priority,
    stopLowerPriority: policy.stopLowerPriority,
    scheduleMode: policy.scheduleMode,
    startsAt: iso(policy.startsAt),
    endsAt: iso(policy.endsAt),
    recurrenceFrequency: policy.recurrenceFrequency ?? 'weekly',
    recurrenceTimezone: policy.recurrenceTimezone ?? shopIanaTimezone,
    recurrenceAnchorDate: localDate(policy.recurrenceAnchorDate),
    recurrenceWindowStart: minuteString(policy.recurrenceWindowStartMinute) ?? '09:00',
    recurrenceWindowEnd: minuteString(policy.recurrenceWindowEndMinute) ?? '17:00',
    recurrenceTermination: policy.recurrenceTermination,
    recurrenceEndsOn: localDate(policy.recurrenceEndsOn),
    recurrenceRunCount: policy.recurrenceRunCount,
  };
}

export function buildOfferPolicyMutation(input: {
  shopId: string;
  policyExists: boolean;
  specificLinkUpdate: { specificLinkRequired: boolean } | null;
  operations: { changed: boolean; data: OfferOperationsData };
  countryTargeting: { changed: boolean; data: OfferCountryTargetingData };
}) {
  const changed = input.specificLinkUpdate !== null
    || input.operations.changed
    || input.countryTargeting.changed;
  if (!changed) return {};

  const data = {
    ...(input.specificLinkUpdate ?? {}),
    ...(input.operations.changed ? input.operations.data : {}),
    ...(input.countryTargeting.changed ? input.countryTargeting.data : {}),
  };
  if (input.policyExists) {
    return { offerPolicy: { update: { ...data, ruleVersion: { increment: 1 } } } };
  }
  return {
    offerPolicy: {
      create: { shopId: input.shopId, ...data, ruleVersion: 1 },
    },
  };
}

function dataFromState(state: OfferOperationsAdminState): OfferOperationsData {
  return {
    priority: state.priority,
    stopLowerPriority: state.stopLowerPriority,
    scheduleMode: state.scheduleMode,
    startsAt: state.startsAt ? new Date(state.startsAt) : null,
    endsAt: state.endsAt ? new Date(state.endsAt) : null,
    recurrenceFrequency: state.recurrenceFrequency,
    recurrenceTimezone: state.recurrenceTimezone,
    recurrenceAnchorDate: state.recurrenceAnchorDate ? new Date(`${state.recurrenceAnchorDate}T00:00:00.000Z`) : null,
    recurrenceWindowStartMinute: parseMinute(state.recurrenceWindowStart),
    recurrenceWindowEndMinute: parseMinute(state.recurrenceWindowEnd),
    recurrenceTermination: state.recurrenceTermination,
    recurrenceEndsOn: state.recurrenceEndsOn ? new Date(`${state.recurrenceEndsOn}T00:00:00.000Z`) : null,
    recurrenceRunCount: state.recurrenceRunCount,
  };
}

function dataFromPolicy(
  policy: OfferOperationsPolicyState | null,
  shopIanaTimezone: string,
): OfferOperationsData {
  if (!policy) return dataFromState(defaultState(shopIanaTimezone));
  return {
    priority: policy.priority,
    stopLowerPriority: policy.stopLowerPriority,
    scheduleMode: policy.scheduleMode,
    startsAt: iso(policy.startsAt) ? new Date(iso(policy.startsAt)!) : null,
    endsAt: iso(policy.endsAt) ? new Date(iso(policy.endsAt)!) : null,
    recurrenceFrequency: policy.recurrenceFrequency,
    recurrenceTimezone: policy.recurrenceTimezone,
    recurrenceAnchorDate: localDate(policy.recurrenceAnchorDate)
      ? new Date(`${localDate(policy.recurrenceAnchorDate)}T00:00:00.000Z`)
      : null,
    recurrenceWindowStartMinute: policy.recurrenceWindowStartMinute,
    recurrenceWindowEndMinute: policy.recurrenceWindowEndMinute,
    recurrenceTermination: policy.recurrenceTermination,
    recurrenceEndsOn: localDate(policy.recurrenceEndsOn)
      ? new Date(`${localDate(policy.recurrenceEndsOn)}T00:00:00.000Z`)
      : null,
    recurrenceRunCount: policy.recurrenceRunCount,
  };
}

export function resolveOfferOperationsSave(
  raw: RawOfferOperations,
  currentPolicy: OfferOperationsPolicyState | null,
  shopIanaTimezone: string,
): OfferOperationsSaveResult {
  if (Object.values(raw).every((value) => value === null)) {
    return {
      changed: false,
      data: dataFromPolicy(currentPolicy, shopIanaTimezone),
    };
  }
  const priority = Number(raw.priority);
  if (!Number.isInteger(priority) || priority < 1 || priority > 9_999) {
    return { issue: { path: 'offerDelivery.priority', message: i18n.t('offerOperations.validation.priority') } };
  }

  const scheduleMode = String(raw.scheduleMode ?? '');
  if (!['always', 'one_time', 'recurring'].includes(scheduleMode)) {
    return { issue: { path: 'offerDelivery.scheduleMode', message: i18n.t('offerOperations.validation.scheduleMode') } };
  }

  const startsAtInput = String(raw.startsAt ?? '').trim();
  const endsAtInput = String(raw.endsAt ?? '').trim();
  const startsAtIso = iso(startsAtInput);
  const endsAtIso = iso(endsAtInput);
  if (scheduleMode === 'one_time' && startsAtInput && !startsAtIso) {
    return { issue: { path: 'offerDelivery.startsAt', message: i18n.t('offerOperations.validation.startsAt') } };
  }
  if (scheduleMode === 'one_time' && endsAtInput && !endsAtIso) {
    return { issue: { path: 'offerDelivery.endsAt', message: i18n.t('offerOperations.validation.endsAt') } };
  }
  if (scheduleMode === 'one_time' && startsAtIso && endsAtIso && endsAtIso <= startsAtIso) {
    return { issue: { path: 'offerDelivery.endsAt', message: i18n.t('offerOperations.validation.range') } };
  }

  const current = buildOfferOperationsAdminState(currentPolicy, shopIanaTimezone);
  const frequencyInput = String(raw.recurrenceFrequency ?? '').trim();
  const recurrenceFrequency = frequencyInput === 'weekly' || frequencyInput === 'monthly'
    ? frequencyInput
    : currentPolicy?.recurrenceFrequency ?? null;
  const anchorInput = String(raw.recurrenceAnchorDate ?? '').trim();
  const recurrenceAnchorDate = anchorInput ? parseLocalDate(raw.recurrenceAnchorDate) : null;
  const startWindowInput = String(raw.recurrenceWindowStart ?? '').trim();
  const endWindowInput = String(raw.recurrenceWindowEnd ?? '').trim();
  const recurrenceWindowStartMinute = startWindowInput ? parseMinute(raw.recurrenceWindowStart) : null;
  const recurrenceWindowEndMinute = endWindowInput ? parseMinute(raw.recurrenceWindowEnd) : null;
  const terminationInput = String(raw.recurrenceTermination ?? '').trim();
  const recurrenceTermination = ['never', 'on_date', 'after_runs'].includes(terminationInput)
    ? terminationInput as OfferRecurrenceTermination
    : current.recurrenceTermination;
  const endsOnInput = String(raw.recurrenceEndsOn ?? '').trim();
  const recurrenceEndsOn = endsOnInput ? parseLocalDate(raw.recurrenceEndsOn) : null;
  const runCountInput = String(raw.recurrenceRunCount ?? '').trim();
  const recurrenceRunCount = runCountInput ? Number(runCountInput) : null;

  if (scheduleMode === 'recurring') {
    if (!validTimezone(shopIanaTimezone)) {
      return { issue: { path: 'offerDelivery.recurrenceTimezone', message: i18n.t('offerOperations.validation.timezone') } };
    }
    if (!recurrenceFrequency) {
      return { issue: { path: 'offerDelivery.recurrenceFrequency', message: i18n.t('offerOperations.validation.frequency') } };
    }
    if (!recurrenceAnchorDate) {
      return { issue: { path: 'offerDelivery.recurrenceAnchorDate', message: i18n.t('offerOperations.validation.anchorDate') } };
    }
    if (recurrenceWindowStartMinute === null) {
      return { issue: { path: 'offerDelivery.recurrenceWindowStart', message: i18n.t('offerOperations.validation.windowStart') } };
    }
    if (recurrenceWindowEndMinute === null || recurrenceWindowEndMinute <= recurrenceWindowStartMinute) {
      return { issue: { path: 'offerDelivery.recurrenceWindowEnd', message: i18n.t('offerOperations.validation.windowEnd') } };
    }
    if (recurrenceTermination === 'on_date'
      && (!recurrenceEndsOn || recurrenceEndsOn < recurrenceAnchorDate)) {
      return { issue: { path: 'offerDelivery.recurrenceEndsOn', message: i18n.t('offerOperations.validation.endsOn') } };
    }
    if (recurrenceTermination === 'after_runs'
      && (!Number.isInteger(recurrenceRunCount) || recurrenceRunCount! < 1)) {
      return { issue: { path: 'offerDelivery.recurrenceRunCount', message: i18n.t('offerOperations.validation.runCount') } };
    }
  }

  const data: OfferOperationsData = {
    priority,
    stopLowerPriority: raw.stopLowerPriority === 'true',
    scheduleMode: scheduleMode as OfferScheduleMode,
    startsAt: startsAtIso ? new Date(startsAtIso) : null,
    endsAt: endsAtIso ? new Date(endsAtIso) : null,
    recurrenceFrequency,
    recurrenceTimezone: frequencyInput || startWindowInput || endWindowInput || anchorInput
      ? shopIanaTimezone
      : currentPolicy?.recurrenceTimezone ?? null,
    recurrenceAnchorDate,
    recurrenceWindowStartMinute,
    recurrenceWindowEndMinute,
    recurrenceTermination,
    recurrenceEndsOn,
    recurrenceRunCount,
  };
  const persisted = dataFromPolicy(currentPolicy, shopIanaTimezone);
  const changed = Object.entries(data).some(([key, value]) => {
    const currentValue = persisted[key as keyof OfferOperationsData];
    return value instanceof Date && currentValue instanceof Date
      ? value.getTime() !== currentValue.getTime()
      : value !== currentValue;
  });
  return { changed, data };
}
