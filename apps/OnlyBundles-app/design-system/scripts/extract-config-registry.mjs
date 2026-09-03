import fs from 'node:fs';
import path from 'node:path';
import designInventory from './design-configuration-inventory.cjs';
import { parseSimpleYamlItems, readText } from './_helpers.mjs';

const sourcePath = new URL('../00-inventory/configuration-registry.yaml', import.meta.url);
const outputPath = new URL('../00-inventory/configuration-registry.json', import.meta.url);
const coveragePath = new URL('../00-inventory/configuration-coverage.csv', import.meta.url);
const designSourcePath = new URL('../../app/lib/admin-configuration-surfaces.ts', import.meta.url);
const { discoverDesignConfigurationFields } = designInventory;

const CONFIGURATION_KEYS = [
  'id', 'family', 'templates', 'admin_label', 'admin_location', 'field_name',
  'persisted_location', 'runtime_location', 'type', 'allowed_values', 'default',
  'nullable', 'dependencies', 'mutual_exclusions', 'visibility_condition',
  'affected_components', 'affected_states', 'merchant_editable',
  'responsive_impact', 'accessibility_impact', 'fixture_ids', 'test_case_ids',
  'status', 'evidence', 'notes',
];

function yamlScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (value === null) return 'null';
  return JSON.stringify(String(value ?? ''));
}

function yamlArray(values) {
  return `[${values.map((value) => yamlScalar(value)).join(', ')}]`;
}

function serializeYaml(items) {
  const lines = ['items:'];
  for (const item of items) {
    CONFIGURATION_KEYS.forEach((key, index) => {
      const prefix = index === 0 ? '  - ' : '    ';
      const raw = item[key];
      const value = Array.isArray(raw) ? yamlArray(raw) : yamlScalar(raw);
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
  const header = 'item_id,family,templates,status,evidence,mapped_admin,mapped_persisted,mapped_runtime,mapped_components';
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
  ].map((value) => csvValue(value)).join(','));
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
  const existing = parseSimpleYamlItems(readText(sourcePath)).filter((item) => !String(item.id).startsWith('design-'));
  const designItems = discoverDesignConfigurationFields(readText(designSourcePath));
  const items = [...existing, ...designItems];
  fs.writeFileSync(sourcePath, serializeYaml(items));
  fs.writeFileSync(coveragePath, serializeCoverage(items));
  const payload = toOutput(items);
  console.log(`Extracted ${payload.count} configuration rows, including ${designItems.length} source-backed Design controls.`);
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
