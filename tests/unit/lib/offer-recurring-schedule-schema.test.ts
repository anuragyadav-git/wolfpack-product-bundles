import { Prisma } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('OfferRecurringScheduleSchema', () => {
  const offerPolicy = Prisma.dmmf.datamodel.models.find(
    (model) => model.name === 'OfferPolicy',
  );

  it('uses one explicit schedule mode and normalized shop-local recurrence fields', () => {
    expect(offerPolicy).toBeDefined();
    expect(offerPolicy?.fields.map((field) => field.name)).toEqual(
      expect.arrayContaining([
        'scheduleMode',
        'recurrenceFrequency',
        'recurrenceTimezone',
        'recurrenceAnchorDate',
        'recurrenceWindowStartMinute',
        'recurrenceWindowEndMinute',
        'recurrenceTermination',
        'recurrenceEndsOn',
        'recurrenceRunCount',
      ]),
    );
  });

  it.each([
    ['OfferScheduleMode', ['always', 'one_time', 'recurring']],
    ['OfferRecurrenceFrequency', ['weekly', 'monthly']],
    ['OfferRecurrenceTermination', ['never', 'on_date', 'after_runs']],
  ])('exposes the bounded %s values', (enumName, expectedValues) => {
    const schemaEnum = Prisma.dmmf.datamodel.enums.find(
      (candidate) => candidate.name === enumName,
    );
    expect(schemaEnum?.values.map((value) => value.name)).toEqual(expectedValues);
  });

  it('classifies existing one-shot rows during migration', () => {
    const migration = readFileSync(resolve(
      process.cwd(),
      'prisma/migrations/20260901170000_add_offer_recurring_schedule/migration.sql',
    ), 'utf8');
    expect(migration).toMatch(
      /SET "scheduleMode" = 'one_time'[\s\S]*WHERE "startsAt" IS NOT NULL OR "endsAt" IS NOT NULL/,
    );
  });
});
