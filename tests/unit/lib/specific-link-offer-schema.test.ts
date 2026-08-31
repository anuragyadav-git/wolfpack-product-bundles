import fs from 'node:fs';
import path from 'node:path';

const schema = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8');
const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    'prisma/migrations/20260830223000_add_specific_link_offer_policy/migration.sql',
  ),
  'utf8',
);
const simplificationMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    'prisma/migrations/20260831124500_simplify_specific_link_token/migration.sql',
  ),
  'utf8',
);
const operationsMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    'prisma/migrations/20260831170000_add_offer_operations/migration.sql',
  ),
  'utf8',
);

describe('specific-link offer schema', () => {
  it('gives each bundle one optional normalized offer policy', () => {
    expect(schema).toMatch(/offerPolicy\s+OfferPolicy\?/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*bundleId\s+String\s+@unique/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*specificLinkRequired\s+Boolean\s+@default\(false\)/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*priority\s+Int\s+@default\(100\)/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*stopLowerPriority\s+Boolean\s+@default\(false\)/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*startsAt\s+DateTime\?/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*endsAt\s+DateTime\?/);
    expect(schema).not.toMatch(/model OfferPolicy \{[\s\S]*\benabled\s+Boolean/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*ruleVersion\s+Int\s+@default\(1\)/);
    expect(operationsMigration).toContain('RENAME COLUMN "enabled" TO "specificLinkRequired"');
  });

  it('persists only a one-way token hash for a link condition', () => {
    expect(schema).toMatch(/enum OfferConditionType \{\s*specific_link\s*\}/);
    expect(schema).toMatch(/model OfferCondition \{[\s\S]*tokenHash\s+String\s+@unique/);
    expect(schema).toMatch(/model OfferCondition \{[\s\S]*expiresAt\s+DateTime\?/);
    expect(schema).toMatch(/model OfferCondition \{[\s\S]*revokedAt\s+DateTime\?/);
    expect(schema).not.toMatch(/rawToken|campaignToken/);
    expect(simplificationMigration).toContain('DROP COLUMN "tokenIdentifier"');
  });

  it('enforces one condition type per policy and cascading ownership', () => {
    expect(schema).toMatch(/@@unique\(\[offerPolicyId, type\]\)/);
    expect(schema).toMatch(
      /offerPolicy\s+OfferPolicy\s+@relation\(fields: \[offerPolicyId\], references: \[id\], onDelete: Cascade\)/,
    );
    expect(migration).toContain('ON DELETE CASCADE');
    expect(migration).toContain('CREATE UNIQUE INDEX "OfferCondition_offerPolicyId_type_key"');
  });
});
