import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export const OFFER_POLICY_CSV_COLUMNS = [
  'schema_version',
  'bundle_id',
  'bundle_name',
  'bundle_type',
  'bundle_status',
  'specific_link_required',
  'priority',
  'stop_lower_priority',
  'starts_at',
  'ends_at',
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
  startsAt: Date | string | null;
  endsAt: Date | string | null;
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
  startsAt: null,
  endsAt: null,
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
      schema_version: '1',
      bundle_id: bundle.id,
      bundle_name: spreadsheetSafe(bundle.name),
      bundle_type: bundle.bundleType,
      bundle_status: bundle.status,
      specific_link_required: String(policy.specificLinkRequired),
      priority: String(policy.priority),
      stop_lower_priority: String(policy.stopLowerPriority),
      starts_at: iso(policy.startsAt),
      ends_at: iso(policy.endsAt),
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

function samePolicy(current: OfferPolicyState | null, data: Omit<OfferPolicyState, 'ruleVersion'>): boolean {
  const normalized = normalizePolicy(current);
  return normalized.specificLinkRequired === data.specificLinkRequired
    && normalized.priority === data.priority
    && normalized.stopLowerPriority === data.stopLowerPriority
    && iso(normalized.startsAt) === iso(data.startsAt)
    && iso(normalized.endsAt) === iso(data.endsAt)
    && normalized.countryTargetingEnabled === data.countryTargetingEnabled
    && normalized.countryTargetingMode === data.countryTargetingMode
    && normalized.countryCodes.join(';') === data.countryCodes.join(';');
}

export function validateOfferPolicyCsvRows(
  parsed: ParsedOfferPolicyCsv,
  bundles: readonly OfferPolicyCsvValidationBundle[],
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
    if (row.schema_version !== '1') addError('schema_version', 'unsupported_schema_version');
    if (!row.bundle_id || counts.get(row.bundle_id) !== 1) addError('bundle_id', 'duplicate_bundle_id');
    const bundle = bundlesById.get(row.bundle_id);
    if (!bundle) addError('bundle_id', 'bundle_not_found');

    const specificLinkRequired = booleanValue(row.specific_link_required);
    if (specificLinkRequired == null) addError('specific_link_required', 'invalid_boolean');
    const priority = unsignedInteger(row.priority);
    if (priority == null || priority < 1 || priority > 9999) addError('priority', 'invalid_priority');
    const stopLowerPriority = booleanValue(row.stop_lower_priority);
    if (stopLowerPriority == null) addError('stop_lower_priority', 'invalid_boolean');
    const startsAt = dateValue(row.starts_at);
    if (startsAt === undefined) addError('starts_at', 'invalid_date');
    const endsAt = dateValue(row.ends_at);
    if (endsAt === undefined) addError('ends_at', 'invalid_date');
    if (startsAt instanceof Date && endsAt instanceof Date && endsAt <= startsAt) {
      addError('ends_at', 'invalid_date_range');
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
      || countryTargetingEnabled == null
      || countryTargetingMode == null) return;

    const data = {
      specificLinkRequired,
      priority,
      stopLowerPriority,
      startsAt,
      endsAt,
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
