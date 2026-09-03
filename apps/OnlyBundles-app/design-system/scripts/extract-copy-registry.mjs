import fs from 'node:fs';
import path from 'node:path';
import runtimeInventory from './copy-runtime-inventory.cjs';

const sourcePath = new URL('../00-inventory/copy-registry.yaml', import.meta.url);
const outputPath = new URL('../00-inventory/copy-registry.json', import.meta.url);
const coveragePath = new URL('../00-inventory/copy-coverage.csv', import.meta.url);
const runtimePath = new URL('../../app/lib/settings-language-runtime.ts', import.meta.url);

const { discoverRuntimeCopyFields } = runtimeInventory;

function yamlScalar(value) {
  if (typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  return JSON.stringify(String(value));
}

function yamlArray(values) {
  return `[${values.map(yamlScalar).join(', ')}]`;
}

function affectedStates(family) {
  if (family === 'FPB') return ['fpb-selection-flow', 'fpb-validation-messaging', 'fpb-discount-messaging'];
  if (family === 'PPB') return ['ppb-footer-messaging', 'ppb-error-feedback'];
  return ['fpb-selection-flow', 'ppb-footer-messaging'];
}

function fixtureIds(family) {
  if (family === 'FPB') return ['fpb-all-templates'];
  if (family === 'PPB') return ['ppb-all-templates'];
  return ['fpb-all-templates', 'ppb-all-templates'];
}

function testCaseIds(family) {
  if (family === 'FPB') return ['fpb-all-template-summary'];
  if (family === 'PPB') return ['product-page-bundle-template-design-verification'];
  return ['fpb-all-template-summary', 'product-page-bundle-template-design-verification'];
}

function toRegistryItem(field) {
  const surface = field.runtime_path.split('.').slice(1, -1).join(' / ') || 'shared storefront';
  const pluralizationTokens = new Set(['count', 'quantity', 'quantityDifference', 'conditionQuantity', 'allowedQuantity']);
  return {
    id: field.id,
    family: field.family,
    templates: field.templates,
    surface,
    admin_label: field.admin_label,
    field_name: field.field_name,
    runtime_path: field.runtime_path,
    fallback: field.fallback,
    required: false,
    merchant_editable: true,
    localizable: true,
    allowed_placeholders: field.allowed_placeholders,
    character_guidance: 'Plain text; validate at narrow mobile width and two times English length',
    supports_pluralization: field.allowed_placeholders.some((token) => pluralizationTokens.has(token)),
    supports_rich_text: false,
    sanitization: 'text',
    affected_states: affectedStates(field.family),
    fixture_ids: fixtureIds(field.family),
    test_case_ids: testCaseIds(field.family),
    status: 'CONFIRMED_CURRENT',
    evidence: 'app/lib/settings-language-runtime.ts',
    notes: 'Generated from the canonical storefront language runtime.',
  };
}

function serializeYaml(items) {
  const keys = [
    'id', 'family', 'templates', 'surface', 'admin_label', 'field_name',
    'runtime_path', 'fallback', 'required', 'merchant_editable', 'localizable',
    'allowed_placeholders', 'character_guidance', 'supports_pluralization',
    'supports_rich_text', 'sanitization', 'affected_states', 'fixture_ids',
    'test_case_ids', 'status', 'evidence', 'notes',
  ];
  const lines = ['items:'];
  for (const item of items) {
    keys.forEach((key, index) => {
      const prefix = index === 0 ? '  - ' : '    ';
      const value = Array.isArray(item[key]) ? yamlArray(item[key]) : yamlScalar(item[key]);
      lines.push(`${prefix}${key}: ${value}`);
    });
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function csvValue(value) {
  const text = Array.isArray(value) ? value.join(', ') : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function serializeCoverage(items) {
  const header = 'item_id,family,templates,status,evidence,mapped_admin,mapped_runtime,mapped_storefront,mapped_states';
  const rows = items.map((item) => [
    item.id,
    item.family,
    item.templates,
    item.status,
    item.evidence,
    'yes',
    'yes',
    'yes',
    'yes',
  ].map(csvValue).join(','));
  return `${[header, ...rows].join('\n')}\n`;
}

function toOutput(items) {
  const payload = {
    count: items.length,
    families: Array.from(new Set(items.map((item) => item.family))),
    items,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

function main() {
  const runtimeSource = fs.readFileSync(runtimePath, 'utf8');
  const items = discoverRuntimeCopyFields(runtimeSource).map(toRegistryItem);
  fs.writeFileSync(sourcePath, serializeYaml(items));
  fs.writeFileSync(coveragePath, serializeCoverage(items));
  const payload = toOutput(items);
  console.log(`Extracted ${payload.count} source-backed copy rows from settings-language-runtime.`);
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
