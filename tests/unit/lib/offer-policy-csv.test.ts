import {
  OFFER_POLICY_CSV_COLUMNS,
  parseOfferPolicyCsv,
  serializeOfferPolicyCsv,
  validateOfferPolicyCsvRows,
} from '../../../app/lib/offer-policy-csv';

const bundle = {
  id: 'bundle-1',
  name: 'Starter bundle',
  bundleType: 'full_page',
  status: 'draft',
  offerPolicy: null,
};

function validCsv(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    schema_version: '1',
    bundle_id: 'bundle-1',
    bundle_name: 'Starter bundle',
    bundle_type: 'full_page',
    bundle_status: 'draft',
    specific_link_required: 'false',
    priority: '10',
    stop_lower_priority: 'true',
    starts_at: '2026-09-02T10:00:00.000Z',
    ends_at: '2026-09-03T10:00:00.000Z',
    country_targeting_enabled: 'true',
    country_targeting_mode: 'include',
    country_codes: 'US;ca;US',
    rule_version: '0',
    ...overrides,
  };
  return `${OFFER_POLICY_CSV_COLUMNS.join(',')}\n${OFFER_POLICY_CSV_COLUMNS.map((key) => values[key]).join(',')}\n`;
}

describe('offer policy CSV', () => {
  it('exports canonical defaults and neutralizes spreadsheet formulas in display cells', () => {
    const csv = serializeOfferPolicyCsv([{ ...bundle, name: '=IMPORTXML("x")' }]);
    expect(csv).toContain('schema_version,bundle_id,bundle_name');
    expect(csv).toContain("'=IMPORTXML");
    expect(csv).not.toContain('token');

    const parsed = parseOfferPolicyCsv(csv);
    expect(parsed.fileErrors).toEqual([]);
    expect(parsed.rows[0]).toEqual(expect.objectContaining({
      schema_version: '1',
      bundle_id: 'bundle-1',
      specific_link_required: 'false',
      priority: '100',
      country_targeting_mode: 'include',
      rule_version: '0',
    }));
  });

  it('round trips quoted commas, quotes, and newlines through the CSV library', () => {
    const csv = serializeOfferPolicyCsv([{ ...bundle, name: 'Starter, "best"\nbundle' }]);
    expect(parseOfferPolicyCsv(csv).rows[0].bundle_name).toBe('Starter, "best"\nbundle');
  });

  it('normalizes a valid policy row', () => {
    const parsed = parseOfferPolicyCsv(validCsv());
    const result = validateOfferPolicyCsvRows(parsed, [{
      ...bundle,
      specificLinkConditionActive: false,
    }]);
    expect(result.errors).toEqual([]);
    expect(result.validRows[0]).toEqual(expect.objectContaining({
      bundleId: 'bundle-1',
      expectedRuleVersion: 0,
      data: expect.objectContaining({
        priority: 10,
        stopLowerPriority: true,
        countryTargetingEnabled: true,
        countryTargetingMode: 'include',
        countryCodes: ['CA', 'US'],
      }),
    }));
  });

  it.each([
    ['schema_version', '2'],
    ['priority', '0'],
    ['priority', '+10'],
    ['stop_lower_priority', 'yes'],
    ['starts_at', 'tomorrow'],
    ['ends_at', '2026-09-01T10:00:00.000Z'],
    ['country_targeting_mode', 'around'],
    ['country_codes', 'USA'],
  ])('rejects invalid %s', (field, value) => {
    const result = validateOfferPolicyCsvRows(
      parseOfferPolicyCsv(validCsv({ [field]: value })),
      [{ ...bundle, specificLinkConditionActive: false }],
    );
    expect(result.validRows).toHaveLength(0);
    expect(result.errors[0]).toEqual(expect.objectContaining({ row: 2, field }));
  });

  it('rejects enabled country targeting without a country', () => {
    const result = validateOfferPolicyCsvRows(
      parseOfferPolicyCsv(validCsv({ country_codes: '' })),
      [{ ...bundle, specificLinkConditionActive: false }],
    );
    expect(result.errors[0].field).toBe('country_codes');
  });

  it('rejects duplicate and unknown bundle IDs', () => {
    const duplicate = `${validCsv().trim()}\n${validCsv().split('\n')[1]}\n`;
    const duplicateResult = validateOfferPolicyCsvRows(
      parseOfferPolicyCsv(duplicate),
      [{ ...bundle, specificLinkConditionActive: false }],
    );
    expect(duplicateResult.errors.filter((error) => error.field === 'bundle_id')).toHaveLength(2);

    const unknownResult = validateOfferPolicyCsvRows(
      parseOfferPolicyCsv(validCsv({ bundle_id: 'other-shop-bundle' })),
      [{ ...bundle, specificLinkConditionActive: false }],
    );
    expect(unknownResult.errors[0].field).toBe('bundle_id');
  });

  it('requires an existing active campaign link before enabling link-only delivery', () => {
    const result = validateOfferPolicyCsvRows(
      parseOfferPolicyCsv(validCsv({ specific_link_required: 'true' })),
      [{ ...bundle, specificLinkConditionActive: false }],
    );
    expect(result.errors[0].field).toBe('specific_link_required');
  });

  it('rejects a stale version but treats an identical retry as unchanged', () => {
    const current = {
      ...bundle,
      offerPolicy: {
        specificLinkRequired: false,
        priority: 10,
        stopLowerPriority: true,
        startsAt: new Date('2026-09-02T10:00:00.000Z'),
        endsAt: new Date('2026-09-03T10:00:00.000Z'),
        countryTargetingEnabled: true,
        countryTargetingMode: 'include' as const,
        countryCodes: ['CA', 'US'],
        ruleVersion: 2,
      },
      specificLinkConditionActive: false,
    };
    const identical = validateOfferPolicyCsvRows(parseOfferPolicyCsv(validCsv()), [current]);
    expect(identical.errors).toEqual([]);
    expect(identical.validRows[0].changed).toBe(false);

    const conflict = validateOfferPolicyCsvRows(
      parseOfferPolicyCsv(validCsv({ priority: '11' })),
      [current],
    );
    expect(conflict.errors[0].field).toBe('rule_version');
  });

  it('rejects unsupported headers and bounded file limits', () => {
    expect(parseOfferPolicyCsv('bundle_id,priority\nbundle-1,10\n').fileErrors).not.toEqual([]);
    expect(parseOfferPolicyCsv('x'.repeat(1024 * 1024 + 1)).fileErrors).not.toEqual([]);

    const header = OFFER_POLICY_CSV_COLUMNS.join(',');
    const row = validCsv().split('\n')[1];
    expect(parseOfferPolicyCsv(`${header}\n${Array.from({ length: 501 }, () => row).join('\n')}`).fileErrors)
      .not.toEqual([]);
  });
});
