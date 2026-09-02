import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Temporal } from 'temporal-polyfill';

export const OFFER_POLICY_CSV_COLUMNS = [
  'schema_version',
  'bundle_id',
  'bundle_name',
  'bundle_type',
  'bundle_status',
  'specific_link_required',
  'priority',
  'stop_lower_priority',
  'schedule_mode',
  'starts_at',
  'ends_at',
  'recurrence_frequency',
  'recurrence_timezone',
  'recurrence_anchor_date',
  'recurrence_window_start',
  'recurrence_window_end',
  'recurrence_termination',
  'recurrence_ends_on',
  'recurrence_run_count',
  'country_targeting_enabled',
  'country_targeting_mode',
  'country_codes',
  'rule_version',
] as const;

const MAX_CSV_BYTES = 1024 * 1024;
const MAX_CSV_ROWS = 500;

type CsvColumn = (typeof OFFER_POLICY_CSV_COLUMNS)[number];
export type OfferPolicyCsvRow = Record<CsvColumn, string>;

type OfferPolicyState = {
  specificLinkRequired: boolean;
  priority: number;
  stopLowerPriority: boolean;
  scheduleMode: 'always' | 'one_time' | 'recurring';
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  recurrenceFrequency: 'weekly' | 'monthly' | null;
  recurrenceTimezone: string | null;
  recurrenceAnchorDate: Date | string | null;
  recurrenceWindowStartMinute: number | null;
  recurrenceWindowEndMinute: number | null;
  recurrenceTermination: 'never' | 'on_date' | 'after_runs';
  recurrenceEndsOn: Date | string | null;
  recurrenceRunCount: number | null;
  countryTargetingEnabled: boolean;
  countryTargetingMode: 'include' | 'exclude';
  countryCodes: readonly string[];
  ruleVersion: number;
};

export type OfferPolicyCsvBundle = {
  id: string;
  name: string;
  bundleType: string;
  status: string;
  offerPolicy: OfferPolicyState | null;
};

export type OfferPolicyCsvValidationBundle = OfferPolicyCsvBundle & {
  specificLinkConditionActive: boolean;
};

export type OfferPolicyCsvError = {
  row: number | null;
  field: CsvColumn | 'file';
  code: string;
};

export type ParsedOfferPolicyCsv = {
  rows: OfferPolicyCsvRow[];
  fileErrors: OfferPolicyCsvError[];
};

export type ValidOfferPolicyCsvRow = {
  row: number;
  bundleId: string;
  bundleType: string;
  expectedRuleVersion: number;
  changed: boolean;
  data: Omit<OfferPolicyState, 'ruleVersion'>;
};

const DEFAULT_POLICY: OfferPolicyState = {
  specificLinkRequired: false,
  priority: 100,
  stopLowerPriority: false,
  scheduleMode: 'always',
  startsAt: null,
  endsAt: null,
  recurrenceFrequency: null,
  recurrenceTimezone: null,
  recurrenceAnchorDate: null,
  recurrenceWindowStartMinute: null,
  recurrenceWindowEndMinute: null,
  recurrenceTermination: 'never',
  recurrenceEndsOn: null,
  recurrenceRunCount: null,
  countryTargetingEnabled: false,
  countryTargetingMode: 'include',
  countryCodes: [],
  ruleVersion: 0,
};

function iso(value: Date | string | null): string {
  if (value == null || value === '') return '';
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : '';
}

function spreadsheetSafe(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function localDate(value: Date | string | null): string {
  return iso(value).slice(0, 10);
}

function localTime(value: number | null): string {
  if (!Number.isInteger(value) || value! < 0 || value! > 1_439) return '';
  return `${String(Math.floor(value! / 60)).padStart(2, '0')}:${String(value! % 60).padStart(2, '0')}`;
}

function normalizePolicy(policy: OfferPolicyState | null): OfferPolicyState {
  if (!policy) return { ...DEFAULT_POLICY, countryCodes: [] };
  return {
    ...policy,
    countryCodes: Array.from(new Set(policy.countryCodes.map((code) => code.toUpperCase()))).sort(),
  };
}

export function serializeOfferPolicyCsv(bundles: readonly OfferPolicyCsvBundle[]): string {
  const records = bundles.map((bundle) => {
    const policy = normalizePolicy(bundle.offerPolicy);
    return {
      schema_version: '2',
      bundle_id: bundle.id,
      bundle_name: spreadsheetSafe(bundle.name),
      bundle_type: bundle.bundleType,
      bundle_status: bundle.status,
      specific_link_required: String(policy.specificLinkRequired),
      priority: String(policy.priority),
      stop_lower_priority: String(policy.stopLowerPriority),
      schedule_mode: policy.scheduleMode,
      starts_at: iso(policy.startsAt),
      ends_at: iso(policy.endsAt),
      recurrence_frequency: policy.recurrenceFrequency ?? '',
      recurrence_timezone: policy.recurrenceTimezone ?? '',
      recurrence_anchor_date: localDate(policy.recurrenceAnchorDate),
      recurrence_window_start: localTime(policy.recurrenceWindowStartMinute),
      recurrence_window_end: localTime(policy.recurrenceWindowEndMinute),
      recurrence_termination: policy.recurrenceTermination,
      recurrence_ends_on: localDate(policy.recurrenceEndsOn),
      recurrence_run_count: policy.recurrenceRunCount == null
        ? ''
        : String(policy.recurrenceRunCount),
      country_targeting_enabled: String(policy.countryTargetingEnabled),
      country_targeting_mode: policy.countryTargetingMode,
      country_codes: policy.countryCodes.join(';'),
      rule_version: String(policy.ruleVersion),
    } satisfies OfferPolicyCsvRow;
  });
  return stringify(records, {
    header: true,
    columns: [...OFFER_POLICY_CSV_COLUMNS],
    record_delimiter: 'unix',
  });
}

export function parseOfferPolicyCsv(csv: string): ParsedOfferPolicyCsv {
  if (Buffer.byteLength(csv, 'utf8') > MAX_CSV_BYTES) {
    return { rows: [], fileErrors: [{ row: null, field: 'file', code: 'file_too_large' }] };
  }
  try {
    const records = parse(csv, {
      bom: true,
      skip_empty_lines: true,
      relax_column_count: false,
    }) as string[][];
    const [header, ...body] = records;
    if (!header || header.length !== OFFER_POLICY_CSV_COLUMNS.length
      || header.some((column, index) => column !== OFFER_POLICY_CSV_COLUMNS[index])) {
      return { rows: [], fileErrors: [{ row: 1, field: 'file', code: 'invalid_headers' }] };
    }
    if (body.length > MAX_CSV_ROWS) {
      return { rows: [], fileErrors: [{ row: null, field: 'file', code: 'too_many_rows' }] };
    }
    const rows = body.map((values) => Object.fromEntries(
      OFFER_POLICY_CSV_COLUMNS.map((column, index) => [column, values[index] ?? '']),
    ) as OfferPolicyCsvRow);
    return { rows, fileErrors: [] };
  } catch {
    return { rows: [], fileErrors: [{ row: null, field: 'file', code: 'invalid_csv' }] };
  }
}

function booleanValue(value: string): boolean | null {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function unsignedInteger(value: string): number | null {
  if (!value || Array.from(value).some((character) => character < '0' || character > '9')) {
    return null;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function dateValue(value: string): Date | null | undefined {
  if (value === '') return null;
  const timezoneOffset = value.slice(-6);
  const hasTimezone = value.endsWith('Z')
    || ((timezoneOffset.startsWith('+') || timezoneOffset.startsWith('-'))
      && timezoneOffset.charAt(3) === ':');
  if (!value.includes('T') || !hasTimezone) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : undefined;
}

function localDateValue(value: string): Date | null | undefined {
  if (value === '') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  try {
    return new Date(`${Temporal.PlainDate.from(value).toString()}T00:00:00.000Z`);
  } catch {
    return undefined;
  }
}

function localTimeValue(value: string): number | null | undefined {
  if (value === '') return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? hour * 60 + minute : undefined;
}

function timezoneIsValid(value: string): boolean {
  if (!value) return false;
  try {
    Temporal.Instant.from('2000-01-01T00:00:00Z').toZonedDateTimeISO(value);
    return true;
  } catch {
    return false;
  }
}

function samePolicy(current: OfferPolicyState | null, data: Omit<OfferPolicyState, 'ruleVersion'>): boolean {
  const normalized = normalizePolicy(current);
  return normalized.specificLinkRequired === data.specificLinkRequired
    && normalized.priority === data.priority
    && normalized.stopLowerPriority === data.stopLowerPriority
    && normalized.scheduleMode === data.scheduleMode
    && iso(normalized.startsAt) === iso(data.startsAt)
    && iso(normalized.endsAt) === iso(data.endsAt)
    && normalized.recurrenceFrequency === data.recurrenceFrequency
    && normalized.recurrenceTimezone === data.recurrenceTimezone
    && localDate(normalized.recurrenceAnchorDate) === localDate(data.recurrenceAnchorDate)
    && normalized.recurrenceWindowStartMinute === data.recurrenceWindowStartMinute
    && normalized.recurrenceWindowEndMinute === data.recurrenceWindowEndMinute
    && normalized.recurrenceTermination === data.recurrenceTermination
    && localDate(normalized.recurrenceEndsOn) === localDate(data.recurrenceEndsOn)
    && normalized.recurrenceRunCount === data.recurrenceRunCount
    && normalized.countryTargetingEnabled === data.countryTargetingEnabled
    && normalized.countryTargetingMode === data.countryTargetingMode
    && normalized.countryCodes.join(';') === data.countryCodes.join(';');
}

export function validateOfferPolicyCsvRows(
  parsed: ParsedOfferPolicyCsv,
  bundles: readonly OfferPolicyCsvValidationBundle[],
  shopIanaTimezone: string,
): { validRows: ValidOfferPolicyCsvRow[]; errors: OfferPolicyCsvError[] } {
  const errors = [...parsed.fileErrors];
  if (errors.length > 0) return { validRows: [], errors };

  const bundlesById = new Map(bundles.map((bundle) => [bundle.id, bundle]));
  const counts = new Map<string, number>();
  for (const row of parsed.rows) counts.set(row.bundle_id, (counts.get(row.bundle_id) ?? 0) + 1);

  const validRows: ValidOfferPolicyCsvRow[] = [];
  parsed.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const addError = (field: OfferPolicyCsvError['field'], code: string) => {
      errors.push({ row: rowNumber, field, code });
    };
    if (row.schema_version !== '2') addError('schema_version', 'unsupported_schema_version');
    if (!row.bundle_id || counts.get(row.bundle_id) !== 1) addError('bundle_id', 'duplicate_bundle_id');
    const bundle = bundlesById.get(row.bundle_id);
    if (!bundle) addError('bundle_id', 'bundle_not_found');

    const specificLinkRequired = booleanValue(row.specific_link_required);
    if (specificLinkRequired == null) addError('specific_link_required', 'invalid_boolean');
    const priority = unsignedInteger(row.priority);
    if (priority == null || priority < 1 || priority > 9999) addError('priority', 'invalid_priority');
    const stopLowerPriority = booleanValue(row.stop_lower_priority);
    if (stopLowerPriority == null) addError('stop_lower_priority', 'invalid_boolean');
    const scheduleMode = ['always', 'one_time', 'recurring'].includes(row.schedule_mode)
      ? row.schedule_mode as OfferPolicyState['scheduleMode']
      : null;
    if (!scheduleMode) addError('schedule_mode', 'invalid_schedule_mode');
    const startsAt = dateValue(row.starts_at);
    if (startsAt === undefined) addError('starts_at', 'invalid_date');
    const endsAt = dateValue(row.ends_at);
    if (endsAt === undefined) addError('ends_at', 'invalid_date');
    if (startsAt instanceof Date && endsAt instanceof Date && endsAt <= startsAt) {
      addError('ends_at', 'invalid_date_range');
    }
    const recurrenceFrequency: OfferPolicyState['recurrenceFrequency'] | undefined = row.recurrence_frequency === ''
      ? null
      : row.recurrence_frequency === 'weekly' || row.recurrence_frequency === 'monthly'
        ? row.recurrence_frequency
        : undefined;
    if (recurrenceFrequency === undefined) {
      addError('recurrence_frequency', 'invalid_recurrence_frequency');
    }
    const recurrenceTimezone = row.recurrence_timezone || null;
    if (recurrenceTimezone && !timezoneIsValid(recurrenceTimezone)) {
      addError('recurrence_timezone', 'invalid_recurrence_timezone');
    } else if (recurrenceTimezone && recurrenceTimezone !== shopIanaTimezone) {
      addError('recurrence_timezone', 'shop_timezone_mismatch');
    }
    const recurrenceAnchorDate = localDateValue(row.recurrence_anchor_date);
    if (recurrenceAnchorDate === undefined) {
      addError('recurrence_anchor_date', 'invalid_recurrence_date');
    }
    const recurrenceWindowStartMinute = localTimeValue(row.recurrence_window_start);
    if (recurrenceWindowStartMinute === undefined) {
      addError('recurrence_window_start', 'invalid_recurrence_time');
    }
    const recurrenceWindowEndMinute = localTimeValue(row.recurrence_window_end);
    if (recurrenceWindowEndMinute === undefined) {
      addError('recurrence_window_end', 'invalid_recurrence_time');
    }
    const recurrenceTermination = ['never', 'on_date', 'after_runs']
      .includes(row.recurrence_termination)
      ? row.recurrence_termination as OfferPolicyState['recurrenceTermination']
      : null;
    if (!recurrenceTermination) {
      addError('recurrence_termination', 'invalid_recurrence_termination');
    }
    const recurrenceEndsOn = localDateValue(row.recurrence_ends_on);
    if (recurrenceEndsOn === undefined) {
      addError('recurrence_ends_on', 'invalid_recurrence_date');
    }
    const recurrenceRunCount = row.recurrence_run_count === ''
      ? null
      : unsignedInteger(row.recurrence_run_count);
    if (row.recurrence_run_count !== '' && recurrenceRunCount == null) {
      addError('recurrence_run_count', 'invalid_recurrence_run_count');
    }
    if (scheduleMode === 'recurring') {
      if (!recurrenceFrequency) addError('recurrence_frequency', 'recurrence_frequency_required');
      if (!recurrenceTimezone) addError('recurrence_timezone', 'recurrence_timezone_required');
      if (!recurrenceAnchorDate) addError('recurrence_anchor_date', 'recurrence_anchor_required');
      if (recurrenceWindowStartMinute == null) {
        addError('recurrence_window_start', 'recurrence_window_required');
      }
      if (recurrenceWindowEndMinute == null
        || (recurrenceWindowStartMinute != null
          && recurrenceWindowEndMinute <= recurrenceWindowStartMinute)) {
        addError('recurrence_window_end', 'invalid_recurrence_window');
      }
      if (recurrenceTermination === 'on_date'
        && (!recurrenceEndsOn
          || (recurrenceAnchorDate && recurrenceEndsOn < recurrenceAnchorDate))) {
        addError('recurrence_ends_on', 'invalid_recurrence_end_date');
      }
      if (recurrenceTermination === 'after_runs'
        && (recurrenceRunCount == null || recurrenceRunCount < 1)) {
        addError('recurrence_run_count', 'invalid_recurrence_run_count');
      }
    }
    const countryTargetingEnabled = booleanValue(row.country_targeting_enabled);
    if (countryTargetingEnabled == null) addError('country_targeting_enabled', 'invalid_boolean');
    const countryTargetingMode: 'include' | 'exclude' | null = row.country_targeting_mode === 'include'
      || row.country_targeting_mode === 'exclude'
      ? row.country_targeting_mode
      : null;
    if (countryTargetingMode == null) {
      addError('country_targeting_mode', 'invalid_country_mode');
    }
    const countryCodes = Array.from(new Set(
      row.country_codes.split(';').map((code) => code.trim().toUpperCase()).filter(Boolean),
    )).sort();
    if (countryCodes.some((code) => !/^[A-Z]{2}$/.test(code))
      || (countryTargetingEnabled === true && countryCodes.length === 0)) {
      addError('country_codes', 'invalid_country_codes');
    }
    const expectedRuleVersion = unsignedInteger(row.rule_version);
    if (expectedRuleVersion == null) {
      addError('rule_version', 'invalid_rule_version');
    }
    if (specificLinkRequired === true && bundle && !bundle.specificLinkConditionActive) {
      addError('specific_link_required', 'campaign_link_required');
    }

    const rowErrorCount = errors.filter((error) => error.row === rowNumber).length;
    if (rowErrorCount > 0 || !bundle || specificLinkRequired == null
      || priority == null || expectedRuleVersion == null
      || stopLowerPriority == null || startsAt === undefined || endsAt === undefined
      || scheduleMode == null || recurrenceFrequency === undefined
      || recurrenceAnchorDate === undefined
      || recurrenceWindowStartMinute === undefined
      || recurrenceWindowEndMinute === undefined
      || recurrenceTermination == null || recurrenceEndsOn === undefined
      || countryTargetingEnabled == null
      || countryTargetingMode == null) return;

    const data = {
      specificLinkRequired,
      priority,
      stopLowerPriority,
      scheduleMode,
      startsAt,
      endsAt,
      recurrenceFrequency,
      recurrenceTimezone,
      recurrenceAnchorDate,
      recurrenceWindowStartMinute,
      recurrenceWindowEndMinute,
      recurrenceTermination,
      recurrenceEndsOn,
      recurrenceRunCount,
      countryTargetingEnabled,
      countryTargetingMode,
      countryCodes,
    };
    const changed = !samePolicy(bundle.offerPolicy, data);
    const currentRuleVersion = bundle.offerPolicy?.ruleVersion ?? 0;
    if (changed && expectedRuleVersion !== currentRuleVersion) {
      addError('rule_version', 'stale_rule_version');
      return;
    }
    validRows.push({
      row: rowNumber,
      bundleId: bundle.id,
      bundleType: bundle.bundleType,
      expectedRuleVersion,
      changed,
      data,
    });
  });

  return { validRows: errors.length > 0 ? [] : validRows, errors };
}
