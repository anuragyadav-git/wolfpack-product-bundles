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

describe('specific-link offer schema', () => {
  it('gives each bundle one optional normalized offer policy', () => {
    expect(schema).toMatch(/offerPolicy\s+OfferPolicy\?/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*bundleId\s+String\s+@unique/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*enabled\s+Boolean\s+@default\(false\)/);
    expect(schema).toMatch(/model OfferPolicy \{[\s\S]*ruleVersion\s+Int\s+@default\(1\)/);
  });

  it('persists only a public identifier and one-way token hash for a link condition', () => {
    expect(schema).toMatch(/enum OfferConditionType \{\s*specific_link\s*\}/);
    expect(schema).toMatch(/model OfferCondition \{[\s\S]*tokenIdentifier\s+String\s+@unique/);
    expect(schema).toMatch(/model OfferCondition \{[\s\S]*tokenHash\s+String\s+@unique/);
    expect(schema).toMatch(/model OfferCondition \{[\s\S]*expiresAt\s+DateTime\?/);
    expect(schema).toMatch(/model OfferCondition \{[\s\S]*revokedAt\s+DateTime\?/);
    expect(schema).not.toMatch(/rawToken|campaignToken/);
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
